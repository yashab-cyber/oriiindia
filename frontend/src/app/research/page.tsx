'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getApiUrl } from '@/lib/config';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserGroupIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface ResearchPaper {
  _id: string;
  title: string;
  abstract: string;
  authors: Array<{
    name: string;
    affiliation?: string;
    isCorresponding: boolean;
  }>;
  keywords: string[];
  category: string;
  subcategory?: string;
  status: 'draft' | 'under-review' | 'published' | 'rejected';
  publishedIn?: {
    journal?: string;
    publishedDate?: string;
    doi?: string;
  };
  views: number;
  likes: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Research() {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [filteredPapers, setFilteredPapers] = useState<ResearchPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Fetch research papers from API
  useEffect(() => {
    const fetchPapers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(getApiUrl('/research'));
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.papers) {
            // Transform API data to match frontend interface
            const transformedPapers = data.data.papers.map((paper: any) => ({
              _id: paper._id,
              title: paper.title,
              abstract: paper.abstract,
              authors: paper.authors,
              keywords: paper.keywords,
              category: paper.category,
              subcategory: paper.subcategory,
              status: paper.status,
              publishedIn: paper.publishedIn,
              views: paper.metrics?.views || 0,
              likes: paper.metrics?.likes || 0,
              isLiked: false, // Will be set based on user interaction
              createdAt: paper.createdAt,
              updatedAt: paper.updatedAt,
            }));
            setPapers(transformedPapers);
            setFilteredPapers(transformedPapers);
          }
        } else {
          console.error('Failed to fetch research papers');
        }
      } catch (error) {
        console.error('Error fetching research papers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPapers();
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = papers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(paper =>
        paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.authors.some(author => author.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        paper.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(paper => paper.category === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(paper => paper.status === selectedStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'oldest':
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        case 'mostViewed':
          return b.views - a.views;
        case 'mostLiked':
          return b.likes - a.likes;
        default:
          return 0;
      }
    });

    setFilteredPapers(filtered);
  }, [papers, searchTerm, selectedCategory, selectedStatus, sortBy]);

  const categories = ['all', 'Computer Science', 'Environmental Science', 'Medicine', 'Business'];
  const statuses = ['all', 'published', 'under-review', 'draft'];

  const handleLike = (paperId: string) => {
    setPapers(papers.map(paper =>
      paper._id === paperId
        ? { ...paper, isLiked: !paper.isLiked, likes: paper.isLiked ? paper.likes - 1 : paper.likes + 1 }
        : paper
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'under-review':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Research Publications
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore cutting-edge research from our community of scholars and researchers
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search papers, authors, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="mostViewed">Most Viewed</option>
                <option value="mostLiked">Most Liked</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <p className="text-gray-600">
              {filteredPapers.length} research paper{filteredPapers.length !== 1 ? 's' : ''} found
            </p>
          </div>

          <div className="space-y-6">
            {filteredPapers.map((paper) => (
              <div key={paper._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    {/* Title and Status */}
                    <div className="flex items-start justify-between mb-3">
                      <Link 
                        href={`/research/${paper._id}`}
                        className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {paper.title}
                      </Link>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(paper.status)}`}>
                        {paper.status.charAt(0).toUpperCase() + paper.status.slice(1)}
                      </span>
                    </div>

                    {/* Authors */}
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <UserGroupIcon className="h-4 w-4 mr-1" />
                      {paper.authors.map((author, index) => (
                        <span key={index}>
                          {author.name}
                          {author.affiliation && ` (${author.affiliation})`}
                          {index < paper.authors.length - 1 && ', '}
                        </span>
                      ))}
                    </div>

                    {/* Abstract */}
                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {paper.abstract}
                    </p>

                    {/* Keywords */}
                    <div className="flex items-center flex-wrap gap-2 mb-4">
                      <TagIcon className="h-4 w-4 text-gray-400" />
                      {paper.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>

                    {/* Publication Info */}
                    {paper.publishedIn && (
                      <div className="flex items-center text-sm text-gray-600 mb-4">
                        <DocumentTextIcon className="h-4 w-4 mr-1" />
                        <span>
                          Published in <strong>{paper.publishedIn.journal}</strong>
                          {paper.publishedIn.publishedDate && (
                            <span> on {new Date(paper.publishedIn.publishedDate).toLocaleDateString()}</span>
                          )}
                          {paper.publishedIn.doi && (
                            <span> | DOI: {paper.publishedIn.doi}</span>
                          )}
                        </span>
                      </div>
                    )}

                    {/* Stats and Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          {paper.views.toLocaleString()} views
                        </div>
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {new Date(paper.updatedAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleLike(paper._id)}
                          className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
                            paper.isLiked
                              ? 'bg-red-50 text-red-600'
                              : 'bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600'
                          }`}
                        >
                          {paper.isLiked ? (
                            <HeartSolidIcon className="h-4 w-4" />
                          ) : (
                            <HeartIcon className="h-4 w-4" />
                          )}
                          <span>{paper.likes}</span>
                        </button>

                        <button className="flex items-center space-x-1 px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors">
                          <ShareIcon className="h-4 w-4" />
                          <span>Share</span>
                        </button>

                        <Link
                          href={`/research/${paper._id}`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          Read More
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPapers.length === 0 && (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No papers found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search criteria or filters.
              </p>
            </div>
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  );
}