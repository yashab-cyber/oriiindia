import { Job, JobApplication } from '../models/index.js';
import mongoose from 'mongoose';

// @desc    Get all active jobs (public)
// @route   GET /api/jobs
// @access  Public
export const getAllJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      department,
      type,
      experience,
      location,
      search
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query for active jobs only
    const query = { 
      isActive: true,
      applicationDeadline: { $gte: new Date() }
    };
    
    if (department && department !== 'all') {
      query.department = department;
    }
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (experience && experience !== 'all') {
      query.experience = experience;
    }
    
    if (location && location !== 'all') {
      query.location = { $regex: location, $options: 'i' };
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate('postedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
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
    console.error('Get jobs error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500
      }
    });
  }
};

// @desc    Get single job details
// @route   GET /api/jobs/:id
// @access  Public
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'firstName lastName')
      .lean();

    if (!job || !job.isActive || job.applicationDeadline < new Date()) {
      return res.status(404).json({
        error: {
          message: 'Job not found or no longer available',
          status: 404
        }
      });
    }

    res.json({
      success: true,
      data: { job }
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500
      }
    });
  }
};

// @desc    Apply for a job
// @route   POST /api/jobs/:id/apply
// @access  Public
export const applyForJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    
    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job || !job.isActive || job.applicationDeadline < new Date()) {
      return res.status(404).json({
        error: {
          message: 'Job not found or application deadline passed',
          status: 404
        }
      });
    }

    // Check if user already applied for this job
    const existingApplication = await JobApplication.findOne({
      job: jobId,
      'applicant.email': req.body.applicant.email
    });

    if (existingApplication) {
      return res.status(400).json({
        error: {
          message: 'You have already applied for this position',
          status: 400
        }
      });
    }

    // Create new application
    const application = new JobApplication({
      job: jobId,
      ...req.body
    });

    await application.save();

    // Increment applications count
    await Job.findByIdAndUpdate(jobId, {
      $inc: { applicationsCount: 1 }
    });

    res.status(201).json({
      success: true,
      data: { 
        application: {
          _id: application._id,
          status: application.status,
          applicationDate: application.applicationDate
        }
      },
      message: 'Application submitted successfully'
    });
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500
      }
    });
  }
};

// @desc    Get job statistics
// @route   GET /api/jobs/stats
// @access  Public
export const getJobStats = async (req, res) => {
  try {
    const stats = await Job.aggregate([
      {
        $match: { 
          isActive: true,
          applicationDeadline: { $gte: new Date() }
        }
      },
      {
        $group: {
          _id: null,
          totalJobs: { $sum: 1 },
          totalApplications: { $sum: '$applicationsCount' },
          departmentBreakdown: {
            $push: {
              department: '$department',
              count: 1
            }
          },
          typeBreakdown: {
            $push: {
              type: '$type',
              count: 1
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        stats: stats[0] || {
          totalJobs: 0,
          totalApplications: 0,
          departmentBreakdown: [],
          typeBreakdown: []
        }
      }
    });
  } catch (error) {
    console.error('Get job stats error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500
      }
    });
  }
};