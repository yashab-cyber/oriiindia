import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today;
    }
  },
  checkInTime: {
    type: Date,
    required: true
  },
  checkOutTime: {
    type: Date
  },
  status: {
    type: String,
    required: true,
    enum: ['present', 'absent', 'late', 'half-day', 'work-from-home', 'on-leave'],
    default: 'present'
  },
  workingHours: {
    type: Number, // in hours
    default: 0
  },
  breakTime: {
    type: Number, // in minutes
    default: 0
  },
  overtime: {
    type: Number, // in hours
    default: 0
  },
  location: {
    checkIn: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    checkOut: {
      latitude: Number,
      longitude: Number,
      address: String
    }
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  isLateArrival: {
    type: Boolean,
    default: false
  },
  isEarlyDeparture: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  regularizationRequest: {
    requested: {
      type: Boolean,
      default: false
    },
    reason: String,
    requestedAt: Date,
    approvedAt: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  },
  deviceInfo: {
    userAgent: String,
    ipAddress: String,
    deviceType: {
      type: String,
      enum: ['mobile', 'desktop', 'tablet'],
      default: 'desktop'
    }
  }
}, {
  timestamps: true
});

// Compound index to ensure one attendance record per employee per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

// Index for efficient queries
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ status: 1 });
attendanceSchema.index({ employee: 1, createdAt: -1 });

// Pre-save middleware to calculate working hours
attendanceSchema.pre('save', function(next) {
  if (this.checkInTime && this.checkOutTime) {
    const workingMs = this.checkOutTime.getTime() - this.checkInTime.getTime();
    this.workingHours = Math.max(0, (workingMs / (1000 * 60 * 60)) - (this.breakTime / 60));
    
    // Calculate overtime (assuming 8 hours is standard working day)
    this.overtime = Math.max(0, this.workingHours - 8);
  }
  next();
});

// Method to check if attendance is for today
attendanceSchema.methods.isToday = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const attendanceDate = new Date(this.date);
  attendanceDate.setHours(0, 0, 0, 0);
  return today.getTime() === attendanceDate.getTime();
};

// Method to format working hours
attendanceSchema.methods.getFormattedWorkingHours = function() {
  const hours = Math.floor(this.workingHours);
  const minutes = Math.round((this.workingHours - hours) * 60);
  return `${hours}h ${minutes}m`;
};

// Method to check if employee is late
attendanceSchema.methods.isLate = function(standardStartTime = '09:00') {
  if (!this.checkInTime) return false;
  
  const checkIn = new Date(this.checkInTime);
  const [hours, minutes] = standardStartTime.split(':');
  const standardTime = new Date(checkIn);
  standardTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  return checkIn > standardTime;
};

// Static method to get attendance summary for a date range
attendanceSchema.statics.getAttendanceSummary = async function(employeeId, startDate, endDate) {
  const attendance = await this.find({
    employee: employeeId,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: -1 });

  const summary = {
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    halfDays: 0,
    totalWorkingHours: 0,
    totalOvertime: 0,
    attendancePercentage: 0
  };

  attendance.forEach(record => {
    summary.totalDays++;
    if (record.status === 'present') summary.presentDays++;
    if (record.status === 'absent') summary.absentDays++;
    if (record.isLateArrival) summary.lateDays++;
    if (record.status === 'half-day') summary.halfDays++;
    summary.totalWorkingHours += record.workingHours || 0;
    summary.totalOvertime += record.overtime || 0;
  });

  summary.attendancePercentage = summary.totalDays > 0 
    ? Math.round((summary.presentDays / summary.totalDays) * 100) 
    : 0;

  return summary;
};

// Virtual for formatted date
attendanceSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-IN');
});

// Virtual for formatted check-in time
attendanceSchema.virtual('formattedCheckIn').get(function() {
  return this.checkInTime ? this.checkInTime.toLocaleTimeString('en-IN', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  }) : null;
});

// Virtual for formatted check-out time
attendanceSchema.virtual('formattedCheckOut').get(function() {
  return this.checkOutTime ? this.checkOutTime.toLocaleTimeString('en-IN', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  }) : null;
});

// Ensure virtual fields are serialized
attendanceSchema.set('toJSON', {
  virtuals: true
});

export default mongoose.model('Attendance', attendanceSchema);