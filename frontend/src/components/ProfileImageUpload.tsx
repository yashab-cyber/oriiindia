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

  const handleUploadSuccess = (response: any) => {
    setIsUploading(false);
    setShowUploader(false);
    console.log('Profile image upload response:', response);
    
    // The backend returns the file data in response.data.file
    const fileId = response.data?.file?.fileId || response.file?.fileId;
    if (fileId) {
      onAvatarUpdate?.(fileId);
    } else {
      console.error('No fileId found in response:', response);
    }
  };

  const handleUploadError = (error: string) => {
    setIsUploading(false);
    console.error('Avatar upload error:', error);
    alert(`Failed to upload profile image: ${error}`);
  };

  const handleRemoveAvatar = async () => {
    if (!confirm('Are you sure you want to remove your profile photo?')) {
      return;
    }

    try {
      setIsUploading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(getApiUrl('/auth/me'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          'profile.avatar': '' // Clear the avatar field
        })
      });

      if (response.ok) {
        onAvatarUpdate?.(''); // Clear the avatar in parent component
        alert('Profile photo removed successfully');
      } else {
        throw new Error('Failed to remove profile photo');
      }
    } catch (error) {
      console.error('Error removing avatar:', error);
      alert('Failed to remove profile photo');
    } finally {
      setIsUploading(false);
    }
  };

  const getAvatarUrl = (avatarId: string) => {
    return getApiUrl(`/files/avatar/${avatarId}`);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Avatar Display */}
      <div className="flex items-center space-x-6">
        <div className="relative group">
          {currentAvatar ? (
            <img
              key={currentAvatar} // Force re-render when avatar changes
              src={getAvatarUrl(currentAvatar)}
              alt="Current profile picture"
              className="w-24 h-24 rounded-full object-cover border-2 border-slate-600"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-slate-700 border-4 border-white shadow-lg flex items-center justify-center">
              <UserCircleIcon className="h-16 w-16 text-gray-400" />
            </div>
          )}
          
          {/* Small upload button in corner */}
          <button
            onClick={() => setShowUploader(true)}
            className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center border-2 border-white shadow-lg transition-colors"
            title={currentAvatar ? 'Change photo' : 'Upload photo'}
          >
            <CameraIcon className="h-4 w-4 text-white" />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-medium text-slate-100">Profile Photo</h3>
          <p className="text-sm text-slate-400">
            {currentAvatar 
              ? 'Click the camera icon to change your photo'
              : 'Upload a professional photo for your profile'
            }
          </p>
          <button
            onClick={() => setShowUploader(true)}
            disabled={isUploading}
            className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors mr-2"
          >
            {isUploading ? 'Uploading...' : (currentAvatar ? 'Change Photo' : 'Upload Photo')}
          </button>
          
          {currentAvatar && (
            <button
              onClick={handleRemoveAvatar}
              disabled={isUploading}
              className="mt-2 px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              Remove Photo
            </button>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-slate-100">
                Upload Profile Photo
              </h3>
              <button
                onClick={() => setShowUploader(false)}
                className="text-slate-400 hover:text-slate-200"
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
                className="px-4 py-2 text-slate-300 bg-slate-700 border border-slate-600 rounded-md hover:bg-slate-600 transition-colors"
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