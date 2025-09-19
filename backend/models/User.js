import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['admin', 'researcher', 'faculty', 'student', 'visitor'],
    default: 'visitor'
  },
  profile: {
    bio: {
      type: String,
      maxlength: [1000, 'Bio cannot exceed 1000 characters']
    },
    title: {
      type: String,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    department: {
      type: String,
      maxlength: [100, 'Department cannot exceed 100 characters']
    },
    institution: {
      type: String,
      maxlength: [100, 'Institution cannot exceed 100 characters']
    },
    researchInterests: [{
      type: String,
      maxlength: [50, 'Research interest cannot exceed 50 characters']
    }],
    avatar: {
      type: String, // URL to profile image
      default: null
    },
    website: {
      type: String,
      match: [
        /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
        'Please enter a valid website URL'
      ]
    },
    linkedIn: {
      type: String,
      match: [
        /^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/,
        'Please enter a valid LinkedIn URL'
      ]
    },
    orcid: {
      type: String,
      match: [
        /^https?:\/\/orcid\.org\/\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/,
        'Please enter a valid ORCID URL'
      ]
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  // User approval system
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvalDate: {
    type: Date,
    default: null
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters'],
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Index for search functionality
userSchema.index({
  firstName: 'text',
  lastName: 'text',
  'profile.bio': 'text',
  'profile.department': 'text',
  'profile.researchInterests': 'text'
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
  const userObj = this.toObject();
  delete userObj.password;
  delete userObj.__v;
  return userObj;
};

const User = mongoose.model('User', userSchema);

export default User;