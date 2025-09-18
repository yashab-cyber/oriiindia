import cron from 'node-cron';
import Event from '../models/Event.js';
import NotificationService from './NotificationService.js';

class EventReminderService {
  constructor() {
    this.scheduledJobs = new Map();
    this.initializeCronJobs();
  }

  initializeCronJobs() {
    // Run every hour to check for events needing reminders
    cron.schedule('0 * * * *', () => {
      this.processEventReminders();
    });

    // Run every day at midnight to cleanup expired events
    cron.schedule('0 0 * * *', () => {
      this.cleanupExpiredEvents();
    });

    console.log('📅 Event reminder service initialized');
  }

  async processEventReminders() {
    try {
      const now = new Date();
      const oneWeekFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
      const oneDayFromNow = new Date(now.getTime() + (24 * 60 * 60 * 1000));
      const oneHourFromNow = new Date(now.getTime() + (60 * 60 * 1000));

      // Find events that need reminders
      const upcomingEvents = await Event.find({
        startDate: {
          $gte: now,
          $lte: oneWeekFromNow
        },
        isActive: true
      }).populate('registeredAttendees', 'firstName lastName email');

      for (const event of upcomingEvents) {
        const eventDate = new Date(event.startDate);
        const timeDiff = eventDate.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);

        // Send 1-week reminder
        if (hoursDiff <= 168 && hoursDiff > 167) {
          await this.sendEventReminder(event, '1w');
        }
        // Send 1-day reminder
        else if (hoursDiff <= 24 && hoursDiff > 23) {
          await this.sendEventReminder(event, '24h');
        }
        // Send 1-hour reminder
        else if (hoursDiff <= 1 && hoursDiff > 0.5) {
          await this.sendEventReminder(event, '1h');
        }
      }

      console.log(`📅 Processed ${upcomingEvents.length} upcoming events for reminders`);
    } catch (error) {
      console.error('Error processing event reminders:', error);
    }
  }

  async sendEventReminder(event, reminderType) {
    try {
      // Get attendees list (you'll need to implement event registration)
      const attendees = event.registeredAttendees || [];
      
      if (attendees.length === 0) {
        console.log(`No attendees registered for event: ${event.title}`);
        return;
      }

      const result = await NotificationService.sendEventReminder(event, reminderType);
      
      if (result.success) {
        console.log(`📧 Sent ${reminderType} reminder for event: ${event.title} to ${attendees.length} attendees`);
      } else {
        console.error(`Failed to send reminder for event: ${event.title}`, result.error);
      }
    } catch (error) {
      console.error(`Error sending reminder for event ${event.title}:`, error);
    }
  }

  async scheduleCustomReminder(eventId, reminderDate, reminderType = 'custom') {
    try {
      const event = await Event.findById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }

      const reminderTime = new Date(reminderDate);
      const now = new Date();

      if (reminderTime <= now) {
        throw new Error('Reminder time must be in the future');
      }

      // Calculate delay in milliseconds
      const delay = reminderTime.getTime() - now.getTime();

      // Schedule the reminder
      const timeoutId = setTimeout(async () => {
        await this.sendEventReminder(event, reminderType);
        this.scheduledJobs.delete(`${eventId}-${reminderTime.getTime()}`);
      }, delay);

      // Store the job reference
      const jobKey = `${eventId}-${reminderTime.getTime()}`;
      this.scheduledJobs.set(jobKey, timeoutId);

      console.log(`📅 Scheduled custom reminder for event: ${event.title} at ${reminderTime}`);
      return { success: true, jobKey };
    } catch (error) {
      console.error('Error scheduling custom reminder:', error);
      return { success: false, error: error.message };
    }
  }

  cancelScheduledReminder(jobKey) {
    try {
      if (this.scheduledJobs.has(jobKey)) {
        clearTimeout(this.scheduledJobs.get(jobKey));
        this.scheduledJobs.delete(jobKey);
        console.log(`📅 Cancelled scheduled reminder: ${jobKey}`);
        return { success: true };
      } else {
        return { success: false, error: 'Job not found' };
      }
    } catch (error) {
      console.error('Error cancelling scheduled reminder:', error);
      return { success: false, error: error.message };
    }
  }

  async cleanupExpiredEvents() {
    try {
      const now = new Date();
      const oneMonthAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

      // Find expired events (ended more than a month ago)
      const expiredEvents = await Event.find({
        endDate: { $lt: oneMonthAgo }
      });

      // You might want to archive instead of delete
      for (const event of expiredEvents) {
        // Archive event or update status
        await Event.findByIdAndUpdate(event._id, {
          isArchived: true
        });
      }

      console.log(`🗑️ Archived ${expiredEvents.length} expired events`);
    } catch (error) {
      console.error('Error cleaning up expired events:', error);
    }
  }

  // Get upcoming events for a user
  async getUserUpcomingEvents(userId) {
    try {
      const now = new Date();
      const upcomingEvents = await Event.find({
        registeredAttendees: userId,
        startDate: { $gte: now },
        isActive: true
      }).sort({ startDate: 1 });

      return {
        success: true,
        events: upcomingEvents
      };
    } catch (error) {
      console.error('Error fetching user upcoming events:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Register user for event notifications
  async registerForEventNotifications(eventId, userId, reminderPreferences = ['24h', '1h']) {
    try {
      const event = await Event.findById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }

      // Add user to event attendees (implement your registration logic)
      if (!event.registeredAttendees.includes(userId)) {
        event.registeredAttendees.push(userId);
        await event.save();
      }

      // Schedule custom reminders based on user preferences
      const eventDate = new Date(event.startDate);
      for (const reminderPref of reminderPreferences) {
        let reminderTime;
        
        switch (reminderPref) {
          case '1w':
            reminderTime = new Date(eventDate.getTime() - (7 * 24 * 60 * 60 * 1000));
            break;
          case '24h':
            reminderTime = new Date(eventDate.getTime() - (24 * 60 * 60 * 1000));
            break;
          case '1h':
            reminderTime = new Date(eventDate.getTime() - (60 * 60 * 1000));
            break;
          default:
            continue;
        }

        if (reminderTime > new Date()) {
          await this.scheduleCustomReminder(eventId, reminderTime, reminderPref);
        }
      }

      return {
        success: true,
        message: 'Registered for event notifications'
      };
    } catch (error) {
      console.error('Error registering for event notifications:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get reminder statistics
  async getReminderStats() {
    try {
      const now = new Date();
      const oneWeekFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));

      const upcomingEvents = await Event.countDocuments({
        startDate: {
          $gte: now,
          $lte: oneWeekFromNow
        },
        isActive: true
      });

      const scheduledJobs = this.scheduledJobs.size;

      return {
        success: true,
        stats: {
          upcomingEventsNextWeek: upcomingEvents,
          scheduledCustomReminders: scheduledJobs,
          cronJobsActive: cron.getTasks().size
        }
      };
    } catch (error) {
      console.error('Error getting reminder stats:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new EventReminderService();