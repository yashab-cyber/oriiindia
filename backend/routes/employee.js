import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Employee login
router.post('/login', async (req, res) => {
  try {
    const { email, password, employeeId } = req.body;

    // Find employee by email or employeeId
    const query = email 
      ? { email: email.toLowerCase() }
      : { employeeId };

    const employee = await Employee.findOne(query);
    
    if (!employee) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if employee is active
    if (!employee.isActive()) {
      return res.status(401).json({
        success: false,
        message: 'Employee account is not active'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, employee.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    employee.lastLoginAt = new Date();
    await employee.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        employeeId: employee._id,
        type: 'employee',
        empId: employee.employeeId 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        employee: {
          id: employee._id,
          employeeId: employee.employeeId,
          name: employee.name,
          email: employee.email,
          department: employee.department,
          position: employee.position,
          isFirstLogin: employee.isFirstLogin
        }
      }
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

// Change password
router.put('/change-password', authenticate, async (req, res) => {
  try {
    if (req.user.type !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Employee login required.'
      });
    }

    const { currentPassword, newPassword } = req.body;

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

    const employee = await Employee.findById(req.user.employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, employee.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and first login flag
    employee.password = hashedNewPassword;
    employee.isFirstLogin = false;
    await employee.save();

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

// Get employee dashboard data
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    if (req.user.type !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Employee login required.'
      });
    }

    const employee = await Employee.findById(req.user.employeeId).select('-password');
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Get today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayAttendance = await Attendance.findOne({
      employee: req.user.employeeId,
      date: today
    });

    // Get this month's attendance summary
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const monthlyAttendance = await Attendance.getAttendanceSummary(
      req.user.employeeId,
      startOfMonth,
      endOfMonth
    );

    // Get recent attendance (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentAttendance = await Attendance.find({
      employee: req.user.employeeId,
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

export default router;