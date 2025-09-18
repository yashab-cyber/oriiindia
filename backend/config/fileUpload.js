import multer from 'multer';
import { GridFSBucket } from 'mongodb';
import mongoose from 'mongoose';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';

// File type validation
const createFileFilter = (uploadType) => {
  return (req, file, cb) => {
    const allowedMimes = {
      'research-papers': [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ],
      'profile-images': [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp'
      ],
      'documents': [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ]
    };

    const allowedTypes = allowedMimes[uploadType] || [];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed for ${uploadType}`), false);
    }
  };
};

// File size limits (in bytes)
const fileLimits = {
  'research-papers': 25 * 1024 * 1024, // 25MB for research papers
  'profile-images': 5 * 1024 * 1024,   // 5MB for profile images
  'documents': 10 * 1024 * 1024        // 10MB for general documents
};

// GridFS Storage Configuration
let gfsBucket;
let gfsProfileBucket;
let gfsDocumentBucket;

const initGridFS = () => {
  const conn = mongoose.connection;
  
  if (conn.readyState === 1) {
    // Main bucket for research papers
    gfsBucket = new GridFSBucket(conn.db, {
      bucketName: 'research_papers'
    });
    
    // Bucket for profile images
    gfsProfileBucket = new GridFSBucket(conn.db, {
      bucketName: 'profile_images'
    });
    
    // Bucket for general documents
    gfsDocumentBucket = new GridFSBucket(conn.db, {
      bucketName: 'documents'
    });
    
    console.log('✅ GridFS buckets initialized');
  }
};

// Initialize GridFS when mongoose connects
mongoose.connection.on('connected', initGridFS);

// Memory storage for initial processing
const storage = multer.memoryStorage();

// Create multer instances with specific configurations
const createUpload = (uploadType, maxSize = 25 * 1024 * 1024) => {
  return multer({
    storage: storage,
    fileFilter: createFileFilter(uploadType),
    limits: {
      fileSize: maxSize
    }
  });
};

// Specific upload instances
const uploadResearchPaper = createUpload('research-papers', 25 * 1024 * 1024);
const uploadProfileImage = createUpload('profile-images', 5 * 1024 * 1024);
const uploadDocument = createUpload('documents', 10 * 1024 * 1024);

// Legacy upload instance (for backwards compatibility)
const upload = createUpload('documents');

// Helper function to get appropriate bucket
const getBucket = (uploadType) => {
  switch (uploadType) {
    case 'profile-images':
      return gfsProfileBucket;
    case 'research-papers':
      return gfsBucket;
    case 'documents':
      return gfsDocumentBucket;
    default:
      return gfsDocumentBucket;
  }
};

// Helper function to generate unique filename
const generateFileName = (originalName, userId, uploadType) => {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const random = crypto.randomBytes(6).toString('hex');
  return `${uploadType}_${userId}_${timestamp}_${random}${ext}`;
};

// Process and upload file to GridFS
const uploadToGridFS = async (file, uploadType, userId, metadata = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const bucket = getBucket(uploadType);
      if (!bucket) {
        return reject(new Error('GridFS bucket not initialized'));
      }

      const filename = generateFileName(file.originalname, userId, uploadType);
      let fileBuffer = file.buffer;

      // Process images if it's a profile image
      if (uploadType === 'profile-images') {
        fileBuffer = await sharp(file.buffer)
          .resize(300, 300, { 
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ quality: 85 })
          .toBuffer();
      }

      const uploadStream = bucket.openUploadStream(filename, {
        metadata: {
          ...metadata,
          originalName: file.originalname,
          uploadType: uploadType,
          userId: userId,
          mimetype: file.mimetype,
          uploadDate: new Date()
        }
      });

      uploadStream.on('error', (error) => {
        reject(error);
      });

      uploadStream.on('finish', () => {
        resolve({
          fileId: uploadStream.id,
          filename: filename,
          originalName: file.originalname,
          size: fileBuffer.length,
          uploadDate: new Date(),
          metadata: uploadStream.options.metadata
        });
      });

      uploadStream.end(fileBuffer);

    } catch (error) {
      reject(error);
    }
  });
};

// Download file from GridFS
const downloadFromGridFS = async (fileId, uploadType) => {
  return new Promise((resolve, reject) => {
    try {
      const bucket = getBucket(uploadType);
      if (!bucket) {
        return reject(new Error('GridFS bucket not initialized'));
      }

      const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
      const chunks = [];

      downloadStream.on('data', (chunk) => {
        chunks.push(chunk);
      });

      downloadStream.on('error', (error) => {
        reject(error);
      });

      downloadStream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

    } catch (error) {
      reject(error);
    }
  });
};

// Delete file from GridFS
const deleteFromGridFS = async (fileId, uploadType) => {
  try {
    const bucket = getBucket(uploadType);
    if (!bucket) {
      throw new Error('GridFS bucket not initialized');
    }

    await bucket.delete(new mongoose.Types.ObjectId(fileId));
    return true;
  } catch (error) {
    throw error;
  }
};

// Get file info from GridFS
const getFileInfo = async (fileId, uploadType) => {
  try {
    const bucket = getBucket(uploadType);
    if (!bucket) {
      throw new Error('GridFS bucket not initialized');
    }

    const files = await bucket.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray();
    return files.length > 0 ? files[0] : null;
  } catch (error) {
    throw error;
  }
};

export {
  upload,
  uploadResearchPaper,
  uploadProfileImage,
  uploadDocument,
  uploadToGridFS,
  downloadFromGridFS,
  deleteFromGridFS,
  getFileInfo,
  initGridFS,
  fileLimits
};