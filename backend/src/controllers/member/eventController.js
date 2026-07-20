const Event = require('../../models/Event');
const User = require('../../models/User');
const EventActivityLog = require('../../models/EventActivityLog');

// Helper to format an event for the frontend member app
const formatEvent = (event, userId) => {
  const isRegistered = event.attendees ? event.attendees.some(id => id.toString() === userId.toString()) : false;
  const isInterested = event.interested ? event.interested.some(id => id.toString() === userId.toString()) : false;
  const isBookmarked = event.bookmarks ? event.bookmarks.some(id => id.toString() === userId.toString()) : false;
  const isReminderSet = event.reminders ? event.reminders.some(id => id.toString() === userId.toString()) : false;

  return {
    id: event._id,
    title: event.title,
    titleEn: event.titleEn,
    date: event.date,
    day: event.day,
    month: event.month,
    monthShort: event.monthShort,
    weekday: event.weekday,
    time: event.time,
    timeEn: event.timeEn,
    venue: event.venue,
    venueEn: event.venueEn,
    description: event.description,
    descriptionEn: event.descriptionEn,
    category: event.category,
    categoryEn: event.categoryEn || event.category,
    image: event.image,
    isFeatured: event.isFeatured,
    entryFee: event.entryFee,
    contact: event.contact,
    communityId: event.communityId,
    organizer: event.organizer || { name: 'Samaj President', role: 'President', initials: 'SP' },
    objectiveEn: event.objectiveEn,
    programsEn: event.programsEn || [],
    audienceEn: event.audienceEn,
    importantInfoEn: event.importantInfoEn,
    tagsEn: event.tagsEn || [],
    attendees: event.attendees ? event.attendees.length : 0,
    interested: event.interested ? event.interested.length : 0,
    isRegistered,
    isInterested,
    isBookmarked,
    isReminderSet,
    gallery: event.gallery || [],
    announcements: event.announcements || []
  };
};

// @desc    Get member events for their community
// @route   GET /api/v1/member/events
// @access  Member
exports.getEvents = async (req, res) => {
  try {
    const userId = req.user._id;
    const communityId = req.communityId || req.user.communityId;

    if (!communityId) {
      return res.status(400).json({ status: 'fail', message: 'No community associated with this member account.' });
    }

    // Filter strictly by community OR global events, & not deleted
    const query = { 
      isDeleted: { $ne: true },
      $or: [
        { communityId },
        { isGlobal: true },
        { communityId: null }
      ]
    };

    const events = await Event.find(query).sort({ createdAt: -1 }).lean();

    const formattedEvents = events.map(e => formatEvent(e, userId));

    res.status(200).json({
      status: 'success',
      data: formattedEvents
    });
  } catch (error) {
    console.error('Get Member Events Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch events' });
  }
};

// @desc    Get single event by ID with populated attendee list
// @route   GET /api/v1/member/events/:eventId
// @access  Member
exports.getEventById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { eventId } = req.params;
    const communityId = req.communityId || req.user.communityId;

    const event = await Event.findOne({ _id: eventId, isDeleted: { $ne: true } })
      .populate('attendees', 'name avatar')
      .lean();

    if (!event) {
      return res.status(404).json({ status: 'fail', message: 'Event not found or has been removed.' });
    }

    // Strict community authorization check or global
    if (event.communityId && event.communityId.toString() !== communityId.toString() && !event.isGlobal) {
      return res.status(403).json({ status: 'fail', message: 'Access denied. You can only view events for your own community.' });
    }

    const formatted = formatEvent(event, userId);

    // Provide populated attendee profiles for detail page
    const attendeeProfiles = (event.attendees || []).map(u => {
      const initials = u.name ? u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'M';
      return {
        id: u._id,
        name: u.name || 'Member',
        avatar: u.avatar || null,
        initials
      };
    });

    res.status(200).json({
      status: 'success',
      data: {
        ...formatted,
        attendeeProfiles
      }
    });
  } catch (error) {
    console.error('Get Event By ID Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch event details' });
  }
};

// @desc    Toggle Interested status
// @route   POST /api/v1/member/events/:eventId/interested
// @access  Member
exports.toggleInterested = async (req, res) => {
  try {
    const userId = req.user._id;
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event || event.isDeleted) {
      return res.status(404).json({ status: 'fail', message: 'Event not found' });
    }

    const communityId = req.communityId || req.user.communityId;
    if (event.communityId && event.communityId.toString() !== communityId.toString() && !event.isGlobal) {
      return res.status(403).json({ status: 'fail', message: 'Access denied. You cannot interact with this event.' });
    }

    const index = event.interested.indexOf(userId);
    let isInterested = false;

    if (index === -1) {
      event.interested.push(userId);
      isInterested = true;
      await EventActivityLog.create({
        actor: { id: userId, name: req.user.name || 'Member', role: req.user.role || 'member' },
        action: 'Interest Join',
        event: { id: event._id, title: event.title },
        community: { id: event.communityId },
        description: `${req.user.name || 'Member'} marked interest in event "${event.title}"`
      });
    } else {
      event.interested.splice(index, 1);
      await EventActivityLog.create({
        actor: { id: userId, name: req.user.name || 'Member', role: req.user.role || 'member' },
        action: 'Interest Leave',
        event: { id: event._id, title: event.title },
        community: { id: event.communityId },
        description: `${req.user.name || 'Member'} removed interest from event "${event.title}"`
      });
    }

    await event.save();

    res.status(200).json({
      status: 'success',
      data: {
        isInterested,
        interestedCount: event.interested.length
      }
    });
  } catch (error) {
    console.error('Toggle Interested Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to toggle interest status' });
  }
};

// @desc    Toggle Attending / Join status
// @route   POST /api/v1/member/events/:eventId/attend
// @access  Member
exports.toggleAttend = async (req, res) => {
  try {
    const userId = req.user._id;
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event || event.isDeleted) {
      return res.status(404).json({ status: 'fail', message: 'Event not found' });
    }

    const communityId = req.communityId || req.user.communityId;
    if (event.communityId && event.communityId.toString() !== communityId.toString() && !event.isGlobal) {
      return res.status(403).json({ status: 'fail', message: 'Access denied. You cannot interact with this event.' });
    }

    const index = event.attendees.indexOf(userId);
    let isRegistered = false;

    if (index === -1) {
      event.attendees.push(userId);
      isRegistered = true;
      await EventActivityLog.create({
        actor: { id: userId, name: req.user.name || 'Member', role: req.user.role || 'member' },
        action: 'RSVP Join',
        event: { id: event._id, title: event.title },
        community: { id: event.communityId },
        description: `${req.user.name || 'Member'} registered/joined the event "${event.title}"`
      });
    } else {
      event.attendees.splice(index, 1);
      await EventActivityLog.create({
        actor: { id: userId, name: req.user.name || 'Member', role: req.user.role || 'member' },
        action: 'RSVP Leave',
        event: { id: event._id, title: event.title },
        community: { id: event.communityId },
        description: `${req.user.name || 'Member'} cancelled registration for event "${event.title}"`
      });
    }

    await event.save();

    res.status(200).json({
      status: 'success',
      data: {
        isRegistered,
        attendeesCount: event.attendees.length
      }
    });
  } catch (error) {
    console.error('Toggle Attend Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update attendance status' });
  }
};

// @desc    Toggle Bookmark status
// @route   POST /api/v1/member/events/:eventId/bookmark
// @access  Member
exports.toggleBookmark = async (req, res) => {
  try {
    const userId = req.user._id;
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event || event.isDeleted) {
      return res.status(404).json({ status: 'fail', message: 'Event not found' });
    }

    const communityId = req.communityId || req.user.communityId;
    if (event.communityId && event.communityId.toString() !== communityId.toString() && !event.isGlobal) {
      return res.status(403).json({ status: 'fail', message: 'Access denied. You cannot interact with this event.' });
    }

    const index = event.bookmarks.indexOf(userId);
    let isBookmarked = false;

    if (index === -1) {
      event.bookmarks.push(userId);
      isBookmarked = true;
    } else {
      event.bookmarks.splice(index, 1);
    }

    await event.save();

    res.status(200).json({
      status: 'success',
      data: {
        isBookmarked
      }
    });
  } catch (error) {
    console.error('Toggle Bookmark Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update bookmark status' });
  }
};

// @desc    Toggle Reminder / Notification status
// @route   POST /api/v1/member/events/:eventId/reminder
// @access  Member
exports.toggleReminder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event || event.isDeleted) {
      return res.status(404).json({ status: 'fail', message: 'Event not found' });
    }

    const communityId = req.communityId || req.user.communityId;
    if (event.communityId && event.communityId.toString() !== communityId.toString() && !event.isGlobal) {
      return res.status(403).json({ status: 'fail', message: 'Access denied. You cannot interact with this event.' });
    }

    const index = event.reminders.indexOf(userId);
    let isReminderSet = false;

    if (index === -1) {
      event.reminders.push(userId);
      isReminderSet = true;
    } else {
      event.reminders.splice(index, 1);
    }

    await event.save();

    res.status(200).json({
      status: 'success',
      data: {
        isReminderSet
      }
    });
  } catch (error) {
    console.error('Toggle Reminder Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update reminder status' });
  }
};
