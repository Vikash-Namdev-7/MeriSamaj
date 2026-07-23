const mongoose = require('mongoose');
const Event = require('../../models/Event');
const EventResponse = require('../../models/EventResponse');
const EventActivityLog = require('../../models/EventActivityLog');
const Community = require('../../models/Community');
const User = require('../../models/User');
const { notifyEventCreated, notifyEventCancelled, notifyEventDeleted } = require('../../services/notificationService');

// Helper to attach dynamic reaction counts to an array of event objects
const attachEventStats = async (events) => {
  if (!events || events.length === 0) return [];
  const eventIds = events.map(e => e._id);

  const stats = await EventResponse.aggregate([
    { $match: { eventId: { $in: eventIds } } },
    {
      $group: {
        _id: '$eventId',
        interestedCount: {
          $sum: { $cond: [{ $or: [{ $eq: ['$isInterested', true] }, { $eq: ['$response', 'Interested'] }] }, 1, 0] }
        },
        goingCount: {
          $sum: { $cond: [{ $or: [{ $eq: ['$isGoing', true] }, { $eq: ['$registered', true] }, { $eq: ['$response', 'Going'] }] }, 1, 0] }
        },
        notGoingCount: {
          $sum: { $cond: [{ $eq: ['$response', 'Not Going'] }, 1, 0] }
        },
        registeredCount: {
          $sum: { $cond: [{ $or: [{ $eq: ['$registered', true] }, { $eq: ['$isGoing', true] }] }, 1, 0] }
        },
        bookmarkedCount: {
          $sum: { $cond: [{ $eq: ['$bookmarked', true] }, 1, 0] }
        }
      }
    }
  ]);

  const statsMap = {};
  stats.forEach(s => {
    statsMap[s._id.toString()] = s;
  });

  return events.map(e => {
    const s = statsMap[e._id.toString()] || {};
    return {
      ...e,
      interestedCount: s.interestedCount || 0,
      goingCount: s.goingCount || 0,
      notGoingCount: s.notGoingCount || 0,
      registeredCount: s.registeredCount || 0,
      bookmarkedCount: s.bookmarkedCount || 0
    };
  });
};

// @desc    Get all events with server-side filters, search, and pagination
// @route   GET /api/v1/admin/events
// @access  Admin
exports.getAllEvents = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      communityId = 'all', 
      category = 'all', 
      status = 'all', 
      isFeatured = 'all',
      sortField = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { isDeleted: { $ne: true } };

    if (search.trim()) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { titleEn: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
        { 'organizer.name': { $regex: search, $options: 'i' } }
      ];
    }

    if (communityId !== 'all') {
      if (communityId === 'global') {
        query.visibility = 'GLOBAL';
      } else if (mongoose.Types.ObjectId.isValid(communityId)) {
        query.communityId = communityId;
      }
    }

    if (category !== 'all') {
      query.category = category;
    }

    if (status !== 'all') {
      query.status = status;
    }

    if (isFeatured !== 'all') {
      query.isFeatured = isFeatured === 'true';
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const sort = {};
    sort[sortField] = sortOrder === 'asc' ? 1 : -1;

    const total = await Event.countDocuments(query);
    const rawEvents = await Event.find(query)
      .populate('communityId', 'name')
      .populate('createdBy', 'name email role')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const events = await attachEventStats(rawEvents);

    res.status(200).json({
      status: 'success',
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: events
    });
  } catch (error) {
    console.error('Admin Get All Events Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch events' });
  }
};

// @desc    Get single event by ID with populated member responses
// @route   GET /api/v1/admin/events/:eventId
// @access  Admin
exports.getEventById = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findOne({ _id: eventId, isDeleted: { $ne: true } })
      .populate('communityId', 'name')
      .populate('createdBy', 'name email role')
      .lean();

    if (!event) {
      return res.status(404).json({ status: 'fail', message: 'Event not found' });
    }

    const responses = await EventResponse.find({ eventId })
      .populate({
        path: 'memberId',
        select: 'name email phone avatar gotra communityId city',
        populate: [
          { path: 'communityId', select: 'name' },
          { path: 'city', select: 'name' }
        ]
      })
      .sort({ updatedAt: -1 })
      .lean();

    const memberResponses = responses.map(r => {
      const u = r.memberId || {};
      const initials = u.name ? u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'M';
      return {
        id: r._id,
        memberId: u._id,
        name: u.name || 'Member',
        email: u.email || 'N/A',
        phone: u.phone || 'N/A',
        avatar: u.avatar || null,
        initials,
        gotra: u.gotra || 'N/A',
        communityName: u.communityId?.name || 'N/A',
        cityName: u.city?.name || 'N/A',
        response: r.response,
        registered: r.registered,
        registeredAt: r.registeredAt,
        bookmarked: r.bookmarked,
        reminderEnabled: r.reminderEnabled,
        responseTime: r.updatedAt || r.respondedAt
      };
    });

    const interestedCount = memberResponses.filter(r => r.response === 'Interested').length;
    const goingCount = memberResponses.filter(r => r.response === 'Going').length;
    const notGoingCount = memberResponses.filter(r => r.response === 'Not Going').length;
    const registeredCount = memberResponses.filter(r => r.registered).length;

    res.status(200).json({
      status: 'success',
      data: {
        ...event,
        interestedCount,
        goingCount,
        notGoingCount,
        registeredCount,
        memberResponses
      }
    });
  } catch (error) {
    console.error('Admin Get Event By ID Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch event details' });
  }
};

// @desc    Create event by Admin (GLOBAL by default)
// @route   POST /api/v1/admin/events
// @access  Admin
exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      titleEn,
      category,
      categoryEn,
      description,
      descriptionEn,
      bannerImage,
      thumbnailImage,
      image,
      venue,
      venueEn,
      address,
      cityId,
      startDate,
      endDate,
      startTime,
      endTime,
      time,
      timeEn,
      entryFee,
      contact,
      capacity,
      registrationRequired,
      objectiveEn,
      programsEn,
      audienceEn,
      importantInfoEn,
      tagsEn,
      tags,
      isFeatured,
      visibility,
      communityId,
      status
    } = req.body;

    let parsedDate = {
      date: 'TBA',
      day: '01',
      month: 'Month',
      monthShort: 'MON',
      weekday: 'Day'
    };
    if (startDate) {
      const d = new Date(startDate);
      if (!isNaN(d.getTime())) {
        const daysHi = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
        const monthsHi = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
        const monthsShortHi = ['जन', 'फर', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुला', 'अग', 'सित', 'अक्तू', 'नव', 'दिस'];
        parsedDate = {
          date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
          day: String(d.getDate()).padStart(2, '0'),
          month: monthsHi[d.getMonth()],
          monthShort: monthsShortHi[d.getMonth()],
          weekday: daysHi[d.getDay()]
        };
      }
    }

    const validCommunityId = (communityId && mongoose.Types.ObjectId.isValid(communityId)) ? communityId : null;
    const validCityId = (cityId && mongoose.Types.ObjectId.isValid(cityId)) ? cityId : undefined;
    const userId = req.user?._id || req.user?.id;

    const event = new Event({
      title,
      titleEn: titleEn || subtitle,
      date: parsedDate.date,
      day: parsedDate.day,
      month: parsedDate.month,
      monthShort: parsedDate.monthShort,
      weekday: parsedDate.weekday,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      startTime: startTime || 'TBA',
      endTime: endTime || 'TBA',
      time: time || startTime || 'TBA',
      timeEn: timeEn || startTime || 'TBA',
      venue: venue || address || 'TBA',
      venueEn: venueEn || address || 'TBA',
      address,
      cityId: validCityId,
      description,
      descriptionEn: descriptionEn || description,
      category: category || 'Cultural',
      categoryEn: categoryEn || category || 'Cultural',
      image: image || bannerImage || thumbnailImage,
      capacity: capacity ? parseInt(capacity) : 0,
      registrationRequired: !!registrationRequired,
      isFeatured: !!isFeatured,
      visibility: visibility || (validCommunityId ? 'COMMUNITY' : 'GLOBAL'),
      isGlobal: !validCommunityId || visibility === 'GLOBAL',
      communityId: validCommunityId,
      status: status || 'Published',
      createdByRole: 'ADMIN',
      createdBy: userId,
      entryFee: entryFee || 'Free',
      contact: contact || req.user?.phone || 'N/A',
      organizer: {
        name: req.user?.name || 'Admin',
        role: 'Admin',
        avatar: req.user?.avatar,
        initials: req.user?.name ? req.user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AD'
      },
      objectiveEn,
      programsEn: Array.isArray(programsEn) ? programsEn : (programsEn ? [programsEn] : []),
      audienceEn,
      importantInfoEn,
      tagsEn: Array.isArray(tagsEn) ? tagsEn : (tags ? tags.split(',').map(t => t.trim()) : [])
    });

    await event.save();

    try {
      await EventActivityLog.create({
        actor: { id: userId, name: req.user?.name || 'Admin', role: 'admin' },
        action: 'Create',
        event: { id: event._id, title: event.title },
        community: validCommunityId ? { id: validCommunityId } : undefined,
        description: `Admin ${req.user?.name || ''} created event "${event.title}"`
      });
    } catch (logErr) {
      console.warn('Event Activity Log Warning:', logErr.message);
    }

    try {
      const memberQuery = { accountStatus: { $ne: 'blocked' } };
      if (validCommunityId) { memberQuery.communityId = validCommunityId; }
      const memberIds = await User.find(memberQuery).distinct('_id');
      await notifyEventCreated(memberIds, event.title, event._id);
    } catch (notifyErr) {
      console.warn('[Notify] notifyEventCreated failed:', notifyErr.message);
    }

    res.status(201).json({
      status: 'success',
      data: event
    });
  } catch (error) {
    console.error('Admin Create Event Error:', error);
    res.status(500).json({ status: 'error', message: error.message || 'Failed to create event' });
  }
};

// @desc    Update any event (Admin overrides)
// @route   PUT /api/v1/admin/events/:eventId
// @access  Admin
exports.updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);

    if (!event || event.isDeleted) {
      return res.status(404).json({ status: 'fail', message: 'Event not found' });
    }

    const updates = req.body;
    updates.updatedBy = req.user?._id || req.user?.id;

    if (updates.communityId && !mongoose.Types.ObjectId.isValid(updates.communityId)) {
      updates.communityId = null;
    }
    if (updates.cityId && !mongoose.Types.ObjectId.isValid(updates.cityId)) {
      updates.cityId = undefined;
    }

    if (updates.startDate) {
      const d = new Date(updates.startDate);
      if (!isNaN(d.getTime())) {
        const daysHi = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
        const monthsHi = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
        const monthsShortHi = ['जन', 'फर', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुला', 'अग', 'सित', 'अक्तू', 'नव', 'दिस'];
        updates.date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        updates.day = String(d.getDate()).padStart(2, '0');
        updates.month = monthsHi[d.getMonth()];
        updates.monthShort = monthsShortHi[d.getMonth()];
        updates.weekday = daysHi[d.getDay()];
      }
    }

    if (updates.bannerImage || updates.thumbnailImage) {
      updates.image = updates.bannerImage || updates.thumbnailImage;
    }

    Object.assign(event, updates);
    await event.save();

    try {
      await EventActivityLog.create({
        actor: { id: req.user?._id || req.user?.id, name: req.user?.name || 'Admin', role: 'admin' },
        action: 'Update',
        event: { id: event._id, title: event.title },
        community: event.communityId ? { id: event.communityId } : undefined,
        description: `Admin ${req.user?.name || ''} modified details of event "${event.title}"`
      });
    } catch (logErr) {
      console.warn('Log warning:', logErr.message);
    }

    res.status(200).json({
      status: 'success',
      data: event
    });
  } catch (error) {
    console.error('Admin Update Event Error:', error);
    res.status(500).json({ status: 'error', message: error.message || 'Failed to update event' });
  }
};

// @desc    Soft Delete event
// @route   DELETE /api/v1/admin/events/:eventId
// @access  Admin
exports.deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);

    if (!event || event.isDeleted) {
      return res.status(404).json({ status: 'fail', message: 'Event not found' });
    }

    const userId = req.user?._id || req.user?.id;
    event.isDeleted = true;
    event.status = 'Deleted';
    event.deletedBy = userId;
    event.deletedAt = new Date();
    await event.save();

    try {
      await EventActivityLog.create({
        actor: { id: userId, name: req.user?.name || 'Admin', role: 'admin' },
        action: 'Delete',
        event: { id: event._id, title: event.title },
        community: event.communityId ? { id: event.communityId } : undefined,
        description: `Admin ${req.user?.name || ''} deleted event "${event.title}"`
      });
    } catch (logErr) {
      console.warn('Log warning:', logErr.message);
    }

    try {
      const respondedMemberIds = await EventResponse.find({
        eventId: event._id,
        $or: [{ response: { $in: ['Going', 'Interested'] } }, { isGoing: true }, { isInterested: true }]
      }).distinct('memberId');
      await notifyEventDeleted(respondedMemberIds, event.title, event._id);
    } catch (notifyErr) {
      console.warn('[Notify] notifyEventDeleted failed:', notifyErr.message);
    }

    res.status(200).json({
      status: 'success',
      message: 'Event deleted successfully.'
    });
  } catch (error) {
    console.error('Admin Delete Event Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete event' });
  }
};

// @desc    Cancel event
// @route   PATCH /api/v1/admin/events/:eventId/cancel
// @access  Admin
exports.cancelEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);

    if (!event || event.isDeleted) {
      return res.status(404).json({ status: 'fail', message: 'Event not found' });
    }

    const userId = req.user?._id || req.user?.id;
    event.status = 'Cancelled';
    event.cancelledBy = userId;
    event.cancelledAt = new Date();
    await event.save();

    try {
      const respondedMemberIds = await EventResponse.find({
        eventId: event._id,
        $or: [{ response: { $in: ['Going', 'Interested'] } }, { isGoing: true }, { isInterested: true }]
      }).distinct('memberId');
      await notifyEventCancelled(respondedMemberIds, event.title, event._id);
    } catch (notifyErr) {
      console.warn('[Notify] notifyEventCancelled failed:', notifyErr.message);
    }

    try {
      await EventActivityLog.create({
        actor: { id: userId, name: req.user?.name || 'Admin', role: 'admin' },
        action: 'Cancel',
        event: { id: event._id, title: event.title },
        community: event.communityId ? { id: event.communityId } : undefined,
        description: `Admin ${req.user?.name || ''} cancelled event "${event.title}"`
      });
    } catch (logErr) {
      console.warn('Log warning:', logErr.message);
    }

    res.status(200).json({
      status: 'success',
      data: event
    });
  } catch (error) {
    console.error('Admin Cancel Event Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to cancel event' });
  }
};

// @desc    Toggle featured status
// @route   PATCH /api/v1/admin/events/:eventId/feature
// @access  Admin
exports.toggleFeatured = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { isFeatured, priority } = req.body;

    const event = await Event.findById(eventId);
    if (!event || event.isDeleted) {
      return res.status(404).json({ status: 'fail', message: 'Event not found' });
    }

    event.isFeatured = isFeatured !== undefined ? !!isFeatured : !event.isFeatured;
    if (priority !== undefined) {
      event.featuredPriority = priority;
    }
    await event.save();

    res.status(200).json({
      status: 'success',
      data: event
    });
  } catch (error) {
    console.error('Admin Toggle Featured Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to toggle featured status' });
  }
};

// @desc    Update event status
// @route   PATCH /api/v1/admin/events/:eventId/status
// @access  Admin
exports.updateStatus = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status } = req.body;

    const event = await Event.findById(eventId);
    if (!event || event.isDeleted) {
      return res.status(404).json({ status: 'fail', message: 'Event not found' });
    }

    event.status = status;
    if (status === 'Cancelled') {
      event.cancelledBy = req.user?._id || req.user?.id;
      event.cancelledAt = new Date();
    }
    await event.save();

    res.status(200).json({
      status: 'success',
      data: event
    });
  } catch (error) {
    console.error('Admin Update Status Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update status' });
  }
};

// @desc    Get Event Monitoring Logs
// @route   GET /api/v1/admin/events/monitoring
// @access  Admin
exports.getMonitoringLogs = async (req, res) => {
  try {
    const logs = await EventActivityLog.find()
      .populate('community.id', 'name')
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();

    const formattedLogs = logs.map(l => ({
      id: l._id,
      actor: l.actor.name,
      role: l.actor.role,
      action: l.action,
      eventTitle: l.event.title,
      communityName: l.community?.name || 'Global',
      description: l.description,
      timestamp: l.timestamp
    }));

    res.status(200).json({
      status: 'success',
      data: formattedLogs
    });
  } catch (error) {
    console.error('Get Event Monitoring Logs Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch monitoring logs' });
  }
};

// @desc    Get Real Event Analytics aggregated from DB
// @route   GET /api/v1/admin/events/analytics
// @access  Admin
exports.getAnalytics = async (req, res) => {
  try {
    const events = await Event.find({ isDeleted: { $ne: true } }).lean();

    const totalEvents = events.length;
    const upcomingEvents = events.filter(e => e.status === 'Upcoming' || e.status === 'Published').length;
    const ongoingEvents = events.filter(e => e.status === 'Ongoing').length;
    const completedEvents = events.filter(e => e.status === 'Completed').length;
    const cancelledEvents = events.filter(e => e.status === 'Cancelled').length;

    const responseAgg = await EventResponse.aggregate([
      {
        $group: {
          _id: null,
          totalInterested: {
            $sum: { $cond: [{ $or: [{ $eq: ['$isInterested', true] }, { $eq: ['$response', 'Interested'] }] }, 1, 0] }
          },
          totalGoing: {
            $sum: { $cond: [{ $or: [{ $eq: ['$isGoing', true] }, { $eq: ['$registered', true] }, { $eq: ['$response', 'Going'] }] }, 1, 0] }
          },
          totalRegistrations: {
            $sum: { $cond: [{ $or: [{ $eq: ['$registered', true] }, { $eq: ['$isGoing', true] }] }, 1, 0] }
          }
        }
      }
    ]);

    const totals = responseAgg[0] || { totalInterested: 0, totalGoing: 0, totalRegistrations: 0 };

    res.status(200).json({
      status: 'success',
      data: {
        totalEvents,
        upcomingEvents,
        ongoingEvents,
        completedEvents,
        cancelledEvents,
        totalInterested: totals.totalInterested,
        totalGoing: totals.totalGoing,
        totalRegistrations: totals.totalRegistrations
      }
    });
  } catch (error) {
    console.error('Get Event Analytics Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch analytics' });
  }
};
