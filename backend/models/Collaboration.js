import mongoose from 'mongoose';

const collaborationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Collaboration title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  type: {
    type: String,
    required: [true, 'Collaboration type is required'],
    enum: [
      'research_project',
      'paper_collaboration',
      'grant_application',
      'conference_presentation',
      'workshop_organization',
      'data_sharing',
      'methodology_development',
      'other'
    ]
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  },
  // Primary collaborator who initiated the collaboration
  initiator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // All collaborators in the project
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['lead', 'co-lead', 'researcher', 'contributor', 'advisor'],
      default: 'contributor'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'removed'],
      default: 'pending'
    },
    joinedAt: {
      type: Date
    },
    permissions: {
      canEdit: {
        type: Boolean,
        default: false
      },
      canInvite: {
        type: Boolean,
        default: false
      },
      canManage: {
        type: Boolean,
        default: false
      }
    },
    contribution: {
      type: String,
      maxlength: [500, 'Contribution description cannot exceed 500 characters']
    }
  }],
  // Research areas and keywords
  researchAreas: [{
    type: String,
    trim: true,
    maxlength: [100, 'Research area cannot exceed 100 characters']
  }],
  keywords: [{
    type: String,
    trim: true,
    maxlength: [50, 'Keyword cannot exceed 50 characters']
  }],
  // Timeline and deadlines
  timeline: {
    startDate: {
      type: Date,
      default: Date.now
    },
    expectedEndDate: {
      type: Date
    },
    milestones: [{
      title: {
        type: String,
        required: true,
        maxlength: [100, 'Milestone title cannot exceed 100 characters']
      },
      description: {
        type: String,
        maxlength: [500, 'Milestone description cannot exceed 500 characters']
      },
      dueDate: {
        type: Date
      },
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'overdue'],
        default: 'pending'
      },
      assignedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      completedAt: {
        type: Date
      }
    }]
  },
  // Resources and requirements
  resources: {
    funding: {
      required: {
        type: Boolean,
        default: false
      },
      amount: {
        type: Number,
        min: [0, 'Funding amount cannot be negative']
      },
      currency: {
        type: String,
        default: 'INR'
      },
      source: {
        type: String,
        maxlength: [200, 'Funding source cannot exceed 200 characters']
      }
    },
    equipment: [{
      name: {
        type: String,
        required: true,
        maxlength: [100, 'Equipment name cannot exceed 100 characters']
      },
      description: {
        type: String,
        maxlength: [300, 'Equipment description cannot exceed 300 characters']
      },
      available: {
        type: Boolean,
        default: false
      },
      provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    software: [{
      name: {
        type: String,
        required: true
      },
      version: {
        type: String
      },
      license: {
        type: String
      }
    }],
    datasets: [{
      name: {
        type: String,
        required: true
      },
      description: {
        type: String
      },
      source: {
        type: String
      },
      accessLevel: {
        type: String,
        enum: ['public', 'restricted', 'private'],
        default: 'private'
      }
    }]
  },
  // Communication and updates
  updates: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      maxlength: [150, 'Update title cannot exceed 150 characters']
    },
    content: {
      type: String,
      required: true,
      maxlength: [2000, 'Update content cannot exceed 2000 characters']
    },
    type: {
      type: String,
      enum: ['progress', 'milestone', 'issue', 'announcement', 'general'],
      default: 'general'
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
        enum: ['document', 'image', 'data', 'code', 'other'],
        default: 'document'
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Privacy and visibility settings
  visibility: {
    type: String,
    enum: ['public', 'institute', 'private'],
    default: 'institute'
  },
  // Tags for organization
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  // Related research papers or publications
  relatedPapers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ResearchPaper'
  }],
  // External links and references
  links: [{
    title: {
      type: String,
      required: true,
      maxlength: [100, 'Link title cannot exceed 100 characters']
    },
    url: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(v);
        },
        message: 'Please enter a valid URL'
      }
    },
    description: {
      type: String,
      maxlength: [200, 'Link description cannot exceed 200 characters']
    }
  }],
  // Metrics and analytics
  metrics: {
    views: {
      type: Number,
      default: 0
    },
    applications: {
      type: Number,
      default: 0
    },
    interactions: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
collaborationSchema.index({ initiator: 1, status: 1 });
collaborationSchema.index({ 'collaborators.user': 1, 'collaborators.status': 1 });
collaborationSchema.index({ researchAreas: 1 });
collaborationSchema.index({ keywords: 1 });
collaborationSchema.index({ createdAt: -1 });
collaborationSchema.index({ 'timeline.expectedEndDate': 1 });

// Text search index
collaborationSchema.index({
  title: 'text',
  description: 'text',
  researchAreas: 'text',
  keywords: 'text'
});

// Virtual for total collaborators count
collaborationSchema.virtual('collaboratorCount').get(function() {
  return this.collaborators ? this.collaborators.length : 0;
});

// Virtual for active collaborators count
collaborationSchema.virtual('activeCollaboratorCount').get(function() {
  return this.collaborators ? 
    this.collaborators.filter(c => c.status === 'accepted').length : 0;
});

// Virtual for pending invitations count
collaborationSchema.virtual('pendingInvitationsCount').get(function() {
  return this.collaborators ? 
    this.collaborators.filter(c => c.status === 'pending').length : 0;
});

// Virtual for collaboration progress
collaborationSchema.virtual('progress').get(function() {
  if (!this.timeline.milestones || this.timeline.milestones.length === 0) {
    return 0;
  }
  
  const completed = this.timeline.milestones.filter(m => m.status === 'completed').length;
  return Math.round((completed / this.timeline.milestones.length) * 100);
});

// Method to add collaborator
collaborationSchema.methods.addCollaborator = function(userId, role = 'contributor', permissions = {}) {
  // Check if user is already a collaborator
  const existingCollaborator = this.collaborators.find(c => 
    c.user.toString() === userId.toString()
  );
  
  if (existingCollaborator) {
    throw new Error('User is already a collaborator');
  }
  
  this.collaborators.push({
    user: userId,
    role,
    status: 'pending',
    permissions: {
      canEdit: permissions.canEdit || false,
      canInvite: permissions.canInvite || false,
      canManage: permissions.canManage || false
    }
  });
  
  return this.save();
};

// Method to update collaborator status
collaborationSchema.methods.updateCollaboratorStatus = function(userId, status) {
  const collaborator = this.collaborators.find(c => 
    c.user.toString() === userId.toString()
  );
  
  if (!collaborator) {
    throw new Error('Collaborator not found');
  }
  
  collaborator.status = status;
  if (status === 'accepted') {
    collaborator.joinedAt = new Date();
  }
  
  return this.save();
};

// Method to add update
collaborationSchema.methods.addUpdate = function(authorId, title, content, type = 'general', attachments = []) {
  this.updates.unshift({
    author: authorId,
    title,
    content,
    type,
    attachments
  });
  
  return this.save();
};

// Static method to find collaborations for user
collaborationSchema.statics.findForUser = function(userId, status = null) {
  const query = {
    $or: [
      { initiator: userId },
      { 'collaborators.user': userId }
    ]
  };
  
  if (status) {
    query.status = status;
  }
  
  return this.find(query).populate('initiator collaborators.user', 'firstName lastName email profilePicture');
};

const Collaboration = mongoose.model('Collaboration', collaborationSchema);

export default Collaboration;