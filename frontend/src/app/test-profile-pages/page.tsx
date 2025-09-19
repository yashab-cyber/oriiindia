'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { getApiUrl } from '@/lib/config';

export default function ProfilePageTest() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  const addTestResult = (test: string, passed: boolean, details: string) => {
    setTestResults(prev => [...prev, {
      test,
      passed,
      details,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runProfilePageTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);

    try {
      // Test 1: Fetch users list
      addTestResult('Fetching Users List', true, 'Testing /api/users endpoint...');
      const usersResponse = await fetch(getApiUrl('/users'));
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        if (usersData.success && usersData.data.users.length > 0) {
          setUsers(usersData.data.users.slice(0, 5)); // Take first 5 users
          addTestResult('Users List API', true, `Found ${usersData.data.users.length} users`);
          
          // Test 2: Test individual profile endpoints
          for (const user of usersData.data.users.slice(0, 3)) { // Test first 3 users
            try {
              const profileResponse = await fetch(getApiUrl(`/users/${user._id}`));
              
              if (profileResponse.ok) {
                const profileData = await profileResponse.json();
                
                if (profileData.success && profileData.data.user) {
                  addTestResult(
                    `Profile API (${user.firstName})`, 
                    true, 
                    `Successfully fetched profile for ${user.firstName} ${user.lastName}`
                  );
                  
                  // Test 3: Validate data structure
                  const userData = profileData.data.user;
                  const hasRequiredFields = userData._id && userData.firstName && userData.lastName && userData.email;
                  
                  addTestResult(
                    `Data Structure (${user.firstName})`,
                    hasRequiredFields,
                    hasRequiredFields 
                      ? 'All required fields present' 
                      : 'Missing required fields'
                  );
                  
                  // Test 4: Check profile fields
                  const hasProfile = userData.profile !== undefined;
                  addTestResult(
                    `Profile Fields (${user.firstName})`,
                    hasProfile,
                    hasProfile 
                      ? `Profile data: ${Object.keys(userData.profile || {}).join(', ')}`
                      : 'No profile data found'
                  );
                  
                } else {
                  addTestResult(
                    `Profile API (${user.firstName})`, 
                    false, 
                    'Response missing data.user field'
                  );
                }
              } else {
                addTestResult(
                  `Profile API (${user.firstName})`, 
                  false, 
                  `HTTP ${profileResponse.status}: ${profileResponse.statusText}`
                );
              }
            } catch (error) {
              addTestResult(
                `Profile API (${user.firstName})`, 
                false, 
                `Error: ${error instanceof Error ? error.message : String(error)}`
              );
            }
          }
        } else {
          addTestResult('Users List API', false, 'No users found in response');
        }
      } else {
        addTestResult('Users List API', false, `HTTP ${usersResponse.status}: ${usersResponse.statusText}`);
      }

    } catch (error) {
      addTestResult('Test Execution', false, `Test failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    setIsRunningTests(false);
  };

  const clearResults = () => {
    setTestResults([]);
    setUsers([]);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Individual Profile Page Test Suite</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Controls */}
          <div className="space-y-6">
            <div className="bg-slate-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
              <div className="space-y-3">
                <button
                  onClick={runProfilePageTests}
                  disabled={isRunningTests}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {isRunningTests ? 'Running Tests...' : 'Test Profile Page APIs'}
                </button>
                <button
                  onClick={clearResults}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Clear Results
                </button>
              </div>
            </div>

            {/* Sample Users */}
            {users.length > 0 && (
              <div className="bg-slate-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Sample Profile Links</h3>
                <div className="space-y-2">
                  {users.map(user => (
                    <div key={user._id} className="flex justify-between items-center">
                      <span className="text-sm text-slate-300">
                        {user.firstName} {user.lastName}
                      </span>
                      <Link 
                        href={`/people/${user._id}`}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                        target="_blank"
                      >
                        View Profile →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
          <h3 className="text-lg font-semibold mb-4">Issue Details</h3>
          <div className="space-y-4 text-sm text-slate-300">
            <div>
              <h4 className="font-semibold text-slate-200 mb-2">Problem:</h4>
              <p>Individual profile pages were showing placeholder data (Visitor role, Invalid Date) instead of real user information.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-200 mb-2">Root Cause:</h4>
              <p>Frontend was accessing <code className="text-blue-400">data.data</code> but backend returns user data in <code className="text-blue-400">data.data.user</code></p>
              <pre className="bg-slate-700 p-2 rounded mt-2 text-xs">
{`// Backend Response Structure:
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "firstName": "...",
      "lastName": "...",
      "profile": {...}
    }
  }
}`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-200 mb-2">Fix Applied:</h4>
              <p>Changed frontend code from <code className="text-red-400">setPerson(data.data)</code> to <code className="text-green-400">setPerson(data.data.user)</code></p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-blue-900/20 border border-blue-600 p-4 rounded-lg">
          <h4 className="text-blue-400 font-semibold mb-2">📋 Manual Testing Steps:</h4>
          <ol className="text-blue-100 text-sm space-y-1 list-decimal list-inside">
            <li>Run the automated tests above to verify API responses</li>
            <li>Click on any "View Profile" link from the generated list</li>
            <li>Verify the profile page shows real user data, not placeholder text</li>
            <li>Check that role shows actual role (researcher, faculty, etc.) not "Visitor"</li>
            <li>Verify dates show properly formatted dates, not "Invalid Date"</li>
            <li>Confirm avatar, bio, and other profile fields display correctly</li>
          </ol>
        </div>
      </div>
    </div>
  );
}