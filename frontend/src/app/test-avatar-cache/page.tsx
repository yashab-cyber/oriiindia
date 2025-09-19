'use client';

import React, { useState } from 'react';
import { getApiUrl } from '@/lib/config';

export default function TestAvatarCache() {
  const [timestamp, setTimestamp] = useState(Date.now());
  
  // Sample avatar ID - you can replace this with a real one from your database
  const sampleAvatarId = "67654f3c75f40e63f46e51d4"; // Replace with actual avatar ID

  const getAvatarUrl = (avatarId: string, withTimestamp = false) => {
    if (withTimestamp) {
      return getApiUrl(`/files/avatar/${avatarId}?t=${timestamp}`);
    }
    return getApiUrl(`/files/avatar/${avatarId}`);
  };

  const refreshTimestamp = () => {
    setTimestamp(Date.now());
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Avatar Cache Busting Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Without Cache Busting</h2>
            <div className="w-32 h-32 mx-auto mb-4">
              <img
                src={getAvatarUrl(sampleAvatarId, false)}
                alt="Avatar without cache busting"
                className="w-full h-full object-cover rounded-full border-2 border-slate-600"
                crossOrigin="anonymous"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjMzc0MTUxIiByeD0iNjQiLz4KPHN2ZyB4PSIzMiIgeT0iMzIiIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjOWNhM2FmIj4KICA8cGF0aCBkPSJNMTIgMTJjMi4yMSAwIDQtMS43OSA0LTRzLTEuNzktNC00LTQtNCAxLjc5LTQgNCAxLjc5IDQgNCA0em0wIDJjLTIuNjcgMC04IDEuMzQtOCA0djJoMTZ2LTJjMC0yLjY2LTUuMzMtNC04LTR6Ii8+Cjwvc3ZnPgo8L3N2Zz4K';
                }}
              />
            </div>
            <p className="text-sm text-slate-400 text-center">
              URL: {getAvatarUrl(sampleAvatarId, false)}
            </p>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">With Cache Busting</h2>
            <div className="w-32 h-32 mx-auto mb-4">
              <img
                key={timestamp} // Force re-render
                src={getAvatarUrl(sampleAvatarId, true)}
                alt="Avatar with cache busting"
                className="w-full h-full object-cover rounded-full border-2 border-slate-600"
                crossOrigin="anonymous"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjMzc0MTUxIiByeD0iNjQiLz4KPHN2ZyB4PSIzMiIgeT0iMzIiIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjOWNhM2FmIj4KICA8cGF0aCBkPSJNMTIgMTJjMi4yMSAwIDQtMS43OSA0LTRzLTEuNzktNC00LTQtNCAxLjc5LTQgNCAxLjc5IDQgNCA0em0wIDJjLTIuNjcgMC04IDEuMzQtOCA0djJoMTZ2LTJjMC0yLjY2LTUuMzMtNC04LTR6Ii8+Cjwvc3ZnPgo8L3N2Zz4K';
                }}
              />
            </div>
            <p className="text-sm text-slate-400 text-center break-all">
              URL: {getAvatarUrl(sampleAvatarId, true)}
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <button
            onClick={refreshTimestamp}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Refresh Timestamp (Current: {timestamp})
          </button>
        </div>
        
        <div className="mt-8 bg-slate-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">How to Test:</h3>
          <ol className="list-decimal list-inside space-y-2 text-slate-300">
            <li>Replace the <code className="text-blue-400">sampleAvatarId</code> with a real avatar ID from your database</li>
            <li>Upload a new profile picture in the profile page</li>
            <li>Come back to this page and click "Refresh Timestamp"</li>
            <li>The right image should show the new avatar, left image might show cached version</li>
            <li>This demonstrates how cache-busting prevents stale avatar display</li>
          </ol>
        </div>
        
        <div className="mt-6 bg-slate-800 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Network Debugging:</h4>
          <p className="text-sm text-slate-300">
            Open browser DevTools → Network tab → Refresh this page. 
            You should see the cache-busted URL being requested with a timestamp parameter.
          </p>
        </div>
      </div>
    </div>
  );
}