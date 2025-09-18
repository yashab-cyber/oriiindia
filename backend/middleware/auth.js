import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

// Middleware to verify JWT token
export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: {
          message: 'Access denied. No token provided.',
          status: 401
        }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        error: {
          message: 'Token is not valid. User not found.',
          status: 401
        }
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: {
          message: 'Account is inactive.',
          status: 401
        }
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      error: {
        message: 'Token is not valid.',
        status: 401
      }
    });
  }
};

// Middleware to check user roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: 'Access denied. Authentication required.',
          status: 401
        }
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          message: 'Access denied. Insufficient permissions.',
          status: 403
        }
      });
    }

    next();
  };
};

// Middleware to check if user is admin
export const isAdmin = authorize('admin');

// Middleware to require admin access (alias for consistency)
export const requireAdmin = isAdmin;

// Middleware to check if user is faculty or admin
export const isFacultyOrAdmin = authorize('admin', 'faculty');

// Middleware to check if user is researcher, faculty, or admin
export const isResearcherOrAbove = authorize('admin', 'faculty', 'researcher');

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (user && user.isActive) {
      req.user = user;
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};