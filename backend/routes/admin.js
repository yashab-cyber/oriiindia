import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import User from '../models/User.js';
import ResearchPaper from '../models/ResearchPaper.js';
import Event from '../models/Event.js';
import Report from '../models/Report.js';

const router = express.Router();

// Middleware to ensure admin access
router.use(authenticate);
router.use(requireAdmin);

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Get various statistics
    const totalUsers = await User.countDocuments();
    const pendingUsers = await User.countDocuments({ approvalStatus: 'pending' });
    const pendingPapers = await ResearchPaper.countDocuments({ status: 'pending' });
    const totalPapers = await ResearchPaper.countDocuments();
    const upcomingEvents = await Event.countDocuments({ 
      startDate: { $gte: new Date() } 
    });

    // Get recent activities (you can customize this based on your needs)
    const recentActivities = await Promise.all([
      // Recent user registrations
      User.find()
        .sort({ createdAt: -1 })
        .limit(3)
        .select('firstName lastName createdAt')
        .then(users => users.map(user => ({
          description: `New user registered: ${user.firstName} ${user.lastName}`,
          timestamp: user.createdAt.toLocaleDateString(),
          type: 'user_registration'
        }))),
      
      // Recent paper submissions
      ResearchPaper.find()
        .sort({ createdAt: -1 })
        .limit(3)
        .populate('submittedBy', 'firstName lastName')
        .then(papers => papers.map(paper => ({
          description: `New paper submitted: "${paper.title}" by ${paper.submittedBy.firstName} ${paper.submittedBy.lastName}`,
          timestamp: paper.createdAt.toLocaleDateString(),
          type: 'paper_submission'
        })))
    ]);

    const flatActivities = recentActivities.flat().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      data: {
        totalUsers,
        pendingUsers,
        pendingPapers,
        totalPapers,
        upcomingEvents,
        recentActivities: flatActivities.slice(0, 10)
      }
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get all users with pagination and filtering
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const role = req.query.role || '';
    const status = req.query.status || '';

    // Build query - by default show only approved users for admin dashboard
    let query = {
      isApproved: true,
      approvalStatus: 'approved'
    };
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    if (status) {
      query.isActive = status === 'active';
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Update user status (activate/deactivate)
router.patch('/users/:userId/status', async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user }
    });

  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Update user role
router.patch('/users/:userId/role', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['admin', 'researcher', 'student', 'faculty', 'visitor'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get research papers for review
router.get('/papers', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || '';
    const search = req.query.search || '';

    let query = {};
    
    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { abstract: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const papers = await ResearchPaper.find(query)
      .populate('submittedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPapers = await ResearchPaper.countDocuments(query);
    const totalPages = Math.ceil(totalPapers / limit);

    res.json({
      success: true,
      data: {
        papers,
        pagination: {
          currentPage: page,
          totalPages,
          totalPapers,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching papers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Approve/reject research paper
router.patch('/papers/:paperId/status', async (req, res) => {
  try {
    const { paperId } = req.params;
    const { status, reviewComments } = req.body;

    // Validate status
    const validStatuses = ['approved', 'rejected', 'pending', 'under_review'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status specified'
      });
    }

    const paper = await ResearchPaper.findByIdAndUpdate(
      paperId,
      { 
        status,
        reviewComments,
        reviewedBy: req.user.id,
        reviewedAt: new Date()
      },
      { new: true }
    ).populate('submittedBy', 'firstName lastName email');

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Research paper not found'
      });
    }

    res.json({
      success: true,
      message: `Paper ${status} successfully`,
      data: { paper }
    });

  } catch (error) {
    console.error('Error updating paper status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Delete user (with safeguards)
router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent admin from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Soft delete by deactivating instead of hard delete
    await User.findByIdAndUpdate(userId, { isActive: false });

    res.json({
      success: true,
      message: 'User account deactivated successfully'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Content Moderation Routes

// Get all reports
router.get('/reports', async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reportedBy', 'firstName lastName email')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { reports }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reports',
      error: error.message
    });
  }
});

// Update report status
router.put('/reports/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, moderatorNotes } = req.body;

    const report = await Report.findByIdAndUpdate(
      reportId,
      {
        status,
        moderatorNotes,
        reviewedBy: req.user.id,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('reportedBy', 'firstName lastName email')
     .populate('reviewedBy', 'firstName lastName');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: { report }
    });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating report',
      error: error.message
    });
  }
});

// Get content for review (posts, comments, papers that need moderation)
router.get('/content', async (req, res) => {
  try {
    const content = [];

    // Get research papers that need moderation
    const papers = await ResearchPaper.find({
      $or: [
        { isModerated: false },
        { status: 'flagged' }
      ]
    })
    .populate('submittedBy', 'firstName lastName email')
    .sort({ createdAt: -1 });

    papers.forEach(paper => {
      content.push({
        _id: paper._id,
        type: 'research_paper',
        title: paper.title,
        content: paper.abstract || paper.description,
        author: paper.submittedBy,
        isActive: paper.status === 'approved',
        isModerated: paper.isModerated || false,
        createdAt: paper.createdAt,
        reportCount: 0 // You can implement report counting later
      });
    });

    // Add other content types here (posts, comments) when those models are created

    res.json({
      success: true,
      data: { content }
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching content',
      error: error.message
    });
  }
});

// Moderate content (approve, hide, delete)
router.put('/content/:contentId/moderate', async (req, res) => {
  try {
    const { contentId } = req.params;
    const { action, type } = req.body;

    let result;

    switch (type) {
      case 'research_paper':
        if (action === 'approve') {
          result = await ResearchPaper.findByIdAndUpdate(
            contentId,
            { 
              status: 'approved',
              isModerated: true,
              moderatedBy: req.user.id,
              moderatedAt: new Date()
            },
            { new: true }
          );
        } else if (action === 'hide') {
          result = await ResearchPaper.findByIdAndUpdate(
            contentId,
            { 
              status: 'hidden',
              isModerated: true,
              moderatedBy: req.user.id,
              moderatedAt: new Date()
            },
            { new: true }
          );
        } else if (action === 'delete') {
          result = await ResearchPaper.findByIdAndDelete(contentId);
        }
        break;

      // Add other content types here when implemented
      default:
        return res.status(400).json({
          success: false,
          message: 'Unsupported content type'
        });
    }

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    res.json({
      success: true,
      message: `Content ${action}d successfully`,
      data: { content: result }
    });
  } catch (error) {
    console.error('Error moderating content:', error);
    res.status(500).json({
      success: false,
      message: 'Error moderating content',
      error: error.message
    });
  }
});

// Get pending users for approval
router.get('/users/pending', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const pendingUsers = await User.find({ approvalStatus: 'pending' })
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalPending = await User.countDocuments({ approvalStatus: 'pending' });
    const totalPages = Math.ceil(totalPending / limitNum);

    res.json({
      success: true,
      data: {
        users: pendingUsers,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalPending,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending users',
      error: error.message
    });
  }
});

// Approve user
router.patch('/users/:userId/approve', async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user.id;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        isApproved: true,
        approvalStatus: 'approved',
        approvedBy: adminId,
        approvalDate: new Date()
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User approved successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving user',
      error: error.message
    });
  }
});

// Reject user
router.patch('/users/:userId/reject', async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        isApproved: false,
        approvalStatus: 'rejected',
        approvedBy: adminId,
        approvalDate: new Date(),
        rejectionReason: reason || 'No reason provided'
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User rejected successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Error rejecting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting user',
      error: error.message
    });
  }
});

export default router;