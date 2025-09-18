import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },
  type: {
    type: String,
    required: [true, 'Event type is required'],
    enum: [
      'conference',
      'workshop',
      'seminar',
      'webinar',
      'symposium',
      'lecture',
      'meeting',
      'training',
      'networking',
      'other'
    ]
  },
  category: {
    type: String,
    required: [true, 'Event category is required'],
    enum: [
      'Research',
      'Academic',
      'Professional Development',
      'Networking',
      'Technology',
      'Innovation',
      'Industry Collaboration',
      'Student Event',
      'Public Outreach',
      'Other'
    ]
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value >= this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)']
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  },
  venue: {
    type: {
      type: String,
      enum: ['physical', 'virtual', 'hybrid'],
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String
    },
    virtualLink: {
      type: String,
      match: [
        /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
        'Please enter a valid URL'
      ]
    },
    capacity: {
      type: Number,
      min: [1, 'Capacity must be at least 1']
    }
  },
  organizers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email'
      ]
    },
    role: {
      type: String,
      enum: ['main-organizer', 'co-organizer', 'committee-member'],
      default: 'committee-member'
    }
  }],
  speakers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    title: {
      type: String,
      trim: true
    },
    bio: {
      type: String,
      maxlength: [1000, 'Speaker bio cannot exceed 1000 characters']
    },
    avatar: {
      type: String // URL to speaker image
    },
    topic: {
      type: String,
      trim: true
    },
    speakerType: {
      type: String,
      enum: ['keynote', 'invited', 'panel', 'presenter'],
      default: 'presenter'
    }
  }],
  agenda: [{
    time: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)']
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      maxlength: [500, 'Agenda item description cannot exceed 500 characters']
    },
    speaker: {
      type: String,
      trim: true
    },
    duration: {
      type: Number, // in minutes
      min: [1, 'Duration must be at least 1 minute']
    }
  }],
  registration: {
    isRequired: {
      type: Boolean,
      default: true
    },
    deadline: {
      type: Date
    },
    fee: {
      amount: {
        type: Number,
        min: [0, 'Fee cannot be negative'],
        default: 0
      },
      currency: {
        type: String,
        default: 'INR'
      }
    },
    maxAttendees: {
      type: Number,
      min: [1, 'Maximum attendees must be at least 1']
    },
    registeredCount: {
      type: Number,
      default: 0
    },
    registeredAttendees: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      trim: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  documents: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['agenda', 'presentation', 'handout', 'certificate', 'other'],
      default: 'other'
    },
    size: {
      type: Number // in bytes
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for search and performance
eventSchema.index({
  title: 'text',
  description: 'text',
  shortDescription: 'text',
  tags: 'text'
});

eventSchema.index({ startDate: 1, status: 1 });
eventSchema.index({ type: 1, category: 1 });
eventSchema.index({ createdAt: -1 });

// Virtual for event duration
eventSchema.virtual('duration').get(function() {
  if (this.startDate && this.endDate) {
    return this.endDate - this.startDate; // in milliseconds
  }
  return null;
});

// Virtual for registration status
eventSchema.virtual('registrationStatus').get(function() {
  if (!this.registration.isRequired) return 'not-required';
  if (this.registration.deadline && new Date() > this.registration.deadline) return 'closed';
  if (this.registration.maxAttendees && this.registration.registeredCount >= this.registration.maxAttendees) return 'full';
  return 'open';
});

// Virtual for event status based on dates
eventSchema.virtual('eventStatus').get(function() {
  const now = new Date();
  if (this.status === 'cancelled') return 'cancelled';
  if (now < this.startDate) return 'upcoming';
  if (now >= this.startDate && now <= this.endDate) return 'ongoing';
  return 'completed';
});

const Event = mongoose.model('Event', eventSchema);

export default Event;