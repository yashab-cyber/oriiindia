'use client';

import { useState, useEffect } from 'react';
import { getApiUrl } from '@/lib/config';

export default function TestAvatar() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState('');
  
  // Test with the avatar ID we know exists
  const avatarId = '68cce8a4a34f6fc3365643e8';
  const avatarUrl = getApiUrl(`/files/avatar/${avatarId}`);

  useEffect(() => {
    console.log('Testing avatar URL:', avatarUrl);
  }, [avatarUrl]);

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-white text-2xl mb-8">Avatar Test Page</h1>
        
        <div className="space-y-4">
          <div className="text-white">
            <p><strong>Avatar ID:</strong> {avatarId}</p>
            <p><strong>Generated URL:</strong> {avatarUrl}</p>
            <p><strong>Image Status:</strong> {imageLoaded ? 'Loaded' : imageError ? `Error: ${imageError}` : 'Loading...'}</p>
          </div>
          
          <div className="w-32 h-32 bg-slate-700 rounded border border-slate-600 overflow-hidden">
            <img
              src={avatarUrl}
              alt="Test Avatar"
              className="w-full h-full object-cover"
              onLoad={() => {
                console.log('Avatar loaded successfully!');
                setImageLoaded(true);
              }}
              onError={(e) => {
                const error = `Failed to load image`;
                console.error('Avatar load error:', error);
                setImageError(error);
              }}
            />
          </div>
          
          <div className="text-white">
            <p>If you see this image above, avatars are working correctly.</p>
            <p>If not, check the browser console for error messages.</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-white font-semibold">Direct Link Test:</p>
            <a 
              href={avatarUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Click here to open avatar directly
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}