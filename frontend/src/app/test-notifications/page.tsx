'use client';

import React, { useState, useEffect } from 'react';
import { getApiUrl } from '@/lib/config';

export default function NotificationTest() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Load user data
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const addTestResult = (test: string, passed: boolean, details: string) => {
    setTestResults(prev => [...prev, {
      test,
      passed,
      details,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testNotificationEndpoints = async () => {
    setIsRunningTests(true);
    setTestResults([]);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        addTestResult('Authentication Check', false, 'No auth token found');
        setIsRunningTests(false);
        return;
      }

      addTestResult('Authentication Check', true, 'Auth token found');

      // Test 1: Health endpoint
      try {
        const healthResponse = await fetch(getApiUrl('/health'));
        if (healthResponse.ok) {
          addTestResult('Backend Health', true, 'Backend is running and accessible');
        } else {
          addTestResult('Backend Health', false, `Health check failed: ${healthResponse.status}`);
        }
      } catch (error) {
        addTestResult('Backend Health', false, 'Backend not accessible');
      }

      // Test 2: Notifications unread count
      try {
        const unreadResponse = await fetch(getApiUrl('/notifications/unread-count'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (unreadResponse.ok) {
          const data = await unreadResponse.json();
          addTestResult('Unread Count API', true, `Returned: ${data.data?.unreadCount || 0} unread notifications`);
        } else if (unreadResponse.status === 401) {
          addTestResult('Unread Count API', false, 'Authentication failed - token may be invalid');
        } else if (unreadResponse.status === 404) {
          addTestResult('Unread Count API', false, 'Endpoint not found');
        } else {
          addTestResult('Unread Count API', false, `HTTP ${unreadResponse.status}: ${unreadResponse.statusText}`);
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('Failed to fetch')) {
          addTestResult('Unread Count API', false, 'Network error - backend may be sleeping');
        } else {
          addTestResult('Unread Count API', false, `Error: ${error}`);
        }
      }

      // Test 3: Notifications list
      try {
        const listResponse = await fetch(getApiUrl('/notifications?page=1&limit=5'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (listResponse.ok) {
          const data = await listResponse.json();
          const count = data.data?.notifications?.length || 0;
          addTestResult('Notifications List API', true, `Returned ${count} notifications`);
        } else if (listResponse.status === 401) {
          addTestResult('Notifications List API', false, 'Authentication failed');
        } else if (listResponse.status === 404) {
          addTestResult('Notifications List API', false, 'Endpoint not found');
        } else {
          addTestResult('Notifications List API', false, `HTTP ${listResponse.status}: ${listResponse.statusText}`);
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('Failed to fetch')) {
          addTestResult('Notifications List API', false, 'Network error - backend may be sleeping');
        } else {
          addTestResult('Notifications List API', false, `Error: ${error}`);
        }
      }

      // Test 4: CORS headers
      try {
        const corsResponse = await fetch(getApiUrl('/notifications/unread-count'), {
          method: 'OPTIONS',
        });
        
        if (corsResponse.ok || corsResponse.status === 204) {
          addTestResult('CORS Support', true, 'CORS preflight request successful');
        } else {
          addTestResult('CORS Support', false, `CORS preflight failed: ${corsResponse.status}`);
        }
      } catch (error) {
        addTestResult('CORS Support', false, `CORS test failed: ${error}`);
      }

    } catch (error) {
      addTestResult('Test Execution', false, `Test suite failed: ${error}`);
    }

    setIsRunningTests(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Notification System Test</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Info & Controls */}
          <div className="space-y-6">
            <div className="bg-slate-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
              {user ? (
                <div className="space-y-2 text-sm">
                  <div className="text-green-400">✓ Logged in as: {user.firstName} {user.lastName}</div>
                  <div className="text-slate-300">Email: {user.email}</div>
                  <div className="text-slate-300">Role: {user.role}</div>
                  <div className="text-slate-300">Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}</div>
                </div>
              ) : (
                <div className="text-red-400">✗ Not logged in or no user data</div>
              )}
            </div>

            <div className="bg-slate-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Test Controls</h3>
              <div className="space-y-3">
                <button
                  onClick={testNotificationEndpoints}
                  disabled={isRunningTests}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {isRunningTests ? 'Running Tests...' : 'Test Notification APIs'}
                </button>
                <button
                  onClick={clearResults}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Clear Results
                </button>
              </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Manual Tests</h3>
              <div className="space-y-2 text-sm text-slate-300">
                <div>1. Check browser console for notification errors</div>
                <div>2. Look for the notification bell in the header</div>
                <div>3. Click the notification bell to open the center</div>
                <div>4. Verify no 404 or connection errors in console</div>
                <div>5. Check that errors are handled gracefully</div>
              </div>
            </div>
          </div>

          {/* Test Results */}
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-slate-400 italic">No tests run yet...</p>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className={`p-3 rounded border-l-4 ${
                    result.passed 
                      ? 'bg-green-900/20 border-green-500 text-green-100' 
                      : 'bg-red-900/20 border-red-500 text-red-100'
                  }`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold">{result.test}</span>
                      <span className="text-xs opacity-75">{result.timestamp}</span>
                    </div>
                    <div className="text-sm opacity-90">{result.details}</div>
                    <div className={`text-xs font-bold ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                      {result.passed ? '✓ PASS' : '✗ FAIL'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-slate-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Common Issues & Solutions</h3>
          <div className="space-y-4 text-sm text-slate-300">
            <div>
              <strong className="text-yellow-400">404 errors:</strong> Usually means the backend notifications routes aren't registered properly
            </div>
            <div>
              <strong className="text-yellow-400">ERR_CONNECTION_CLOSED:</strong> Backend is sleeping (common on free hosting). First request wakes it up.
            </div>
            <div>
              <strong className="text-yellow-400">401 Unauthorized:</strong> Auth token is missing, invalid, or expired
            </div>
            <div>
              <strong className="text-yellow-400">Network errors:</strong> Usually temporary - backend may be starting up
            </div>
          </div>
        </div>

        <div className="mt-6 bg-green-900/20 border border-green-600 p-4 rounded-lg">
          <h4 className="text-green-400 font-semibold mb-2">✅ Fixed Issues:</h4>
          <ul className="text-green-100 text-sm space-y-1">
            <li>• Added proper error handling to prevent console spam</li>
            <li>• NotificationBell only renders when authenticated</li>
            <li>• Graceful handling of 401, 404, and network errors</li>
            <li>• Better user feedback for error states</li>
            <li>• Prevented unnecessary API calls when not logged in</li>
          </ul>
        </div>
      </div>
    </div>
  );
}