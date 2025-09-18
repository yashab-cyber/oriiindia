import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Computer Science',
      'Engineering',
      'Mathematics',
      'Physics',
      'Chemistry',
      'Biology',
      'Medicine',
      'Social Sciences',
      'Economics',
      'Environmental Science',
      'Interdisciplinary',
      'Other'
    ]
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: [100, 'Subcategory cannot exceed 100 characters']
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'],
    default: 'planning'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  timeline: {
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function(value) {
          return value > this.timeline.startDate;
        },
        message: 'End date must be after start date'
      }
    },
    milestones: [{
      title: {
        type: String,
        required: true,
        trim: true
      },
      description: {
        type: String,
        maxlength: [500, 'Milestone description cannot exceed 500 characters']
      },
      dueDate: {
        type: Date,
        required: true
      },
      status: {
        type: String,
        enum: ['not-started', 'in-progress', 'completed', 'overdue'],
        default: 'not-started'
      },
      completedAt: {
        type: Date
      }
    }]
  },
  team: {
    principalInvestigator: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      name: {
        type: String,
        required: true,
        trim: true
      }
    },
    members: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      name: {
        type: String,
        required: true,
        trim: true
      },
      role: {
        type: String,
        enum: ['co-investigator', 'research-associate', 'phd-student', 'masters-student', 'research-assistant', 'collaborator'],
        required: true
      },
      joinDate: {
        type: Date,
        default: Date.now
      },
      isActive: {
        type: Boolean,
        default: true
      }
    }]
  },
  funding: {
    totalBudget: {
      type: Number,
      min: [0, 'Budget cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    sources: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      amount: {
        type: Number,
        required: true,
        min: [0, 'Amount cannot be negative']
      },
      type: {
        type: String,
        enum: ['government', 'private', 'international', 'internal', 'other'],
        required: true
      },
      grantNumber: {
        type: String,
        trim: true
      },
      startDate: {
        type: Date
      },
      endDate: {
        type: Date
      }
    }]
  },
  objectives: [{
    description: {
      type: String,
      required: true,
      maxlength: [500, 'Objective cannot exceed 500 characters']
    },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed'],
      default: 'not-started'
    }
  }],
  methodology: {
    type: String,
    maxlength: [2000, 'Methodology cannot exceed 2000 characters']
  },
  technologies: [{
    type: String,
    trim: true,
    maxlength: [50, 'Technology name cannot exceed 50 characters']
  }],
  keywords: [{
    type: String,
    trim: true,
    maxlength: [50, 'Keyword cannot exceed 50 characters']
  }],
  collaborations: [{
    organization: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['academic', 'industry', 'government', 'ngo', 'international'],
      required: true
    },
    contactPerson: {
      name: {
        type: String,
        trim: true
      },
      email: {
        type: String,
        match: [
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
          'Please enter a valid email'
        ]
      }
    },
    description: {
      type: String,
      maxlength: [500, 'Collaboration description cannot exceed 500 characters']
    }
  }],
  publications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ResearchPaper'
  }],
  events: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  resources: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['document', 'dataset', 'code', 'presentation', 'image', 'video', 'other'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    size: {
      type: Number // in bytes
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  progress: {
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    updates: [{
      title: {
        type: String,
        required: true,
        trim: true
      },
      description: {
        type: String,
        required: true,
        maxlength: [1000, 'Update description cannot exceed 1000 characters']
      },
      date: {
        type: Date,
        default: Date.now
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }]
  },
  visibility: {
    type: String,
    enum: ['public', 'internal', 'restricted'],
    default: 'public'
  },
  isActive: {
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
projectSchema.index({
  title: 'text',
  description: 'text',
  shortDescription: 'text',
  keywords: 'text',
  technologies: 'text'
});

projectSchema.index({ category: 1, status: 1 });
projectSchema.index({ 'timeline.startDate': -1 });
projectSchema.index({ createdAt: -1 });

// Virtual for project duration
projectSchema.virtual('duration').get(function() {
  if (this.timeline.startDate && this.timeline.endDate) {
    return this.timeline.endDate - this.timeline.startDate; // in milliseconds
  }
  return null;
});

// Virtual for days remaining
projectSchema.virtual('daysRemaining').get(function() {
  if (this.timeline.endDate) {
    const now = new Date();
    const timeDiff = this.timeline.endDate - now;
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Virtual for team size
projectSchema.virtual('teamSize').get(function() {
  return 1 + (this.team.members ? this.team.members.filter(member => member.isActive).length : 0);
});

// Method to update progress
projectSchema.methods.updateProgress = function(percentage, updateTitle, updateDescription, updatedBy) {
  this.progress.percentage = percentage;
  this.progress.lastUpdated = new Date();
  this.progress.updates.push({
    title: updateTitle,
    description: updateDescription,
    updatedBy: updatedBy
  });
  return this.save();
};

const Project = mongoose.model('Project', projectSchema);

export default Project;