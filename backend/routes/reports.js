import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Report from '../models/Report.js';
import User from '../models/User.js';
import ResearchPaper from '../models/ResearchPaper.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create a new report
router.post('/', async (req, res) => {
  try {
    const { type, targetId, reason, description } = req.body;

    // Validate required fields
    if (!type || !targetId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Type, target ID, and reason are required'
      });
    }

    // Check if target exists based on type
    let targetExists = false;
    switch (type) {
      case 'user':
        targetExists = await User.findById(targetId);
        break;
      case 'research_paper':
        targetExists = await ResearchPaper.findById(targetId);
        break;
      // Add other content types as needed
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
    }

    if (!targetExists) {
      return res.status(404).json({
        success: false,
        message: 'Target content not found'
      });
    }

    // Check if user has already reported this content
    const existingReport = await Report.findOne({
      type,
      targetId,
      reportedBy: req.user.id
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this content'
      });
    }

    // Determine priority based on reason
    let priority = 'medium';
    if (['harassment', 'offensive_language', 'privacy_violation'].includes(reason)) {
      priority = 'high';
    } else if (reason === 'spam') {
      priority = 'low';
    }

    // Create the report
    const report = new Report({
      type,
      targetId,
      reportedBy: req.user.id,
      reason,
      description,
      priority
    });

    await report.save();

    // Populate the report for response
    await report.populate('reportedBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: { report }
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting report',
      error: error.message
    });
  }
});

// Get user's own reports
router.get('/my-reports', async (req, res) => {
  try {
    const reports = await Report.find({ reportedBy: req.user.id })
      .populate('targetContent')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { reports }
    });
  } catch (error) {
    console.error('Error fetching user reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reports',
      error: error.message
    });
  }
});

// Get report status (for checking if content is already reported)
router.get('/status/:type/:targetId', async (req, res) => {
  try {
    const { type, targetId } = req.params;

    const report = await Report.findOne({
      type,
      targetId,
      reportedBy: req.user.id
    });

    res.json({
      success: true,
      data: {
        isReported: !!report,
        reportStatus: report?.status || null
      }
    });
  } catch (error) {
    console.error('Error checking report status:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking report status',
      error: error.message
    });
  }
});

export default router;