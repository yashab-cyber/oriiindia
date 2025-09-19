'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FileUpload from '@/components/FileUpload';
import { getApiUrl } from '@/lib/config';
import { 
  DocumentIcon,
  CloudArrowUpIcon,
  EyeIcon,
  TrashIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface ResearchPaper {
  _id: string;
  title: string;
  abstract: string;
  category: string;
  status: string;
  files: Array<{
    fileId: string;
    filename: string;
    originalName: string;
    size: number;
    uploadDate: string;
    fileType: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function UploadPage() {
  const [user, setUser] = useState<any>(null);
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }
    
    setUser(JSON.parse(userData));
    fetchUserPapers();
  }, [router]);

  const fetchUserPapers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/research'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.papers) {
          // Filter papers by current user
          let currentUserId = null;
          try {
            const userData = localStorage.getItem('user');
            if (userData) {
              currentUserId = JSON.parse(userData)._id;
            }
          } catch (error) {
            console.error('Error parsing user data:', error);
          }
          
          const userPapers = data.data.papers.filter((paper: any) => 
            paper.submittedBy._id === currentUserId
          );
          setPapers(userPapers);
        }
      }
    } catch (error) {
      console.error('Error fetching papers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUploadSuccess = (fileData: any) => {
    setShowUploader(false);
    setSelectedPaper(null);
    fetchUserPapers(); // Refresh the papers list
  };

  const handleFileUploadError = (error: string) => {
    console.error('File upload error:', error);
    // Could show a toast notification here
  };

  const downloadFile = async (fileId: string, filename: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`/files/download/research-papers/${fileId}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const deleteFile = async (fileId: string, paperId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`/files/delete/research-papers/${fileId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchUserPapers(); // Refresh the papers list
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Research Paper Uploads</h1>
          <p className="mt-2 text-gray-600">
            Manage files for your research papers
          </p>
        </div>

        {papers.length === 0 ? (
          <div className="text-center py-12">
            <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No research papers</h3>
            <p className="mt-1 text-sm text-gray-500">
              Submit a research paper first to upload files.
            </p>
            <div className="mt-6">
              <button
                onClick={() => router.push('/research')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <CloudArrowUpIcon className="-ml-1 mr-2 h-5 w-5" />
                View Research Papers
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {papers.map((paper) => (
              <div key={paper._id} className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{paper.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {paper.category} • {paper.status}
                    </p>
                    <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                      {paper.abstract}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSelectedPaper(paper);
                      setShowUploader(true);
                    }}
                    className="ml-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <CloudArrowUpIcon className="-ml-0.5 mr-2 h-4 w-4" />
                    Upload File
                  </button>
                </div>

                {/* Files List */}
                {paper.files && paper.files.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Uploaded Files</h4>
                    <div className="space-y-2">
                      {paper.files.map((file) => (
                        <div key={file.fileId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <DocumentIcon className="h-8 w-8 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.originalName}</p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)} • Uploaded {formatDate(file.uploadDate)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => downloadFile(file.fileId, file.originalName)}
                              className="p-1 text-gray-400 hover:text-blue-500"
                              title="Download"
                            >
                              <ArrowDownTrayIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteFile(file.fileId, paper._id)}
                              className="p-1 text-gray-400 hover:text-red-500"
                              title="Delete"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 text-xs text-gray-500">
                  Created: {formatDate(paper.createdAt)} • Last updated: {formatDate(paper.updatedAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploader && selectedPaper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Upload File for: {selectedPaper.title}
                </h3>
                <p className="text-sm text-gray-500">
                  Upload research paper documents (PDF, DOC, DOCX)
                </p>
              </div>
              <button
                onClick={() => {
                  setShowUploader(false);
                  setSelectedPaper(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <DocumentIcon className="h-6 w-6" />
              </button>
            </div>

            <FileUpload
              uploadType="research-papers"
              paperId={selectedPaper._id}
              accept=".pdf,.doc,.docx"
              maxSize={25 * 1024 * 1024} // 25MB
              onUploadSuccess={handleFileUploadSuccess}
              onUploadError={handleFileUploadError}
              multiple={true}
            />

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowUploader(false);
                  setSelectedPaper(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}