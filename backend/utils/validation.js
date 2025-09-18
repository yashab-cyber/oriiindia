import { body, param, query } from 'express-validator';

// User registration validation
export const validateRegister = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('role')
    .optional()
    .isIn(['admin', 'researcher', 'faculty', 'student', 'visitor'])
    .withMessage('Invalid role specified')
];

// User login validation
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Profile update validation
export const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('First name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Last name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  
  body('profile.bio')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Bio cannot exceed 1000 characters'),
  
  body('profile.title')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  
  body('profile.department')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Department cannot exceed 100 characters'),
  
  body('profile.institution')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Institution cannot exceed 100 characters'),
  
  body('profile.website')
    .optional()
    .isURL()
    .withMessage('Please enter a valid website URL'),
  
  body('profile.linkedIn')
    .optional()
    .matches(/^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/)
    .withMessage('Please enter a valid LinkedIn URL'),
  
  body('profile.orcid')
    .optional()
    .matches(/^https?:\/\/orcid\.org\/\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/)
    .withMessage('Please enter a valid ORCID URL'),
  
  body('profile.researchInterests')
    .optional()
    .isArray()
    .withMessage('Research interests must be an array'),
  
  body('profile.researchInterests.*')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Each research interest cannot exceed 50 characters')
];

// Change password validation
export const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    })
];

// Research paper validation
export const validateResearchPaper = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  
  body('abstract')
    .trim()
    .notEmpty()
    .withMessage('Abstract is required')
    .isLength({ max: 2000 })
    .withMessage('Abstract cannot exceed 2000 characters'),
  
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn([
      'Computer Science', 'Engineering', 'Mathematics', 'Physics', 'Chemistry', 
      'Biology', 'Medicine', 'Social Sciences', 'Economics', 'Environmental Science', 'Other'
    ])
    .withMessage('Invalid category'),
  
  body('keywords')
    .optional()
    .isArray()
    .withMessage('Keywords must be an array'),
  
  body('keywords.*')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Each keyword cannot exceed 50 characters'),
  
  body('authors')
    .isArray({ min: 1 })
    .withMessage('At least one author is required'),
  
  body('authors.*.name')
    .trim()
    .notEmpty()
    .withMessage('Author name is required')
];

// Event validation
export const validateEvent = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Event title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Event description is required')
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters'),
  
  body('type')
    .notEmpty()
    .withMessage('Event type is required')
    .isIn(['conference', 'workshop', 'seminar', 'webinar', 'symposium', 'lecture', 'meeting', 'training', 'networking', 'other'])
    .withMessage('Invalid event type'),
  
  body('category')
    .notEmpty()
    .withMessage('Event category is required'),
  
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date')
    .toDate(),
  
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date')
    .toDate()
    .custom((value, { req }) => {
      if (value <= req.body.startDate) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  body('startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  
  body('endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),
  
  body('venue.type')
    .notEmpty()
    .withMessage('Venue type is required')
    .isIn(['physical', 'virtual', 'hybrid'])
    .withMessage('Invalid venue type'),
  
  body('venue.name')
    .trim()
    .notEmpty()
    .withMessage('Venue name is required')
];

// Contact form validation
export const validateContact = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ max: 200 })
    .withMessage('Subject cannot exceed 200 characters'),
  
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 2000 })
    .withMessage('Message cannot exceed 2000 characters'),
  
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn([
      'general-inquiry', 'collaboration', 'research-proposal', 'media-inquiry', 
      'technical-support', 'partnership', 'career-opportunity', 'student-inquiry', 
      'event-inquiry', 'other'
    ])
    .withMessage('Invalid category'),
  
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please enter a valid phone number'),
  
  body('organization')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Organization name cannot exceed 100 characters')
];

// Project validation
export const validateProject = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Project title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Project description is required')
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters'),
  
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn([
      'Computer Science', 'Engineering', 'Mathematics', 'Physics', 'Chemistry', 
      'Biology', 'Medicine', 'Social Sciences', 'Economics', 'Environmental Science', 
      'Interdisciplinary', 'Other'
    ])
    .withMessage('Invalid category'),
  
  body('timeline.startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date')
    .toDate(),
  
  body('timeline.endDate')
    .isISO8601()
    .withMessage('End date must be a valid date')
    .toDate()
    .custom((value, { req }) => {
      if (value <= req.body.timeline?.startDate) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  body('team.principalInvestigator.name')
    .trim()
    .notEmpty()
    .withMessage('Principal investigator name is required')
];

// Search validation
export const validateSearch = [
  query('q')
    .trim()
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters long'),
  
  query('type')
    .optional()
    .isIn(['users', 'research', 'events', 'projects', 'all'])
    .withMessage('Invalid search type'),
  
  query('category')
    .optional()
    .trim(),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];