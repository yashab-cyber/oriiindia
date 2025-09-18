import mongoose from 'mongoose';

const researchPaperSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Paper title is required'],
    trim: true,
    maxlength: [300, 'Title cannot exceed 300 characters']
  },
  abstract: {
    type: String,
    required: [true, 'Abstract is required'],
    maxlength: [3000, 'Abstract cannot exceed 3000 characters']
  },
  keywords: [{
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Keyword cannot exceed 100 characters']
  }],
  
  // Authors and Contributors
  authors: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    order: {
      type: Number,
      required: true,
      min: 1
    },
    role: {
      type: String,
      enum: ['primary_author', 'co_author', 'corresponding_author', 'supervisor'],
      default: 'co_author'
    },
    affiliation: {
      type: String,
      maxlength: [200, 'Affiliation cannot exceed 200 characters']
    },
    contribution: {
      type: String,
      maxlength: [500, 'Contribution description cannot exceed 500 characters']
    },
    isCorresponding: {
      type: Boolean,
      default: false
    }
  }],

  // Submission Details
  submissionId: {
    type: String,
    unique: true,
    required: true
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submissionDate: {
    type: Date,
    default: Date.now
  },
  
  // Paper Classification
  field: {
    type: String,
    required: [true, 'Research field is required'],
    enum: [
      'computer_science',
      'engineering',
      'mathematics',
      'physics',
      'chemistry',
      'biology',
      'medicine',
      'social_sciences',
      'economics',
      'psychology',
      'education',
      'environmental_science',
      'other'
    ]
  },
  subfield: {
    type: String,
    maxlength: [100, 'Subfield cannot exceed 100 characters']
  },
  researchType: {
    type: String,
    required: [true, 'Research type is required'],
    enum: [
      'original_research',
      'review_article',
      'case_study',
      'technical_note',
      'survey',
      'tutorial',
      'position_paper',
      'short_communication'
    ]
  },
  
  // Research Categories
  methodology: {
    type: String,
    enum: [
      'experimental',
      'theoretical',
      'computational',
      'observational',
      'mixed_methods',
      'qualitative',
      'quantitative',
      'systematic_review',
      'meta_analysis'
    ]
  },
  
  // Files and Documents
  files: {
    manuscript: {
      filename: {
        type: String,
        required: [true, 'Manuscript file is required']
      },
      originalName: {
        type: String,
        required: true
      },
      path: {
        type: String,
        required: true
      },
      size: {
        type: Number,
        required: true
      },
      mimeType: {
        type: String,
        required: true
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      },
      version: {
        type: Number,
        default: 1
      }
    },
    supplementaryMaterials: [{
      filename: {
        type: String,
        required: true
      },
      originalName: {
        type: String,
        required: true
      },
      path: {
        type: String,
        required: true
      },
      size: {
        type: Number,
        required: true
      },
      mimeType: {
        type: String,
        required: true
      },
      description: {
        type: String,
        maxlength: [200, 'File description cannot exceed 200 characters']
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    figures: [{
      filename: {
        type: String,
        required: true
      },
      originalName: {
        type: String,
        required: true
      },
      path: {
        type: String,
        required: true
      },
      caption: {
        type: String,
        maxlength: [500, 'Figure caption cannot exceed 500 characters']
      },
      order: {
        type: Number,
        required: true
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    coverLetter: {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimeType: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }
  },
  
  // Submission Status and Workflow
  status: {
    type: String,
    enum: [
      'draft',
      'submitted',
      'under_review',
      'revision_required',
      'revised_submitted',
      'accepted',
      'rejected',
      'published',
      'withdrawn'
    ],
    default: 'draft'
  },
  
  // Submission Progress Tracking
  submissionProgress: {
    step1_basic_info: {
      completed: { type: Boolean, default: false },
      completedAt: Date
    },
    step2_authors: {
      completed: { type: Boolean, default: false },
      completedAt: Date
    },
    step3_manuscript: {
      completed: { type: Boolean, default: false },
      completedAt: Date
    },
    step4_review: {
      completed: { type: Boolean, default: false },
      completedAt: Date
    },
    step5_submit: {
      completed: { type: Boolean, default: false },
      completedAt: Date
    }
  },
  
  // Review Process
  reviewProcess: {
    assignedReviewers: [{
      reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      assignedAt: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ['pending', 'accepted', 'declined', 'completed'],
        default: 'pending'
      },
      dueDate: Date,
      acceptedAt: Date,
      completedAt: Date
    }],
    
    reviews: [{
      reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      overall_rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
      },
      recommendation: {
        type: String,
        enum: ['accept', 'minor_revision', 'major_revision', 'reject'],
        required: true
      },
      comments: {
        overall: {
          type: String,
          required: [true, 'Overall comments are required'],
          maxlength: [3000, 'Overall comments cannot exceed 3000 characters']
        },
        methodology: {
          type: String,
          maxlength: [1500, 'Methodology comments cannot exceed 1500 characters']
        },
        results: {
          type: String,
          maxlength: [1500, 'Results comments cannot exceed 1500 characters']
        },
        presentation: {
          type: String,
          maxlength: [1500, 'Presentation comments cannot exceed 1500 characters']
        },
        significance: {
          type: String,
          maxlength: [1500, 'Significance comments cannot exceed 1500 characters']
        }
      },
      confidentialComments: {
        type: String,
        maxlength: [2000, 'Confidential comments cannot exceed 2000 characters']
      },
      reviewFile: {
        filename: String,
        path: String,
        uploadedAt: Date
      },
      submittedAt: {
        type: Date,
        default: Date.now
      },
      isAnonymous: {
        type: Boolean,
        default: true
      }
    }],
    
    editorialDecision: {
      decision: {
        type: String,
        enum: ['accept', 'minor_revision', 'major_revision', 'reject']
      },
      comments: {
        type: String,
        maxlength: [2000, 'Editorial comments cannot exceed 2000 characters']
      },
      decidedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      decidedAt: Date,
      revisionDueDate: Date
    }
  },
  
  // Version Control
  versions: [{
    version: {
      type: Number,
      required: true
    },
    manuscriptFile: {
      filename: String,
      path: String,
      uploadedAt: Date
    },
    changes: {
      type: String,
      maxlength: [1000, 'Version changes cannot exceed 1000 characters']
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Publication Details
  publication: {
    journal: {
      type: String,
      maxlength: [200, 'Journal name cannot exceed 200 characters']
    },
    volume: String,
    issue: String,
    pages: String,
    doi: String,
    publishedDate: Date,
    url: String,
    isOpenAccess: {
      type: Boolean,
      default: false
    }
  },
  
  // Metadata and Analytics
  metrics: {
    views: {
      type: Number,
      default: 0
    },
    downloads: {
      type: Number,
      default: 0
    },
    citations: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    }
  },
  
  // Timeline and Important Dates
  timeline: {
    submittedAt: Date,
    reviewStartedAt: Date,
    firstDecisionAt: Date,
    revisedAt: Date,
    finalDecisionAt: Date,
    publishedAt: Date
  },
  
  // Additional Settings
  settings: {
    isPublic: {
      type: Boolean,
      default: false
    },
    allowComments: {
      type: Boolean,
      default: true
    },
    anonymousReview: {
      type: Boolean,
      default: true
    },
    suggestedReviewers: [{
      name: {
        type: String,
        maxlength: [100, 'Reviewer name cannot exceed 100 characters']
      },
      email: {
        type: String,
        validate: {
          validator: function(v) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
          },
          message: 'Please enter a valid email address'
        }
      },
      affiliation: {
        type: String,
        maxlength: [200, 'Affiliation cannot exceed 200 characters']
      },
      expertise: {
        type: String,
        maxlength: [200, 'Expertise cannot exceed 200 characters']
      }
    }],
    excludedReviewers: [{
      name: {
        type: String,
        maxlength: [100, 'Reviewer name cannot exceed 100 characters']
      },
      email: String,
      reason: {
        type: String,
        maxlength: [300, 'Exclusion reason cannot exceed 300 characters']
      }
    }]
  },
  
  // Comments and Communication
  communications: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    to: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    type: {
      type: String,
      enum: ['author_to_editor', 'editor_to_author', 'reviewer_to_editor', 'system_message'],
      required: true
    },
    subject: {
      type: String,
      required: [true, 'Communication subject is required'],
      maxlength: [200, 'Subject cannot exceed 200 characters']
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      maxlength: [3000, 'Message cannot exceed 3000 characters']
    },
    attachments: [{
      filename: String,
      path: String,
      uploadedAt: Date
    }],
    sentAt: {
      type: Date,
      default: Date.now
    },
    readAt: Date,
    isRead: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
researchPaperSchema.index({ submittedBy: 1, status: 1 });
researchPaperSchema.index({ 'authors.user': 1 });
researchPaperSchema.index({ field: 1, subfield: 1 });
researchPaperSchema.index({ submissionId: 1 }, { unique: true });
researchPaperSchema.index({ createdAt: -1 });
researchPaperSchema.index({ 'reviewProcess.assignedReviewers.reviewer': 1 });

// Text search index
researchPaperSchema.index({
  title: 'text',
  abstract: 'text',
  keywords: 'text'
});

// Virtual for current version
researchPaperSchema.virtual('currentVersion').get(function() {
  if (!this.versions || this.versions.length === 0) {
    return 1;
  }
  return Math.max(...this.versions.map(v => v.version));
});

// Virtual for completion percentage
researchPaperSchema.virtual('completionPercentage').get(function() {
  const steps = this.submissionProgress;
  const completedSteps = Object.values(steps).filter(step => step.completed).length;
  const totalSteps = Object.keys(steps).length;
  return Math.round((completedSteps / totalSteps) * 100);
});

// Virtual for review status
researchPaperSchema.virtual('reviewStatus').get(function() {
  if (!this.reviewProcess.assignedReviewers || this.reviewProcess.assignedReviewers.length === 0) {
    return 'no_reviewers_assigned';
  }
  
  const completed = this.reviewProcess.assignedReviewers.filter(r => r.status === 'completed').length;
  const total = this.reviewProcess.assignedReviewers.length;
  
  if (completed === 0) return 'pending_reviews';
  if (completed < total) return 'partial_reviews';
  return 'all_reviews_completed';
});

// Pre-save middleware to generate submission ID
researchPaperSchema.pre('save', function(next) {
  if (this.isNew && !this.submissionId) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const day = String(new Date().getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    this.submissionId = `ORII-${year}${month}${day}-${random}`;
  }
  next();
});

// Methods for submission workflow
researchPaperSchema.methods.updateProgress = function(step) {
  this.submissionProgress[step].completed = true;
  this.submissionProgress[step].completedAt = new Date();
  return this.save();
};

researchPaperSchema.methods.addAuthor = function(userId, order, role = 'co_author', affiliation = '') {
  this.authors.push({
    user: userId,
    order,
    role,
    affiliation
  });
  return this.save();
};

researchPaperSchema.methods.removeAuthor = function(userId) {
  this.authors = this.authors.filter(author => !author.user.equals(userId));
  return this.save();
};

researchPaperSchema.methods.addVersion = function(manuscriptFile, changes, uploadedBy) {
  const newVersion = this.currentVersion + 1;
  this.versions.push({
    version: newVersion,
    manuscriptFile,
    changes,
    uploadedBy,
    uploadedAt: new Date()
  });
  
  // Update main manuscript file
  this.files.manuscript = {
    ...manuscriptFile,
    version: newVersion
  };
  
  return this.save();
};

researchPaperSchema.methods.assignReviewer = function(reviewerId, dueDate) {
  this.reviewProcess.assignedReviewers.push({
    reviewer: reviewerId,
    assignedAt: new Date(),
    dueDate: dueDate,
    status: 'pending'
  });
  return this.save();
};

researchPaperSchema.methods.addCommunication = function(from, to, type, subject, message, attachments = []) {
  this.communications.unshift({
    from,
    to,
    type,
    subject,
    message,
    attachments,
    sentAt: new Date()
  });
  return this.save();
};

// Static methods
researchPaperSchema.statics.findByAuthor = function(userId) {
  return this.find({ 'authors.user': userId })
    .populate('submittedBy', 'firstName lastName email')
    .populate('authors.user', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

researchPaperSchema.statics.findForReviewer = function(reviewerId) {
  return this.find({ 'reviewProcess.assignedReviewers.reviewer': reviewerId })
    .populate('submittedBy', 'firstName lastName email')
    .populate('authors.user', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

researchPaperSchema.methods.incrementViews = function() {
  this.metrics.views += 1;
  return this.save();
};

researchPaperSchema.methods.incrementDownloads = function() {
  this.metrics.downloads += 1;
  return this.save();
};

const ResearchPaper = mongoose.model('ResearchPaper', researchPaperSchema);

export default ResearchPaper;