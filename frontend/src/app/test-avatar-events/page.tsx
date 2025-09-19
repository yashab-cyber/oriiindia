'use client';

import React, { useState, useEffect } from 'react';

export default function TestAvatarEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [avatarTimestamp, setAvatarTimestamp] = useState(Date.now());

  useEffect(() => {
    // Listen for avatar change events
    const handleAvatarChange = (e: CustomEvent) => {
      const newEvent = {
        type: 'avatarChanged',
        timestamp: new Date().toLocaleTimeString(),
        detail: e.detail
      };
      setEvents(prev => [newEvent, ...prev.slice(0, 9)]); // Keep last 10 events
      setAvatarTimestamp(Date.now());
    };

    // Listen for localStorage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'avatarChangeTimestamp' || e.key === 'user') {
        const newEvent = {
          type: 'localStorage',
          timestamp: new Date().toLocaleTimeString(),
          key: e.key,
          newValue: e.newValue?.substring(0, 100) + (e.newValue && e.newValue.length > 100 ? '...' : ''),
          oldValue: e.oldValue?.substring(0, 100) + (e.oldValue && e.oldValue.length > 100 ? '...' : '')
        };
        setEvents(prev => [newEvent, ...prev.slice(0, 9)]);
        if (e.key === 'avatarChangeTimestamp') {
          setAvatarTimestamp(Date.now());
        }
      }
    };

    window.addEventListener('avatarChanged', handleAvatarChange as EventListener);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('avatarChanged', handleAvatarChange as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const simulateAvatarChange = () => {
    const event = new CustomEvent('avatarChanged', {
      detail: {
        userId: 'test-user-123',
        avatarId: 'avatar-' + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now()
      }
    });
    window.dispatchEvent(event);
  };

  const simulateLocalStorageChange = () => {
    localStorage.setItem('avatarChangeTimestamp', Date.now().toString());
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Avatar Event Synchronization Test</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Controls */}
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
            <div className="space-y-4">
              <button
                onClick={simulateAvatarChange}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Simulate Avatar Change Event
              </button>
              <button
                onClick={simulateLocalStorageChange}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Simulate localStorage Change
              </button>
              <div className="bg-slate-700 p-4 rounded">
                <h3 className="font-semibold mb-2">Current Avatar Timestamp:</h3>
                <p className="text-blue-300 font-mono">{avatarTimestamp}</p>
              </div>
            </div>
          </div>

          {/* Event Log */}
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Event Log (Last 10)</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {events.length === 0 ? (
                <p className="text-slate-400 italic">No events captured yet...</p>
              ) : (
                events.map((event, index) => (
                  <div key={index} className="bg-slate-700 p-3 rounded text-sm">
                    <div className="flex justify-between items-start mb-1">
                      <span className={`font-semibold ${
                        event.type === 'avatarChanged' ? 'text-blue-400' : 'text-green-400'
                      }`}>
                        {event.type}
                      </span>
                      <span className="text-slate-400 text-xs">{event.timestamp}</span>
                    </div>
                    {event.detail && (
                      <pre className="text-xs text-slate-300 overflow-x-auto">
                        {JSON.stringify(event.detail, null, 2)}
                      </pre>
                    )}
                    {event.key && (
                      <div className="text-xs text-slate-300">
                        <div><strong>Key:</strong> {event.key}</div>
                        {event.newValue && <div><strong>New:</strong> {event.newValue}</div>}
                        {event.oldValue && <div><strong>Old:</strong> {event.oldValue}</div>}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-slate-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">How to Test Avatar Re-upload Issue:</h3>
          <ol className="list-decimal list-inside space-y-3 text-slate-300">
            <li>
              <strong>Open the People page</strong> - Navigate to <code className="text-blue-400">/people</code> in another tab
            </li>
            <li>
              <strong>Open the Profile page</strong> - Navigate to <code className="text-blue-400">/profile</code> in another tab
            </li>
            <li>
              <strong>Upload an avatar</strong> - Upload a profile picture in the profile page
            </li>
            <li>
              <strong>Check People page</strong> - Verify the avatar appears on the people page
            </li>
            <li>
              <strong>Change avatar</strong> - Upload a different picture in the profile page
            </li>
            <li>
              <strong>Re-upload original</strong> - Upload the same picture from step 3 again
            </li>
            <li>
              <strong>Check synchronization</strong> - The people page should show the re-uploaded avatar immediately
            </li>
            <li>
              <strong>Monitor events</strong> - Watch this page to see avatar change events being fired
            </li>
          </ol>
        </div>

        <div className="mt-6 bg-slate-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Expected Behavior:</h3>
          <ul className="list-disc list-inside space-y-2 text-slate-300">
            <li>Each avatar upload/change should trigger an <code className="text-blue-400">avatarChanged</code> event</li>
            <li>All pages listening for avatar changes should update their timestamp immediately</li>
            <li>Avatar images should never show cached versions when re-uploading the same file</li>
            <li>Changes should sync across all open tabs/windows</li>
            <li>Both custom events and localStorage changes should be captured</li>
          </ul>
        </div>

        <div className="mt-6 bg-yellow-900/20 border border-yellow-600 p-4 rounded-lg">
          <h4 className="text-yellow-400 font-semibold mb-2">🔧 Development Notes:</h4>
          <p className="text-yellow-100 text-sm">
            This test page helps verify that the avatar cache-busting mechanism works correctly. 
            The key improvement is that avatar URLs now include a timestamp that updates immediately 
            when any avatar change occurs, not just on page refresh.
          </p>
        </div>
      </div>
    </div>
  );
}