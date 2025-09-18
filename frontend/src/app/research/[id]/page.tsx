'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  ArrowLeftIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  TagIcon,
  ShareIcon,
  BookmarkIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { ResearchPaper } from '@/types';

export default function ResearchDetail() {
  const params = useParams();
  const router = useRouter();
  const [paper, setPaper] = useState<ResearchPaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchPaper(params.id as string);
    }
  }, [params.id]);

  const fetchPaper = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/research/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        setPaper(data);
      } else {
        setError('Research paper not found');
      }
    } catch (error) {
      setError('Failed to load research paper');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'under-review':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <DocumentTextIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Paper Not Found</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <Link 
              href="/research"
              className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Research
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <Link 
              href="/research"
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Research
            </Link>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full">
                <BookmarkIcon className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full">
                <ShareIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(paper.status)}`}>
              {paper.status.charAt(0).toUpperCase() + paper.status.slice(1)}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {paper.title}
          </h1>
          
          {/* Authors */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center text-gray-600">
              <UserIcon className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Authors:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {paper.authors.map((author, index) => (
                <span key={index} className="text-sm">
                  <span className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                    {author.name}
                  </span>
                  {author.affiliation && (
                    <span className="text-gray-500"> ({author.affiliation})</span>
                  )}
                  {author.isCorresponding && (
                    <span className="text-green-600 ml-1">*</span>
                  )}
                  {index < paper.authors.length - 1 && <span className="text-gray-400">, </span>}
                </span>
              ))}
            </div>
          </div>
          
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2" />
              {paper.publishedIn?.publishedDate ? formatDate(paper.publishedIn.publishedDate) : formatDate(paper.createdAt)}
            </div>
            <div className="flex items-center">
              <TagIcon className="h-4 w-4 mr-2" />
              {paper.category}
            </div>
            {paper.publishedIn?.journal && (
              <div className="flex items-center">
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                {paper.publishedIn.journal}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Abstract */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Abstract</h2>
              <p className="text-gray-700 leading-relaxed">
                {paper.abstract}
              </p>
            </div>
            
            {/* Keywords */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Keywords</h2>
              <div className="flex flex-wrap gap-2">
                {paper.keywords.map((keyword, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Files */}
            {paper.files && paper.files.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Files & Downloads</h2>
                <div className="space-y-3">
                  {paper.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">{file.name}</div>
                          <div className="text-sm text-gray-500">
                            {file.type} • {file.size ? (file.size / 1024 / 1024).toFixed(2) : '0'} MB
                          </div>
                        </div>
                      </div>
                      <button className="flex items-center px-3 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded">
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publication Info */}
            {paper.publishedIn && Object.keys(paper.publishedIn).some(key => paper.publishedIn![key as keyof typeof paper.publishedIn]) && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Publication Details</h3>
                <div className="space-y-3 text-sm">
                  {paper.publishedIn.journal && (
                    <div>
                      <span className="font-medium text-gray-700">Journal:</span>
                      <p className="text-gray-900">{paper.publishedIn.journal}</p>
                    </div>
                  )}
                  {paper.publishedIn.volume && (
                    <div>
                      <span className="font-medium text-gray-700">Volume:</span>
                      <p className="text-gray-900">{paper.publishedIn.volume}</p>
                    </div>
                  )}
                  {paper.publishedIn.issue && (
                    <div>
                      <span className="font-medium text-gray-700">Issue:</span>
                      <p className="text-gray-900">{paper.publishedIn.issue}</p>
                    </div>
                  )}
                  {paper.publishedIn.pages && (
                    <div>
                      <span className="font-medium text-gray-700">Pages:</span>
                      <p className="text-gray-900">{paper.publishedIn.pages}</p>
                    </div>
                  )}
                  {paper.publishedIn.doi && (
                    <div>
                      <span className="font-medium text-gray-700">DOI:</span>
                      <a 
                        href={`https://doi.org/${paper.publishedIn.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 break-all"
                      >
                        {paper.publishedIn.doi}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Statistics */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="font-medium">{paper.metrics?.views || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Downloads</span>
                  <span className="font-medium">{paper.metrics?.downloads || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Citations</span>
                  <span className="font-medium">{paper.citations?.count || 0}</span>
                </div>
              </div>
            </div>
            
            {/* Related Papers */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Papers</h3>
              <div className="space-y-3">
                <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                    Machine Learning Applications in Climate Research
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">By Dr. Smith et al.</p>
                </div>
                <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                    Advanced Data Analytics in Environmental Studies
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">By Prof. Johnson</p>
                </div>
                <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                    Sustainable Technology Innovations
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">By Dr. Wilson et al.</p>
                </div>
              </div>
              <Link 
                href="/research"
                className="block mt-4 text-center text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View all research
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}