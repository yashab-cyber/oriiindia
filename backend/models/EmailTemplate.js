import mongoose from 'mongoose';

const emailTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'user-management', // welcome, approval, rejection
      'notification',    // general notifications
      'marketing',       // promotional emails
      'newsletter',      // newsletters and updates
      'system',          // system alerts and maintenance
      'event',           // event invitations and updates
      'research',        // research-related communications
      'custom'           // custom templates
    ],
    default: 'custom'
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  htmlContent: {
    type: String,
    required: true
  },
  textContent: {
    type: String,
    required: false // Optional plain text version
  },
  variables: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'email', 'url', 'date', 'number'],
      default: 'text'
    },
    required: {
      type: Boolean,
      default: false
    },
    defaultValue: {
      type: String,
      default: ''
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isSystem: {
    type: Boolean,
    default: false // System templates cannot be deleted
  },
  version: {
    type: Number,
    default: 1
  },
  tags: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    trim: true
  },
  preview: {
    type: String, // Store a preview of the template
    default: ''
  },
  // Template metadata
  metadata: {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    usageCount: {
      type: Number,
      default: 0
    },
    lastUsed: {
      type: Date,
      default: null
    }
  },
  // Template settings
  settings: {
    allowScheduling: {
      type: Boolean,
      default: true
    },
    allowBulkSend: {
      type: Boolean,
      default: true
    },
    trackOpens: {
      type: Boolean,
      default: true
    },
    trackClicks: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
emailTemplateSchema.index({ category: 1, isActive: 1 });
emailTemplateSchema.index({ name: 'text', description: 'text' });
emailTemplateSchema.index({ tags: 1 });
emailTemplateSchema.index({ 'metadata.usageCount': -1 });

// Virtual for template usage analytics
emailTemplateSchema.virtual('isPopular').get(function() {
  return this.metadata.usageCount > 10;
});

// Pre-save middleware to update version and metadata
emailTemplateSchema.pre('save', function(next) {
  if (this.isModified('htmlContent') || this.isModified('subject')) {
    this.version += 1;
  }
  next();
});

// Instance method to increment usage count
emailTemplateSchema.methods.incrementUsage = function() {
  this.metadata.usageCount += 1;
  this.metadata.lastUsed = new Date();
  return this.save();
};

// Static method to find templates by category
emailTemplateSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ 'metadata.usageCount': -1 });
};

// Static method to search templates
emailTemplateSchema.statics.searchTemplates = function(query) {
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      }
    ]
  }).sort({ 'metadata.usageCount': -1 });
};

const EmailTemplate = mongoose.model('EmailTemplate', emailTemplateSchema);

export default EmailTemplate;