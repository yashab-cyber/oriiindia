import React, { useState } from 'react';
import { 
  EyeIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

const ReviewStep = ({ paper, updatePaper, onComplete, errors, saving }) => {
  const [suggestedReviewers, setSuggestedReviewers] = useState(
    paper?.settings?.suggestedReviewers || []
  );
  const [excludedReviewers, setExcludedReviewers] = useState(
    paper?.settings?.excludedReviewers || []
  );
  const [newSuggestedReviewer, setNewSuggestedReviewer] = useState({
    name: '',
    email: '',
    affiliation: '',
    expertise: ''
  });
  const [newExcludedReviewer, setNewExcludedReviewer] = useState({
    name: '',
    email: '',
    reason: ''
  });

  const handleAddSuggestedReviewer = () => {
    if (!newSuggestedReviewer.name || !newSuggestedReviewer.email) {
      return;
    }

    const updatedReviewers = [...suggestedReviewers, { ...newSuggestedReviewer }];
    setSuggestedReviewers(updatedReviewers);
    updatePaper({
      settings: {
        ...paper.settings,
        suggestedReviewers: updatedReviewers
      }
    });

    setNewSuggestedReviewer({
      name: '',
      email: '',
      affiliation: '',
      expertise: ''
    });
  };

  const handleRemoveSuggestedReviewer = (index) => {
    const updatedReviewers = suggestedReviewers.filter((_, i) => i !== index);
    setSuggestedReviewers(updatedReviewers);
    updatePaper({
      settings: {
        ...paper.settings,
        suggestedReviewers: updatedReviewers
      }
    });
  };

  const handleAddExcludedReviewer = () => {
    if (!newExcludedReviewer.name || !newExcludedReviewer.reason) {
      return;
    }

    const updatedReviewers = [...excludedReviewers, { ...newExcludedReviewer }];
    setExcludedReviewers(updatedReviewers);
    updatePaper({
      settings: {
        ...paper.settings,
        excludedReviewers: updatedReviewers
      }
    });

    setNewExcludedReviewer({
      name: '',
      email: '',
      reason: ''
    });
  };

  const handleRemoveExcludedReviewer = (index) => {
    const updatedReviewers = excludedReviewers.filter((_, i) => i !== index);
    setExcludedReviewers(updatedReviewers);
    updatePaper({
      settings: {
        ...paper.settings,
        excludedReviewers: updatedReviewers
      }
    });
  };

  const handleComplete = async (e) => {
    e.preventDefault();

    try {
      await onComplete({
        settings: {
          ...paper.settings,
          suggestedReviewers,
          excludedReviewers
        }
      });
    } catch (error) {
      console.error('Error completing review step:', error);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFieldLabel = (field) => {
    const fieldMap = {
      'computer_science': 'Computer Science',
      'engineering': 'Engineering',
      'mathematics': 'Mathematics',
      'physics': 'Physics',
      'chemistry': 'Chemistry',
      'biology': 'Biology',
      'medicine': 'Medicine',
      'social_sciences': 'Social Sciences',
      'economics': 'Economics',
      'psychology': 'Psychology',
      'education': 'Education',
      'environmental_science': 'Environmental Science',
      'other': 'Other'
    };
    return fieldMap[field] || field;
  };

  const getResearchTypeLabel = (type) => {
    const typeMap = {
      'original_research': 'Original Research',
      'review_article': 'Review Article',
      'case_study': 'Case Study',
      'technical_note': 'Technical Note',
      'survey': 'Survey',
      'tutorial': 'Tutorial',
      'position_paper': 'Position Paper',
      'short_communication': 'Short Communication'
    };
    return typeMap[type] || type;
  };

  const getMethodologyLabel = (methodology) => {
    const methodologyMap = {
      'experimental': 'Experimental',
      'theoretical': 'Theoretical',
      'computational': 'Computational',
      'observational': 'Observational',
      'mixed_methods': 'Mixed Methods',
      'qualitative': 'Qualitative',
      'quantitative': 'Quantitative',
      'systematic_review': 'Systematic Review',
      'meta_analysis': 'Meta Analysis'
    };
    return methodologyMap[methodology] || methodology;
  };

  const getRoleLabel = (role) => {
    const roleMap = {
      'primary_author': 'Primary Author',
      'co_author': 'Co-Author',
      'corresponding_author': 'Corresponding Author',
      'supervisor': 'Supervisor'
    };
    return roleMap[role] || role;
  };

  return (
    <div className="space-y-8">
      {/* Submission Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
          <EyeIcon className="w-5 h-5 mr-2 text-blue-500" />
          Submission Summary
        </h3>

        {/* Basic Information */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <DocumentTextIcon className="w-4 h-4 mr-2 text-gray-600" />
            Basic Information
          </h4>
          <div className="bg-white rounded-lg border p-4 space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-600">Title:</span>
              <p className="text-gray-900 mt-1">{paper.title}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Abstract:</span>
              <p className="text-gray-900 mt-1 text-sm leading-relaxed">
                {paper.abstract.length > 300 
                  ? `${paper.abstract.substring(0, 300)}...` 
                  : paper.abstract
                }
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Field:</span>
                <p className="text-gray-900">{getFieldLabel(paper.field)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Research Type:</span>
                <p className="text-gray-900">{getResearchTypeLabel(paper.researchType)}</p>
              </div>
              {paper.methodology && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Methodology:</span>
                  <p className="text-gray-900">{getMethodologyLabel(paper.methodology)}</p>
                </div>
              )}
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Keywords:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {paper.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Authors */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <UserGroupIcon className="w-4 h-4 mr-2 text-gray-600" />
            Authors ({paper.authors.length})
          </h4>
          <div className="bg-white rounded-lg border p-4">
            <div className="space-y-3">
              {paper.authors
                .sort((a, b) => a.order - b.order)
                .map((author, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-900">
                        {author.user ? 
                          `${author.user.firstName} ${author.user.lastName}` : 
                          author.email
                        }
                      </span>
                      <div className="text-sm text-gray-600 space-x-2">
                        <span>{getRoleLabel(author.role)}</span>
                        {author.isCorresponding && (
                          <span className="text-yellow-600 font-medium">• Corresponding</span>
                        )}
                      </div>
                      {author.affiliation && (
                        <div className="text-sm text-gray-500">{author.affiliation}</div>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">#{author.order}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Files */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <CloudArrowUpIcon className="w-4 h-4 mr-2 text-gray-600" />
            Uploaded Files
          </h4>
          <div className="bg-white rounded-lg border p-4 space-y-4">
            {/* Manuscript */}
            {paper.files?.manuscript && (
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-900">Manuscript</span>
                  <div className="text-sm text-gray-600">
                    {paper.files.manuscript.originalName} • {formatFileSize(paper.files.manuscript.size)}
                  </div>
                </div>
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
              </div>
            )}

            {/* Supplementary Materials */}
            {paper.files?.supplementaryMaterials && paper.files.supplementaryMaterials.length > 0 && (
              <div>
                <span className="font-medium text-gray-900">
                  Supplementary Materials ({paper.files.supplementaryMaterials.length})
                </span>
                <div className="mt-1 space-y-1">
                  {paper.files.supplementaryMaterials.map((file, index) => (
                    <div key={index} className="text-sm text-gray-600 ml-4">
                      • {file.originalName} ({formatFileSize(file.size)})
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Figures */}
            {paper.files?.figures && paper.files.figures.length > 0 && (
              <div>
                <span className="font-medium text-gray-900">
                  Figures ({paper.files.figures.length})
                </span>
                <div className="mt-1 space-y-1">
                  {paper.files.figures
                    .sort((a, b) => a.order - b.order)
                    .map((file, index) => (
                      <div key={index} className="text-sm text-gray-600 ml-4">
                        • Figure {file.order}: {file.originalName} ({formatFileSize(file.size)})
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviewer Suggestions */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Reviewer Preferences (Optional)</h3>
        
        {/* Suggested Reviewers */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Suggested Reviewers</h4>
          <p className="text-sm text-gray-600 mb-4">
            Suggest experts in your field who could review your paper. Please ensure they don't have conflicts of interest.
          </p>
          
          {suggestedReviewers.length > 0 && (
            <div className="space-y-3 mb-4">
              {suggestedReviewers.map((reviewer, index) => (
                <div key={index} className="bg-white border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{reviewer.name}</div>
                      <div className="text-sm text-gray-600">{reviewer.email}</div>
                      {reviewer.affiliation && (
                        <div className="text-sm text-gray-600">{reviewer.affiliation}</div>
                      )}
                      {reviewer.expertise && (
                        <div className="text-sm text-gray-500 mt-1">
                          Expertise: {reviewer.expertise}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveSuggestedReviewer(index)}
                      className="text-red-600 hover:text-red-800 ml-4"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newSuggestedReviewer.name}
                  onChange={(e) => setNewSuggestedReviewer(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Dr. Jane Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newSuggestedReviewer.email}
                  onChange={(e) => setNewSuggestedReviewer(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="jane.smith@university.edu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Affiliation
                </label>
                <input
                  type="text"
                  value={newSuggestedReviewer.affiliation}
                  onChange={(e) => setNewSuggestedReviewer(prev => ({ ...prev, affiliation: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Stanford University"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expertise
                </label>
                <input
                  type="text"
                  value={newSuggestedReviewer.expertise}
                  onChange={(e) => setNewSuggestedReviewer(prev => ({ ...prev, expertise: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Machine Learning, Computer Vision"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleAddSuggestedReviewer}
                disabled={!newSuggestedReviewer.name || !newSuggestedReviewer.email}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Add Reviewer
              </button>
            </div>
          </div>
        </div>

        {/* Excluded Reviewers */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Excluded Reviewers</h4>
          <p className="text-sm text-gray-600 mb-4">
            List any potential reviewers who should be excluded due to conflicts of interest.
          </p>
          
          {excludedReviewers.length > 0 && (
            <div className="space-y-3 mb-4">
              {excludedReviewers.map((reviewer, index) => (
                <div key={index} className="bg-white border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{reviewer.name}</div>
                      {reviewer.email && (
                        <div className="text-sm text-gray-600">{reviewer.email}</div>
                      )}
                      <div className="text-sm text-gray-500 mt-1">
                        Reason: {reviewer.reason}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveExcludedReviewer(index)}
                      className="text-red-600 hover:text-red-800 ml-4"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newExcludedReviewer.name}
                  onChange={(e) => setNewExcludedReviewer(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Dr. John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={newExcludedReviewer.email}
                  onChange={(e) => setNewExcludedReviewer(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="john.doe@institution.edu"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Exclusion
                </label>
                <input
                  type="text"
                  value={newExcludedReviewer.reason}
                  onChange={(e) => setNewExcludedReviewer(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Former colleague, potential conflict of interest"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleAddExcludedReviewer}
                disabled={!newExcludedReviewer.name || !newExcludedReviewer.reason}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Add Excluded Reviewer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start">
          <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-amber-800 mb-1">Before Submitting</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Review all information carefully as changes after submission are limited</li>
              <li>• Ensure all files are correct and properly formatted</li>
              <li>• Verify author information and contributions are accurate</li>
              <li>• Check that suggested/excluded reviewers are appropriate</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          onClick={handleComplete}
          disabled={saving}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors flex items-center"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            'Save & Continue'
          )}
        </button>
      </div>
    </div>
  );
};

// Static validation function for the wizard
ReviewStep.validate = (paper) => {
  // This step is always valid as it's just a review
  return true;
};

export default ReviewStep;