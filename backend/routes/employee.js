import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Employee from '../models/Employee.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Employee login
router.post('/login', async (req, res) => {
  try {
    const { email, password, employeeId } = req.body;

    let employeeRecord = null;
    let isUserEmployee = false;

    // First, try to find in Employee collection
    const query = email 
      ? { email: email.toLowerCase() }
      : { employeeId };

    employeeRecord = await Employee.findOne(query);
    
    // If not found in Employee collection, check Users with employee role
    if (!employeeRecord && email) {
      const User = (await import('../models/User.js')).default;
      const userRecord = await User.findOne({ 
        email: email.toLowerCase(), 
        isEmployee: true 
      }).select('+password'); // Include password for verification

      if (userRecord) {
        employeeRecord = userRecord;
        isUserEmployee = true;
      }
    }

    if (!employeeRecord) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if employee is active
    if (isUserEmployee) {
      // For user-employees, check user isActive and employee status
      if (!employeeRecord.isActive || employeeRecord.employeeDetails?.employmentStatus !== 'active') {
        return res.status(401).json({
          success: false,
          message: 'Employee account is not active'
        });
      }
    } else {
      // For dedicated employees, use existing method
      if (!employeeRecord.isActive()) {
        return res.status(401).json({
          success: false,
          message: 'Employee account is not active'
        });
      }
    }

    // Verify password
    let isPasswordValid;
    if (isUserEmployee) {
      // For user-employees, compare directly with bcrypt
      isPasswordValid = await bcrypt.compare(password, employeeRecord.password);
    } else {
      // For dedicated employees, use the model method
      isPasswordValid = await employeeRecord.comparePassword(password);
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    if (isUserEmployee) {
      employeeRecord.lastLogin = new Date();
      if (employeeRecord.employeeDetails) {
        employeeRecord.employeeDetails.lastLoginAsEmployee = new Date();
      }
      await employeeRecord.save();
    } else {
      employeeRecord.lastLoginAt = new Date();
      await employeeRecord.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        employeeId: employeeRecord._id,
        userId: isUserEmployee ? employeeRecord._id : null,
        type: 'employee',
        empId: isUserEmployee ? employeeRecord.employeeDetails?.employeeId : employeeRecord.employeeId,
        isUserEmployee: isUserEmployee
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Prepare response data
    const responseData = {
      token,
      employee: {
        id: employeeRecord._id,
        employeeId: isUserEmployee ? employeeRecord.employeeDetails?.employeeId : employeeRecord.employeeId,
        name: isUserEmployee ? `${employeeRecord.firstName} ${employeeRecord.lastName}` : employeeRecord.name,
        email: employeeRecord.email,
        department: isUserEmployee ? employeeRecord.employeeDetails?.employeeDepartment : employeeRecord.department,
        position: isUserEmployee ? employeeRecord.employeeDetails?.position : employeeRecord.position,
        isFirstLogin: isUserEmployee ? false : employeeRecord.isFirstLogin,
        isUserEmployee: isUserEmployee
      }
    };

    res.json({
      success: true,
      message: 'Login successful',
      data: responseData
    });

  } catch (error) {
    console.error('Employee login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Get employee profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    // Check if user is an employee
    if (req.user.type !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Employee login required.'
      });
    }

    const employee = await Employee.findById(req.user.employeeId)
      .select('-password')
      .populate('manager', 'name employeeId position');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      data: employee
    });

  } catch (error) {
    console.error('Get employee profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

// Update employee profile (limited fields)
router.put('/profile', authenticate, async (req, res) => {
  try {
    if (req.user.type !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Employee login required.'
      });
    }

    const allowedUpdates = [
      'phoneNumber', 
      'address', 
      'emergencyContact',
      'profilePicture'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const employee = await Employee.findByIdAndUpdate(
      req.user.employeeId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: employee
    });

  } catch (error) {
    console.error('Update employee profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// Get employee dashboard data
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    if (req.user.type !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Employee login required.'
      });
    }

    let employee;
    let employeeId;

    if (req.user.isUserEmployee) {
      // User-employee: get from User collection
      const user = await User.findById(req.user.userId).select('-password');
      if (!user || !user.isEmployee) {
        return res.status(404).json({
          success: false,
          message: 'Employee profile not found'
        });
      }
      
      // Transform user data to match employee format
      employee = {
        _id: user._id,
        employeeId: user.employeeDetails.employeeId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        position: user.employeeDetails.position,
        department: user.employeeDetails.department,
        salary: user.employeeDetails.salary,
        dateOfJoining: user.employeeDetails.dateOfJoining,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
      employeeId = user._id; // Use user ID for attendance lookup
    } else {
      // Regular employee: get from Employee collection
      employee = await Employee.findById(req.user.employeeId).select('-password');
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }
      employeeId = req.user.employeeId;
    }

    // Get today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayAttendance = await Attendance.findOne({
      employee: employeeId,
      date: today
    });

    // Get this month's attendance summary
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const monthlyAttendance = await Attendance.getAttendanceSummary(
      employeeId,
      startOfMonth,
      endOfMonth
    );

    // Get recent attendance (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentAttendance = await Attendance.find({
      employee: employeeId,
      date: { $gte: sevenDaysAgo }
    }).sort({ date: -1 }).limit(7);

    res.json({
      success: true,
      data: {
        employee,
        todayAttendance,
        monthlyAttendance,
        recentAttendance
      }
    });

  } catch (error) {
    console.error('Get employee dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
});

// Change employee password
router.post('/change-password', authenticate, async (req, res) => {
  try {
    // Check if user is an employee
    if (req.user.type !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Employee login required.'
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    let user;
    let isCurrentPasswordValid = false;

    if (req.user.isUserEmployee) {
      // User-employee: check User collection
      user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      isCurrentPasswordValid = await user.comparePassword(currentPassword);
    } else {
      // Regular employee: check Employee collection
      user = await Employee.findById(req.user.employeeId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }
      isCurrentPasswordValid = await user.comparePassword(currentPassword);
    }

    // Verify current password
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    if (!req.user.isUserEmployee) {
      user.isFirstLogin = false; // Mark as not first login after password change for Employee records
    }
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
});

export default router;