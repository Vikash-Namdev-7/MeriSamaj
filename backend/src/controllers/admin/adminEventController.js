const Event = require('../../models/Event');
const EventActivityLog = require('../../models/EventActivityLog');
const Community = require('../../models/Community');

// @desc    Get all events with filters, search, and pagination
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

    // Search query
    if (search.trim()) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { titleEn: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
        { 'organizer.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Community filter
    if (communityId !== 'all') {
      query.communityId = communityId;
    }

    // Category filter
    if (category !== 'all') {
      query.category = category;
    }

    // Status filter - wait, some events use status based on dates, or stored status.
    // If we calculate status dynamically, let's see. If the event does not have status in DB, we default to stored or calculated.
    // Let's filter by the stored category/status.
    if (status !== 'all') {
      query.status = status;
    }

    // Featured filter
    if (isFeatured !== 'all') {
      query.isFeatured = isFeatured === 'true';
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sort = {};
    sort[sortField] = sortOrder === 'asc' ? 1 : -1;

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('communityId', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

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

// @desc    Get single event by ID with detailed attendee profiles
// @route   GET /api/v1/admin/events/:eventId
// @access  Admin
exports.getEventById = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findOne({ _id: eventId, isDeleted: { $ne: true } })
      .populate('communityId', 'name')
      .populate('attendees', 'name email phone avatar gotra communityId')
      .populate('interested', 'name email phone avatar gotra communityId')
      .lean();

    if (!event) {
      return res.status(404).json({ status: 'fail', message: 'Event not found' });
    }

    // Format attendee detailed profiles
    const attendeeProfiles = (event.attendees || []).map(u => {
      const initials = u.name ? u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'M';
      return {
        id: u._id,
        name: u.name || 'Member',
        email: u.email || 'N/A',
        phone: u.phone || 'N/A',
        avatar: u.avatar || null,
        initials,
        gotra: u.gotra || 'N/A'
      };
    });

    // Format interested detailed profiles
    const interestedProfiles = (event.interested || []).map(u => {
      const initials = u.name ? u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'M';
      return {
        id: u._id,
        name: u.name || 'Member',
        email: u.email || 'N/A',
        phone: u.phone || 'N/A',
        avatar: u.avatar || null,
        initials,
        gotra: u.gotra || 'N/A'
      };
    });

    res.status(200).json({
      status: 'success',
      data: {
        ...event,
        attendeeProfiles,
        interestedProfiles
      }
    });
  } catch (error) {
    console.error('Admin Get Event By ID Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch event details' });
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
    Object.assign(event, updates);
    await event.save();

    await EventActivityLog.create({
      actor: { id: req.user._id, name: req.user.name || 'Admin', role: 'admin' },
      action: 'Update',
      event: { id: event._id, title: event.title },
      community: { id: event.communityId },
      description: `Admin ${req.user.name || ''} modified details of event "${event.title}"`
    });

    res.status(200).json({
      status: 'success',
      data: event
    });
  } catch (error) {
    console.error('Admin Update Event Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update event' });
  }
};

// @desc    Deactivate/Delete event
// @route   DELETE /api/v1/admin/events/:eventId
// @access  Admin
exports.deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);

    if (!event || event.isDeleted) {
      return res.status(404).json({ status: 'fail', message: 'Event not found' });
    }

    event.isDeleted = true;
    await event.save();

    await EventActivityLog.create({
      actor: { id: req.user._id, name: req.user.name || 'Admin', role: 'admin' },
      action: 'Delete',
      event: { id: event._id, title: event.title },
      community: { id: event.communityId },
      description: `Admin ${req.user.name || ''} deleted event "${event.title}"`
    });

    res.status(200).json({
      status: 'success',
      message: 'Event deleted successfully.'
    });
  } catch (error) {
    console.error('Admin Delete Event Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete event' });
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

    await EventActivityLog.create({
      actor: { id: req.user._id, name: req.user.name || 'Admin', role: 'admin' },
      action: event.isFeatured ? 'Feature' : 'Unfeature',
      event: { id: event._id, title: event.title },
      community: { id: event.communityId },
      description: `Admin ${req.user.name || ''} ${event.isFeatured ? 'marked' : 'unmarked'} event "${event.title}" as Featured`
    });

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
    await event.save();

    await EventActivityLog.create({
      actor: { id: req.user._id, name: req.user.name || 'Admin', role: 'admin' },
      action: 'Status Change',
      event: { id: event._id, title: event.title },
      community: { id: event.communityId },
      description: `Admin ${req.user.name || ''} changed status of event "${event.title}" to ${status}`
    });

    res.status(200).json({
      status: 'success',
      data: event
    });
  } catch (error) {
    console.error('Admin Update Status Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update status' });
  }
};

// @desc    Get Event Activities timeline logs
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

// @desc    Get Event Analytics aggregated
// @route   GET /api/v1/admin/events/analytics
// @access  Admin
exports.getAnalytics = async (req, res) => {
  try {
    const events = await Event.find({ isDeleted: { $ne: true } }).lean();

    const totalEvents = events.length;
    const featuredEvents = events.filter(e => e.isFeatured).length;

    // Engagement summary
    let totalAttendees = 0;
    let totalInterested = 0;
    events.forEach(e => {
      totalAttendees += (e.attendees || []).length;
      totalInterested += (e.interested || []).length;
    });

    const avgAttendees = totalEvents > 0 ? Math.round(totalAttendees / totalEvents) : 0;

    // Category distribution
    const categoriesMap = {};
    events.forEach(e => {
      categoriesMap[e.category] = (categoriesMap[e.category] || 0) + 1;
    });
    const categoryDistribution = Object.keys(categoriesMap).map(k => ({
      category: k,
      count: categoriesMap[k]
    }));

    // Community comparison
    const communitiesMap = {};
    events.forEach(e => {
      const commId = e.communityId?.toString() || 'Global';
      if (!communitiesMap[commId]) {
        communitiesMap[commId] = {
          communityId: commId,
          totalEvents: 0,
          totalAttendees: 0,
          totalInterested: 0
        };
      }
      communitiesMap[commId].totalEvents += 1;
      communitiesMap[commId].totalAttendees += (e.attendees || []).length;
      communitiesMap[commId].totalInterested += (e.interested || []).length;
    });

    // Populate community names
    const populatedCommunityList = [];
    for (const key of Object.keys(communitiesMap)) {
      let name = 'Global';
      if (key !== 'Global') {
        const c = await Community.findById(key).select('name').lean();
        name = c ? c.name : 'Unknown Community';
      }
      populatedCommunityList.push({
        ...communitiesMap[key],
        communityName: name
      });
    }

    // Popular rankings
    const sortedByAttendees = [...events].sort((a, b) => (b.attendees || []).length - (a.attendees || []).length).slice(0, 5);
    const sortedByInterested = [...events].sort((a, b) => (b.interested || []).length - (a.interested || []).length).slice(0, 5);

    const popularEvents = sortedByAttendees.map(e => ({
      id: e._id,
      title: e.title,
      attendees: (e.attendees || []).length,
      interested: (e.interested || []).length
    }));

    const mostInterestedEvents = sortedByInterested.map(e => ({
      id: e._id,
      title: e.title,
      attendees: (e.attendees || []).length,
      interested: (e.interested || []).length
    }));

    // Created this month stats
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);
    const createdThisMonth = events.filter(e => new Date(e.createdAt) >= startOfMonth).length;

    res.status(200).json({
      status: 'success',
      data: {
        totalEvents,
        featuredEvents,
        totalAttendees,
        totalInterested,
        avgAttendees,
        createdThisMonth,
        categoryDistribution,
        communityWise: populatedCommunityList,
        popularEvents,
        mostInterestedEvents
      }
    });
  } catch (error) {
    console.error('Get Event Analytics Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch analytics' });
  }
};

// @desc    Create an event by Admin (Always Global by default unless specified)
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
      city,
      googleMapsLink,
      startDate,
      endDate,
      timings,
      time,
      timeEn,
      entryFee,
      contact,
      objectiveEn,
      programsEn,
      audienceEn,
      importantInfoEn,
      tagsEn,
      tags,
      isFeatured,
      isGlobal,
      communityId
    } = req.body;

    // Date parsing helper
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

    const event = new Event({
      title,
      titleEn: titleEn || subtitle,
      date: parsedDate.date,
      day: parsedDate.day,
      month: parsedDate.month,
      monthShort: parsedDate.monthShort,
      weekday: parsedDate.weekday,
      time: time || timings || 'TBA',
      timeEn: timeEn || timings || 'TBA',
      venue: venue || address || 'TBA',
      venueEn: venueEn || address || 'TBA',
      description,
      descriptionEn: descriptionEn || description,
      category: category || 'Cultural',
      categoryEn: categoryEn || category || 'Cultural',
      image: image || bannerImage || thumbnailImage,
      isFeatured: !!isFeatured,
      isGlobal: isGlobal !== undefined ? !!isGlobal : true,
      entryFee: entryFee || 'Free',
      contact: contact || req.user.phone,
      communityId: communityId || null,
      organizer: {
        name: req.user.name || 'Admin',
        role: 'Admin',
        avatar: req.user.avatar,
        initials: req.user.name ? req.user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AD'
      },
      objectiveEn,
      programsEn: Array.isArray(programsEn) ? programsEn : (programsEn ? [programsEn] : []),
      audienceEn,
      importantInfoEn,
      tagsEn: Array.isArray(tagsEn) ? tagsEn : (tags ? tags.split(',').map(t => t.trim()) : []),
      createdBy: req.user._id
    });

    await event.save();

    await EventActivityLog.create({
      actor: { id: req.user._id, name: req.user.name || 'Admin', role: 'admin' },
      action: 'Create',
      event: { id: event._id, title: event.title },
      community: event.communityId ? { id: event.communityId } : undefined,
      description: `Admin ${req.user.name || ''} created global event "${event.title}"`
    });

    res.status(201).json({
      status: 'success',
      data: event
    });
  } catch (error) {
    console.error('Admin Create Event Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create event' });
  }
};
