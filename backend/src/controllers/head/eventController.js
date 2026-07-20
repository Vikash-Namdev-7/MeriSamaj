const mongoose = require('mongoose');
const Event = require('../../models/Event');
const EventActivityLog = require('../../models/EventActivityLog');
const Community = require('../../models/Community');

// Date parser helper to generate localized months, short months, day, and date string
const parseEventDate = (startDateStr) => {
  const d = new Date(startDateStr);
  if (isNaN(d.getTime())) {
    return {
      date: 'TBA',
      day: '01',
      month: 'Month',
      monthShort: 'MON',
      weekday: 'Day'
    };
  }

  const daysHi = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
  const monthsHi = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
  const monthsShortHi = ['जन', 'फर', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुला', 'अग', 'सित', 'अक्तू', 'नव', 'दिस'];

  const weekdayVal = daysHi[d.getDay()];
  const dayVal = String(d.getDate()).padStart(2, '0');
  const monthHiVal = monthsHi[d.getMonth()];
  const monthShortVal = monthsShortHi[d.getMonth()];
  
  // Format as e.g. "2026-07-15"
  const yr = d.getFullYear();
  const mt = String(d.getMonth() + 1).padStart(2, '0');
  const dy = String(d.getDate()).padStart(2, '0');
  const formattedDate = `${yr}-${mt}-${dy}`;

  return {
    date: formattedDate,
    day: dayVal,
    month: monthHiVal,
    monthShort: monthShortVal,
    weekday: weekdayVal
  };
};

// Helper to resolve the community ID for write/bind operations
const getEventCommunityId = async (req) => {
  // 1. Check req.communityId or req.user.communityId
  let communityId = req.communityId || req.user?.communityId;
  if (communityId) return communityId;

  // 2. Head role fallback: first assigned community ID
  if (req.user?.role === 'head' && req.user.assignedCommunityIds && req.user.assignedCommunityIds.length > 0) {
    return req.user.assignedCommunityIds[0];
  }

  // 3. Fallback for users not yet fully migrated to ObjectId references
  if (req.user?.community) {
    const comm = await Community.findOne({ name: req.user.community });
    if (comm) return comm._id;
  }

  // 4. Dev Fallback: Return a dummy one so the UI still functions for testing
  return new mongoose.Types.ObjectId('000000000000000000000000');
};

// Helper to build the community filter for queries (Read operations)
const getEventQueryFilter = (req) => {
  // 1. If head user, match any of their assigned communities
  if (req.user?.role === 'head' && req.user.assignedCommunityIds && req.user.assignedCommunityIds.length > 0) {
    return { communityId: { $in: req.user.assignedCommunityIds } };
  }

  // 2. Check req.communityId
  if (req.communityId) {
    return { communityId: req.communityId };
  }

  // 3. Check req.user.communityId
  if (req.user?.communityId) {
    return { communityId: req.user.communityId };
  }

  // 4. Fallback for pre-migration data (community String)
  if (req.user?.community) {
    return { community: req.user.community };
  }

  // 5. Dev fallback to dummy ID
  return { communityId: new mongoose.Types.ObjectId('000000000000000000000000') };
};

// Helper to check if user has access to a specific community's event
const hasEventAccess = (req, eventCommunityId) => {
  if (!eventCommunityId) return false;
  
  if (req.user?.role === 'head' && req.user.assignedCommunityIds && req.user.assignedCommunityIds.length > 0) {
    return req.user.assignedCommunityIds.some(id => id.toString() === eventCommunityId.toString());
  }
  
  const communityId = req.communityId || req.user?.communityId;
  if (communityId) {
    return eventCommunityId.toString() === communityId.toString();
  }
  
  return false;
};

// @desc    Get head events for their community (Strict Isolation)
// @route   GET /api/v1/head/events
// @access  Head
exports.getHeadEvents = async (req, res) => {
  try {
    const queryFilter = getEventQueryFilter(req);
    const query = { ...queryFilter, isDeleted: { $ne: true } };

    const events = await Event.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: events
    });
  } catch (error) {
    console.error('Get Head Events Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch events' });
  }
};

// @desc    Create a new event (Automatic Community Binding)
// @route   POST /api/v1/head/events
// @access  Head
exports.createEvent = async (req, res) => {
  try {
    const communityId = await getEventCommunityId(req);
    if (!communityId) {
      return res.status(400).json({ status: 'fail', message: 'No community associated with this account.' });
    }

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
      isFeatured
    } = req.body;

    const parsedDate = parseEventDate(startDate || new Date());

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
      address,
      city,
      googleMapsLink,
      description,
      descriptionEn: descriptionEn || description,
      category: category || 'Cultural',
      categoryEn: categoryEn || category || 'Cultural',
      image: image || bannerImage || thumbnailImage,
      isFeatured: !!isFeatured,
      entryFee: entryFee || 'Free',
      contact: contact || req.user.phone,
      communityId, // Enforce community of authenticated Head
      organizer: {
        name: req.user.name || 'Community Head',
        role: req.user.role === 'head' ? 'Community Head' : 'Admin',
        avatar: req.user.avatar,
        initials: req.user.name ? req.user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'CH'
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
      actor: { id: req.user._id, name: req.user.name || 'Community Head', role: req.user.role || 'head' },
      action: 'Create',
      event: { id: event._id, title: event.title },
      community: { id: event.communityId },
      description: `Community Head ${req.user.name || ''} created event "${event.title}"`
    });

    res.status(201).json({
      status: 'success',
      data: event
    });
  } catch (error) {
    console.error('Create Event Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create event' });
  }
};

// @desc    Update event details (Strict Isolation Check)
// @route   PUT /api/v1/head/events/:eventId
// @access  Head
exports.updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findOne({ _id: eventId });
    if (!event || event.isDeleted) {
      return res.status(404).json({ status: 'fail', message: 'Event not found.' });
    }

    // Strict Scope check: must belong to the head's community
    if (!hasEventAccess(req, event.communityId)) {
      return res.status(403).json({ status: 'fail', message: 'Access denied. You cannot edit events from other communities.' });
    }

    const updates = req.body;

    if (updates.startDate) {
      const parsedDate = parseEventDate(updates.startDate);
      updates.date = parsedDate.date;
      updates.day = parsedDate.day;
      updates.month = parsedDate.month;
      updates.monthShort = parsedDate.monthShort;
      updates.weekday = parsedDate.weekday;
    }

    if (updates.subtitle) updates.titleEn = updates.subtitle;
    if (updates.timings) {
      updates.time = updates.timings;
      updates.timeEn = updates.timings;
    }
    if (updates.address) {
      updates.venue = updates.address;
      updates.venueEn = updates.address;
    }
    if (updates.bannerImage || updates.thumbnailImage) {
      updates.image = updates.bannerImage || updates.thumbnailImage;
    }

    Object.assign(event, updates);
    await event.save();

    await EventActivityLog.create({
      actor: { id: req.user._id, name: req.user.name || 'Community Head', role: req.user.role || 'head' },
      action: 'Update',
      event: { id: event._id, title: event.title },
      community: { id: event.communityId },
      description: `Community Head ${req.user.name || ''} updated event "${event.title}"`
    });

    res.status(200).json({
      status: 'success',
      data: event
    });
  } catch (error) {
    console.error('Update Event Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update event' });
  }
};

// @desc    Soft-delete event (Strict Isolation Check)
// @route   DELETE /api/v1/head/events/:eventId
// @access  Head
exports.deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findOne({ _id: eventId });
    if (!event || event.isDeleted) {
      return res.status(404).json({ status: 'fail', message: 'Event not found.' });
    }

    // Strict Scope check: must belong to the head's community
    if (!hasEventAccess(req, event.communityId)) {
      return res.status(403).json({ status: 'fail', message: 'Access denied. You cannot delete events from other communities.' });
    }

    event.isDeleted = true;
    await event.save();

    await EventActivityLog.create({
      actor: { id: req.user._id, name: req.user.name || 'Community Head', role: req.user.role || 'head' },
      action: 'Delete',
      event: { id: event._id, title: event.title },
      community: { id: event.communityId },
      description: `Community Head ${req.user.name || ''} deleted event "${event.title}"`
    });

    res.status(200).json({
      status: 'success',
      message: 'Event deleted successfully.'
    });
  } catch (error) {
    console.error('Delete Event Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete event' });
  }
};

// @desc    Toggle Featured Event status
// @route   PATCH /api/v1/head/events/:eventId/feature
// @access  Head
exports.toggleFeatured = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findOne({ _id: eventId, isDeleted: { $ne: true } });
    if (!event) {
      return res.status(404).json({ status: 'fail', message: 'Event not found' });
    }

    if (!hasEventAccess(req, event.communityId)) {
      return res.status(403).json({ status: 'fail', message: 'Access denied. You can only feature events for your own community.' });
    }

    event.isFeatured = !event.isFeatured;
    await event.save();

    await EventActivityLog.create({
      actor: { id: req.user._id, name: req.user.name || 'Community Head', role: 'head' },
      action: event.isFeatured ? 'Feature' : 'Unfeature',
      event: { id: event._id, title: event.title },
      community: { id: event.communityId },
      description: `Community Head ${req.user.name || ''} ${event.isFeatured ? 'featured' : 'unfeatured'} event "${event.title}"`
    });

    res.status(200).json({ status: 'success', data: event });
  } catch (error) {
    console.error('Toggle Featured Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update featured status' });
  }
};

// @desc    Update Event status
// @route   PATCH /api/v1/head/events/:eventId/status
// @access  Head
exports.updateStatus = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status } = req.body;

    const event = await Event.findOne({ _id: eventId, isDeleted: { $ne: true } });
    if (!event) {
      return res.status(404).json({ status: 'fail', message: 'Event not found' });
    }

    if (!hasEventAccess(req, event.communityId)) {
      return res.status(403).json({ status: 'fail', message: 'Access denied. You can only update status for events in your own community.' });
    }

    event.status = status;
    await event.save();

    await EventActivityLog.create({
      actor: { id: req.user._id, name: req.user.name || 'Community Head', role: 'head' },
      action: 'Status Change',
      event: { id: event._id, title: event.title },
      community: { id: event.communityId },
      description: `Community Head ${req.user.name || ''} updated status of event "${event.title}" to ${status}`
    });

    res.status(200).json({ status: 'success', data: event });
  } catch (error) {
    console.error('Update Status Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update status' });
  }
};

// @desc    Get Event Monitoring Logs for this community
// @route   GET /api/v1/head/events/monitoring
// @access  Head
exports.getMonitoringLogs = async (req, res) => {
  try {
    const queryFilter = getEventQueryFilter(req);
    const logQuery = {};
    if (queryFilter.communityId) {
      logQuery['community.id'] = queryFilter.communityId;
    } else if (queryFilter.community) {
      logQuery['community.name'] = queryFilter.community;
    }

    const logs = await EventActivityLog.find(logQuery)
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();

    const formattedLogs = logs.map(l => ({
      id: l._id,
      actor: l.actor.name,
      role: l.actor.role,
      action: l.action,
      eventTitle: l.event.title,
      description: l.description,
      timestamp: l.timestamp
    }));

    res.status(200).json({ status: 'success', data: formattedLogs });
  } catch (error) {
    console.error('Get Monitoring Logs Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch monitoring logs' });
  }
};

// @desc    Get Event Analytics aggregated for this community
// @route   GET /api/v1/head/events/analytics
// @access  Head
exports.getAnalytics = async (req, res) => {
  try {
    const queryFilter = getEventQueryFilter(req);
    const query = { ...queryFilter, isDeleted: { $ne: true } };

    const events = await Event.find(query).lean();

    const totalEvents = events.length;
    const featuredEvents = events.filter(e => e.isFeatured).length;
    const upcomingEvents = events.filter(e => ['Draft', 'Published', 'Registration Open'].includes(e.status)).length;
    const completedEvents = events.filter(e => e.status === 'Completed').length;
    const liveEvents = events.filter(e => e.status === 'Event Live').length;

    let totalAttendees = 0;
    let totalInterested = 0;
    let createdByThisHead = 0;

    events.forEach(e => {
      totalAttendees += (e.attendees || []).length;
      totalInterested += (e.interested || []).length;
      if (e.createdBy?.toString() === req.user._id.toString()) {
        createdByThisHead += 1;
      }
    });

    const categoriesMap = {};
    events.forEach(e => {
      categoriesMap[e.category] = (categoriesMap[e.category] || 0) + 1;
    });
    const categoryDistribution = Object.keys(categoriesMap).map(k => ({
      category: k,
      count: categoriesMap[k]
    }));

    const popularEvents = [...events]
      .sort((a, b) => (b.attendees || []).length - (a.attendees || []).length)
      .slice(0, 5)
      .map(e => ({
        id: e._id,
        title: e.title,
        attendees: (e.attendees || []).length,
        interested: (e.interested || []).length
      }));

    res.status(200).json({
      status: 'success',
      data: {
        totalEvents,
        featuredEvents,
        upcomingEvents,
        completedEvents,
        liveEvents,
        totalAttendees,
        totalInterested,
        createdByThisHead,
        categoryDistribution,
        popularEvents
      }
    });
  } catch (error) {
    console.error('Get Head Analytics Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch analytics data' });
  }
};

// @desc    Get attendees for a community event
// @route   GET /api/v1/head/events/:eventId/attendees
// @access  Head
exports.getAttendees = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findOne({ _id: eventId, isDeleted: { $ne: true } })
      .populate('attendees', 'name email phone avatar gotra communityId')
      .lean();

    if (!event) {
      return res.status(404).json({ status: 'fail', message: 'Event not found' });
    }

    if (!hasEventAccess(req, event.communityId)) {
      return res.status(403).json({ status: 'fail', message: 'Access denied. Event does not belong to your community.' });
    }

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

    res.status(200).json({ status: 'success', data: attendeeProfiles });
  } catch (error) {
    console.error('Get Event Attendees Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch attendees' });
  }
};

// @desc    Get interested users for a community event
// @route   GET /api/v1/head/events/:eventId/interested
// @access  Head
exports.getInterested = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findOne({ _id: eventId, isDeleted: { $ne: true } })
      .populate('interested', 'name email phone avatar gotra communityId')
      .lean();

    if (!event) {
      return res.status(404).json({ status: 'fail', message: 'Event not found' });
    }

    if (!hasEventAccess(req, event.communityId)) {
      return res.status(403).json({ status: 'fail', message: 'Access denied.' });
    }

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

    res.status(200).json({ status: 'success', data: interestedProfiles });
  } catch (error) {
    console.error('Get Interested Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch interested list' });
  }
};
