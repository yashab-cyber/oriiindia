'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getApiUrl } from '@/lib/config';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  AcademicCapIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  MapPinIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { User } from '@/types';

export default function People() {
  const [people, setPeople] = useState<User[]>([]);
  const [filteredPeople, setFilteredPeople] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [refreshTimestamp, setRefreshTimestamp] = useState(Date.now());

  // Helper function to get avatar URL with cache busting
  const getAvatarUrl = (avatarId: string) => {
    return getApiUrl(`/files/avatar/${avatarId}?t=${refreshTimestamp}`);
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  useEffect(() => {
    filterPeople();
  }, [people, searchTerm, roleFilter, departmentFilter]);

  // Refresh data when the page becomes visible (user returns from profile page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible, refresh the data with cache-busting
        fetchPeople(true);
      }
    };

    const handleFocus = () => {
      // Window regained focus, refresh the data with cache-busting
      fetchPeople(true);
    };

    // Listen for localStorage changes (when profile is updated on another tab/page)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' && e.newValue !== e.oldValue) {
        // User data changed, refresh people list
        fetchPeople(true);
      }
      // Also listen for avatar change timestamp
      if (e.key === 'avatarChangeTimestamp') {
        setRefreshTimestamp(Date.now());
      }
    };

    // Listen for avatar change events from profile page
    const handleAvatarChange = (e: CustomEvent) => {
      console.log('Avatar change detected:', e.detail);
      setRefreshTimestamp(Date.now());
      // Optionally refresh the people list to get latest user data
      fetchPeople(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('avatarChanged', handleAvatarChange as EventListener);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('avatarChanged', handleAvatarChange as EventListener);
    };
  }, []);

  const fetchPeople = async (forceRefresh = false) => {
    try {
      setLoading(true);
      
      // Update refresh timestamp for cache-busting avatar URLs when force refreshing
      if (forceRefresh) {
        setRefreshTimestamp(Date.now());
      }
      
      // Add cache-busting parameter when force refreshing
      const url = forceRefresh 
        ? getApiUrl(`/users?t=${Date.now()}`) 
        : getApiUrl('/users');
      
      const response = await fetch(url, {
        // Disable cache when force refreshing
        cache: forceRefresh ? 'no-cache' : 'default'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.users) {
          setPeople(data.data.users);
        } else {
          setPeople([]);
        }
      } else {
        console.error('Failed to fetch people');
        setPeople([]);
      }
    } catch (error) {
      console.error('Error fetching people:', error);
      setPeople([]);
    } finally {
      setLoading(false);
    }
  };



  const filterPeople = () => {
    let filtered = people;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(person =>
        `${person.firstName} ${person.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.profile.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.profile.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.profile.researchInterests?.some(interest => 
          interest.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(person => (person.role || 'visitor') === roleFilter);
    }

    // Department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(person => person.profile?.department === departmentFilter);
    }

    setFilteredPeople(filtered);
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

  const getDepartments = () => {
    const departments = new Set(people.map(person => person.profile?.department).filter(Boolean));
    return Array.from(departments);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="bg-slate-800 rounded-lg shadow-sm p-6 space-y-4">
                  <div className="h-6 bg-slate-700 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-700 rounded"></div>
                  <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <h1 className="text-4xl md:text-5xl font-bold">
                Our People
              </h1>
              <button
                onClick={() => fetchPeople(true)}
                disabled={loading}
                className="ml-4 p-2 bg-blue-700 hover:bg-blue-800 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh people data"
              >
                <ArrowPathIcon className={`h-6 w-6 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Meet the brilliant minds driving innovation and advancing knowledge at the 
              Open Research Institute of India.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search people, departments, or research interests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-600 rounded-md bg-slate-700 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Role Filter */}
            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="faculty">Faculty</option>
                <option value="researcher">Researchers</option>
                <option value="admin">Admin</option>
                <option value="student">Students</option>
              </select>
            </div>
            
            {/* Department Filter */}
            <div>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Departments</option>
                {getDepartments().map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-400">
            Showing {filteredPeople.length} of {people.length} people
          </p>
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-4 w-4 text-slate-500" />
            <span className="text-sm text-slate-400">Sort by name</span>
          </div>
        </div>

        {/* People Grid */}
        {filteredPeople.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="mx-auto h-16 w-16 text-slate-500" />
            <h3 className="mt-4 text-lg font-medium text-slate-100">No people found</h3>
            <p className="mt-2 text-slate-400">
              {searchTerm || roleFilter !== 'all' || departmentFilter !== 'all'
                ? 'Try adjusting your search criteria.'
                : 'No people are currently listed.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPeople.map((person) => (
              <div key={person._id} className="bg-slate-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-700 hover:border-slate-600 overflow-hidden">
                <div className="p-6">
                  {/* Avatar and Basic Info */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center border border-slate-600 overflow-hidden">
                      {person.profile?.avatar ? (
                        <>
                          <img
                            src={getAvatarUrl(person.profile.avatar)}
                            alt={`${person.firstName} ${person.lastName}`}
                            className="w-full h-full object-cover rounded-full"
                            crossOrigin="anonymous"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.parentElement?.querySelector('.fallback-icon');
                              if (fallback) {
                                fallback.classList.remove('hidden');
                              }
                            }}
                            onLoad={() => {
                              // Avatar loaded successfully
                            }}
                          />
                          <UserIcon className="h-8 w-8 text-slate-400 hidden fallback-icon" />
                        </>
                      ) : (
                        <UserIcon className="h-8 w-8 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-slate-100 truncate">
                        {person.firstName} {person.lastName}
                      </h3>
                      {person.profile?.title && (
                        <p className="text-blue-400 font-medium text-sm mb-1">
                          {person.profile.title}
                        </p>
                      )}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(person.role || 'visitor')}`}>
                        {person.role ? person.role.charAt(0).toUpperCase() + person.role.slice(1) : 'Visitor'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Department and Institution */}
                  <div className="mb-4">
                    {person.profile?.department && (
                      <div className="flex items-center text-sm text-slate-400 mb-1">
                        <AcademicCapIcon className="h-4 w-4 mr-2" />
                        {person.profile.department}
                      </div>
                    )}
                    {person.profile?.institution && (
                      <div className="flex items-center text-sm text-slate-400">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        {person.profile.institution}
                      </div>
                    )}
                  </div>
                  
                  {/* Bio */}
                  {person.profile?.bio && (
                    <p className="text-slate-300 text-sm mb-4 line-clamp-3">
                      {person.profile.bio}
                    </p>
                  )}
                  
                                    {/* Research Interests */}
                  {person.profile?.researchInterests && person.profile.researchInterests.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-slate-200 mb-2">Research Interests</h4>
                      <div className="flex flex-wrap gap-1">
                        {person.profile.researchInterests.slice(0, 3).map((interest, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-slate-700 text-slate-300 border border-slate-600">
                            {interest}
                          </span>
                        ))}
                        {person.profile.researchInterests.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-slate-700 text-slate-300 border border-slate-600">
                            +{person.profile.researchInterests.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Contact Links */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                    <div className="flex items-center space-x-3">
                      <a 
                        href={`mailto:${person.email}`}
                        className="text-slate-400 hover:text-blue-400 transition-colors"
                        title="Email"
                      >
                        <EnvelopeIcon className="h-5 w-5" />
                      </a>
                      {person.profile?.website && (
                        <a 
                          href={person.profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-blue-400 transition-colors"
                          title="Website"
                        >
                          <GlobeAltIcon className="h-5 w-5" />
                        </a>
                      )}
                      {person.profile?.linkedIn && (
                        <a 
                          href={person.profile.linkedIn}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-blue-400 transition-colors"
                          title="LinkedIn"
                        >
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                          </svg>
                        </a>
                      )}
                    </div>
                    
                    <Link 
                      href={`/people/${person._id}`}
                      className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}