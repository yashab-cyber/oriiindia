import React, { useState, useEffect, useCallback } from 'react';
import { 
  CloudArrowUpIcon,
  DocumentTextIcon,
  PhotoIcon,
  PaperClipIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const allowedFileTypes = {
  manuscript: {
    types: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    extensions: ['.pdf', '.doc', '.docx'],
    maxSize: 50 * 1024 * 1024 // 50MB
  },
  supplementary: {
    types: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
    extensions: ['.pdf', '.doc', '.docx', '.txt'],
    maxSize: 25 * 1024 * 1024 // 25MB
  },
  figures: {
    types: ['image/jpeg', 'image/png', 'image/tiff', 'application/pdf'],
    extensions: ['.jpg', '.jpeg', '.png', '.tiff', '.tif', '.pdf'],
    maxSize: 10 * 1024 * 1024 // 10MB
  }
};

const FileUploadZone = ({ accept, multiple, onFileSelect, children, className = "" }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    onFileSelect(files);
  }, [onFileSelect]);

  const handleFileInput = useCallback((e) => {
    const files = Array.from(e.target.files);
    onFileSelect(files);
    e.target.value = ''; // Reset input
  }, [onFileSelect]);

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        isDragOver 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 hover:border-gray-400'
      } ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInput}
        className="sr-only"
        id={`file-upload-${Math.random()}`}
      />
      <label htmlFor={`file-upload-${Math.random()}`} className="cursor-pointer">
        {children}
      </label>
    </div>
  );
};

const FileItem = ({ file, onRemove, onEdit, type }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = () => {
    if (file.mimeType?.startsWith('image/')) {
      return <PhotoIcon className="w-8 h-8 text-green-500" />;
    }
    return <DocumentTextIcon className="w-8 h-8 text-blue-500" />;
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center space-x-3">
        {getFileIcon()}
        <div>
          <h4 className="font-medium text-gray-900">{file.originalName || file.name}</h4>
          <p className="text-sm text-gray-500">
            {formatFileSize(file.size)} • Uploaded {file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : 'now'}
          </p>
          {file.description && (
            <p className="text-sm text-gray-600 mt-1">{file.description}</p>
          )}
          {file.caption && (
            <p className="text-sm text-gray-600 mt-1">Caption: {file.caption}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {file.path && (
          <button
            onClick={() => window.open(`/api/papers/files/${file.filename}`, '_blank')}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="View file"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
        )}
        {onEdit && (
          <button
            onClick={() => onEdit(file)}
            className="p-2 text-blue-400 hover:text-blue-600 transition-colors"
            title="Edit details"
          >
            <PaperClipIcon className="w-4 h-4" />
          </button>
        )}
        {onRemove && (
          <button
            onClick={() => onRemove(file)}
            className="p-2 text-red-400 hover:text-red-600 transition-colors"
            title="Remove file"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

const ManuscriptStep = ({ paper, updatePaper, onComplete, errors, saving }) => {
  const [uploading, setUploading] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [figureDetails, setFigureDetails] = useState({});
  const [supplementaryDetails, setSupplementaryDetails] = useState({});

  const validateFile = (file, type) => {
    const config = allowedFileTypes[type];
    
    if (!config.types.includes(file.type)) {
      return `Invalid file type. Allowed: ${config.extensions.join(', ')}`;
    }
    
    if (file.size > config.maxSize) {
      return `File too large. Maximum size: ${Math.round(config.maxSize / (1024 * 1024))}MB`;
    }
    
    return null;
  };

  const uploadFile = async (files, endpoint, type) => {
    const formData = new FormData();
    
    if (type === 'manuscript') {
      if (files.length !== 1) {
        toast.error('Please select exactly one manuscript file');
        return;
      }
      formData.append('manuscript', files[0]);
    } else if (type === 'supplementary') {
      files.forEach((file, index) => {
        formData.append('supplementary', file);
        if (supplementaryDetails[file.name]) {
          formData.append('descriptions', supplementaryDetails[file.name].description || '');
        }
      });
    } else if (type === 'figures') {
      files.forEach((file, index) => {
        formData.append('figures', file);
        if (figureDetails[file.name]) {
          formData.append('captions', figureDetails[file.name].caption || '');
          formData.append('orders', figureDetails[file.name].order || index + 1);
        }
      });
    }

    try {
      setUploading(prev => ({ ...prev, [type]: true }));

      const response = await fetch(`/api/papers/${paper._id}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        updatePaper(data.data.paper);
        toast.success(`${type === 'manuscript' ? 'Manuscript' : type === 'supplementary' ? 'Supplementary materials' : 'Figures'} uploaded successfully`);
        
        // Clear details after successful upload
        if (type === 'figures') {
          setFigureDetails({});
        } else if (type === 'supplementary') {
          setSupplementaryDetails({});
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleManuscriptUpload = (files) => {
    const file = files[0];
    const error = validateFile(file, 'manuscript');
    
    if (error) {
      toast.error(error);
      return;
    }

    uploadFile(files, 'upload-manuscript', 'manuscript');
  };

  const handleSupplementaryUpload = (files) => {
    // Validate all files
    for (const file of files) {
      const error = validateFile(file, 'supplementary');
      if (error) {
        toast.error(`${file.name}: ${error}`);
        return;
      }
    }

    uploadFile(files, 'upload-supplementary', 'supplementary');
  };

  const handleFiguresUpload = (files) => {
    // Validate all files
    for (const file of files) {
      const error = validateFile(file, 'figures');
      if (error) {
        toast.error(`${file.name}: ${error}`);
        return;
      }
    }

    uploadFile(files, 'upload-figures', 'figures');
  };

  const handleComplete = async (e) => {
    e.preventDefault();

    if (!paper.files?.manuscript) {
      toast.error('Manuscript file is required');
      return;
    }

    try {
      await onComplete({});
    } catch (error) {
      console.error('Error completing manuscript step:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Manuscript Upload */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <DocumentTextIcon className="w-5 h-5 mr-2 text-blue-500" />
          Manuscript File *
        </h3>
        
        {paper.files?.manuscript ? (
          <div className="space-y-4">
            <FileItem 
              file={paper.files.manuscript} 
              type="manuscript"
              onRemove={() => {
                // Handle manuscript removal if needed
                toast.info('To replace the manuscript, upload a new file');
              }}
            />
            <div className="flex items-center text-sm text-green-600">
              <CheckCircleIcon className="w-4 h-4 mr-2" />
              Manuscript uploaded successfully
            </div>
          </div>
        ) : (
          <FileUploadZone
            accept={allowedFileTypes.manuscript.extensions.join(',')}
            multiple={false}
            onFileSelect={handleManuscriptUpload}
            className={uploading.manuscript ? 'opacity-50 pointer-events-none' : ''}
          >
            <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Manuscript</h4>
            <p className="text-gray-600 mb-4">
              Drag and drop your manuscript file here, or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Supported formats: PDF, DOC, DOCX • Max size: 50MB
            </p>
            {uploading.manuscript && (
              <div className="flex items-center justify-center mt-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-blue-600">Uploading...</span>
              </div>
            )}
          </FileUploadZone>
        )}
      </div>

      {/* Supplementary Materials */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <PaperClipIcon className="w-5 h-5 mr-2 text-green-500" />
          Supplementary Materials (Optional)
        </h3>
        
        {paper.files?.supplementaryMaterials && paper.files.supplementaryMaterials.length > 0 && (
          <div className="space-y-3 mb-6">
            {paper.files.supplementaryMaterials.map((file, index) => (
              <FileItem 
                key={index} 
                file={file} 
                type="supplementary"
              />
            ))}
          </div>
        )}

        <FileUploadZone
          accept={allowedFileTypes.supplementary.extensions.join(',')}
          multiple={true}
          onFileSelect={handleSupplementaryUpload}
          className={uploading.supplementary ? 'opacity-50 pointer-events-none' : ''}
        >
          <PaperClipIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Supplementary Materials</h4>
          <p className="text-gray-600 mb-4">
            Add supporting documents, datasets, or additional materials
          </p>
          <p className="text-sm text-gray-500">
            Supported formats: PDF, DOC, DOCX, TXT • Max size: 25MB each • Multiple files allowed
          </p>
          {uploading.supplementary && (
            <div className="flex items-center justify-center mt-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
              <span className="ml-2 text-green-600">Uploading...</span>
            </div>
          )}
        </FileUploadZone>
      </div>

      {/* Figures */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <PhotoIcon className="w-5 h-5 mr-2 text-purple-500" />
          Figures and Images (Optional)
        </h3>
        
        {paper.files?.figures && paper.files.figures.length > 0 && (
          <div className="space-y-3 mb-6">
            {paper.files.figures
              .sort((a, b) => a.order - b.order)
              .map((file, index) => (
                <FileItem 
                  key={index} 
                  file={file} 
                  type="figures"
                />
              ))}
          </div>
        )}

        <FileUploadZone
          accept={allowedFileTypes.figures.extensions.join(',')}
          multiple={true}
          onFileSelect={handleFiguresUpload}
          className={uploading.figures ? 'opacity-50 pointer-events-none' : ''}
        >
          <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Figures</h4>
          <p className="text-gray-600 mb-4">
            Add charts, graphs, images, or other visual materials
          </p>
          <p className="text-sm text-gray-500">
            Supported formats: JPG, PNG, TIFF, PDF • Max size: 10MB each • Multiple files allowed
          </p>
          {uploading.figures && (
            <div className="flex items-center justify-center mt-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
              <span className="ml-2 text-purple-600">Uploading...</span>
            </div>
          )}
        </FileUploadZone>
      </div>

      {/* File Requirements */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start">
          <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-amber-800 mb-2">File Requirements</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Manuscript file is required and must be in PDF, DOC, or DOCX format</li>
              <li>• All files should be clearly named and well-organized</li>
              <li>• Figures should be high resolution and properly labeled</li>
              <li>• Supplementary materials should support your main research findings</li>
              <li>• Large datasets should be uploaded to a repository and referenced in the paper</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Upload Progress Summary */}
      {(paper.files?.manuscript || paper.files?.supplementaryMaterials?.length > 0 || paper.files?.figures?.length > 0) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-800 mb-2">Upload Summary</h4>
          <div className="space-y-1 text-sm text-green-700">
            {paper.files?.manuscript && (
              <div className="flex items-center">
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                Manuscript: {paper.files.manuscript.originalName}
              </div>
            )}
            {paper.files?.supplementaryMaterials?.length > 0 && (
              <div className="flex items-center">
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                Supplementary Materials: {paper.files.supplementaryMaterials.length} files
              </div>
            )}
            {paper.files?.figures?.length > 0 && (
              <div className="flex items-center">
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                Figures: {paper.files.figures.length} files
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          onClick={handleComplete}
          disabled={saving || !paper.files?.manuscript}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors flex items-center"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            'Save & Continue'
          )}
        </button>
      </div>
    </div>
  );
};

// Static validation function for the wizard
ManuscriptStep.validate = (paper) => {
  return !!(paper?.files?.manuscript);
};

export default ManuscriptStep;