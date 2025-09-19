'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getApiUrl } from '@/lib/config';
import { 
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  MapPinIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { User } from '@/types';

export default function PersonProfile() {
  const params = useParams();
  const router = useRouter();
  const [person, setPerson] = useState<User | null>(null);
  const [publications, setPublications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshTimestamp, setRefreshTimestamp] = useState(Date.now());

  useEffect(() => {
    if (params.id) {
      fetchPerson(params.id as string);
      fetchUserPublications(params.id as string);
    }
  }, [params.id]);

  // Refresh data when page becomes visible (in case profile was updated)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && params.id) {
        fetchPerson(params.id as string, true);
      }
    };

    const handleFocus = () => {
      if (params.id) {
        fetchPerson(params.id as string, true);
      }
    };

    // Listen for avatar change events
    const handleAvatarChange = (e: CustomEvent) => {
      console.log('Avatar change detected on profile page:', e.detail);
      setRefreshTimestamp(Date.now());
      // If the avatar change is for the current user, refresh their data
      if (e.detail.userId === params.id) {
        fetchPerson(params.id as string, true);
      }
    };

    // Listen for localStorage changes for cross-tab synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'avatarChangeTimestamp') {
        setRefreshTimestamp(Date.now());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('avatarChanged', handleAvatarChange as EventListener);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('avatarChanged', handleAvatarChange as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [params.id]);

  const fetchPerson = async (id: string, forceRefresh = false) => {
    try {
      setLoading(true);
      
      // Update refresh timestamp for cache-busting avatar URLs when force refreshing
      if (forceRefresh) {
        setRefreshTimestamp(Date.now());
      }
      
      const url = forceRefresh 
        ? getApiUrl(`/users/${id}?t=${Date.now()}`) 
        : getApiUrl(`/users/${id}`);
      
      console.log('🔍 Fetching person profile from URL:', url);
      console.log('🔍 User ID:', id);
      
      const response = await fetch(url, {
        cache: forceRefresh ? 'no-cache' : 'default'
      });
      
      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Raw API response:', data);
        console.log('🔍 Response structure check:');
        console.log('  - data exists:', !!data);
        console.log('  - data.data exists:', !!data.data);
        console.log('  - data.data.user exists:', !!data.data?.user);
        console.log('🔍 User object to set:', data.data?.user);
        
        if (data.success && data.data && data.data.user) {
          console.log('✅ Setting person state with:', data.data.user);
          setPerson(data.data.user); // CRITICAL FIX: use data.data.user instead of data.data
          console.log('✅ Person state set successfully');
        } else {
          console.error('❌ Invalid data structure received:', data);
          setError('Invalid data received from server');
        }
      } else {
        console.error('❌ API call failed:', response.status, response.statusText);
        setError('Person not found');
      }
    } catch (error) {
      console.error('❌ Error fetching person profile:', error);
      setError('Failed to load person profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPublications = async (userId: string) => {
    try {
      const response = await fetch(getApiUrl('/research'));
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.papers) {
          // Filter papers where this user is an author
          const userPublications = data.data.papers.filter((paper: any) => 
            paper.authors.some((author: any) => author.user === userId)
          );
          setPublications(userPublications);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user publications:', error);
    }
  };

  const getRoleColor = (role: string | undefined) => {
    switch (role) {
      case 'faculty':
        return 'bg-blue-900/20 text-blue-400 border border-blue-800';
      case 'researcher':
        return 'bg-green-900/20 text-green-400 border border-green-800';
      case 'admin':
        return 'bg-purple-900/20 text-purple-400 border border-purple-800';
      case 'student':
        return 'bg-yellow-900/20 text-yellow-400 border border-yellow-800';
      default:
        return 'bg-slate-700 text-slate-300 border border-slate-600';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) {
      return 'Date not available';
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date format';
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPublicationDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const getAvatarUrl = (avatarId: string) => {
    return getApiUrl(`/files/avatar/${avatarId}?t=${refreshTimestamp}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-700 rounded w-3/4"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-700 rounded"></div>
              <div className="h-4 bg-slate-700 rounded"></div>
              <div className="h-4 bg-slate-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <UserIcon className="mx-auto h-16 w-16 text-slate-500" />
            <h2 className="mt-4 text-2xl font-bold text-slate-100">Profile Not Found</h2>
            <p className="mt-2 text-slate-400">{error}</p>
            <Link 
              href="/people"
              className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to People
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      
      {/* Debug info - remove this after fixing */}
      {process.env.NODE_ENV === 'development' && person && (
        <div className="bg-yellow-900/20 border border-yellow-600 p-4 m-4 rounded">
          <details>
            <summary className="text-yellow-400 cursor-pointer">Debug: Person Data</summary>
            <pre className="text-xs mt-2 text-yellow-100">
              {JSON.stringify(person, null, 2)}
            </pre>
          </details>
        </div>
      )}
      
      {/* Always visible debug info to help troubleshoot */}
      <div className="bg-red-900/20 border border-red-600 p-4 m-4 rounded">
        <h3 className="text-red-400 font-bold">🔧 Debug Info (Remove after fixing) - Updated:</h3>
        <div className="text-red-100 text-sm mt-2">
          <p><strong>Person object exists:</strong> {person ? 'YES' : 'NO'}</p>
          {person && (
            <>
              <p><strong>Role:</strong> {person.role || 'NULL/UNDEFINED'}</p>
              <p><strong>Created At:</strong> {person.createdAt || 'NULL/UNDEFINED'}</p>
              <p><strong>First Name:</strong> {person.firstName || 'NULL/UNDEFINED'}</p>
              <p><strong>Last Name:</strong> {person.lastName || 'NULL/UNDEFINED'}</p>
              <p><strong>Profile exists:</strong> {person.profile ? 'YES' : 'NO'}</p>
              {person.profile && (
                <p><strong>Profile title:</strong> {person.profile.title || 'NULL/UNDEFINED'}</p>
              )}
            </>
          )}
          <p className="mt-2 text-yellow-300"><strong>Deployment Check:</strong> {new Date().toISOString()}</p>
        </div>
      </div>
      
      {/* Header Section */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <Link 
              href="/people"
              className="inline-flex items-center text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to People
            </Link>
          </div>
          
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="w-32 h-32 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0 border border-slate-600 overflow-hidden">
              {person.profile?.avatar ? (
                <img
                  key={`${person.profile.avatar}-${refreshTimestamp}`} // Force re-render on avatar or timestamp change
                  src={getAvatarUrl(person.profile.avatar)}
                  alt={`${person.firstName} ${person.lastName}`}
                  className="w-full h-full object-cover rounded-full"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    // Fallback to icon if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <UserIcon className={`h-16 w-16 text-slate-400 ${person.profile?.avatar ? 'hidden' : ''}`} />
            </div>
            
            {/* Basic Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-slate-100 mb-2">
                {person.firstName} {person.lastName}
              </h1>
              
              {person.profile?.title && (
                <p className="text-xl text-blue-400 font-medium mb-3">
                  {person.profile.title}
                </p>
              )}
              
              <div className="flex items-center space-x-4 mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(person.role || 'visitor')}`}>
                  {person.role ? person.role.charAt(0).toUpperCase() + person.role.slice(1) : 'Visitor'}
                </span>
                {person.profile?.department && (
                  <div className="flex items-center text-slate-400">
                    <AcademicCapIcon className="h-4 w-4 mr-2" />
                    <span>{person.profile.department}</span>
                  </div>
                )}
              </div>
              
              {person.profile?.institution && (
                <div className="flex items-center text-slate-400 mb-4">
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  <span>{person.profile.institution}</span>
                </div>
              )}
              
              {/* Contact Info */}
              <div className="flex items-center space-x-4">
                <a 
                  href={`mailto:${person.email}`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                  Contact
                </a>
                
                {person.profile?.website && (
                  <a 
                    href={person.profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-slate-600 text-slate-300 rounded-md hover:bg-slate-700 transition-colors"
                  >
                    <GlobeAltIcon className="h-4 w-4 mr-2" />
                    Website
                  </a>
                )}
                
                {person.profile?.linkedIn && (
                  <a 
                    href={person.profile.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-slate-600 text-slate-300 rounded-md hover:bg-slate-700 transition-colors"
                  >
                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                    </svg>
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Biography */}
            {person.profile?.bio && (
              <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-6">
                <h2 className="text-xl font-semibold text-slate-100 mb-4">About</h2>
                <p className="text-slate-300 leading-relaxed">
                  {person.profile.bio}
                </p>
              </div>
            )}
            
            {/* Research Interests */}
            {person.profile?.researchInterests && person.profile.researchInterests.length > 0 && (
              <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-6">
                <h2 className="text-xl font-semibold text-slate-100 mb-4">Research Interests</h2>
                <div className="flex flex-wrap gap-2">
                  {person.profile.researchInterests.map((interest, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-900/20 text-blue-400 hover:bg-blue-900/30 cursor-pointer border border-blue-800 transition-colors"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Recent Publications */}
            <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-slate-100 mb-4">Recent Publications</h2>
              {publications.length > 0 ? (
                <div className="space-y-4">
                  {publications.slice(0, 3).map((paper, index) => (
                    <div key={paper._id} className="border-l-4 border-blue-500 pl-4">
                      <Link 
                        href={`/research/${paper._id}`}
                        className="block hover:bg-slate-700/30 rounded p-2 -ml-2 transition-colors"
                      >
                        <h3 className="font-medium text-slate-200 hover:text-blue-400 transition-colors">{paper.title}</h3>
                        <p className="text-sm text-slate-400 mt-1">
                          {paper.publishedIn?.journal && (
                            <>Published in {paper.publishedIn.journal}</>
                          )}
                          {paper.publishedIn?.publishedDate && (
                            <> • {formatPublicationDate(paper.publishedIn.publishedDate)}</>
                          )}
                          {!paper.publishedIn?.journal && paper.status && (
                            <>Status: {paper.status.charAt(0).toUpperCase() + paper.status.slice(1).replace('-', ' ')}</>
                          )}
                        </p>
                        {paper.abstract && (
                          <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                            {paper.abstract.length > 150 
                              ? `${paper.abstract.substring(0, 150)}...` 
                              : paper.abstract
                            }
                          </p>
                        )}
                        {paper.authors && paper.authors.length > 1 && (
                          <p className="text-xs text-slate-500 mt-2">
                            Co-authors: {paper.authors
                              .filter((author: any) => author.user !== person?._id)
                              .map((author: any) => author.name)
                              .slice(0, 2)
                              .join(', ')}
                            {paper.authors.length > 3 && ' and others'}
                          </p>
                        )}
                      </Link>
                    </div>
                  ))}
                  {publications.length > 3 && (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-slate-400">
                        And {publications.length - 3} more publication{publications.length - 3 !== 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-slate-400 mb-2">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-slate-400 text-sm">No publications found</p>
                  <p className="text-slate-500 text-xs mt-1">Publications will appear here once submitted and approved</p>
                </div>
              )}
              <div className="mt-6">
                <Link 
                  href="/research"
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  View all publications →
                </Link>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            {/* Contact Information */}
            <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-100 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-slate-400 mr-3" />
                  <div>
                    <p className="font-medium text-slate-200">Email</p>
                    <a 
                      href={`mailto:${person.email}`}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {person.email}
                    </a>
                  </div>
                </div>
                {person.profile?.website && (
                  <div className="flex items-center">
                    <GlobeAltIcon className="h-5 w-5 text-slate-400 mr-3" />
                    <div>
                      <p className="font-medium text-slate-200">Website</p>
                      <a 
                        href={person.profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        {person.profile.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>            {/* Professional Information */}
            <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-100 mb-4">Professional Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-slate-300">Role:</span>
                  <p className="text-slate-100 capitalize">{person.role || 'Visitor'}</p>
                </div>
                
                {person.profile?.department && (
                  <div>
                    <span className="font-medium text-slate-300">Department:</span>
                    <p className="text-slate-100">{person.profile.department}</p>
                  </div>
                )}
                
                {person.profile?.institution && (
                  <div>
                    <span className="font-medium text-slate-300">Institution:</span>
                    <p className="text-slate-100">{person.profile.institution}</p>
                  </div>
                )}
                
                <div>
                  <span className="font-medium text-slate-300">Member since:</span>
                  <p className="text-slate-100">{formatDate(person.createdAt)}</p>
                </div>
                
                {person.lastLogin && (
                  <div>
                    <span className="font-medium text-slate-300">Last active:</span>
                    <p className="text-slate-100">{formatDate(person.lastLogin)}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Collaboration */}
            <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-100 mb-4">Collaborate</h3>
              <p className="text-sm text-slate-400 mb-4">
                Interested in collaborating? Reach out to discuss potential research opportunities.
              </p>
              <a 
                href={`mailto:${person.email}?subject=Research Collaboration Inquiry`}
                className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Send Collaboration Request
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}