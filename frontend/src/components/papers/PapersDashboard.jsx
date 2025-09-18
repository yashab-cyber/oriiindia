import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon,
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const statusColors = {
  'draft': 'bg-gray-100 text-gray-800',
  'submitted': 'bg-blue-100 text-blue-800',
  'under_review': 'bg-yellow-100 text-yellow-800',
  'revision_required': 'bg-orange-100 text-orange-800',
  'revised_submitted': 'bg-purple-100 text-purple-800',
  'accepted': 'bg-green-100 text-green-800',
  'rejected': 'bg-red-100 text-red-800',
  'published': 'bg-emerald-100 text-emerald-800',
  'withdrawn': 'bg-gray-100 text-gray-800'
};

const statusLabels = {
  'draft': 'Draft',
  'submitted': 'Submitted',
  'under_review': 'Under Review',
  'revision_required': 'Revision Required',
  'revised_submitted': 'Revised & Submitted',
  'accepted': 'Accepted',
  'rejected': 'Rejected',
  'published': 'Published',
  'withdrawn': 'Withdrawn'
};

const PaperCard = ({ paper, onDelete }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this paper? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(`/api/papers/${paper._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Paper deleted successfully');
        onDelete(paper._id);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete paper');
      }
    } catch (error) {
      console.error('Error deleting paper:', error);
      toast.error('Failed to delete paper');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProgressPercentage = () => {
    if (!paper.submissionProgress) return 0;
    const steps = Object.values(paper.submissionProgress);
    const completedSteps = steps.filter(step => step.completed).length;
    return Math.round((completedSteps / steps.length) * 100);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {paper.title}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[paper.status]}`}>
              {statusLabels[paper.status]}
            </span>
            {paper.submissionId && (
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                {paper.submissionId}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <Link
            to={`/dashboard/papers/${paper._id}`}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="View details"
          >
            <EyeIcon className="w-4 h-4" />
          </Link>
          
          {paper.status === 'draft' && (
            <Link
              to={`/dashboard/papers/submit/${paper._id}`}
              className="p-2 text-blue-400 hover:text-blue-600 transition-colors"
              title="Continue editing"
            >
              <PencilIcon className="w-4 h-4" />
            </Link>
          )}
          
          {paper.status === 'draft' && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-2 text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
              title="Delete paper"
            >
              {deleting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
              ) : (
                <TrashIcon className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
        {paper.abstract}
      </p>

      <div className="space-y-3">
        {/* Authors */}
        <div className="flex items-center text-sm text-gray-600">
          <span className="font-medium mr-2">Authors:</span>
          <span>
            {paper.authors
              ?.sort((a, b) => a.order - b.order)
              ?.slice(0, 3)
              ?.map(author => 
                author.user ? 
                  `${author.user.firstName} ${author.user.lastName}` : 
                  author.email
              )
              ?.join(', ')}
            {paper.authors?.length > 3 && ` +${paper.authors.length - 3} more`}
          </span>
        </div>

        {/* Progress */}
        {paper.status === 'draft' && (
          <div>
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Completion Progress</span>
              <span>{getProgressPercentage()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Created: {formatDate(paper.createdAt)}</span>
          {paper.submissionDate && (
            <span>Submitted: {formatDate(paper.submissionDate)}</span>
          )}
        </div>

        {/* Keywords */}
        {paper.keywords && paper.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {paper.keywords.slice(0, 4).map((keyword, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
              >
                {keyword}
              </span>
            ))}
            {paper.keywords.length > 4 && (
              <span className="text-xs text-gray-500">+{paper.keywords.length - 4} more</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const PapersDashboard = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPapers();
  }, [searchQuery, statusFilter, sortBy, sortOrder, currentPage]);

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        sortBy,
        sortOrder
      });

      if (statusFilter) {
        params.append('status', statusFilter);
      }

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/papers/user/my-papers?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPapers(data.data.papers);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        toast.error('Failed to fetch papers');
      }
    } catch (error) {
      console.error('Error fetching papers:', error);
      toast.error('Failed to fetch papers');
    } finally {
      setLoading(false);
    }
  };

  const handlePaperDelete = (paperId) => {
    setPapers(prev => prev.filter(paper => paper._id !== paperId));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPapers();
  };

  const stats = {
    total: papers.length,
    drafts: papers.filter(p => p.status === 'draft').length,
    submitted: papers.filter(p => ['submitted', 'under_review', 'revision_required'].includes(p.status)).length,
    published: papers.filter(p => ['accepted', 'published'].includes(p.status)).length
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Research Papers</h1>
          <p className="mt-2 text-gray-600">
            Manage your research paper submissions and track their progress
          </p>
        </div>
        <Link
          to="/dashboard/papers/submit"
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Submit New Paper
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <DocumentTextIcon className="w-8 h-8 text-blue-500" />
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Papers</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <PencilIcon className="w-8 h-8 text-gray-500" />
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{stats.drafts}</div>
              <div className="text-sm text-gray-600">Drafts</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <ClockIcon className="w-8 h-8 text-yellow-500" />
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{stats.submitted}</div>
              <div className="text-sm text-gray-600">Under Review</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <CheckCircleIcon className="w-8 h-8 text-green-500" />
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{stats.published}</div>
              <div className="text-sm text-gray-600">Published</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search papers by title, abstract, or keywords..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </form>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="revision_required">Revision Required</option>
              <option value="accepted">Accepted</option>
              <option value="published">Published</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-2">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="title-asc">Title A-Z</option>
              <option value="title-desc">Title Z-A</option>
              <option value="submissionDate-desc">Recently Submitted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Papers Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : papers.length === 0 ? (
        <div className="text-center py-12">
          <DocumentTextIcon className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No papers found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || statusFilter ? 
              'Try adjusting your search filters or create your first paper.' :
              'Get started by submitting your first research paper.'
            }
          </p>
          <Link
            to="/dashboard/papers/submit"
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Submit New Paper
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {papers.map((paper) => (
              <PaperCard
                key={paper._id}
                paper={paper}
                onDelete={handlePaperDelete}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === page
                          ? 'bg-blue-500 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PapersDashboard;