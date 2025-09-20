import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  department: {
    type: String,
    required: true,
    enum: [
      'Human Resources',
      'Information Technology',
      'Finance',
      'Marketing',
      'Research & Development',
      'Operations',
      'Administration',
      'Legal',
      'Customer Support',
      'Sales'
    ]
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  dateOfJoining: {
    type: Date,
    required: true,
    default: Date.now
  },
  employmentStatus: {
    type: String,
    required: true,
    enum: ['active', 'inactive', 'terminated', 'on-leave'],
    default: 'active'
  },
  workingHours: {
    start: {
      type: String,
      default: '09:00'
    },
    end: {
      type: String,
      default: '17:00'
    }
  },
  salary: {
    type: Number,
    min: 0
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  profilePicture: {
    type: String,
    default: ''
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phoneNumber: String
  },
  isFirstLogin: {
    type: Boolean,
    default: true
  },
  lastLoginAt: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ email: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ employmentStatus: 1 });

// Pre-save middleware to generate employee ID and hash password
employeeSchema.pre('save', async function(next) {
  // Generate employee ID if not provided
  if (!this.employeeId) {
    const count = await mongoose.model('Employee').countDocuments();
    this.employeeId = `EMP${String(count + 1).padStart(4, '0')}`;
  }
  
  // Hash password if it's modified
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  
  next();
});

// Method to get full name
employeeSchema.methods.getFullName = function() {
  return this.name;
};

// Method to compare passwords
employeeSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if employee is active
employeeSchema.methods.isActive = function() {
  return this.employmentStatus === 'active';
};

// Virtual for employee age (if birthDate is added later)
employeeSchema.virtual('fullAddress').get(function() {
  if (!this.address) return '';
  const { street, city, state, zipCode, country } = this.address;
  return [street, city, state, zipCode, country].filter(Boolean).join(', ');
});

// Ensure virtual fields are serialized
employeeSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    return ret;
  }
});

export default mongoose.model('Employee', employeeSchema);