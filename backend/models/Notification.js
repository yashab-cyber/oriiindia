import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    required: true,
    enum: [
      'event_reminder',
      'event_registration',
      'research_collaboration',
      'paper_submission',
      'paper_review_assigned',
      'paper_review_completed',
      'paper_status_update',
      'user_registration',
      'profile_update',
      'system_announcement',
      'comment_reply',
      'mention',
      'general'
    ]
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Reference to the related entity
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['Event', 'ResearchPaper', 'User', 'Comment', 'Review', 'Collaboration']
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  // Notification delivery status
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  // Email notification status
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date
  },
  emailDelivered: {
    type: Boolean,
    default: false
  },
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  // Schedule delivery for future notifications
  scheduledFor: {
    type: Date
  },
  // Category for filtering
  category: {
    type: String,
    enum: ['academic', 'social', 'system', 'personal'],
    default: 'system'
  },
  // Action buttons for interactive notifications
  actions: [{
    label: {
      type: String,
      maxlength: 50
    },
    action: {
      type: String,
      maxlength: 100
    },
    style: {
      type: String,
      enum: ['primary', 'secondary', 'success', 'warning', 'danger'],
      default: 'primary'
    }
  }],
  // Expiration for temporary notifications
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ type: 1, recipient: 1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for checking if notification is actionable
notificationSchema.virtual('isActionable').get(function() {
  return this.actions && this.actions.length > 0;
});

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Static method to create notification with template
notificationSchema.statics.createNotification = async function(data) {
  const notification = new this(data);
  return await notification.save();
};

// Static method to get unread count for user
notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({
    recipient: userId,
    isRead: false
  });
};

// Static method to mark all as read for user
notificationSchema.statics.markAllAsRead = async function(userId) {
  return await this.updateMany(
    { recipient: userId, isRead: false },
    { 
      isRead: true, 
      readAt: new Date() 
    }
  );
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;