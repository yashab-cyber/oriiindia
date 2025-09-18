import express from 'express';
import {
  submitContact,
  getAllContacts,
  getContact,
  updateContactStatus,
  respondToContact,
  markAsSpam,
  deleteContact
} from '../controllers/contactController.js';
import { validateContact } from '../utils/validation.js';
import { handleValidationErrors, validateObjectId, validatePagination } from '../middleware/validation.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/contact/test
// @desc    Test contact route
// @access  Public
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Contact route working',
    timestamp: new Date().toISOString()
  });
});

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', validateContact, handleValidationErrors, submitContact);

// @route   GET /api/contact
// @desc    Get all contact submissions
// @access  Private (Admin)
router.get('/', authenticate, isAdmin, validatePagination, getAllContacts);

// @route   GET /api/contact/:id
// @desc    Get single contact
// @access  Private (Admin)
router.get('/:id', authenticate, isAdmin, validateObjectId(), getContact);

// @route   PUT /api/contact/:id/status
// @desc    Update contact status
// @access  Private (Admin)
router.put('/:id/status', authenticate, isAdmin, validateObjectId(), updateContactStatus);

// @route   POST /api/contact/:id/respond
// @desc    Respond to contact
// @access  Private (Admin)
router.post('/:id/respond', authenticate, isAdmin, validateObjectId(), respondToContact);

// @route   PUT /api/contact/:id/spam
// @desc    Mark contact as spam
// @access  Private (Admin)
router.put('/:id/spam', authenticate, isAdmin, validateObjectId(), markAsSpam);

// @route   DELETE /api/contact/:id
// @desc    Delete contact
// @access  Private (Admin)
router.delete('/:id', authenticate, isAdmin, validateObjectId(), deleteContact);

export default router;