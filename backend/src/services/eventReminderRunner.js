const Event = require('../models/Event');
const EventResponse = require('../models/EventResponse');
const { createNotification } = require('./notificationService');
const { sendPushNotification } = require('./pushNotificationService');

let isRunning = false;

/**
 * Checks for upcoming events starting within the next 60-65 minutes
 * and sends reminder notifications to attending members.
 */
const checkAndSendEventReminders = async () => {
  if (isRunning) return;
  isRunning = true;

  try {
    const now = new Date();
    const targetStart = new Date(now.getTime() + 55 * 60 * 1000); // ~55 mins from now
    const targetEnd = new Date(now.getTime() + 65 * 60 * 1000);   // ~65 mins from now

    // Find active events starting in ~1 hour
    const upcomingEvents = await Event.find({
      isDeleted: { $ne: true },
      status: { $nin: ['Draft', 'Deleted', 'Archived', 'Cancelled'] },
      reminderSent: { $ne: true },
      date: { $gte: targetStart, $lte: targetEnd }
    }).lean();

    for (const event of upcomingEvents) {
      // Find all attendees who have registered or toggled reminder
      const responses = await EventResponse.find({
        eventId: event._id,
        $or: [{ isGoing: true }, { registered: true }, { reminderEnabled: true }]
      }).select('memberId').lean();

      for (const resp of responses) {
        if (!resp.memberId) continue;

        const notif = await createNotification({
          userId: resp.memberId,
          communityId: event.communityId,
          module: 'events',
          type: 'event_reminder',
          title: 'Event Reminder ⏰',
          message: `"${event.title}" is starting in 1 hour at ${event.venue || 'the scheduled venue'}.`,
          icon: '⏰',
          priority: 'high',
          actionUrl: `/member/events/${event._id}`,
          referenceId: event._id,
          referenceType: 'Event'
        });

        if (notif) {
          sendPushNotification({
            userId: resp.memberId,
            notificationId: notif._id,
            type: 'event_reminder',
            title: 'Event Reminder ⏰',
            message: `"${event.title}" is starting in 1 hour at ${event.venue || 'the scheduled venue'}.`,
            icon: '⏰',
            actionUrl: `/member/events/${event._id}`
          }).catch(err => console.error('[EventReminderPushError]', err.message));
        }
      }

      // Mark event reminder as sent
      await Event.findByIdAndUpdate(event._id, { reminderSent: true });
    }
  } catch (err) {
    console.error('[EventReminderRunnerError]', err.message);
  } finally {
    isRunning = false;
  }
};

/**
 * Initializes periodic interval check for event reminders (runs every 5 minutes).
 */
const initEventReminderRunner = () => {
  // Run once on startup after 10 seconds
  setTimeout(checkAndSendEventReminders, 10000);
  // Interval every 5 minutes
  setInterval(checkAndSendEventReminders, 5 * 60 * 1000);
};

module.exports = {
  checkAndSendEventReminders,
  initEventReminderRunner
};
