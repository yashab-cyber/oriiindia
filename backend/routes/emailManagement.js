import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import EmailTemplate from '../models/EmailTemplate.js';
import EmailLog from '../models/EmailLog.js';
import User from '../models/User.js';
import EmailService from '../services/EmailService.js';

const router = express.Router();

// Middleware to ensure admin access
const adminAuth = [authenticate, requireAdmin];
router.use(authenticate);
router.use(requireAdmin);

// ============================================================================
// EMAIL TEMPLATES MANAGEMENT
// ============================================================================

// Get all email templates with pagination and filtering
router.get('/templates', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const query = {};
    
    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Filter by active status
    if (req.query.active !== undefined) {
      query.isActive = req.query.active === 'true';
    }
    
    // Search in name and description
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }
    
    const templates = await EmailTemplate.find(query)
      .populate('metadata.author', 'firstName lastName')
      .populate('metadata.lastModifiedBy', 'firstName lastName')
      .sort({ 'metadata.usageCount': -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await EmailTemplate.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        templates,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch templates',
      error: error.message
    });
  }
});

// Get template by ID
router.get('/templates/:id', async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id)
      .populate('metadata.author', 'firstName lastName')
      .populate('metadata.lastModifiedBy', 'firstName lastName');
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    res.json({
      success: true,
      data: { template }
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch template',
      error: error.message
    });
  }
});

// Create new email template
router.post('/templates', async (req, res) => {
  try {
    const templateData = {
      ...req.body,
      metadata: {
        author: req.user.id,
        lastModifiedBy: req.user.id
      }
    };
    
    const template = new EmailTemplate(templateData);
    await template.save();
    
    await template.populate('metadata.author', 'firstName lastName');
    await template.populate('metadata.lastModifiedBy', 'firstName lastName');
    
    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: { template }
    });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create template',
      error: error.message
    });
  }
});

// Update email template
router.put('/templates/:id', async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    if (template.isSystem) {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify system templates'
      });
    }
    
    // Update template data
    Object.assign(template, req.body);
    template.metadata.lastModifiedBy = req.user.id;
    
    await template.save();
    await template.populate('metadata.author', 'firstName lastName');
    await template.populate('metadata.lastModifiedBy', 'firstName lastName');
    
    res.json({
      success: true,
      message: 'Template updated successfully',
      data: { template }
    });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update template',
      error: error.message
    });
  }
});

// Delete email template
router.delete('/templates/:id', async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    if (template.isSystem) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete system templates'
      });
    }
    
    await EmailTemplate.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete template',
      error: error.message
    });
  }
});

// Clone email template
router.post('/templates/:id/clone', async (req, res) => {
  try {
    const originalTemplate = await EmailTemplate.findById(req.params.id);
    
    if (!originalTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    const clonedTemplate = new EmailTemplate({
      ...originalTemplate.toObject(),
      _id: undefined,
      name: `${originalTemplate.name} (Copy)`,
      isSystem: false,
      metadata: {
        author: req.user.id,
        lastModifiedBy: req.user.id,
        usageCount: 0,
        lastUsed: null
      }
    });
    
    await clonedTemplate.save();
    await clonedTemplate.populate('metadata.author', 'firstName lastName');
    
    res.status(201).json({
      success: true,
      message: 'Template cloned successfully',
      data: { template: clonedTemplate }
    });
  } catch (error) {
    console.error('Error cloning template:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to clone template',
      error: error.message
    });
  }
});

// ============================================================================
// EMAIL SENDING
// ============================================================================

// Send single email from template
router.post('/send/template', async (req, res) => {
  try {
    const { templateId, recipientEmail, variables, options = {} } = req.body;
    
    if (!templateId || !recipientEmail) {
      return res.status(400).json({
        success: false,
        message: 'Template ID and recipient email are required'
      });
    }
    
    const result = await EmailService.sendFromTemplate(
      templateId,
      recipientEmail,
      variables,
      {
        ...options,
        senderUserId: req.user.id,
        senderName: `${req.user.firstName} ${req.user.lastName}`
      }
    );
    
    res.json({
      success: result.success,
      message: result.success ? 'Email sent successfully' : 'Failed to send email',
      data: result
    });
  } catch (error) {
    console.error('Error sending template email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    });
  }
});

// Send bulk email
router.post('/send/bulk', async (req, res) => {
  try {
    const { templateId, recipients, variables = {}, options = {} } = req.body;
    
    if (!templateId || !recipients || !Array.isArray(recipients)) {
      return res.status(400).json({
        success: false,
        message: 'Template ID and recipients array are required'
      });
    }
    
    if (recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Recipients array cannot be empty'
      });
    }
    
    const result = await EmailService.sendBulkEmail(
      templateId,
      recipients,
      variables,
      {
        ...options,
        senderUserId: req.user.id,
        senderName: `${req.user.firstName} ${req.user.lastName}`
      }
    );
    
    res.json({
      success: result.success,
      message: result.success ? 'Bulk email initiated successfully' : 'Failed to send bulk email',
      data: result
    });
  } catch (error) {
    console.error('Error sending bulk email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send bulk email',
      error: error.message
    });
  }
});

// Send custom email (without template)
router.post('/send/custom', async (req, res) => {
  try {
    const { to, subject, html, text, options = {} } = req.body;
    
    if (!to || !subject || !html) {
      return res.status(400).json({
        success: false,
        message: 'Recipient, subject, and HTML content are required'
      });
    }
    
    const result = await EmailService.sendEmail(
      { to, subject, html, text },
      {
        ...options,
        emailType: 'custom',
        senderUserId: req.user.id,
        senderName: `${req.user.firstName} ${req.user.lastName}`
      }
    );
    
    res.json({
      success: result.success,
      message: result.success ? 'Email sent successfully' : 'Failed to send email',
      data: result
    });
  } catch (error) {
    console.error('Error sending custom email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    });
  }
});

// ============================================================================
// EMAIL LOGS AND HISTORY
// ============================================================================

// Get users for email sending
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { search, role, isApproved } = req.query;
    
    let query = {};
    
    // Build query filters
    if (role) query.role = role;
    if (isApproved !== undefined) query.isApproved = isApproved === 'true';
    
    // Search functionality
    if (search) {
      query.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const users = await User.find(query)
      .select('firstName lastName email role isApproved')
      .sort({ firstName: 1, lastName: 1 })
      .limit(500); // Reasonable limit to prevent performance issues

    res.json({
      success: true,
      data: {
        users
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Get email logs with filtering and pagination
router.get('/logs', adminAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status,
      templateId,
      recipientEmail,
      campaignId,
      dateFilter,
      search
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    let query = {};

    // Build query filters
    if (status) query.status = status;
    if (templateId) query.templateId = templateId;
    if (recipientEmail) query.recipientEmail = new RegExp(recipientEmail, 'i');
    if (campaignId) query.campaignId = campaignId;

    // Date filters
    if (dateFilter) {
      const now = new Date();
      const startDate = new Date();

      switch (dateFilter) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
      }

      if (dateFilter !== 'all') {
        query.createdAt = { $gte: startDate };
      }
    }

    // Search functionality
    if (search) {
      query.$or = [
        { recipientEmail: new RegExp(search, 'i') },
        { subject: new RegExp(search, 'i') },
        { templateName: new RegExp(search, 'i') }
      ];
    }

    const logs = await EmailLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('templateId', 'name')
      .lean();

    const total = await EmailLog.countDocuments(query);

    // Transform logs to include template name
    const transformedLogs = logs.map(log => ({
      ...log,
      templateName: log.templateId?.name || null
    }));

    res.json({
      success: true,
      data: {
        logs: transformedLogs,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching email logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch email logs'
    });
  }
});

// Get email log by ID
router.get('/logs/:id', async (req, res) => {
  try {
    const log = await EmailLog.findById(req.params.id)
      .populate('recipient.userId', 'firstName lastName email')
      .populate('sender.userId', 'firstName lastName email')
      .populate('template.id', 'name category description');
    
    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Email log not found'
      });
    }
    
    res.json({
      success: true,
      data: { log }
    });
  } catch (error) {
    console.error('Error fetching email log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch email log',
      error: error.message
    });
  }
});

// ============================================================================
// EMAIL ANALYTICS AND REPORTING
// ============================================================================

// Get email analytics dashboard
router.get('/analytics/dashboard', async (req, res) => {
  try {
    const dateRange = {};
    if (req.query.startDate) dateRange.start = new Date(req.query.startDate);
    if (req.query.endDate) dateRange.end = new Date(req.query.endDate);
    
    // Get basic stats
    const totalSent = await EmailLog.countDocuments({
      status: { $in: ['sent', 'delivered', 'opened', 'clicked'] },
      ...(dateRange.start && { createdAt: { $gte: dateRange.start } }),
      ...(dateRange.end && { createdAt: { ...dateRange.end && { $lte: dateRange.end } } })
    });
    
    const totalDelivered = await EmailLog.countDocuments({
      status: { $in: ['delivered', 'opened', 'clicked'] },
      ...(dateRange.start && { createdAt: { $gte: dateRange.start } }),
      ...(dateRange.end && { createdAt: { ...dateRange.end && { $lte: dateRange.end } } })
    });
    
    const totalOpened = await EmailLog.countDocuments({
      'analytics.openCount': { $gt: 0 },
      ...(dateRange.start && { createdAt: { $gte: dateRange.start } }),
      ...(dateRange.end && { createdAt: { ...dateRange.end && { $lte: dateRange.end } } })
    });
    
    const totalClicked = await EmailLog.countDocuments({
      'analytics.clickCount': { $gt: 0 },
      ...(dateRange.start && { createdAt: { $gte: dateRange.start } }),
      ...(dateRange.end && { createdAt: { ...dateRange.end && { $lte: dateRange.end } } })
    });
    
    const totalFailed = await EmailLog.countDocuments({
      status: { $in: ['failed', 'bounced'] },
      ...(dateRange.start && { createdAt: { $gte: dateRange.start } }),
      ...(dateRange.end && { createdAt: { ...dateRange.end && { $lte: dateRange.end } } })
    });
    
    // Calculate rates
    const deliveryRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(2) : 0;
    const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(2) : 0;
    const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(2) : 0;
    const failureRate = totalSent > 0 ? ((totalFailed / totalSent) * 100).toFixed(2) : 0;
    
    // Get status distribution
    const statusStats = await EmailLog.aggregate([
      {
        $match: {
          ...(dateRange.start && { createdAt: { $gte: dateRange.start } }),
          ...(dateRange.end && { createdAt: { ...dateRange.end && { $lte: dateRange.end } } })
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get email type distribution
    const typeStats = await EmailLog.aggregate([
      {
        $match: {
          ...(dateRange.start && { createdAt: { $gte: dateRange.start } }),
          ...(dateRange.end && { createdAt: { ...dateRange.end && { $lte: dateRange.end } } })
        }
      },
      {
        $group: {
          _id: '$emailType',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get top performing templates
    const topTemplates = await EmailLog.aggregate([
      {
        $match: {
          'template.id': { $ne: null },
          ...(dateRange.start && { createdAt: { $gte: dateRange.start } }),
          ...(dateRange.end && { createdAt: { ...dateRange.end && { $lte: dateRange.end } } })
        }
      },
      {
        $group: {
          _id: '$template.id',
          templateName: { $first: '$template.name' },
          templateCategory: { $first: '$template.category' },
          totalSent: { $sum: 1 },
          totalOpened: { $sum: { $cond: [{ $gt: ['$analytics.openCount', 0] }, 1, 0] } },
          totalClicked: { $sum: { $cond: [{ $gt: ['$analytics.clickCount', 0] }, 1, 0] } }
        }
      },
      {
        $project: {
          templateName: 1,
          templateCategory: 1,
          totalSent: 1,
          totalOpened: 1,
          totalClicked: 1,
          openRate: { $multiply: [{ $divide: ['$totalOpened', '$totalSent'] }, 100] },
          clickRate: { $multiply: [{ $divide: ['$totalClicked', '$totalSent'] }, 100] }
        }
      },
      { $sort: { totalSent: -1 } },
      { $limit: 5 }
    ]);
    
    res.json({
      success: true,
      data: {
        overview: {
          totalSent,
          totalDelivered,
          totalOpened,
          totalClicked,
          totalFailed,
          deliveryRate: parseFloat(deliveryRate),
          openRate: parseFloat(openRate),
          clickRate: parseFloat(clickRate),
          failureRate: parseFloat(failureRate)
        },
        statusDistribution: statusStats,
        typeDistribution: typeStats,
        topTemplates
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
});

// Get email trends over time
router.get('/analytics/trends', async (req, res) => {
  try {
    const period = req.query.period || 'daily'; // daily, weekly, monthly
    const days = parseInt(req.query.days) || 30;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    let groupBy;
    switch (period) {
      case 'monthly':
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
      case 'weekly':
        groupBy = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        break;
      default:
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
    }
    
    const trends = await EmailLog.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          totalSent: { $sum: 1 },
          totalOpened: { $sum: { $cond: [{ $gt: ['$analytics.openCount', 0] }, 1, 0] } },
          totalClicked: { $sum: { $cond: [{ $gt: ['$analytics.clickCount', 0] }, 1, 0] } },
          totalFailed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } }
        }
      },
      {
        $project: {
          date: '$_id',
          totalSent: 1,
          totalOpened: 1,
          totalClicked: 1,
          totalFailed: 1,
          openRate: { $multiply: [{ $divide: ['$totalOpened', '$totalSent'] }, 100] },
          clickRate: { $multiply: [{ $divide: ['$totalClicked', '$totalSent'] }, 100] }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
    ]);
    
    res.json({
      success: true,
      data: { trends }
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trends',
      error: error.message
    });
  }
});

// ============================================================================
// UTILITY ENDPOINTS
// ============================================================================

// Get all users for recipient selection
router.get('/users', async (req, res) => {
  try {
    const query = {};
    
    // Filter by role
    if (req.query.role) {
      query.role = req.query.role;
    }
    
    // Filter by approval status
    if (req.query.approved !== undefined) {
      query.isApproved = req.query.approved === 'true';
    }
    
    // Search in name and email
    if (req.query.search) {
      query.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('firstName lastName email role isApproved')
      .sort({ firstName: 1 })
      .limit(100);
    
    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Get template categories
router.get('/templates/categories', async (req, res) => {
  try {
    const categories = await EmailTemplate.distinct('category');
    
    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

// Enhanced detailed analytics with trends and breakdowns
router.get('/analytics/detailed', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const now = new Date();
    let startDate = new Date();

    // Calculate start date based on period
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get basic stats
    const [
      totalEmails,
      sentEmails,
      deliveredEmails,
      openedEmails,
      clickedEmails,
      failedEmails
    ] = await Promise.all([
      EmailLog.countDocuments({ createdAt: { $gte: startDate } }),
      EmailLog.countDocuments({ 
        createdAt: { $gte: startDate },
        status: { $in: ['sent', 'delivered', 'opened', 'clicked'] } 
      }),
      EmailLog.countDocuments({ 
        createdAt: { $gte: startDate },
        status: { $in: ['delivered', 'opened', 'clicked'] } 
      }),
      EmailLog.countDocuments({ 
        createdAt: { $gte: startDate },
        status: { $in: ['opened', 'clicked'] } 
      }),
      EmailLog.countDocuments({ 
        createdAt: { $gte: startDate },
        status: 'clicked' 
      }),
      EmailLog.countDocuments({ 
        createdAt: { $gte: startDate },
        status: { $in: ['failed', 'bounced'] } 
      })
    ]);

    // Calculate rates
    const deliveryRate = sentEmails > 0 ? (deliveredEmails / sentEmails) * 100 : 0;
    const openRate = deliveredEmails > 0 ? (openedEmails / deliveredEmails) * 100 : 0;
    const clickRate = deliveredEmails > 0 ? (clickedEmails / deliveredEmails) * 100 : 0;
    const bounceRate = sentEmails > 0 ? (failedEmails / sentEmails) * 100 : 0;

    // Get email trends (daily aggregation)
    const emailTrends = await EmailLog.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate } 
        } 
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          sent: { 
            $sum: { 
              $cond: [{ $in: ["$status", ["sent", "delivered", "opened", "clicked"]] }, 1, 0] 
            } 
          },
          delivered: { 
            $sum: { 
              $cond: [{ $in: ["$status", ["delivered", "opened", "clicked"]] }, 1, 0] 
            } 
          },
          opened: { 
            $sum: { 
              $cond: [{ $in: ["$status", ["opened", "clicked"]] }, 1, 0] 
            } 
          },
          clicked: { 
            $sum: { 
              $cond: [{ $eq: ["$status", "clicked"] }, 1, 0] 
            } 
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get template performance
    const templateStats = await EmailLog.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate },
          templateId: { $exists: true }
        } 
      },
      {
        $lookup: {
          from: 'emailtemplates',
          localField: 'templateId',
          foreignField: '_id',
          as: 'template'
        }
      },
      {
        $group: {
          _id: "$templateId",
          templateName: { $first: { $arrayElemAt: ["$template.name", 0] } },
          totalSent: { $sum: 1 },
          delivered: { 
            $sum: { 
              $cond: [{ $in: ["$status", ["delivered", "opened", "clicked"]] }, 1, 0] 
            } 
          },
          opened: { 
            $sum: { 
              $cond: [{ $in: ["$status", ["opened", "clicked"]] }, 1, 0] 
            } 
          },
          clicked: { 
            $sum: { 
              $cond: [{ $eq: ["$status", "clicked"] }, 1, 0] 
            } 
          }
        }
      },
      {
        $addFields: {
          openRate: { 
            $cond: [
              { $eq: ["$delivered", 0] }, 
              0, 
              { $multiply: [{ $divide: ["$opened", "$delivered"] }, 100] }
            ]
          },
          clickRate: { 
            $cond: [
              { $eq: ["$delivered", 0] }, 
              0, 
              { $multiply: [{ $divide: ["$clicked", "$delivered"] }, 100] }
            ]
          }
        }
      },
      { $sort: { totalSent: -1 } },
      { $limit: 10 }
    ]);

    // Get campaign performance
    const campaignStats = await EmailLog.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate },
          campaignId: { $exists: true }
        } 
      },
      {
        $group: {
          _id: "$campaignId",
          campaignName: { $first: "$campaignName" },
          totalSent: { $sum: 1 },
          delivered: { 
            $sum: { 
              $cond: [{ $in: ["$status", ["delivered", "opened", "clicked"]] }, 1, 0] 
            } 
          },
          opened: { 
            $sum: { 
              $cond: [{ $in: ["$status", ["opened", "clicked"]] }, 1, 0] 
            } 
          },
          clicked: { 
            $sum: { 
              $cond: [{ $eq: ["$status", "clicked"] }, 1, 0] 
            } 
          }
        }
      },
      {
        $addFields: {
          deliveryRate: { 
            $cond: [
              { $eq: ["$totalSent", 0] }, 
              0, 
              { $multiply: [{ $divide: ["$delivered", "$totalSent"] }, 100] }
            ]
          },
          openRate: { 
            $cond: [
              { $eq: ["$delivered", 0] }, 
              0, 
              { $multiply: [{ $divide: ["$opened", "$delivered"] }, 100] }
            ]
          },
          clickRate: { 
            $cond: [
              { $eq: ["$delivered", 0] }, 
              0, 
              { $multiply: [{ $divide: ["$clicked", "$delivered"] }, 100] }
            ]
          }
        }
      },
      { $sort: { totalSent: -1 } },
      { $limit: 10 }
    ]);

    // Mock device stats (would need user agent tracking in production)
    const deviceStats = {
      mobile: Math.floor(totalEmails * 0.6),
      desktop: Math.floor(totalEmails * 0.3),
      tablet: Math.floor(totalEmails * 0.08),
      unknown: Math.floor(totalEmails * 0.02)
    };

    // Get top domains
    const topDomains = await EmailLog.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate } 
        } 
      },
      {
        $addFields: {
          domain: {
            $arrayElemAt: [
              { $split: ["$recipientEmail", "@"] },
              1
            ]
          }
        }
      },
      {
        $group: {
          _id: "$domain",
          count: { $sum: 1 },
          delivered: { 
            $sum: { 
              $cond: [{ $in: ["$status", ["delivered", "opened", "clicked"]] }, 1, 0] 
            } 
          }
        }
      },
      {
        $addFields: {
          deliveryRate: { 
            $cond: [
              { $eq: ["$count", 0] }, 
              0, 
              { $multiply: [{ $divide: ["$delivered", "$count"] }, 100] }
            ]
          }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        totalEmails,
        sentEmails,
        deliveredEmails,
        openedEmails,
        clickedEmails,
        failedEmails,
        deliveryRate,
        openRate,
        clickRate,
        bounceRate,
        emailTrends: emailTrends.map(trend => ({
          date: trend._id,
          sent: trend.sent,
          delivered: trend.delivered,
          opened: trend.opened,
          clicked: trend.clicked
        })),
        templateStats: templateStats.map(stat => ({
          templateId: stat._id,
          templateName: stat.templateName || 'Unknown Template',
          totalSent: stat.totalSent,
          delivered: stat.delivered,
          opened: stat.opened,
          clicked: stat.clicked,
          openRate: stat.openRate,
          clickRate: stat.clickRate
        })),
        campaignStats: campaignStats.map(stat => ({
          campaignId: stat._id,
          campaignName: stat.campaignName || 'Unknown Campaign',
          totalSent: stat.totalSent,
          delivered: stat.delivered,
          opened: stat.opened,
          clicked: stat.clicked,
          deliveryRate: stat.deliveryRate,
          openRate: stat.openRate,
          clickRate: stat.clickRate
        })),
        deviceStats,
        topDomains: topDomains.map(domain => ({
          domain: domain._id,
          count: domain.count,
          deliveryRate: domain.deliveryRate
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching detailed analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch detailed analytics data',
      error: error.message
    });
  }
});

export default router;