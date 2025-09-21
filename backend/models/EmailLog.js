import mongoose from 'mongoose';

const emailLogSchema = new mongoose.Schema({
  // Email identification
  messageId: {
    type: String,
    unique: true,
    required: true
  },
  
  // Template information
  template: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmailTemplate',
      default: null
    },
    name: {
      type: String,
      default: 'Custom Email'
    },
    category: {
      type: String,
      default: 'custom'
    }
  },
  
  // Email content
  subject: {
    type: String,
    required: true
  },
  htmlContent: {
    type: String,
    required: true
  },
  textContent: {
    type: String,
    default: ''
  },
  
  // Recipient information
  recipient: {
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    name: {
      type: String,
      default: ''
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  
  // Sender information
  sender: {
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    name: {
      type: String,
      default: 'ORII'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true // Admin who sent the email
    }
  },
  
  // Email status and delivery
  status: {
    type: String,
    enum: [
      'queued',     // Email is queued for sending
      'sending',    // Email is being sent
      'sent',       // Email sent successfully
      'delivered',  // Email delivered to recipient
      'opened',     // Email opened by recipient
      'clicked',    // Links in email clicked
      'bounced',    // Email bounced
      'failed',     // Email failed to send
      'spam',       // Email marked as spam
      'unsubscribed' // Recipient unsubscribed
    ],
    default: 'queued'
  },
  
  // Timestamps
  timestamps: {
    queued: {
      type: Date,
      default: Date.now
    },
    sent: {
      type: Date,
      default: null
    },
    delivered: {
      type: Date,
      default: null
    },
    opened: {
      type: Date,
      default: null
    },
    firstClicked: {
      type: Date,
      default: null
    },
    lastClicked: {
      type: Date,
      default: null
    },
    bounced: {
      type: Date,
      default: null
    },
    failed: {
      type: Date,
      default: null
    }
  },
  
  // Email type and context
  emailType: {
    type: String,
    enum: [
      'welcome',
      'approval', 
      'rejection',
      'notification',
      'marketing',
      'newsletter',
      'system',
      'event',
      'research',
      'bulk',
      'scheduled',
      'custom'
    ],
    default: 'custom'
  },
  
  // Bulk email information
  bulkEmail: {
    batchId: {
      type: String,
      default: null
    },
    campaignName: {
      type: String,
      default: null
    },
    totalRecipients: {
      type: Number,
      default: 1
    }
  },
  
  // Scheduled email information
  scheduledEmail: {
    scheduledFor: {
      type: Date,
      default: null
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  
  // Analytics and tracking
  analytics: {
    openCount: {
      type: Number,
      default: 0
    },
    clickCount: {
      type: Number,
      default: 0
    },
    uniqueClicks: [{
      url: String,
      timestamp: {
        type: Date,
        default: Date.now
      },
      userAgent: String,
      ip: String
    }],
    userAgent: {
      type: String,
      default: ''
    },
    ipAddress: {
      type: String,
      default: ''
    },
    location: {
      country: String,
      city: String,
      region: String
    }
  },
  
  // Error information
  error: {
    message: {
      type: String,
      default: null
    },
    code: {
      type: String,
      default: null
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  
  // Variable substitutions used
  variables: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Email settings
  settings: {
    trackOpens: {
      type: Boolean,
      default: true
    },
    trackClicks: {
      type: Boolean,
      default: true
    },
    allowUnsubscribe: {
      type: Boolean,
      default: true
    }
  },
  
  // Additional metadata
  metadata: {
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal'
    },
    tags: [String],
    notes: {
      type: String,
      default: ''
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
emailLogSchema.index({ 'recipient.email': 1, createdAt: -1 });
emailLogSchema.index({ status: 1, createdAt: -1 });
emailLogSchema.index({ emailType: 1, createdAt: -1 });
emailLogSchema.index({ 'bulkEmail.batchId': 1 });
emailLogSchema.index({ 'sender.userId': 1, createdAt: -1 });
emailLogSchema.index({ 'template.id': 1 });
emailLogSchema.index({ messageId: 1 });
emailLogSchema.index({ 'scheduledEmail.scheduledFor': 1 });

// Compound indexes
emailLogSchema.index({ status: 1, emailType: 1, createdAt: -1 });
emailLogSchema.index({ 'recipient.email': 1, status: 1 });

// Virtual for delivery time calculation
emailLogSchema.virtual('deliveryTime').get(function() {
  if (this.timestamps.sent && this.timestamps.delivered) {
    return this.timestamps.delivered.getTime() - this.timestamps.sent.getTime();
  }
  return null;
});

// Virtual for open rate calculation
emailLogSchema.virtual('isOpened').get(function() {
  return this.analytics.openCount > 0;
});

// Virtual for click rate calculation
emailLogSchema.virtual('hasClicks').get(function() {
  return this.analytics.clickCount > 0;
});

// Instance methods
emailLogSchema.methods.markAsOpened = function(userAgent = '', ipAddress = '') {
  this.status = 'opened';
  this.timestamps.opened = new Date();
  this.analytics.openCount += 1;
  this.analytics.userAgent = userAgent;
  this.analytics.ipAddress = ipAddress;
  return this.save();
};

emailLogSchema.methods.markAsClicked = function(url, userAgent = '', ipAddress = '') {
  if (this.status === 'sent' || this.status === 'delivered') {
    this.status = 'clicked';
  }
  
  this.analytics.clickCount += 1;
  this.analytics.uniqueClicks.push({
    url,
    userAgent,
    ip: ipAddress
  });
  
  if (!this.timestamps.firstClicked) {
    this.timestamps.firstClicked = new Date();
  }
  this.timestamps.lastClicked = new Date();
  
  return this.save();
};

emailLogSchema.methods.markAsDelivered = function() {
  this.status = 'delivered';
  this.timestamps.delivered = new Date();
  return this.save();
};

emailLogSchema.methods.markAsFailed = function(error) {
  this.status = 'failed';
  this.timestamps.failed = new Date();
  this.error = {
    message: error.message || 'Unknown error',
    code: error.code || 'UNKNOWN',
    details: error.details || error
  };
  return this.save();
};

// Static methods for analytics
emailLogSchema.statics.getDeliveryStats = function(dateRange = {}) {
  const match = {};
  if (dateRange.start) match.createdAt = { $gte: dateRange.start };
  if (dateRange.end) match.createdAt = { ...match.createdAt, $lte: dateRange.end };
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

emailLogSchema.statics.getOpenRates = function(dateRange = {}) {
  const match = {};
  if (dateRange.start) match.createdAt = { $gte: dateRange.start };
  if (dateRange.end) match.createdAt = { ...match.createdAt, $lte: dateRange.end };
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalSent: { $sum: 1 },
        totalOpened: { 
          $sum: { 
            $cond: [{ $gt: ['$analytics.openCount', 0] }, 1, 0] 
          } 
        },
        totalClicked: { 
          $sum: { 
            $cond: [{ $gt: ['$analytics.clickCount', 0] }, 1, 0] 
          } 
        }
      }
    },
    {
      $project: {
        totalSent: 1,
        totalOpened: 1,
        totalClicked: 1,
        openRate: { 
          $multiply: [
            { $divide: ['$totalOpened', '$totalSent'] }, 
            100
          ] 
        },
        clickRate: { 
          $multiply: [
            { $divide: ['$totalClicked', '$totalSent'] }, 
            100
          ] 
        }
      }
    }
  ]);
};

const EmailLog = mongoose.model('EmailLog', emailLogSchema);

export default EmailLog;