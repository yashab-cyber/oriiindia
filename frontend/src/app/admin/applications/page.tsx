'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/lib/config';
import {
  EyeIcon,
  MagnifyingGlassIcon,
  UserIcon,
  BriefcaseIcon,
  CalendarIcon,
  EnvelopeIcon,
  PhoneIcon,
  DocumentTextIcon,
  LinkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface JobApplication {
  _id: string;
  job: {
    _id: string;
    title: string;
    department: string;
  };
  applicant: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: {
      city: string;
      state: string;
      country: string;
    };
  };
  experience: {
    type: string;
    totalYears: number;
    workHistory: Array<{
      company: string;
      position: string;
      duration: string;
      description: string;
    }>;
  };
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    grade: string;
  }>;
  skills: string[];
  communication: {
    languages: Array<{
      language: string;
      proficiency: string;
    }>;
    preferredLanguage: string;
  };
  resume: {
    filename: string;
    originalName: string;
    fileId: string;
    uploadDate: string;
  };
  coverLetter: string;
  additionalInfo: {
    portfolioUrl: string;
    linkedinUrl: string;
    githubUrl: string;
    expectedSalary: {
      amount: number;
      currency: string;
    };
    availableFrom: string;
    relocate: boolean;
  };
  status: string;
  reviewNotes: Array<{
    note: string;
    reviewedBy: string;
    reviewDate: string;
  }>;
  applicationDate: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const ApplicationManagement = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [reviewNote, setReviewNote] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  const router = useRouter();

  useEffect(() => {
    checkAdminAccess();
    fetchApplications();
  }, []);

  const checkAdminAccess = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
  };

  const fetchApplications = async (page = 1) => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(getApiUrl(`/admin/job-applications?${params}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data.data.applications);
        setPagination(data.data.pagination);
      } else {
        console.error('Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedApplication || !newStatus) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        getApiUrl(`/admin/job-applications/${selectedApplication._id}/status`),
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: newStatus,
            ...(reviewNote && { note: reviewNote })
          })
        }
      );

      if (response.ok) {
        alert('Application status updated successfully!');
        setShowStatusModal(false);
        setSelectedApplication(null);
        setNewStatus('');
        setReviewNote('');
        fetchApplications(pagination.currentPage);
      } else {
        alert('Failed to update application status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating application status');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Applied':
        return <ClockIcon className="h-4 w-4 text-blue-500" />;
      case 'Under Review':
        return <EyeIcon className="h-4 w-4 text-yellow-500" />;
      case 'Shortlisted':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'Interview Scheduled':
        return <CalendarIcon className="h-4 w-4 text-purple-500" />;
      case 'Rejected':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'Hired':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Applied':
        return 'bg-blue-100 text-blue-800';
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-800';
      case 'Shortlisted':
        return 'bg-green-100 text-green-800';
      case 'Interview Scheduled':
        return 'bg-purple-100 text-purple-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Hired':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading applications...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Applications</h1>
            <p className="text-gray-600 mt-2">Review and manage job applications</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                fetchApplications(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="Applied">Applied</option>
              <option value="Under Review">Under Review</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Rejected">Rejected</option>
              <option value="Hired">Hired</option>
            </select>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Applications ({pagination.totalItems})
            </h2>
          </div>

          {applications.length === 0 ? (
            <div className="p-8 text-center">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No applications found.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {applications.map((application) => (
                <div key={application._id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {application.applicant.firstName} {application.applicant.lastName}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(application.status)}`}>
                          {getStatusIcon(application.status)}
                          {application.status}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <BriefcaseIcon className="h-4 w-4" />
                          {application.job.title} - {application.job.department}
                        </div>
                        <div className="flex items-center gap-1">
                          <EnvelopeIcon className="h-4 w-4" />
                          {application.applicant.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <PhoneIcon className="h-4 w-4" />
                          {application.applicant.phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <UserIcon className="h-4 w-4" />
                          {application.experience.type}
                          {application.experience.type === 'Experienced' && 
                            ` (${application.experience.totalYears} years)`
                          }
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {application.skills.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {application.skills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{application.skills.length - 3} more
                          </span>
                        )}
                      </div>

                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Applied:</span> {formatDate(application.applicationDate)}
                        {application.additionalInfo.expectedSalary.amount && (
                          <>
                            <span className="ml-4 font-medium">Expected Salary:</span> {application.additionalInfo.expectedSalary.currency} {application.additionalInfo.expectedSalary.amount.toLocaleString()}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => setSelectedApplication(application)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedApplication(application);
                          setNewStatus(application.status);
                          setShowStatusModal(true);
                        }}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Update Status"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="p-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                  {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                  {pagination.totalItems} results
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchApplications(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded">
                    {pagination.currentPage}
                  </span>
                  <button
                    onClick={() => fetchApplications(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && !showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Application Details
                </h2>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Applicant Info */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Applicant Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Name:</span>
                    <p className="font-medium">{selectedApplication.applicant.firstName} {selectedApplication.applicant.lastName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Email:</span>
                    <p className="font-medium">{selectedApplication.applicant.email}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Phone:</span>
                    <p className="font-medium">{selectedApplication.applicant.phone}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Location:</span>
                    <p className="font-medium">
                      {selectedApplication.applicant.address.city}, {selectedApplication.applicant.address.state}, {selectedApplication.applicant.address.country}
                    </p>
                  </div>
                </div>
              </section>

              {/* Job Info */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Position Applied For</h3>
                <p className="font-medium">{selectedApplication.job.title} - {selectedApplication.job.department}</p>
              </section>

              {/* Experience */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience</h3>
                <p className="mb-2">
                  <span className="font-medium">Type:</span> {selectedApplication.experience.type}
                  {selectedApplication.experience.type === 'Experienced' && 
                    ` (${selectedApplication.experience.totalYears} years)`
                  }
                </p>
                {selectedApplication.experience.workHistory.length > 0 && (
                  <div className="space-y-3">
                    {selectedApplication.experience.workHistory.map((work, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <p className="font-medium">{work.position} at {work.company}</p>
                        <p className="text-sm text-gray-600">{work.duration}</p>
                        <p className="text-sm text-gray-600 mt-1">{work.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Skills */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedApplication.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>

              {/* Cover Letter */}
              {selectedApplication.coverLetter && (
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Cover Letter</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                  </div>
                </section>
              )}

              {/* Additional Info */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedApplication.additionalInfo.portfolioUrl && (
                    <div>
                      <span className="text-sm text-gray-500">Portfolio:</span>
                      <a href={selectedApplication.additionalInfo.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 block">
                        <LinkIcon className="h-4 w-4 inline mr-1" />
                        View Portfolio
                      </a>
                    </div>
                  )}
                  {selectedApplication.additionalInfo.linkedinUrl && (
                    <div>
                      <span className="text-sm text-gray-500">LinkedIn:</span>
                      <a href={selectedApplication.additionalInfo.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 block">
                        <LinkIcon className="h-4 w-4 inline mr-1" />
                        View LinkedIn
                      </a>
                    </div>
                  )}
                  {selectedApplication.additionalInfo.expectedSalary.amount && (
                    <div>
                      <span className="text-sm text-gray-500">Expected Salary:</span>
                      <p className="font-medium">{selectedApplication.additionalInfo.expectedSalary.currency} {selectedApplication.additionalInfo.expectedSalary.amount.toLocaleString()}</p>
                    </div>
                  )}
                  {selectedApplication.additionalInfo.availableFrom && (
                    <div>
                      <span className="text-sm text-gray-500">Available From:</span>
                      <p className="font-medium">{formatDate(selectedApplication.additionalInfo.availableFrom)}</p>
                    </div>
                  )}
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Willing to Relocate:</span>
                  <p className="font-medium">{selectedApplication.additionalInfo.relocate ? 'Yes' : 'No'}</p>
                </div>
              </section>

              {/* Status Update Button */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setNewStatus(selectedApplication.status);
                    setShowStatusModal(true);
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Update Application Status
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Applied">Applied</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Interview Scheduled">Interview Scheduled</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Hired">Hired</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Note (Optional)
                  </label>
                  <textarea
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder="Add a note about this status change..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setNewStatus('');
                    setReviewNote('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationManagement;