import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get user's notifications with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      type, 
      category, 
      isRead, 
      priority 
    } = req.query;

    // Build filter object
    const filter = { recipient: req.user.id };
    
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (isRead !== undefined) filter.isRead = isRead === 'true';
    if (priority) filter.priority = priority;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch notifications
    const notifications = await Notification.find(filter)
      .populate('sender', 'firstName lastName profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalCount = await Notification.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    // Get unread count
    const unreadCount = await Notification.getUnreadCount(req.user.id);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        },
        unreadCount
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
});

// Get unread notification count
router.get('/unread-count', async (req, res) => {
  try {
    const unreadCount = await Notification.getUnreadCount(req.user.id);
    
    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message
    });
  }
});

// Mark notification as read
router.put('/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.markAsRead();

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: { notification }
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message
    });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', async (req, res) => {
  try {
    const result = await Notification.markAllAsRead(req.user.id);

    res.json({
      success: true,
      message: 'All notifications marked as read',
      data: { 
        modifiedCount: result.modifiedCount 
      }
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking all notifications as read',
      error: error.message
    });
  }
});

// Delete notification
router.delete('/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message
    });
  }
});

// Create a new notification (admin or system use)
router.post('/', async (req, res) => {
  try {
    const {
      recipient,
      type,
      title,
      message,
      data = {},
      relatedEntity,
      priority = 'medium',
      category = 'system',
      actions = [],
      scheduledFor,
      expiresAt
    } = req.body;

    // Validate required fields
    if (!recipient || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Recipient, type, title, and message are required'
      });
    }

    const notification = await Notification.createNotification({
      recipient,
      sender: req.user.id,
      type,
      title,
      message,
      data,
      relatedEntity,
      priority,
      category,
      actions,
      scheduledFor,
      expiresAt
    });

    // Populate sender information
    await notification.populate('sender', 'firstName lastName profilePicture');

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: { notification }
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating notification',
      error: error.message
    });
  }
});

// Get notification types and categories for filtering
router.get('/metadata', async (req, res) => {
  try {
    const types = [
      'event_reminder',
      'event_registration',
      'research_collaboration',
      'paper_submission',
      'paper_review_assigned',
      'paper_review_completed',
      'paper_status_update',
      'user_registration',
      'profile_update',
      'system_announcement',
      'comment_reply',
      'mention',
      'general'
    ];

    const categories = ['academic', 'social', 'system', 'personal'];
    const priorities = ['low', 'medium', 'high', 'urgent'];

    res.json({
      success: true,
      data: {
        types,
        categories,
        priorities
      }
    });
  } catch (error) {
    console.error('Error fetching metadata:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching metadata',
      error: error.message
    });
  }
});

export default router;