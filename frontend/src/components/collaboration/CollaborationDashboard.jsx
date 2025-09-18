import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Users, 
  Calendar, 
  MapPin, 
  Star,
  Clock,
  User,
  Tag,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

const CollaborationDashboard = () => {
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    myCollaborations: false
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Collaboration types with icons and colors
  const collaborationTypes = {
    research_project: { icon: TrendingUp, label: 'Research Project', color: 'bg-blue-100 text-blue-800' },
    paper_collaboration: { icon: Star, label: 'Paper Collaboration', color: 'bg-purple-100 text-purple-800' },
    grant_application: { icon: Star, label: 'Grant Application', color: 'bg-green-100 text-green-800' },
    conference_presentation: { icon: Users, label: 'Conference Presentation', color: 'bg-orange-100 text-orange-800' },
    workshop_organization: { icon: Calendar, label: 'Workshop Organization', color: 'bg-pink-100 text-pink-800' },
    data_sharing: { icon: MapPin, label: 'Data Sharing', color: 'bg-teal-100 text-teal-800' },
    methodology_development: { icon: AlertCircle, label: 'Methodology Development', color: 'bg-indigo-100 text-indigo-800' },
    other: { icon: Tag, label: 'Other', color: 'bg-gray-100 text-gray-800' }
  };

  // Status icons and colors
  const statusConfig = {
    active: { icon: CheckCircle, color: 'text-green-500', label: 'Active' },
    completed: { icon: CheckCircle, color: 'text-blue-500', label: 'Completed' },
    paused: { icon: Clock, color: 'text-yellow-500', label: 'Paused' },
    cancelled: { icon: XCircle, color: 'text-red-500', label: 'Cancelled' }
  };

  // Fetch collaborations
  const fetchCollaborations = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        ...filters
      });

      const response = await fetch(`/api/collaborations?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCollaborations(data.data.collaborations);
        setTotalPages(data.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching collaborations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollaborations();
  }, [currentPage, searchTerm, filters]);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Handle collaboration invitation response
  const handleInvitationResponse = async (collaborationId, response) => {
    try {
      const res = await fetch(`/api/collaborations/${collaborationId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ response })
      });

      if (res.ok) {
        fetchCollaborations();
        // Show success message
        alert(`Invitation ${response} successfully!`);
      }
    } catch (error) {
      console.error('Error responding to invitation:', error);
      alert('Failed to respond to invitation');
    }
  };

  // Render collaboration card
  const renderCollaborationCard = (collaboration) => {
    const typeConfig = collaborationTypes[collaboration.type] || collaborationTypes.other;
    const TypeIcon = typeConfig.icon;
    const statusIcon = statusConfig[collaboration.status];
    const StatusIcon = statusIcon.icon;

    // Check if current user has pending invitation
    const currentUserId = JSON.parse(localStorage.getItem('user'))?.id;
    const userCollaborator = collaboration.collaborators?.find(c => c.user._id === currentUserId);
    const hasPendingInvitation = userCollaborator?.status === 'pending';

    return (
      <div key={collaboration._id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <TypeIcon className="w-5 h-5 text-gray-600" />
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeConfig.color}`}>
                {typeConfig.label}
              </span>
              <span className={`flex items-center gap-1 text-sm ${statusIcon.color}`}>
                <StatusIcon className="w-4 h-4" />
                {statusIcon.label}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {collaboration.title}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2">
              {collaboration.description}
            </p>
          </div>
        </div>

        {/* Collaboration Info */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">
              Initiated by: {collaboration.initiator.firstName} {collaboration.initiator.lastName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">
              {collaboration.activeCollaboratorCount || 0} active collaborators
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">
              Created: {new Date(collaboration.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">
              Progress: {collaboration.progress || 0}%
            </span>
          </div>
        </div>

        {/* Research Areas */}
        {collaboration.researchAreas && collaboration.researchAreas.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {collaboration.researchAreas.slice(0, 3).map((area, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                  {area}
                </span>
              ))}
              {collaboration.researchAreas.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                  +{collaboration.researchAreas.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Pending Invitation */}
        {hasPendingInvitation && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800 font-medium mb-2">
              You have a pending invitation for this collaboration
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleInvitationResponse(collaboration._id, 'accept')}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Accept
              </button>
              <button
                onClick={() => handleInvitationResponse(collaboration._id, 'decline')}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Decline
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View Details
          </button>
          <div className="flex gap-2">
            {collaboration.visibility === 'public' && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                Public
              </span>
            )}
            {collaboration.visibility === 'institute' && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                Institute
              </span>
            )}
            {collaboration.visibility === 'private' && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                Private
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Research Collaborations</h1>
        <p className="text-gray-600">Discover and join exciting research collaborations</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search collaborations..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
            </select>

            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="research_project">Research Project</option>
              <option value="paper_collaboration">Paper Collaboration</option>
              <option value="grant_application">Grant Application</option>
              <option value="conference_presentation">Conference</option>
            </select>

            <label className="flex items-center gap-2 px-3 py-2">
              <input
                type="checkbox"
                checked={filters.myCollaborations}
                onChange={(e) => handleFilterChange('myCollaborations', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">My Collaborations</span>
            </label>
          </div>

          {/* Create Button */}
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            Create Collaboration
          </button>
        </div>
      </div>

      {/* Collaborations Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading collaborations...</p>
        </div>
      ) : collaborations.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No collaborations found</h3>
          <p className="text-gray-600 mb-4">Start by creating your first collaboration or adjusting your filters.</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Create Collaboration
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {collaborations.map(renderCollaborationCard)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-2 border rounded-md ${
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaborationDashboard;