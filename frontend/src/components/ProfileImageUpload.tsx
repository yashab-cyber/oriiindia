'use client';

import React, { useState, useRef } from 'react';
import { getApiUrl } from '@/lib/config';
import { 
  UserCircleIcon, 
  CameraIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import FileUpload from './FileUpload';

interface ProfileImageUploadProps {
  currentAvatar?: string;
  onAvatarUpdate?: (avatarId: string) => void;
  className?: string;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  currentAvatar,
  onAvatarUpdate,
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showUploader, setShowUploader] = useState(false);

  const handleUploadSuccess = (fileData: any) => {
    setIsUploading(false);
    setShowUploader(false);
    onAvatarUpdate?.(fileData.file.fileId);
  };

  const handleUploadError = (error: string) => {
    setIsUploading(false);
    console.error('Avatar upload error:', error);
  };

  const getAvatarUrl = (avatarId: string) => {
    return getApiUrl(`/files/avatar/${avatarId}`);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Avatar Display */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          {currentAvatar ? (
            <img
              src={getAvatarUrl(currentAvatar)}
              alt="Profile"
              className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <UserCircleIcon className="h-20 w-20 text-gray-400" />
          )}
          
          {/* Upload overlay button */}
          <button
            onClick={() => setShowUploader(true)}
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity"
          >
            <CameraIcon className="h-8 w-8 text-white" />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900">Profile Photo</h3>
          <p className="text-sm text-gray-500">
            Upload a professional photo for your profile
          </p>
          <button
            onClick={() => setShowUploader(true)}
            className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            {currentAvatar ? 'Change Photo' : 'Upload Photo'}
          </button>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Upload Profile Photo
              </h3>
              <button
                onClick={() => setShowUploader(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <FileUpload
              uploadType="profile-images"
              accept=".jpg,.jpeg,.png,.webp"
              maxSize={5 * 1024 * 1024} // 5MB
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
              multiple={false}
            />

            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowUploader(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileImageUpload;