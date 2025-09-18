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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchPerson(params.id as string);
    }
  }, [params.id]);

  const fetchPerson = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl(`/users/${id}`));
      
      if (response.ok) {
        const data = await response.json();
        setPerson(data.data);
      } else {
        setError('Person not found');
      }
    } catch (error) {
      setError('Failed to load person profile');
    } finally {
      setLoading(false);
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
            <div className="w-32 h-32 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0 border border-slate-600">
              <UserIcon className="h-16 w-16 text-slate-400" />
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
            
            {/* Recent Publications (Placeholder) */}
            <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-slate-100 mb-4">Recent Publications</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-medium text-slate-200">Machine Learning Applications in Climate Research</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Published in Nature Climate Change • 2025
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    A comprehensive study on the application of machine learning techniques in climate modeling...
                  </p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-medium text-slate-200">Sustainable Technology Solutions for Environmental Challenges</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Published in Environmental Science & Technology • 2024
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    Exploring innovative approaches to address environmental challenges through technology...
                  </p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="font-medium text-slate-200">AI Ethics in Research: A Framework for Responsible Innovation</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Published in AI & Society • 2024
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    Developing ethical frameworks for artificial intelligence applications in research...
                  </p>
                </div>
              </div>
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