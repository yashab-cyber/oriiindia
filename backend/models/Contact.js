import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  phone: {
    type: String,
    trim: true,
    match: [
      /^[\+]?[1-9][\d]{0,15}$/,
      'Please enter a valid phone number'
    ]
  },
  organization: {
    type: String,
    trim: true,
    maxlength: [100, 'Organization name cannot exceed 100 characters']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'general-inquiry',
      'collaboration',
      'research-proposal',
      'media-inquiry',
      'technical-support',
      'partnership',
      'career-opportunity',
      'student-inquiry',
      'event-inquiry',
      'other'
    ]
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['new', 'in-progress', 'resolved', 'closed'],
    default: 'new'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  response: {
    message: {
      type: String,
      maxlength: [2000, 'Response cannot exceed 2000 characters']
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: {
      type: Date
    }
  },
  attachments: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    size: {
      type: Number // in bytes
    }
  }],
  metadata: {
    ipAddress: {
      type: String
    },
    userAgent: {
      type: String
    },
    source: {
      type: String,
      enum: ['website', 'api', 'admin'],
      default: 'website'
    },
    referrer: {
      type: String
    }
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  isSpam: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for search and performance
contactSchema.index({
  name: 'text',
  email: 'text',
  subject: 'text',
  message: 'text',
  organization: 'text'
});

contactSchema.index({ status: 1, priority: 1 });
contactSchema.index({ category: 1, createdAt: -1 });
contactSchema.index({ email: 1, createdAt: -1 });

// Virtual for response time (if responded)
contactSchema.virtual('responseTime').get(function() {
  if (this.response.respondedAt) {
    return this.response.respondedAt - this.createdAt; // in milliseconds
  }
  return null;
});

// Virtual for age of inquiry
contactSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt; // in milliseconds
});

// Method to mark as spam
contactSchema.methods.markAsSpam = function() {
  this.isSpam = true;
  this.status = 'closed';
  return this.save();
};

// Method to respond to inquiry
contactSchema.methods.respond = function(responseMessage, responderId) {
  this.response = {
    message: responseMessage,
    respondedBy: responderId,
    respondedAt: new Date()
  };
  this.status = 'resolved';
  return this.save();
};

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;