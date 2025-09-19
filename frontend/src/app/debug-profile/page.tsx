'use client';

import { useState } from 'react';
import { getApiUrl } from '@/lib/config';

export default function ProfileDebugPage() {
  const [userId, setUserId] = useState('');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [frontendData, setFrontendData] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const testProfileAPI = async () => {
    if (!userId.trim()) {
      setError('Please enter a user ID');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      console.log('Testing API for user ID:', userId);
      
      // Test the API call exactly like the profile page does
      const response = await fetch(getApiUrl(`/users/${userId}`), {
        cache: 'no-cache'
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Raw API response:', data);
        setApiResponse(data);
        
        // Test the exact data path used in the profile page
        const extractedUser = data.data.user;
        console.log('Extracted user data:', extractedUser);
        setFrontendData(extractedUser);
        
      } else {
        const errorText = await response.text();
        setError(`API Error: ${response.status} - ${errorText}`);
      }
    } catch (err) {
      console.error('Test error:', err);
      setError(`Network Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchSampleUserIds = async () => {
    try {
      const response = await fetch(getApiUrl('/users'));
      if (response.ok) {
        const data = await response.json();
        console.log('Sample users:', data.data.users?.slice(0, 3).map((u: any) => ({id: u._id, name: `${u.firstName} ${u.lastName}`})));
      }
    } catch (err) {
      console.error('Failed to fetch sample users:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Profile API Debug Tool</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Controls */}
          <div className="space-y-6">
            <div className="bg-slate-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Test Profile API</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">User ID to test:</label>
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="e.g., 68ccfa265bf6c852bb2ce1b1"
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Tip: Click "Get Sample IDs" to see available user IDs
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={testProfileAPI}
                    disabled={loading || !userId.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white px-4 py-2 rounded transition-colors"
                  >
                    {loading ? 'Testing...' : 'Test API'}
                  </button>
                  
                  <button
                    onClick={fetchSampleUserIds}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
                  >
                    Get Sample IDs
                  </button>
                </div>
                
                {error && (
                  <div className="bg-red-900/20 border border-red-600 p-3 rounded">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Test Buttons */}
            <div className="bg-slate-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Quick Tests</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setUserId('68ccfa265bf6c852bb2ce1b1');
                    setTimeout(() => testProfileAPI(), 100);
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors text-sm"
                >
                  Test Deep Sarkar Profile
                </button>
                
                <button
                  onClick={() => {
                    window.open('/people/68ccfa265bf6c852bb2ce1b1', '_blank');
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors text-sm"
                >
                  Open Deep's Profile Page
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {/* Raw API Response */}
            {apiResponse && (
              <div className="bg-slate-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Raw API Response</h3>
                <pre className="bg-slate-900 p-4 rounded overflow-auto text-xs">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              </div>
            )}

            {/* Extracted Frontend Data */}
            {frontendData && (
              <div className="bg-slate-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Frontend Data (data.data.user)</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-semibold text-slate-300">Name:</span>
                      <p className="text-slate-100">{frontendData.firstName} {frontendData.lastName}</p>
                    </div>
                    
                    <div>
                      <span className="font-semibold text-slate-300">Role:</span>
                      <p className="text-slate-100">{frontendData.role || 'No role'}</p>
                    </div>
                    
                    <div>
                      <span className="font-semibold text-slate-300">Email:</span>
                      <p className="text-slate-100">{frontendData.email}</p>
                    </div>
                    
                    <div>
                      <span className="font-semibold text-slate-300">Created:</span>
                      <p className="text-slate-100">
                        {frontendData.createdAt ? new Date(frontendData.createdAt).toLocaleDateString() : 'Invalid Date'}
                      </p>
                    </div>
                  </div>
                  
                  {frontendData.profile && (
                    <div className="mt-4 p-4 bg-slate-700 rounded">
                      <h4 className="font-semibold text-slate-200 mb-2">Profile Data:</h4>
                      <div className="grid grid-cols-1 gap-2 text-xs">
                        <div><strong>Title:</strong> {frontendData.profile.title || 'None'}</div>
                        <div><strong>Department:</strong> {frontendData.profile.department || 'None'}</div>
                        <div><strong>Institution:</strong> {frontendData.profile.institution || 'None'}</div>
                        <div><strong>Bio:</strong> {frontendData.profile.bio ? 'Present' : 'None'}</div>
                        <div><strong>Avatar:</strong> {frontendData.profile.avatar ? 'Present' : 'None'}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-blue-900/20 border border-blue-600 p-4 rounded-lg">
          <h4 className="text-blue-400 font-semibold mb-2">🔍 Debugging Checklist:</h4>
          <ul className="text-blue-100 text-sm space-y-1 list-disc list-inside">
            <li>Check if API returns the correct data structure</li>
            <li>Verify that data.data.user contains the expected user information</li>
            <li>Test the profile page directly to see what's displayed</li>
            <li>Check browser console for any JavaScript errors</li>
            <li>Verify that the profile page is using the latest code</li>
            <li>Check if there are any caching issues</li>
          </ul>
        </div>
      </div>
    </div>
  );
}