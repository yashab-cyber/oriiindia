import mongoose from 'mongoose';

const jobApplicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicant: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    }
  },
  experience: {
    type: {
      type: String,
      enum: ['Fresher', 'Experienced'],
      required: true
    },
    totalYears: {
      type: Number,
      default: 0
    },
    workHistory: [{
      company: String,
      position: String,
      duration: String,
      description: String
    }]
  },
  education: [{
    degree: String,
    institution: String,
    year: String,
    grade: String
  }],
  skills: [{
    type: String,
    trim: true
  }],
  communication: {
    languages: [{
      language: String,
      proficiency: {
        type: String,
        enum: ['Basic', 'Intermediate', 'Advanced', 'Native']
      }
    }],
    preferredLanguage: {
      type: String,
      default: 'English'
    }
  },
  resume: {
    filename: String,
    originalName: String,
    fileId: mongoose.Schema.Types.ObjectId,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  },
  coverLetter: {
    type: String,
    maxLength: 2000
  },
  additionalInfo: {
    portfolioUrl: String,
    linkedinUrl: String,
    githubUrl: String,
    expectedSalary: {
      amount: Number,
      currency: {
        type: String,
        default: 'INR'
      }
    },
    availableFrom: Date,
    relocate: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Rejected', 'Hired'],
    default: 'Applied'
  },
  reviewNotes: [{
    note: String,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewDate: {
      type: Date,
      default: Date.now
    }
  }],
  applicationDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
jobApplicationSchema.index({ job: 1, status: 1 });
jobApplicationSchema.index({ 'applicant.email': 1 });
jobApplicationSchema.index({ applicationDate: -1 });

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

export default JobApplication;