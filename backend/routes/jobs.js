import express from 'express';
import {
  getAllJobs,
  getJobById,
  applyForJob,
  getJobStats
} from '../controllers/jobController.js';

const router = express.Router();

// @route   GET /api/jobs/stats
// @desc    Get job statistics
// @access  Public
router.get('/stats', getJobStats);

// @route   GET /api/jobs
// @desc    Get all active jobs
// @access  Public
router.get('/', getAllJobs);

// @route   GET /api/jobs/:id
// @desc    Get single job details
// @access  Public
router.get('/:id', getJobById);

// @route   POST /api/jobs/:id/apply
// @desc    Apply for a job
// @access  Public
router.post('/:id/apply', applyForJob);

export default router;