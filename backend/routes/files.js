import express from 'express';
import { 
  upload, 
  uploadResearchPaper,
  uploadProfileImage,
  uploadDocument,
  uploadToGridFS, 
  downloadFromGridFS, 
  deleteFromGridFS, 
  getFileInfo 
} from '../config/fileUpload.js';
import { authenticate } from '../middleware/auth.js';
import ResearchPaper from '../models/ResearchPaper.js';
import User from '../models/User.js';
import { GridFSBucket } from 'mongodb';
import mongoose from 'mongoose';

const router = express.Router();

// Helper function to get appropriate bucket
const getBucket = (uploadType) => {
  const conn = mongoose.connection;
  
  if (conn.readyState !== 1) {
    throw new Error('Database not connected');
  }
  
  const bucketNames = {
    'profile-images': 'profile_images',
    'research-papers': 'research_papers',
    'documents': 'documents'
  };
  
  const bucketName = bucketNames[uploadType] || 'documents';
  return new GridFSBucket(conn.db, { bucketName });
};

// Upload research paper file
router.post('/upload/research-papers/:paperId', 
  authenticate, 
  uploadResearchPaper.single('file'), 
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const { paperId } = req.params;
      const userId = req.user.id;

      // Verify the research paper exists and user has permission
      const paper = await ResearchPaper.findById(paperId);
      if (!paper) {
        return res.status(404).json({
          success: false,
          message: 'Research paper not found'
        });
      }

      // Check if user is the author or has permission
      if (paper.submittedBy.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to upload files for this paper'
        });
      }

      // Upload file to GridFS
      const fileData = await uploadToGridFS(
        req.file, 
        'research-papers', 
        userId, 
        {
          paperId: paperId,
          paperTitle: paper.title,
          fileType: 'main-document'
        }
      );

      // Update research paper with file information
      paper.files.push({
        fileId: fileData.fileId,
        filename: fileData.filename,
        originalName: fileData.originalName,
        size: fileData.size,
        uploadDate: fileData.uploadDate,
        fileType: 'main-document'
      });

      await paper.save();

      res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          file: fileData,
          paper: {
            id: paper._id,
            title: paper.title,
            fileCount: paper.files.length
          }
        }
      });

    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({
        success: false,
        message: 'File upload failed',
        error: error.message
      });
    }
  }
);

// Upload profile image
router.post('/upload/profile-image', 
  authenticate, 
  uploadProfileImage.single('image'), 
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image uploaded'
        });
      }

      const userId = req.user.id;

      // Get user's current avatar to delete old one
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Delete old avatar if exists
      if (user.profile.avatar) {
        try {
          await deleteFromGridFS(user.profile.avatar, 'profile-images');
        } catch (deleteError) {
          console.log('Old avatar deletion failed:', deleteError.message);
        }
      }

      // Upload new profile image
      const fileData = await uploadToGridFS(
        req.file, 
        'profile-images', 
        userId, 
        {
          userEmail: user.email,
          userName: `${user.firstName} ${user.lastName}`
        }
      );

      // Update user profile with new avatar
      user.profile.avatar = fileData.fileId;
      await user.save();

      res.status(201).json({
        success: true,
        message: 'Profile image uploaded successfully',
        data: {
          file: fileData,
          user: {
            id: user._id,
            name: user.fullName,
            avatar: fileData.fileId
          }
        }
      });

    } catch (error) {
      console.error('Profile image upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Profile image upload failed',
        error: error.message
      });
    }
  }
);

// Upload general document
router.post('/upload/documents', 
  authenticate, 
  uploadDocument.single('document'), 
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No document uploaded'
        });
      }

      const userId = req.user.id;
      const { description, category } = req.body;

      // Upload document to GridFS
      const fileData = await uploadToGridFS(
        req.file, 
        'documents', 
        userId, 
        {
          description: description || '',
          category: category || 'general',
          uploaderEmail: req.user.email
        }
      );

      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        data: {
          file: fileData
        }
      });

    } catch (error) {
      console.error('Document upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Document upload failed',
        error: error.message
      });
    }
  }
);

// Download file
router.get('/download/:type/:fileId', authenticate, async (req, res) => {
  try {
    const { type, fileId } = req.params;
    
    // Validate upload type
    const validTypes = ['research-papers', 'profile-images', 'documents'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type'
      });
    }

    // Get file info
    const fileInfo = await getFileInfo(fileId, type);
    if (!fileInfo) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check permissions
    if (type === 'profile-images' && 
        fileInfo.metadata.userId !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this file'
      });
    }

    // Download file
    const fileBuffer = await downloadFromGridFS(fileId, type);

    // Set appropriate headers
    res.set({
      'Content-Type': fileInfo.metadata.mimetype || 'application/octet-stream',
      'Content-Length': fileBuffer.length,
      'Content-Disposition': `attachment; filename="${fileInfo.filename}"`
    });

    res.send(fileBuffer);

  } catch (error) {
    console.error('File download error:', error);
    res.status(500).json({
      success: false,
      message: 'File download failed',
      error: error.message
    });
  }
});

// Handle preflight requests for avatar endpoint
router.options('/avatar/:fileId', (req, res) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'https://oriiindia0.vercel.app',
    'https://oriiindia.vercel.app',
    'https://oriiindia-git-main-yashab-cyber.vercel.app',
    'https://oriiindia-yashab-cyber.vercel.app'
  ];
  
  // Set CORS headers for preflight
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
  
  // Don't set credentials for anonymous cross-origin requests
  // res.header('Access-Control-Allow-Credentials', 'true');
  
  res.sendStatus(200);
});

// Serve profile image (public access for display)
router.get('/avatar/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;

    // Set CORS headers for image display - more permissive for anonymous access
    const origin = req.headers.origin;
    const allowedOrigins = [
      'http://localhost:3000',
      'https://oriiindia0.vercel.app',
      'https://oriiindia.vercel.app',
      'https://oriiindia-git-main-yashab-cyber.vercel.app',
      'https://oriiindia-yashab-cyber.vercel.app'
    ];
    
    // Always set CORS headers for image serving
    if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    } else if (!origin) {
      // For direct requests without origin (like curl or direct browser access)
      res.header('Access-Control-Allow-Origin', '*');
    }
    
    // Essential headers for crossorigin="anonymous" image loading
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
    
    // Don't set credentials for anonymous cross-origin image requests
    // res.header('Access-Control-Allow-Credentials', 'true');

    // Get file info
    const fileInfo = await getFileInfo(fileId, 'profile-images');
    if (!fileInfo) {
      return res.status(404).json({
        success: false,
        message: 'Avatar not found'
      });
    }

    // Download file
    const fileBuffer = await downloadFromGridFS(fileId, 'profile-images');

    // Set appropriate headers for image display
    res.set({
      'Content-Type': fileInfo.metadata.mimetype || 'image/jpeg',
      'Content-Length': fileBuffer.length,
      'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
    });

    res.send(fileBuffer);

  } catch (error) {
    console.error('Avatar serving error:', error);
    res.status(404).json({
      success: false,
      message: 'Avatar not found'
    });
  }
});

// Delete file
router.delete('/delete/:type/:fileId', authenticate, async (req, res) => {
  try {
    const { type, fileId } = req.params;
    
    // Validate upload type
    const validTypes = ['research-papers', 'profile-images', 'documents'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type'
      });
    }

    // Get file info to check permissions
    const fileInfo = await getFileInfo(fileId, type);
    if (!fileInfo) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check permissions
    if (fileInfo.metadata.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this file'
      });
    }

    // Delete file from GridFS
    await deleteFromGridFS(fileId, type);

    // If it's a research paper file, remove from paper's files array
    if (type === 'research-papers' && fileInfo.metadata.paperId) {
      await ResearchPaper.findByIdAndUpdate(
        fileInfo.metadata.paperId,
        { $pull: { files: { fileId: fileId } } }
      );
    }

    // If it's a profile image, remove from user's profile
    if (type === 'profile-images') {
      await User.findByIdAndUpdate(
        fileInfo.metadata.userId,
        { $unset: { 'profile.avatar': '' } }
      );
    }

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'File deletion failed',
      error: error.message
    });
  }
});

// Get user's files
router.get('/my-files/:type', authenticate, async (req, res) => {
  try {
    const { type } = req.params;
    const userId = req.user.id;

    // If type is specified, validate it
    const validTypes = ['research-papers', 'profile-images', 'documents'];
    if (type && !validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type'
      });
    }

    const files = [];
    const typesToQuery = type ? [type] : validTypes;

    for (const fileType of typesToQuery) {
      const bucket = getBucket(fileType);
      if (bucket) {
        const userFiles = await bucket.find({ 
          'metadata.userId': userId 
        }).toArray();
        
        files.push(...userFiles.map(file => ({
          ...file,
          uploadType: fileType
        })));
      }
    }

    res.status(200).json({
      success: true,
      data: {
        files: files,
        count: files.length
      }
    });

  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve files',
      error: error.message
    });
  }
});

// Get all user's files (alternative route)
router.get('/my-files', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const validTypes = ['research-papers', 'profile-images', 'documents'];
    const files = [];

    for (const fileType of validTypes) {
      const bucket = getBucket(fileType);
      if (bucket) {
        const userFiles = await bucket.find({ 
          'metadata.userId': userId 
        }).toArray();
        
        files.push(...userFiles.map(file => ({
          ...file,
          uploadType: fileType
        })));
      }
    }

    res.status(200).json({
      success: true,
      data: {
        files: files,
        count: files.length
      }
    });

  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve files',
      error: error.message
    });
  }
});

export default router;