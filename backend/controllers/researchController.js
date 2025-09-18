import { ResearchPaper } from '../models/index.js';

// @desc    Get all research papers
// @route   GET /api/research
// @access  Public
export const getAllResearchPapers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status = 'published',
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query
    const query = { status };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [papers, total] = await Promise.all([
      ResearchPaper.find(query)
        .populate('authors.user', 'firstName lastName profile.title profile.institution')
        .populate('submittedBy', 'firstName lastName')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      ResearchPaper.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        papers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get research papers error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500
      }
    });
  }
};

// @desc    Get single research paper
// @route   GET /api/research/:id
// @access  Public
export const getResearchPaper = async (req, res) => {
  try {
    const paper = await ResearchPaper.findById(req.params.id)
      .populate('authors.user', 'firstName lastName profile')
      .populate('submittedBy', 'firstName lastName profile')
      .populate('reviewers.user', 'firstName lastName profile.title');

    if (!paper) {
      return res.status(404).json({
        error: {
          message: 'Research paper not found',
          status: 404
        }
      });
    }

    // Increment view count
    await paper.incrementViews();

    res.json({
      success: true,
      data: {
        paper
      }
    });
  } catch (error) {
    console.error('Get research paper error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500
      }
    });
  }
};

// @desc    Create new research paper
// @route   POST /api/research
// @access  Private (Researcher, Faculty, Admin)
export const createResearchPaper = async (req, res) => {
  try {
    const paperData = {
      ...req.body,
      submittedBy: req.user.id
    };

    const paper = new ResearchPaper(paperData);
    await paper.save();

    await paper.populate('authors.user', 'firstName lastName profile.title');
    await paper.populate('submittedBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Research paper created successfully',
      data: {
        paper
      }
    });
  } catch (error) {
    console.error('Create research paper error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500
      }
    });
  }
};

// @desc    Update research paper
// @route   PUT /api/research/:id
// @access  Private (Owner, Admin)
export const updateResearchPaper = async (req, res) => {
  try {
    const paper = await ResearchPaper.findById(req.params.id);

    if (!paper) {
      return res.status(404).json({
        error: {
          message: 'Research paper not found',
          status: 404
        }
      });
    }

    // Check ownership or admin role
    if (paper.submittedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: {
          message: 'Access denied. You can only update your own papers.',
          status: 403
        }
      });
    }

    const updatedPaper = await ResearchPaper.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .populate('authors.user', 'firstName lastName profile.title')
      .populate('submittedBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Research paper updated successfully',
      data: {
        paper: updatedPaper
      }
    });
  } catch (error) {
    console.error('Update research paper error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500
      }
    });
  }
};

// @desc    Delete research paper
// @route   DELETE /api/research/:id
// @access  Private (Owner, Admin)
export const deleteResearchPaper = async (req, res) => {
  try {
    const paper = await ResearchPaper.findById(req.params.id);

    if (!paper) {
      return res.status(404).json({
        error: {
          message: 'Research paper not found',
          status: 404
        }
      });
    }

    // Check ownership or admin role
    if (paper.submittedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: {
          message: 'Access denied. You can only delete your own papers.',
          status: 403
        }
      });
    }

    await ResearchPaper.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Research paper deleted successfully'
    });
  } catch (error) {
    console.error('Delete research paper error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500
      }
    });
  }
};

// @desc    Download research paper file
// @route   GET /api/research/:id/download/:fileIndex
// @access  Public
export const downloadPaperFile = async (req, res) => {
  try {
    const { id, fileIndex } = req.params;
    
    const paper = await ResearchPaper.findById(id);
    if (!paper) {
      return res.status(404).json({
        error: {
          message: 'Research paper not found',
          status: 404
        }
      });
    }

    const fileIdx = parseInt(fileIndex);
    if (fileIdx < 0 || fileIdx >= paper.files.length) {
      return res.status(404).json({
        error: {
          message: 'File not found',
          status: 404
        }
      });
    }

    // Increment download count
    await paper.incrementDownloads();

    const file = paper.files[fileIdx];
    
    // In a real application, you would serve the file from cloud storage
    res.json({
      success: true,
      message: 'File download initiated',
      data: {
        fileName: file.name,
        downloadUrl: file.url,
        fileType: file.type,
        fileSize: file.size
      }
    });
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500
      }
    });
  }
};

// @desc    Get research paper categories
// @route   GET /api/research/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = [
      'Computer Science',
      'Engineering',
      'Mathematics',
      'Physics',
      'Chemistry',
      'Biology',
      'Medicine',
      'Social Sciences',
      'Economics',
      'Environmental Science',
      'Other'
    ];

    res.json({
      success: true,
      data: {
        categories
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500
      }
    });
  }
};