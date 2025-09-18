'use client';

import React, { useState, useRef, useCallback } from 'react';
import { 
  CloudArrowUpIcon, 
  DocumentIcon, 
  PhotoIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface FileUploadProps {
  uploadType: 'research-papers' | 'profile-images' | 'documents';
  accept?: string;
  maxSize?: number;
  onUploadSuccess?: (file: any) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  multiple?: boolean;
  paperId?: string; // For research papers
}

interface UploadedFile {
  file: File;
  preview?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  progress?: number;
  id?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  uploadType,
  accept,
  maxSize = 25 * 1024 * 1024, // 25MB default
  onUploadSuccess,
  onUploadError,
  className = '',
  multiple = false,
  paperId
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File type configurations
  const getFileConfig = () => {
    switch (uploadType) {
      case 'research-papers':
        return {
          accept: accept || '.pdf,.doc,.docx',
          maxSize: maxSize || 25 * 1024 * 1024,
          description: 'Upload research paper (PDF, DOC, DOCX)',
          icon: DocumentIcon
        };
      case 'profile-images':
        return {
          accept: accept || '.jpg,.jpeg,.png,.webp',
          maxSize: maxSize || 5 * 1024 * 1024,
          description: 'Upload profile image (JPG, PNG, WEBP)',
          icon: PhotoIcon
        };
      case 'documents':
        return {
          accept: accept || '.pdf,.doc,.docx,.txt',
          maxSize: maxSize || 10 * 1024 * 1024,
          description: 'Upload document (PDF, DOC, DOCX, TXT)',
          icon: DocumentIcon
        };
      default:
        return {
          accept: accept || '*',
          maxSize: maxSize,
          description: 'Upload file',
          icon: DocumentIcon
        };
    }
  };

  const config = getFileConfig();

  // Validate file
  const validateFile = (file: File): string | null => {
    if (file.size > config.maxSize) {
      return `File size exceeds ${(config.maxSize / (1024 * 1024)).toFixed(1)}MB limit`;
    }

    const allowedTypes = config.accept.split(',').map(type => {
      if (type.startsWith('.')) {
        return type.slice(1).toLowerCase();
      }
      return type.toLowerCase();
    });

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const fileMimeType = file.type.toLowerCase();

    const isValidExtension = allowedTypes.some(type => 
      fileExtension === type || fileMimeType.includes(type.replace('.', ''))
    );

    if (!isValidExtension) {
      return `File type not allowed. Accepted types: ${config.accept}`;
    }

    return null;
  };

  // Handle file selection
  const handleFiles = useCallback((selectedFiles: FileList) => {
    const newFiles: UploadedFile[] = [];

    Array.from(selectedFiles).forEach(file => {
      const validationError = validateFile(file);
      
      if (validationError) {
        onUploadError?.(validationError);
        return;
      }

      const uploadedFile: UploadedFile = {
        file,
        status: 'pending'
      };

      // Create preview for images
      if (uploadType === 'profile-images' && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          uploadedFile.preview = e.target?.result as string;
          setFiles(prev => [...prev.filter(f => f.file !== file), uploadedFile]);
        };
        reader.readAsDataURL(file);
      }

      newFiles.push(uploadedFile);
    });

    if (!multiple) {
      setFiles(newFiles);
    } else {
      setFiles(prev => [...prev, ...newFiles]);
    }
  }, [uploadType, multiple, onUploadError]);

  // Upload file to backend
  const uploadFile = async (uploadedFile: UploadedFile) => {
    const formData = new FormData();
    
    if (uploadType === 'research-papers') {
      if (!paperId) {
        throw new Error('Paper ID is required for research paper uploads');
      }
      formData.append('file', uploadedFile.file);
    } else if (uploadType === 'profile-images') {
      formData.append('avatar', uploadedFile.file);
    } else {
      formData.append('document', uploadedFile.file);
    }

    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    let url = `http://localhost:5000/api/files/upload/${uploadType}`;
    if (uploadType === 'research-papers' && paperId) {
      url += `/${paperId}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Upload failed');
    }

    return await response.json();
  };

  // Handle upload
  const handleUpload = async (uploadedFile: UploadedFile) => {
    setFiles(prev => prev.map(f => 
      f.file === uploadedFile.file 
        ? { ...f, status: 'uploading', progress: 0 }
        : f
    ));

    try {
      const result = await uploadFile(uploadedFile);
      
      setFiles(prev => prev.map(f => 
        f.file === uploadedFile.file 
          ? { ...f, status: 'success', progress: 100, id: result.data.file.fileId }
          : f
      ));

      onUploadSuccess?.(result.data);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      setFiles(prev => prev.map(f => 
        f.file === uploadedFile.file 
          ? { ...f, status: 'error', error: errorMessage }
          : f
      ));

      onUploadError?.(errorMessage);
    }
  };

  // Remove file
  const removeFile = (fileToRemove: UploadedFile) => {
    setFiles(prev => prev.filter(f => f.file !== fileToRemove.file));
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // File input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const IconComponent = config.icon;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={config.accept}
          multiple={multiple}
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center space-y-3">
          <IconComponent className="h-12 w-12 text-gray-400" />
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragOver ? 'Drop files here' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-sm text-gray-500">{config.description}</p>
            <p className="text-xs text-gray-400 mt-1">
              Max size: {(config.maxSize / (1024 * 1024)).toFixed(1)}MB
            </p>
          </div>
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <CloudArrowUpIcon className="h-5 w-5 inline mr-2" />
            Choose Files
          </button>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Selected Files</h4>
          {files.map((uploadedFile, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* File preview or icon */}
                  {uploadedFile.preview ? (
                    <img 
                      src={uploadedFile.preview} 
                      alt="Preview" 
                      className="h-12 w-12 object-cover rounded"
                    />
                  ) : (
                    <IconComponent className="h-8 w-8 text-gray-400" />
                  )}
                  
                  <div>
                    <p className="font-medium text-gray-900">{uploadedFile.file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(uploadedFile.file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Status indicator */}
                  {uploadedFile.status === 'pending' && (
                    <button
                      onClick={() => handleUpload(uploadedFile)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Upload
                    </button>
                  )}
                  
                  {uploadedFile.status === 'uploading' && (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      <span className="text-sm text-gray-600">Uploading...</span>
                    </div>
                  )}
                  
                  {uploadedFile.status === 'success' && (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  )}
                  
                  {uploadedFile.status === 'error' && (
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                  )}

                  <button
                    onClick={() => removeFile(uploadedFile)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Error message */}
              {uploadedFile.status === 'error' && uploadedFile.error && (
                <p className="mt-2 text-sm text-red-600">{uploadedFile.error}</p>
              )}

              {/* Progress bar */}
              {uploadedFile.status === 'uploading' && (
                <div className="mt-2">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${uploadedFile.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;