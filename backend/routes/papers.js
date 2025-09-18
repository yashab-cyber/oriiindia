import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import ResearchPaper from '../models/ResearchPaper.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import NotificationService from '../services/NotificationService.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(process.cwd(), 'uploads', 'papers');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/tiff',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, PNG, TIFF, and TXT files are allowed.'));
    }
  }
});

// Create new paper (Step 1: Basic Information)
router.post('/create', authenticate, async (req, res) => {
  try {
    const {
      title,
      abstract,
      keywords,
      field,
      subfield,
      researchType,
      methodology
    } = req.body;

    // Validate required fields
    if (!title || !abstract || !keywords || !field || !researchType) {
      return res.status(400).json({
        success: false,
        message: 'Title, abstract, keywords, field, and research type are required'
      });
    }

    const paper = new ResearchPaper({
      title,
      abstract,
      keywords: Array.isArray(keywords) ? keywords : [keywords],
      field,
      subfield,
      researchType,
      methodology,
      submittedBy: req.user.id,
      authors: [{
        user: req.user.id,
        order: 1,
        role: 'primary_author',
        isCorresponding: true
      }]
    });

    // Mark step 1 as completed
    paper.submissionProgress.step1_basic_info.completed = true;
    paper.submissionProgress.step1_basic_info.completedAt = new Date();

    await paper.save();

    // Create notification
    await NotificationService.createNotification({
      userId: req.user.id,
      type: 'paper_draft_created',
      title: 'Research Paper Draft Created',
      message: `Your paper "${title}" has been created as a draft.`,
      metadata: {
        paperId: paper._id,
        submissionId: paper.submissionId
      }
    });

    res.status(201).json({
      success: true,
      message: 'Paper created successfully',
      data: paper
    });
  } catch (error) {
    console.error('Error creating paper:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create paper',
      error: error.message
    });
  }
});

// Update paper basic information
router.put('/:id/basic-info', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const paper = await ResearchPaper.findById(id);
    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found'
      });
    }

    // Check if user is authorized to edit
    const isAuthor = paper.authors.some(author => author.user.equals(req.user.id));
    if (!isAuthor && !paper.submittedBy.equals(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this paper'
      });
    }

    // Update allowed fields
    const allowedFields = ['title', 'abstract', 'keywords', 'field', 'subfield', 'researchType', 'methodology'];
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        paper[field] = updates[field];
      }
    });

    // Mark step 1 as completed if not already
    if (!paper.submissionProgress.step1_basic_info.completed) {
      paper.submissionProgress.step1_basic_info.completed = true;
      paper.submissionProgress.step1_basic_info.completedAt = new Date();
    }

    await paper.save();

    res.json({
      success: true,
      message: 'Paper updated successfully',
      data: paper
    });
  } catch (error) {
    console.error('Error updating paper:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update paper',
      error: error.message
    });
  }
});

// Add author to paper (Step 2: Authors)
router.post('/:id/authors', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, email, order, role, affiliation, contribution } = req.body;

    const paper = await ResearchPaper.findById(id);
    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found'
      });
    }

    // Check if user is authorized to edit
    const isAuthor = paper.authors.some(author => author.user.equals(req.user.id));
    if (!isAuthor && !paper.submittedBy.equals(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this paper'
      });
    }

    let authorUserId = userId;

    // If email is provided instead of userId, find or invite user
    if (!userId && email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        authorUserId = existingUser._id;
      } else {
        return res.status(400).json({
          success: false,
          message: 'User not found. Please invite them to join the platform first.'
        });
      }
    }

    // Check if author already exists
    const existingAuthor = paper.authors.find(author => author.user.equals(authorUserId));
    if (existingAuthor) {
      return res.status(400).json({
        success: false,
        message: 'User is already an author on this paper'
      });
    }

    // Add author
    paper.authors.push({
      user: authorUserId,
      order: order || paper.authors.length + 1,
      role: role || 'co_author',
      affiliation,
      contribution
    });

    // Sort authors by order
    paper.authors.sort((a, b) => a.order - b.order);

    // Mark step 2 as completed
    paper.submissionProgress.step2_authors.completed = true;
    paper.submissionProgress.step2_authors.completedAt = new Date();

    await paper.save();

    // Notify the added author
    await NotificationService.createNotification({
      userId: authorUserId,
      type: 'paper_author_added',
      title: 'Added as Author',
      message: `You have been added as an author to the paper "${paper.title}".`,
      metadata: {
        paperId: paper._id,
        submissionId: paper.submissionId,
        role: role || 'co_author'
      }
    });

    res.json({
      success: true,
      message: 'Author added successfully',
      data: paper
    });
  } catch (error) {
    console.error('Error adding author:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add author',
      error: error.message
    });
  }
});

// Remove author from paper
router.delete('/:id/authors/:authorId', authenticate, async (req, res) => {
  try {
    const { id, authorId } = req.params;

    const paper = await ResearchPaper.findById(id);
    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found'
      });
    }

    // Check if user is authorized to edit
    const isAuthor = paper.authors.some(author => author.user.equals(req.user.id));
    if (!isAuthor && !paper.submittedBy.equals(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this paper'
      });
    }

    // Don't allow removing the primary author
    const authorToRemove = paper.authors.find(author => author._id.equals(authorId));
    if (authorToRemove && authorToRemove.role === 'primary_author') {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the primary author'
      });
    }

    paper.authors = paper.authors.filter(author => !author._id.equals(authorId));
    await paper.save();

    res.json({
      success: true,
      message: 'Author removed successfully',
      data: paper
    });
  } catch (error) {
    console.error('Error removing author:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove author',
      error: error.message
    });
  }
});

// Upload manuscript file (Step 3: Manuscript)
router.post('/:id/upload-manuscript', authenticate, upload.single('manuscript'), async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const paper = await ResearchPaper.findById(id);
    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found'
      });
    }

    // Check if user is authorized to edit
    const isAuthor = paper.authors.some(author => author.user.equals(req.user.id));
    if (!isAuthor && !paper.submittedBy.equals(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this paper'
      });
    }

    // Update manuscript file
    paper.files.manuscript = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date(),
      version: paper.currentVersion + 1
    };

    // Mark step 3 as completed
    paper.submissionProgress.step3_manuscript.completed = true;
    paper.submissionProgress.step3_manuscript.completedAt = new Date();

    await paper.save();

    // Create notification
    await NotificationService.createNotification({
      userId: req.user.id,
      type: 'paper_manuscript_uploaded',
      title: 'Manuscript Uploaded',
      message: `Manuscript file has been uploaded for paper "${paper.title}".`,
      metadata: {
        paperId: paper._id,
        submissionId: paper.submissionId,
        filename: req.file.originalname
      }
    });

    res.json({
      success: true,
      message: 'Manuscript uploaded successfully',
      data: {
        paper,
        file: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size
        }
      }
    });
  } catch (error) {
    console.error('Error uploading manuscript:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload manuscript',
      error: error.message
    });
  }
});

// Upload supplementary materials
router.post('/:id/upload-supplementary', authenticate, upload.array('supplementary', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const { descriptions } = req.body; // Array of descriptions for each file

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const paper = await ResearchPaper.findById(id);
    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found'
      });
    }

    // Check if user is authorized to edit
    const isAuthor = paper.authors.some(author => author.user.equals(req.user.id));
    if (!isAuthor && !paper.submittedBy.equals(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this paper'
      });
    }

    // Add supplementary files
    const descriptionsArray = Array.isArray(descriptions) ? descriptions : [descriptions];
    req.files.forEach((file, index) => {
      paper.files.supplementaryMaterials.push({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        mimeType: file.mimetype,
        description: descriptionsArray[index] || '',
        uploadedAt: new Date()
      });
    });

    await paper.save();

    res.json({
      success: true,
      message: 'Supplementary materials uploaded successfully',
      data: {
        paper,
        uploadedFiles: req.files.map(file => ({
          filename: file.filename,
          originalName: file.originalname,
          size: file.size
        }))
      }
    });
  } catch (error) {
    console.error('Error uploading supplementary materials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload supplementary materials',
      error: error.message
    });
  }
});

// Upload figures
router.post('/:id/upload-figures', authenticate, upload.array('figures', 20), async (req, res) => {
  try {
    const { id } = req.params;
    const { captions, orders } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const paper = await ResearchPaper.findById(id);
    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found'
      });
    }

    // Check if user is authorized to edit
    const isAuthor = paper.authors.some(author => author.user.equals(req.user.id));
    if (!isAuthor && !paper.submittedBy.equals(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this paper'
      });
    }

    // Add figures
    const captionsArray = Array.isArray(captions) ? captions : [captions];
    const ordersArray = Array.isArray(orders) ? orders : [orders];
    
    req.files.forEach((file, index) => {
      paper.files.figures.push({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        caption: captionsArray[index] || '',
        order: parseInt(ordersArray[index]) || index + 1,
        uploadedAt: new Date()
      });
    });

    // Sort figures by order
    paper.files.figures.sort((a, b) => a.order - b.order);

    await paper.save();

    res.json({
      success: true,
      message: 'Figures uploaded successfully',
      data: {
        paper,
        uploadedFiles: req.files.map(file => ({
          filename: file.filename,
          originalName: file.originalname,
          size: file.size
        }))
      }
    });
  } catch (error) {
    console.error('Error uploading figures:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload figures',
      error: error.message
    });
  }
});

// Submit paper for review (Step 5: Submit)
router.post('/:id/submit', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { suggestedReviewers, excludedReviewers, coverLetter } = req.body;

    const paper = await ResearchPaper.findById(id);
    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found'
      });
    }

    // Check if user is authorized to submit
    const isAuthor = paper.authors.some(author => author.user.equals(req.user.id));
    if (!isAuthor && !paper.submittedBy.equals(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to submit this paper'
      });
    }

    // Validate submission requirements
    if (!paper.submissionProgress.step1_basic_info.completed) {
      return res.status(400).json({
        success: false,
        message: 'Basic information must be completed before submission'
      });
    }

    if (!paper.submissionProgress.step2_authors.completed) {
      return res.status(400).json({
        success: false,
        message: 'Authors information must be completed before submission'
      });
    }

    if (!paper.submissionProgress.step3_manuscript.completed) {
      return res.status(400).json({
        success: false,
        message: 'Manuscript file must be uploaded before submission'
      });
    }

    // Update paper status and settings
    paper.status = 'submitted';
    paper.submissionDate = new Date();
    paper.timeline.submittedAt = new Date();

    if (suggestedReviewers) {
      paper.settings.suggestedReviewers = suggestedReviewers;
    }

    if (excludedReviewers) {
      paper.settings.excludedReviewers = excludedReviewers;
    }

    // Mark all steps as completed
    paper.submissionProgress.step4_review.completed = true;
    paper.submissionProgress.step4_review.completedAt = new Date();
    paper.submissionProgress.step5_submit.completed = true;
    paper.submissionProgress.step5_submit.completedAt = new Date();

    await paper.save();

    // Create submission notification for author
    await NotificationService.createNotification({
      userId: req.user.id,
      type: 'paper_submitted',
      title: 'Paper Submitted Successfully',
      message: `Your paper "${paper.title}" has been submitted for review. Submission ID: ${paper.submissionId}`,
      metadata: {
        paperId: paper._id,
        submissionId: paper.submissionId
      }
    });

    // Notify all co-authors
    for (const author of paper.authors) {
      if (!author.user.equals(req.user.id)) {
        await NotificationService.createNotification({
          userId: author.user,
          type: 'paper_submitted',
          title: 'Co-authored Paper Submitted',
          message: `A paper you co-authored "${paper.title}" has been submitted for review.`,
          metadata: {
            paperId: paper._id,
            submissionId: paper.submissionId,
            submittedBy: req.user.id
          }
        });
      }
    }

    res.json({
      success: true,
      message: 'Paper submitted successfully',
      data: {
        paper,
        submissionId: paper.submissionId
      }
    });
  } catch (error) {
    console.error('Error submitting paper:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit paper',
      error: error.message
    });
  }
});

// Get paper details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const paper = await ResearchPaper.findById(id)
      .populate('submittedBy', 'firstName lastName email avatar')
      .populate('authors.user', 'firstName lastName email avatar')
      .populate('reviewProcess.assignedReviewers.reviewer', 'firstName lastName email')
      .populate('reviewProcess.reviews.reviewer', 'firstName lastName email')
      .populate('communications.from', 'firstName lastName email')
      .populate('communications.to', 'firstName lastName email');

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found'
      });
    }

    // Check if user has access to view this paper
    const isAuthor = paper.authors.some(author => author.user._id.equals(req.user.id));
    const isSubmitter = paper.submittedBy._id.equals(req.user.id);
    const isReviewer = paper.reviewProcess.assignedReviewers.some(r => r.reviewer._id.equals(req.user.id));
    
    if (!isAuthor && !isSubmitter && !isReviewer && !paper.settings.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this paper'
      });
    }

    res.json({
      success: true,
      data: paper
    });
  } catch (error) {
    console.error('Error fetching paper:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch paper details',
      error: error.message
    });
  }
});

// Get user's papers
router.get('/user/my-papers', authenticate, async (req, res) => {
  try {
    const { status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query = {
      $or: [
        { submittedBy: req.user.id },
        { 'authors.user': req.user.id }
      ]
    };

    if (status) {
      query.status = status;
    }

    const papers = await ResearchPaper.find(query)
      .populate('submittedBy', 'firstName lastName email avatar')
      .populate('authors.user', 'firstName lastName email avatar')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ResearchPaper.countDocuments(query);

    res.json({
      success: true,
      data: {
        papers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user papers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch papers',
      error: error.message
    });
  }
});

// Get papers for review
router.get('/reviewer/assigned', authenticate, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {
      'reviewProcess.assignedReviewers.reviewer': req.user.id
    };

    if (status) {
      query['reviewProcess.assignedReviewers.status'] = status;
    }

    const papers = await ResearchPaper.find(query)
      .populate('submittedBy', 'firstName lastName email avatar')
      .populate('authors.user', 'firstName lastName email avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ResearchPaper.countDocuments(query);

    res.json({
      success: true,
      data: {
        papers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching papers for review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch papers for review',
      error: error.message
    });
  }
});

// Delete paper (only drafts)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const paper = await ResearchPaper.findById(id);
    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found'
      });
    }

    // Check if user is authorized to delete
    if (!paper.submittedBy.equals(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this paper'
      });
    }

    // Only allow deletion of drafts
    if (paper.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft papers can be deleted'
      });
    }

    // Delete associated files
    if (paper.files.manuscript && paper.files.manuscript.path) {
      try {
        fs.unlinkSync(paper.files.manuscript.path);
      } catch (err) {
        console.error('Error deleting manuscript file:', err);
      }
    }

    paper.files.supplementaryMaterials.forEach(file => {
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.error('Error deleting supplementary file:', err);
      }
    });

    paper.files.figures.forEach(file => {
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.error('Error deleting figure file:', err);
      }
    });

    await ResearchPaper.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Paper deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting paper:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete paper',
      error: error.message
    });
  }
});

export default router;