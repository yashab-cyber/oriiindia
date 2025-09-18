import express from 'express';
import {
  getAllResearchPapers,
  getResearchPaper,
  createResearchPaper,
  updateResearchPaper,
  deleteResearchPaper,
  downloadPaperFile,
  getCategories
} from '../controllers/researchController.js';
import { validateResearchPaper } from '../utils/validation.js';
import { handleValidationErrors, validateObjectId, validatePagination } from '../middleware/validation.js';
import { authenticate, isResearcherOrAbove, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/research/test
// @desc    Test research route
// @access  Public
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Research route working',
    timestamp: new Date().toISOString()
  });
});

// @route   GET /api/research/categories
// @desc    Get research paper categories
// @access  Public
router.get('/categories', getCategories);

// @route   GET /api/research
// @desc    Get all research papers
// @access  Public
router.get('/', validatePagination, getAllResearchPapers);

// @route   POST /api/research
// @desc    Create new research paper
// @access  Private (Researcher, Faculty, Admin)
router.post('/', authenticate, isResearcherOrAbove, validateResearchPaper, handleValidationErrors, createResearchPaper);

// @route   GET /api/research/:id/download/:fileIndex
// @desc    Download research paper file
// @access  Public
router.get('/:id/download/:fileIndex', validateObjectId(), downloadPaperFile);

// @route   GET /api/research/:id
// @desc    Get single research paper
// @access  Public
router.get('/:id', validateObjectId(), getResearchPaper);

// @route   PUT /api/research/:id
// @desc    Update research paper
// @access  Private (Owner, Admin)
router.put('/:id', authenticate, validateObjectId(), validateResearchPaper, handleValidationErrors, updateResearchPaper);

// @route   DELETE /api/research/:id
// @desc    Delete research paper
// @access  Private (Owner, Admin)
router.delete('/:id', authenticate, validateObjectId(), deleteResearchPaper);

export default router;