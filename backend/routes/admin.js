import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import User from '../models/User.js';
import ResearchPaper from '../models/ResearchPaper.js';
import Event from '../models/Event.js';
import Report from '../models/Report.js';
import { Job, JobApplication } from '../models/index.js';

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

// =============================================================================
// JOB MANAGEMENT ROUTES
// =============================================================================

// Create a new job posting
router.post('/jobs', async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      postedBy: req.user.id
    };

    // If no application deadline provided, set it to 30 days from now
    if (!jobData.applicationDeadline) {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 30);
      jobData.applicationDeadline = deadline;
    }

    const job = new Job(jobData);
    await job.save();
    
    await job.populate('postedBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      data: { job },
      message: 'Job posted successfully'
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating job',
      error: error.message
    });
  }
});

// Get all jobs (including inactive ones for admin)
router.get('/jobs', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = 'all'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== 'all') {
      query.isActive = status === 'active';
    }

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate('postedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Job.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
      error: error.message
    });
  }
});

// Get single job with applications
router.get('/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'firstName lastName');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const applications = await JobApplication.find({ job: req.params.id })
      .sort({ applicationDate: -1 });

    res.json({
      success: true,
      data: {
        job,
        applications,
        applicationsCount: applications.length
      }
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job',
      error: error.message
    });
  }
});

// Update job
router.put('/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('postedBy', 'firstName lastName');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      data: { job },
      message: 'Job updated successfully'
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating job',
      error: error.message
    });
  }
});

// Delete job
router.delete('/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Also delete all applications for this job
    await JobApplication.deleteMany({ job: req.params.id });

    res.json({
      success: true,
      message: 'Job and all applications deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting job',
      error: error.message
    });
  }
});

// Get all job applications
router.get('/job-applications', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      jobId,
      status = 'all'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let query = {};
    
    if (jobId) {
      query.job = jobId;
    }

    if (status !== 'all') {
      query.status = status;
    }

    const [applications, total] = await Promise.all([
      JobApplication.find(query)
        .populate('job', 'title department')
        .sort({ applicationDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      JobApplication.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
});

// Get single application details
router.get('/job-applications/:id', async (req, res) => {
  try {
    const application = await JobApplication.findById(req.params.id)
      .populate('job', 'title department location type')
      .populate('reviewNotes.reviewedBy', 'firstName lastName');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: { application }
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching application',
      error: error.message
    });
  }
});

// Update application status
router.patch('/job-applications/:id/status', async (req, res) => {
  try {
    const { status, note } = req.body;

    const updateData = { status };
    
    if (note) {
      updateData.$push = {
        reviewNotes: {
          note,
          reviewedBy: req.user.id,
          reviewDate: new Date()
        }
      };
    }

    const application = await JobApplication.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('job', 'title department');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: { application },
      message: 'Application status updated successfully'
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating application status',
      error: error.message
    });
  }
});

// =============================================================================
// ANALYTICS ROUTES
// =============================================================================

// Get comprehensive analytics data
router.get('/analytics', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysAgo = parseInt(days);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Overview statistics
    const [
      totalUsers,
      totalPapers,
      totalJobs,
      totalEvents,
      totalApplications,
      usersThisMonth,
      papersThisMonth,
      jobsThisMonth,
      applicationsThisMonth
    ] = await Promise.all([
      User.countDocuments(),
      ResearchPaper.countDocuments(),
      Job.countDocuments(),
      Event.countDocuments(),
      JobApplication.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startDate } }),
      ResearchPaper.countDocuments({ createdAt: { $gte: startDate } }),
      Job.countDocuments({ createdAt: { $gte: startDate } }),
      JobApplication.countDocuments({ createdAt: { $gte: startDate } })
    ]);

    // Calculate growth percentages (simplified calculation)
    const previousPeriodStart = new Date();
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (daysAgo * 2));
    previousPeriodStart.setDate(previousPeriodStart.getDate() + daysAgo);

    const [
      prevUsers,
      prevPapers,
      prevJobs,
      prevApplications
    ] = await Promise.all([
      User.countDocuments({ 
        createdAt: { 
          $gte: previousPeriodStart, 
          $lt: startDate 
        } 
      }),
      ResearchPaper.countDocuments({ 
        createdAt: { 
          $gte: previousPeriodStart, 
          $lt: startDate 
        } 
      }),
      Job.countDocuments({ 
        createdAt: { 
          $gte: previousPeriodStart, 
          $lt: startDate 
        } 
      }),
      JobApplication.countDocuments({ 
        createdAt: { 
          $gte: previousPeriodStart, 
          $lt: startDate 
        } 
      })
    ]);

    // Calculate growth percentages
    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    // User statistics
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    const roleStats = {
      student: 0,
      faculty: 0,
      admin: 0,
      researcher: 0
    };
    
    usersByRole.forEach(role => {
      if (roleStats.hasOwnProperty(role._id)) {
        roleStats[role._id] = role.count;
      }
    });

    // Paper statistics
    const papersByStatus = await ResearchPaper.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const paperStats = {
      approved: 0,
      pending: 0,
      rejected: 0
    };
    
    papersByStatus.forEach(status => {
      if (paperStats.hasOwnProperty(status._id)) {
        paperStats[status._id] = status.count;
      }
    });

    // Recent paper submissions
    const recentSubmissions = await ResearchPaper.find()
      .populate('submittedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title status createdAt submittedBy');

    // Job statistics
    const activeJobs = await Job.countDocuments({ isActive: true });
    
    const applicationsByStatus = await JobApplication.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const appStats = {
      pending: 0,
      reviewed: 0,
      shortlisted: 0,
      rejected: 0
    };
    
    applicationsByStatus.forEach(status => {
      if (appStats.hasOwnProperty(status._id)) {
        appStats[status._id] = status.count;
      }
    });

    // Jobs by department
    const jobsByDepartment = await Job.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Top jobs by applications
    const topJobs = await Job.aggregate([
      {
        $lookup: {
          from: 'jobapplications',
          localField: '_id',
          foreignField: 'job',
          as: 'applications'
        }
      },
      {
        $project: {
          title: 1,
          department: 1,
          applications: { $size: '$applications' }
        }
      },
      { $sort: { applications: -1 } },
      { $limit: 5 }
    ]);

    // Event statistics
    const upcomingEvents = await Event.countDocuments({ 
      startDate: { $gte: new Date() } 
    });
    const pastEvents = totalEvents - upcomingEvents;

    // Compile analytics data
    const analyticsData = {
      overview: {
        totalUsers,
        totalPapers,
        totalJobs,
        totalEvents,
        totalApplications,
        monthlyGrowth: {
          users: calculateGrowth(usersThisMonth, prevUsers),
          papers: calculateGrowth(papersThisMonth, prevPapers),
          jobs: calculateGrowth(jobsThisMonth, prevJobs),
          applications: calculateGrowth(applicationsThisMonth, prevApplications)
        }
      },
      userStats: {
        totalUsers,
        activeUsers: totalUsers, // Simplified - could be based on recent activity
        newUsersThisMonth: usersThisMonth,
        usersByRole: roleStats
      },
      paperStats: {
        totalPapers,
        pendingPapers: paperStats.pending,
        approvedPapers: paperStats.approved,
        rejectedPapers: paperStats.rejected,
        recentSubmissions: recentSubmissions.map(paper => ({
          title: paper.title,
          author: `${paper.submittedBy.firstName} ${paper.submittedBy.lastName}`,
          status: paper.status,
          submittedAt: paper.createdAt
        }))
      },
      jobStats: {
        totalJobs,
        activeJobs,
        totalApplications,
        applicationsByStatus: appStats,
        jobsByDepartment: jobsByDepartment.map(dept => ({
          department: dept._id,
          count: dept.count
        })),
        topJobs: topJobs.map(job => ({
          title: job.title,
          department: job.department,
          applications: job.applications
        }))
      },
      eventStats: {
        totalEvents,
        upcomingEvents,
        pastEvents,
        eventsByType: [] // Could be implemented if event types are added
      }
    };

    res.json({
      success: true,
      data: analyticsData,
      message: 'Analytics data retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics data',
      error: error.message
    });
  }
});

// Employee Management Routes

// Get all employees with pagination and filters
router.get('/employees', async (req, res) => {
  try {
    const { page = 1, limit = 10, department, status, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    let query = {};
    
    if (department) {
      query.department = department;
    }
    
    if (status) {
      query.employmentStatus = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } }
      ];
    }

    // Import Employee model dynamically
    const Employee = (await import('../models/Employee.js')).default;

    const [employees, total] = await Promise.all([
      Employee.find(query)
        .select('-password')
        .populate('manager', 'name employeeId position')
        .populate('createdBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Employee.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        employees,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total
        }
      }
    });

  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employees',
      error: error.message
    });
  }
});

// Create new employee
router.post('/employees', async (req, res) => {
  try {
    const bcrypt = (await import('bcryptjs')).default;
    const Employee = (await import('../models/Employee.js')).default;

    const {
      name,
      email,
      department,
      position,
      phoneNumber,
      dateOfJoining,
      salary,
      manager,
      workingHours,
      address,
      emergencyContact
    } = req.body;

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({ email: email.toLowerCase() });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this email already exists'
      });
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Create employee
    const employee = new Employee({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      department,
      position,
      phoneNumber,
      dateOfJoining: dateOfJoining || new Date(),
      salary,
      manager,
      workingHours,
      address,
      emergencyContact,
      createdBy: req.user.id
    });

    await employee.save();

    // Don't return password in response
    const employeeResponse = employee.toJSON();
    delete employeeResponse.password;

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: {
        employee: employeeResponse,
        tempPassword // In production, send this via email
      }
    });

  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating employee',
      error: error.message
    });
  }
});

// Get employee by ID
router.get('/employees/:id', async (req, res) => {
  try {
    const Employee = (await import('../models/Employee.js')).default;
    
    const employee = await Employee.findById(req.params.id)
      .select('-password')
      .populate('manager', 'name employeeId position')
      .populate('createdBy', 'firstName lastName');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      data: employee
    });

  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employee',
      error: error.message
    });
  }
});

// Update employee
router.put('/employees/:id', async (req, res) => {
  try {
    const Employee = (await import('../models/Employee.js')).default;
    
    const updates = { ...req.body };
    delete updates.password; // Don't allow password update through this route
    delete updates.employeeId; // Don't allow employee ID change

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: employee
    });

  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating employee',
      error: error.message
    });
  }
});

// Delete employee (soft delete by changing status)
router.delete('/employees/:id', async (req, res) => {
  try {
    const Employee = (await import('../models/Employee.js')).default;
    
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { employmentStatus: 'terminated' },
      { new: true }
    ).select('-password');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      message: 'Employee deactivated successfully',
      data: employee
    });

  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting employee',
      error: error.message
    });
  }
});

// Get all attendance records with filters
router.get('/attendance', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      employee, 
      department, 
      date, 
      startDate, 
      endDate,
      status
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Import models
    const Employee = (await import('../models/Employee.js')).default;
    const Attendance = (await import('../models/Attendance.js')).default;

    // Build query
    let query = {};
    
    if (employee) {
      query.employee = employee;
    }
    
    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: targetDate, $lt: nextDay };
    } else if (startDate && endDate) {
      query.date = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }
    
    if (status) {
      query.status = status;
    }

    // If department filter is specified, get employees from that department first
    let employeeIds;
    if (department) {
      const deptEmployees = await Employee.find({ department }).select('_id');
      employeeIds = deptEmployees.map(emp => emp._id);
      query.employee = { $in: employeeIds };
    }

    const [attendance, total] = await Promise.all([
      Attendance.find(query)
        .populate('employee', 'name employeeId department position')
        .sort({ date: -1, checkInTime: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Attendance.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        attendance,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total
        }
      }
    });

  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance records',
      error: error.message
    });
  }
});

// Get attendance summary by employee
router.get('/attendance/summary', async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;
    
    // Import models
    const Employee = (await import('../models/Employee.js')).default;
    const Attendance = (await import('../models/Attendance.js')).default;

    // Default to current month if no dates provided
    let start, end;
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      const now = new Date();
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    // Get employees (optionally filtered by department)
    let employeeQuery = { employmentStatus: 'active' };
    if (department) {
      employeeQuery.department = department;
    }

    const employees = await Employee.find(employeeQuery).select('name employeeId department position');

    // Get attendance summaries for each employee
    const summaries = await Promise.all(
      employees.map(async (employee) => {
        const summary = await Attendance.getAttendanceSummary(employee._id, start, end);
        return {
          employee: {
            id: employee._id,
            name: employee.name,
            employeeId: employee.employeeId,
            department: employee.department,
            position: employee.position
          },
          ...summary
        };
      })
    );

    res.json({
      success: true,
      data: {
        summaries,
        dateRange: {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
        }
      }
    });

  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance summary',
      error: error.message
    });
  }
});

// Approve/Reject regularization requests
router.put('/attendance/:id/regularization', async (req, res) => {
  try {
    const { action, comments } = req.body; // action: 'approve' or 'reject'
    
    const Attendance = (await import('../models/Attendance.js')).default;
    
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be "approve" or "reject"'
      });
    }

    const attendance = await Attendance.findById(req.params.id)
      .populate('employee', 'name employeeId');

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    if (!attendance.regularizationRequest.requested) {
      return res.status(400).json({
        success: false,
        message: 'No regularization request found for this attendance'
      });
    }

    // Update regularization request
    attendance.regularizationRequest.status = action === 'approve' ? 'approved' : 'rejected';
    attendance.regularizationRequest.approvedAt = new Date();
    attendance.regularizationRequest.approvedBy = req.user.id;
    
    if (comments) {
      attendance.regularizationRequest.comments = comments;
    }

    await attendance.save();

    res.json({
      success: true,
      message: `Regularization request ${action}d successfully`,
      data: attendance
    });

  } catch (error) {
    console.error('Error processing regularization:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing regularization request',
      error: error.message
    });
  }
});

export default router;