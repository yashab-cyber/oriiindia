import { Event } from '../models/index.js';
import mongoose from 'mongoose';

// @desc    Get all events
// @route   GET /api/events
// @access  Public
export const getAllEvents = async (req, res) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        data: {
          events: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: 10
          }
        },
        message: 'Database not connected - using fallback'
      });
    }

    const {
      page = 1,
      limit = 10,
      type,
      category,
      status = 'published',
      upcoming = false,
      search
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query
    const query = { status, isPublic: true };
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (upcoming === 'true') {
      query.startDate = { $gte: new Date() };
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    const [events, total] = await Promise.all([
      Event.find(query)
        .populate('organizers.user', 'firstName lastName profile.title')
        .populate('speakers.user', 'firstName lastName profile.title')
        .populate('createdBy', 'firstName lastName')
        .sort({ startDate: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Event.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500
      }
    });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
export const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizers.user', 'firstName lastName profile')
      .populate('speakers.user', 'firstName lastName profile')
      .populate('createdBy', 'firstName lastName profile');

    if (!event) {
      return res.status(404).json({
        error: {
          message: 'Event not found',
          status: 404
        }
      });
    }

    res.json({
      success: true,
      data: {
        event
      }
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500
      }
    });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Faculty, Admin)
export const createEvent = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      createdBy: req.user.id
    };

    const event = new Event(eventData);
    await event.save();

    await event.populate('organizers.user', 'firstName lastName profile.title');
    await event.populate('createdBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: {
        event
      }
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500
      }
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Creator, Admin)
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        error: {
          message: 'Event not found',
          status: 404
        }
      });
    }

    // Check ownership or admin role
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: {
          message: 'Access denied. You can only update your own events.',
          status: 403
        }
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .populate('organizers.user', 'firstName lastName profile.title')
      .populate('createdBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: {
        event: updatedEvent
      }
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500
      }
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Creator, Admin)
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        error: {
          message: 'Event not found',
          status: 404
        }
      });
    }

    // Check ownership or admin role
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: {
          message: 'Access denied. You can only delete your own events.',
          status: 403
        }
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500
      }
    });
  }
};