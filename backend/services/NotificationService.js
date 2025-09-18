import Notification from '../models/Notification.js';
import EmailService from '../services/EmailService.js';

class NotificationService {
  // Create and send notification
  static async createAndSendNotification(recipientId, notificationData) {
    try {
      const notification = await Notification.create({
        recipient: recipientId,
        ...notificationData
      });

      // Send email if enabled and email is provided
      if (notificationData.sendEmail) {
        await EmailService.sendNotificationEmail(recipientId, notificationData);
      }

      console.log(`Notification created for user ${recipientId}: ${notificationData.title}`);
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Create multiple notifications at once
  static async createBulkNotifications(notifications) {
    try {
      const createdNotifications = await Notification.insertMany(notifications);
      console.log(`Created ${createdNotifications.length} notifications`);
      return createdNotifications;
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { 
          isRead: true,
          readAt: new Date()
        },
        { new: true }
      );

      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { recipient: userId, isRead: false },
        { 
          isRead: true,
          readAt: new Date()
        }
      );

      console.log(`Marked ${result.nModified} notifications as read for user ${userId}`);
      return result;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Delete notification
  static async deleteNotification(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        recipient: userId
      });

      return notification;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Get unread count for user
  static async getUnreadCount(userId) {
    try {
      const count = await Notification.countDocuments({
        recipient: userId,
        isRead: false
      });

      return count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  // Process scheduled notifications
  static async processScheduledNotifications() {
    try {
      const now = new Date();
      const scheduledNotifications = await Notification.find({
        isScheduled: true,
        scheduledFor: { $lte: now },
        isRead: false
      }).populate('recipient', 'email firstName lastName');

      for (const notification of scheduledNotifications) {
        // Send email for scheduled notifications
        await EmailService.sendNotificationEmail(
          notification.recipient._id,
          {
            title: notification.title,
            message: notification.message,
            type: notification.type
          }
        );

        // Mark as processed
        notification.isScheduled = false;
        await notification.save();
      }

      console.log(`Processed ${scheduledNotifications.length} scheduled notifications`);
    } catch (error) {
      console.error('Error processing scheduled notifications:', error);
      throw error;
    }
  }

  // Clean up old notifications
  static async cleanupOldNotifications(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await Notification.deleteMany({
        $or: [
          { createdAt: { $lt: cutoffDate }, isRead: true },
          { expiresAt: { $lt: new Date() } }
        ]
      });

      console.log(`Cleaned up ${result.deletedCount} old notifications`);
      return result;
    } catch (error) {
      console.error('Error cleaning up notifications:', error);
      throw error;
    }
  }

  // Event-related notifications
  
  // Send event reminder
  static async sendEventReminder(eventId, attendeeId, reminderType, eventData) {
    try {
      const reminderTitles = {
        '1w': 'Event Reminder - 1 Week',
        '24h': 'Event Reminder - Tomorrow',
        '1h': 'Event Starting Soon'
      };

      const reminderMessages = {
        '1w': `Don't forget about "${eventData.title}" happening in one week on ${eventData.date}.`,
        '24h': `Reminder: "${eventData.title}" is tomorrow at ${eventData.time}.`,
        '1h': `"${eventData.title}" is starting in one hour! Don't miss it.`
      };

      const notification = await Notification.create({
        recipient: attendeeId,
        type: 'event_reminder',
        title: reminderTitles[reminderType],
        message: reminderMessages[reminderType],
        priority: reminderType === '1h' ? 'high' : 'medium',
        relatedEntity: {
          entityType: 'Event',
          entityId: eventId
        },
        actionButtons: [
          {
            text: 'View Event',
            action: 'navigate',
            url: `/events/${eventId}`
          },
          {
            text: 'Add to Calendar',
            action: 'calendar',
            data: {
              title: eventData.title,
              date: eventData.date,
              time: eventData.time,
              location: eventData.location
            }
          }
        ]
      });

      // Send email reminder
      await EmailService.sendEventReminder(attendeeId, {
        eventTitle: eventData.title,
        eventDate: eventData.date,
        eventTime: eventData.time,
        eventLocation: eventData.location,
        reminderType,
        eventUrl: `${process.env.FRONTEND_URL}/events/${eventId}`
      });

      console.log(`Event reminder (${reminderType}) sent to user ${attendeeId}`);
      return notification;
    } catch (error) {
      console.error('Error sending event reminder:', error);
      throw error;
    }
  }

  // Send event registration confirmation
  static async sendEventRegistrationConfirmation(eventId, attendeeId, eventData) {
    try {
      const notification = await Notification.create({
        recipient: attendeeId,
        type: 'event_registration',
        title: 'Event Registration Confirmed',
        message: `You have successfully registered for "${eventData.title}" on ${eventData.date}.`,
        priority: 'medium',
        relatedEntity: {
          entityType: 'Event',
          entityId: eventId
        },
        actionButtons: [{
          text: 'View Event Details',
          action: 'navigate',
          url: `/events/${eventId}`
        }]
      });

      console.log(`Event registration confirmation sent to user ${attendeeId}`);
      return notification;
    } catch (error) {
      console.error('Error sending event registration confirmation:', error);
      throw error;
    }
  }

  // Send system announcement
  static async createSystemAnnouncement(userIds, announcementData) {
    try {
      const notifications = userIds.map(userId => ({
        recipient: userId,
        type: 'system_announcement',
        title: `System Announcement: ${announcementData.title}`,
        message: announcementData.message,
        priority: announcementData.priority || 'medium',
        actionButtons: announcementData.actionUrl ? [{
          text: 'View Details',
          action: 'navigate',
          url: announcementData.actionUrl
        }] : []
      }));

      await this.createBulkNotifications(notifications);
      console.log(`System announcement sent to ${userIds.length} users`);
    } catch (error) {
      console.error('Error creating system announcement:', error);
      throw error;
    }
  }

  // Research Collaboration Notifications
  
  // Send collaboration invitation
  static async createCollaborationInvitation(recipientId, collaborationId, inviterId, data) {
    try {
      const notification = await Notification.create({
        recipient: recipientId,
        type: 'collaboration_invitation',
        title: 'Research Collaboration Invitation',
        message: `${data.inviterName} has invited you to collaborate on "${data.collaborationTitle}" as a ${data.role}.`,
        priority: 'high',
        relatedEntity: {
          entityType: 'Collaboration',
          entityId: collaborationId
        },
        actionButtons: [
          {
            text: 'Accept',
            action: 'api_call',
            endpoint: `/api/collaborations/${collaborationId}/respond`,
            method: 'POST',
            data: { response: 'accept' }
          },
          {
            text: 'Decline',
            action: 'api_call',
            endpoint: `/api/collaborations/${collaborationId}/respond`,
            method: 'POST',
            data: { response: 'decline' }
          },
          {
            text: 'View Details',
            action: 'navigate',
            url: `/collaborations/${collaborationId}`
          }
        ]
      });

      // Send email notification
      await EmailService.sendCollaborationInvitation(recipientId, {
        collaborationTitle: data.collaborationTitle,
        inviterName: data.inviterName,
        role: data.role,
        collaborationId,
        acceptUrl: `${process.env.FRONTEND_URL}/collaborations/${collaborationId}/accept`,
        declineUrl: `${process.env.FRONTEND_URL}/collaborations/${collaborationId}/decline`,
        viewUrl: `${process.env.FRONTEND_URL}/collaborations/${collaborationId}`
      });

      console.log(`Collaboration invitation sent to user ${recipientId}`);
      return notification;
    } catch (error) {
      console.error('Error creating collaboration invitation:', error);
      throw error;
    }
  }

  // Send collaboration response notification
  static async createCollaborationResponse(recipientId, collaborationId, responderId, data) {
    try {
      const statusColor = data.status === 'accepted' ? '✅' : '❌';
      
      const notification = await Notification.create({
        recipient: recipientId,
        type: 'collaboration_response',
        title: `Collaboration Invitation ${data.status}`,
        message: `${statusColor} ${data.responderName} has ${data.status} your invitation to collaborate on "${data.collaborationTitle}".`,
        priority: 'medium',
        relatedEntity: {
          entityType: 'Collaboration',
          entityId: collaborationId
        },
        actionButtons: [{
          text: 'View Collaboration',
          action: 'navigate',
          url: `/collaborations/${collaborationId}`
        }]
      });

      // Send email notification
      await EmailService.sendCollaborationResponse(recipientId, {
        collaborationTitle: data.collaborationTitle,
        responderName: data.responderName,
        status: data.status,
        collaborationUrl: `${process.env.FRONTEND_URL}/collaborations/${collaborationId}`
      });

      console.log(`Collaboration response notification sent to user ${recipientId}`);
      return notification;
    } catch (error) {
      console.error('Error creating collaboration response notification:', error);
      throw error;
    }
  }

  // Send collaboration update notification
  static async createCollaborationUpdate(recipientId, collaborationId, authorId, data) {
    try {
      const notification = await Notification.create({
        recipient: recipientId,
        type: 'collaboration_update',
        title: 'New Collaboration Update',
        message: `${data.authorName} posted an update "${data.updateTitle}" in collaboration "${data.collaborationTitle}".`,
        priority: 'medium',
        relatedEntity: {
          entityType: 'Collaboration',
          entityId: collaborationId
        },
        actionButtons: [{
          text: 'View Update',
          action: 'navigate',
          url: `/collaborations/${collaborationId}#updates`
        }]
      });

      // Send email notification (optional, based on user preferences)
      await EmailService.sendCollaborationUpdate(recipientId, {
        collaborationTitle: data.collaborationTitle,
        updateTitle: data.updateTitle,
        authorName: data.authorName,
        collaborationUrl: `${process.env.FRONTEND_URL}/collaborations/${collaborationId}`
      });

      console.log(`Collaboration update notification sent to user ${recipientId}`);
      return notification;
    } catch (error) {
      console.error('Error creating collaboration update notification:', error);
      throw error;
    }
  }

  // Send milestone deadline reminder
  static async createMilestoneDeadlineReminder(recipientId, collaborationId, milestoneData) {
    try {
      const daysUntilDeadline = Math.ceil((new Date(milestoneData.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
      
      const notification = await Notification.create({
        recipient: recipientId,
        type: 'milestone_deadline',
        title: 'Milestone Deadline Approaching',
        message: `The milestone "${milestoneData.title}" in collaboration "${milestoneData.collaborationTitle}" is due in ${daysUntilDeadline} day(s).`,
        priority: daysUntilDeadline <= 1 ? 'high' : 'medium',
        relatedEntity: {
          entityType: 'Collaboration',
          entityId: collaborationId
        },
        actionButtons: [{
          text: 'View Milestone',
          action: 'navigate',
          url: `/collaborations/${collaborationId}#milestone-${milestoneData.milestoneId}`
        }],
        scheduledFor: new Date()
      });

      console.log(`Milestone deadline reminder sent to user ${recipientId}`);
      return notification;
    } catch (error) {
      console.error('Error creating milestone deadline reminder:', error);
      throw error;
    }
  }

  // Send collaboration completion notification
  static async createCollaborationCompletion(recipientId, collaborationId, data) {
    try {
      const notification = await Notification.create({
        recipient: recipientId,
        type: 'collaboration_completion',
        title: 'Collaboration Completed',
        message: `🎉 The collaboration "${data.collaborationTitle}" has been successfully completed! Thank you for your contribution.`,
        priority: 'high',
        relatedEntity: {
          entityType: 'Collaboration',
          entityId: collaborationId
        },
        actionButtons: [
          {
            text: 'View Results',
            action: 'navigate',
            url: `/collaborations/${collaborationId}/results`
          },
          {
            text: 'Download Report',
            action: 'download',
            url: `/collaborations/${collaborationId}/report`
          }
        ]
      });

      // Send congratulatory email
      await EmailService.sendCollaborationCompletion(recipientId, {
        collaborationTitle: data.collaborationTitle,
        completionDate: data.completionDate,
        collaborationUrl: `${process.env.FRONTEND_URL}/collaborations/${collaborationId}`,
        reportUrl: `${process.env.FRONTEND_URL}/collaborations/${collaborationId}/report`
      });

      console.log(`Collaboration completion notification sent to user ${recipientId}`);
      return notification;
    } catch (error) {
      console.error('Error creating collaboration completion notification:', error);
      throw error;
    }
  }

  // Research Paper Submission Notifications

  // Send paper submission confirmation
  static async createPaperSubmissionConfirmation(paperId, authorId, paperData) {
    try {
      const notification = await Notification.create({
        recipient: authorId,
        type: 'paper_submission',
        title: 'Research Paper Submitted',
        message: `Your paper "${paperData.title}" has been successfully submitted and is now under review.`,
        priority: 'high',
        relatedEntity: {
          entityType: 'ResearchPaper',
          entityId: paperId
        },
        actionButtons: [
          {
            text: 'View Submission',
            action: 'navigate',
            url: `/papers/${paperId}`
          },
          {
            text: 'Track Status',
            action: 'navigate',
            url: `/papers/${paperId}/status`
          }
        ]
      });

      console.log(`Paper submission confirmation sent to author ${authorId}`);
      return notification;
    } catch (error) {
      console.error('Error creating paper submission confirmation:', error);
      throw error;
    }
  }

  // Send review assignment notification
  static async createReviewAssignment(reviewerId, paperId, paperData, dueDate) {
    try {
      const notification = await Notification.create({
        recipient: reviewerId,
        type: 'review_assignment',
        title: 'New Review Assignment',
        message: `You have been assigned to review the paper "${paperData.title}". Review deadline: ${dueDate.toLocaleDateString()}.`,
        priority: 'high',
        relatedEntity: {
          entityType: 'ResearchPaper',
          entityId: paperId
        },
        actionButtons: [
          {
            text: 'Start Review',
            action: 'navigate',
            url: `/papers/${paperId}/review`
          },
          {
            text: 'Accept Assignment',
            action: 'api_call',
            endpoint: `/api/papers/${paperId}/review/accept`,
            method: 'POST'
          },
          {
            text: 'Decline Assignment',
            action: 'api_call',
            endpoint: `/api/papers/${paperId}/review/decline`,
            method: 'POST'
          }
        ]
      });

      console.log(`Review assignment sent to reviewer ${reviewerId}`);
      return notification;
    } catch (error) {
      console.error('Error creating review assignment:', error);
      throw error;
    }
  }

  // Send paper status update
  static async createPaperStatusUpdate(authorId, paperId, paperData, statusChange) {
    try {
      const statusMessages = {
        'under_review': 'is now under review',
        'revision_required': 'requires revisions',
        'accepted': 'has been accepted! 🎉',
        'rejected': 'has been rejected',
        'published': 'has been published! 🎊'
      };

      const notification = await Notification.create({
        recipient: authorId,
        type: 'paper_status_update',
        title: 'Paper Status Update',
        message: `Your paper "${paperData.title}" ${statusMessages[statusChange.newStatus]}.`,
        priority: ['accepted', 'published'].includes(statusChange.newStatus) ? 'high' : 'medium',
        relatedEntity: {
          entityType: 'ResearchPaper',
          entityId: paperId
        },
        actionButtons: [
          {
            text: 'View Paper',
            action: 'navigate',
            url: `/papers/${paperId}`
          },
          ...(statusChange.newStatus === 'revision_required' ? [{
            text: 'View Comments',
            action: 'navigate',
            url: `/papers/${paperId}/reviews`
          }] : [])
        ]
      });

      console.log(`Paper status update sent to author ${authorId}`);
      return notification;
    } catch (error) {
      console.error('Error creating paper status update:', error);
      throw error;
    }
  }

  // Send review deadline reminder
  static async createReviewDeadlineReminder(reviewerId, paperId, paperData, daysRemaining) {
    try {
      const notification = await Notification.create({
        recipient: reviewerId,
        type: 'review_deadline',
        title: 'Review Deadline Reminder',
        message: `Reminder: Your review for "${paperData.title}" is due in ${daysRemaining} day(s).`,
        priority: daysRemaining <= 1 ? 'high' : 'medium',
        relatedEntity: {
          entityType: 'ResearchPaper',
          entityId: paperId
        },
        actionButtons: [{
          text: 'Continue Review',
          action: 'navigate',
          url: `/papers/${paperId}/review`
        }]
      });

      console.log(`Review deadline reminder sent to reviewer ${reviewerId}`);
      return notification;
    } catch (error) {
      console.error('Error creating review deadline reminder:', error);
      throw error;
    }
  }
}

export default NotificationService;