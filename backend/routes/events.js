import express from 'express';
import {
  getAllEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent
} from '../controllers/eventController.js';
import { validateEvent } from '../utils/validation.js';
import { handleValidationErrors, validateObjectId, validatePagination } from '../middleware/validation.js';
import { authenticate, isFacultyOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/events/test
// @desc    Test events route
// @access  Public
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Events route working',
    timestamp: new Date().toISOString()
  });
});

// @route   GET /api/events
// @desc    Get all events
// @access  Public
router.get('/', validatePagination, getAllEvents);

// @route   POST /api/events
// @desc    Create new event
// @access  Private (Faculty, Admin)
router.post('/', authenticate, isFacultyOrAdmin, validateEvent, handleValidationErrors, createEvent);

// @route   GET /api/events/:id
// @desc    Get single event
// @access  Public
router.get('/:id', validateObjectId(), getEvent);

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private (Creator, Admin)
router.put('/:id', authenticate, validateObjectId(), validateEvent, handleValidationErrors, updateEvent);

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Private (Creator, Admin)
router.delete('/:id', authenticate, validateObjectId(), deleteEvent);

export default router;