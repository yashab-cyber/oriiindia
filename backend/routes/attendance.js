import express from 'express';
import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Mark attendance (check-in)
router.post('/checkin', authenticate, async (req, res) => {
  try {
    if (req.user.type !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Employee login required.'
      });
    }

    const { latitude, longitude, address, notes } = req.body;
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      employee: req.user.employeeId,
      date: today
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in for today'
      });
    }

    // Get employee details for late calculation
    const employee = await Employee.findById(req.user.employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const checkInTime = new Date();
    
    // Create attendance record
    const attendance = new Attendance({
      employee: req.user.employeeId,
      date: today,
      checkInTime,
      location: {
        checkIn: {
          latitude,
          longitude,
          address
        }
      },
      notes,
      deviceInfo: {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        deviceType: req.get('User-Agent')?.includes('Mobile') ? 'mobile' : 'desktop'
      }
    });

    // Check if late arrival
    const standardStartTime = employee.workingHours?.start || '09:00';
    attendance.isLateArrival = attendance.isLate(standardStartTime);
    
    if (attendance.isLateArrival) {
      attendance.status = 'late';
    }

    await attendance.save();

    res.json({
      success: true,
      message: 'Checked in successfully',
      data: attendance
    });

  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check in',
      error: error.message
    });
  }
});

// Mark attendance (check-out)
router.post('/checkout', authenticate, async (req, res) => {
  try {
    if (req.user.type !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Employee login required.'
      });
    }

    const { latitude, longitude, address, notes } = req.body;
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's attendance record
    const attendance = await Attendance.findOne({
      employee: req.user.employeeId,
      date: today
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'No check-in found for today'
      });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({
        success: false,
        message: 'Already checked out for today'
      });
    }

    const checkOutTime = new Date();
    
    // Update attendance record
    attendance.checkOutTime = checkOutTime;
    attendance.location.checkOut = {
      latitude,
      longitude,
      address
    };
    
    if (notes) {
      attendance.notes = attendance.notes 
        ? `${attendance.notes}\nCheckout: ${notes}`
        : `Checkout: ${notes}`;
    }

    // Get employee details for early departure calculation
    const employee = await Employee.findById(req.user.employeeId);
    const standardEndTime = employee?.workingHours?.end || '17:00';
    
    // Check if early departure
    const [endHours, endMinutes] = standardEndTime.split(':');
    const standardEnd = new Date(checkOutTime);
    standardEnd.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);
    
    attendance.isEarlyDeparture = checkOutTime < standardEnd;

    await attendance.save();

    res.json({
      success: true,
      message: 'Checked out successfully',
      data: attendance
    });

  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check out',
      error: error.message
    });
  }
});

// Get today's attendance status
router.get('/today', authenticate, async (req, res) => {
  try {
    if (req.user.type !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Employee login required.'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee: req.user.employeeId,
      date: today
    });

    res.json({
      success: true,
      data: attendance
    });

  } catch (error) {
    console.error('Get today attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s attendance',
      error: error.message
    });
  }
});

// Get attendance history
router.get('/history', authenticate, async (req, res) => {
  try {
    if (req.user.type !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Employee login required.'
      });
    }

    const { page = 1, limit = 10, month, year } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build date filter
    let dateFilter = {};
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);
      dateFilter = { 
        date: { 
          $gte: startDate, 
          $lte: endDate 
        } 
      };
    }

    const query = {
      employee: req.user.employeeId,
      ...dateFilter
    };

    const [attendance, total] = await Promise.all([
      Attendance.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Attendance.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        attendance,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get attendance history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance history',
      error: error.message
    });
  }
});

// Get attendance summary for a date range
router.get('/summary', authenticate, async (req, res) => {
  try {
    if (req.user.type !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Employee login required.'
      });
    }

    const { startDate, endDate } = req.query;
    
    let start, end;
    
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      // Default to current month
      const now = new Date();
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    const summary = await Attendance.getAttendanceSummary(
      req.user.employeeId,
      start,
      end
    );

    res.json({
      success: true,
      data: {
        summary,
        dateRange: {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
        }
      }
    });

  } catch (error) {
    console.error('Get attendance summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance summary',
      error: error.message
    });
  }
});

// Request regularization for attendance
router.post('/regularize', authenticate, async (req, res) => {
  try {
    if (req.user.type !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Employee login required.'
      });
    }

    const { attendanceId, reason } = req.body;
    
    if (!attendanceId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Attendance ID and reason are required'
      });
    }

    const attendance = await Attendance.findOne({
      _id: attendanceId,
      employee: req.user.employeeId
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    if (attendance.regularizationRequest.requested) {
      return res.status(400).json({
        success: false,
        message: 'Regularization already requested for this attendance'
      });
    }

    // Update regularization request
    attendance.regularizationRequest = {
      requested: true,
      reason,
      requestedAt: new Date(),
      status: 'pending'
    };

    await attendance.save();

    res.json({
      success: true,
      message: 'Regularization request submitted successfully',
      data: attendance
    });

  } catch (error) {
    console.error('Regularization request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit regularization request',
      error: error.message
    });
  }
});

export default router;