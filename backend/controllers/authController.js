import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import EmailService from '../services/EmailService.js';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role = 'visitor' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: {
          message: 'User already exists with this email',
          status: 400
        }
      });
    }

    // Create new user with conditional approval (admins are auto-approved)
    const isAdmin = role === 'admin';
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      role,
      isApproved: isAdmin,
      approvalStatus: isAdmin ? 'approved' : 'pending',
      ...(isAdmin && { approvalDate: new Date() })
    });

    await user.save();

    // Send welcome email
    try {
      const emailService = new EmailService();
      await emailService.init(); // Initialize with current environment variables
      const emailResult = await emailService.sendWelcomeEmail(user);
      
      if (emailResult.success) {
        console.log(`✅ Welcome email sent to ${user.email}`);
      } else {
        console.error(`❌ Failed to send welcome email to ${user.email}:`, emailResult.error);
      }
    } catch (emailError) {
      console.error('Email service error during registration:', emailError);
      // Don't fail registration if email fails
    }

    // Different response based on user role
    const message = isAdmin 
      ? 'Registration successful! Admin account created and approved automatically. You can now login. Welcome email sent!'
      : 'Registration successful! Your account is pending admin approval. You will be notified once approved. Welcome email sent!';

    res.status(201).json({
      success: true,
      message,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          approvalStatus: user.approvalStatus
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error during registration',
        status: 500
      }
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        error: {
          message: 'Invalid email or password',
          status: 401
        }
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        error: {
          message: 'Account is inactive. Please contact administrator.',
          status: 401
        }
      });
    }

    // Check if user is approved (skip approval check for admin users)
    if (user.role !== 'admin' && (!user.isApproved || user.approvalStatus !== 'approved')) {
      const statusMessages = {
        'pending': 'Your account is pending admin approval. Please wait for approval before logging in.',
        'rejected': `Your account has been rejected. ${user.rejectionReason || 'Please contact administrator for more information.'}`
      };
      
      return res.status(403).json({
        error: {
          message: statusMessages[user.approvalStatus] || 'Account not approved. Please contact administrator.',
          status: 403,
          approvalStatus: user.approvalStatus
        }
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: {
          message: 'Invalid email or password',
          status: 401
        }
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.getPublicProfile(),
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error during login',
        status: 500
      }
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500
      }
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      'firstName',
      'lastName',
      'profile.bio',
      'profile.title',
      'profile.department',
      'profile.institution',
      'profile.researchInterests',
      'profile.website',
      'profile.linkedIn',
      'profile.orcid',
      'profile.avatar'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        if (key.startsWith('profile.')) {
          const profileKey = key.replace('profile.', '');
          if (!updates.profile) updates.profile = {};
          updates.profile[profileKey] = req.body[key];
        } else {
          updates[key] = req.body[key];
        }
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500
      }
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        error: {
          message: 'Current password is incorrect',
          status: 400
        }
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500
      }
    });
  }
};

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500
      }
    });
  }
};