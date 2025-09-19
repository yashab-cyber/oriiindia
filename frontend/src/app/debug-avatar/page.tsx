'use client';

import { useState, useEffect } from 'react';
import { getApiUrl } from '@/lib/config';

export default function DebugAvatar() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [localStorageUser, setLocalStorageUser] = useState<any>(null);

  useEffect(() => {
    // Get user from localStorage
    const localUser = localStorage.getItem('user');
    if (localUser) {
      setLocalStorageUser(JSON.parse(localUser));
    }

    // Fetch current user from API
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(getApiUrl('/auth/me'), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserInfo(data.data.user);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  const clearAvatar = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(getApiUrl('/auth/me'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          'profile.avatar': ''
        })
      });

      if (response.ok) {
        alert('Avatar cleared successfully! Please refresh the page.');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error clearing avatar:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-white text-2xl mb-8">Avatar Debug Tool</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-white text-xl mb-4">LocalStorage User Data</h2>
            <pre className="text-sm text-gray-300 overflow-auto">
              {JSON.stringify(localStorageUser, null, 2)}
            </pre>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-white text-xl mb-4">API User Data</h2>
            <pre className="text-sm text-gray-300 overflow-auto">
              {JSON.stringify(userInfo, null, 2)}
            </pre>
          </div>
        </div>

        <div className="mt-8 bg-slate-800 p-6 rounded-lg">
          <h2 className="text-white text-xl mb-4">Avatar Information</h2>
          <div className="space-y-4">
            <div className="text-white">
              <strong>LocalStorage Avatar:</strong> {localStorageUser?.profile?.avatar || 'None'}
            </div>
            <div className="text-white">
              <strong>API Avatar:</strong> {userInfo?.profile?.avatar || 'None'}
            </div>
            {localStorageUser?.profile?.avatar && (
              <div className="text-white">
                <strong>Avatar URL:</strong> 
                <a 
                  href={getApiUrl(`/files/avatar/${localStorageUser.profile.avatar}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 ml-2"
                >
                  {getApiUrl(`/files/avatar/${localStorageUser.profile.avatar}`)}
                </a>
              </div>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={clearAvatar}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Clear Avatar (Fix Wrong Image Issue)
            </button>
          </div>
        </div>

        <div className="mt-8 bg-yellow-800 p-6 rounded-lg">
          <h3 className="text-yellow-100 text-lg mb-2">Instructions to Fix Avatar Issue:</h3>
          <ol className="text-yellow-200 space-y-2 list-decimal list-inside">
            <li>Check if the "LocalStorage Avatar" and "API Avatar" IDs match</li>
            <li>If they show your friend's avatar, click "Clear Avatar" button</li>
            <li>Go back to your profile page and upload your own photo</li>
            <li>The new photo should appear correctly on the people page</li>
          </ol>
        </div>
      </div>
    </div>
  );
}