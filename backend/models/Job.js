import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
    required: true
  },
  experience: {
    type: String,
    enum: ['entry-level', 'mid-level', 'senior-level', 'executive'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: [{
    type: String,
    required: true
  }],
  responsibilities: [{
    type: String,
    required: true
  }],
  skills: [{
    type: String,
    required: true
  }],
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'INR'
    },
    negotiable: {
      type: Boolean,
      default: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicationDeadline: {
    type: Date,
    required: false,
    default: function() {
      // Default to 30 days from now if not specified
      const date = new Date();
      date.setDate(date.getDate() + 30);
      return date;
    }
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicationsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better search performance
jobSchema.index({ title: 'text', description: 'text', department: 'text' });
jobSchema.index({ isActive: 1, applicationDeadline: 1 });

const Job = mongoose.model('Job', jobSchema);

export default Job;