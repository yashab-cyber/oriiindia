import React, { useState } from 'react';
import { 
  PaperAirplaneIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const SubmitStep = ({ paper, updatePaper, onComplete, errors, saving }) => {
  const [submitting, setSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agreed) {
      toast.error('Please agree to the submission terms and conditions');
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`/api/papers/${paper._id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          suggestedReviewers: paper.settings?.suggestedReviewers || [],
          excludedReviewers: paper.settings?.excludedReviewers || [],
          coverLetter: coverLetter.trim() || undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        updatePaper(data.data.paper);
        
        toast.success('Paper submitted successfully!');
        
        // Navigate to the paper details page or dashboard
        setTimeout(() => {
          navigate(`/dashboard/papers/${paper._id}`);
        }, 2000);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const submissionChecklist = [
    {
      id: 'basic_info',
      label: 'Basic information completed',
      completed: paper.submissionProgress?.step1_basic_info?.completed,
      description: 'Title, abstract, keywords, and research classification'
    },
    {
      id: 'authors',
      label: 'Authors information completed',
      completed: paper.submissionProgress?.step2_authors?.completed,
      description: 'All authors added with proper roles and affiliations'
    },
    {
      id: 'manuscript',
      label: 'Manuscript uploaded',
      completed: paper.submissionProgress?.step3_manuscript?.completed,
      description: 'Primary manuscript file and any supporting materials'
    },
    {
      id: 'corresponding_author',
      label: 'Corresponding author designated',
      completed: paper.authors?.some(author => author.isCorresponding),
      description: 'One author marked as the primary contact'
    },
    {
      id: 'file_formats',
      label: 'Files in correct format',
      completed: paper.files?.manuscript?.mimeType?.includes('pdf') || 
                 paper.files?.manuscript?.mimeType?.includes('word'),
      description: 'Manuscript in PDF, DOC, or DOCX format'
    }
  ];

  const allRequirementsMet = submissionChecklist.every(item => item.completed);

  return (
    <div className="space-y-8">
      {/* Submission Checklist */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
          <ClipboardDocumentCheckIcon className="w-5 h-5 mr-2 text-blue-500" />
          Submission Checklist
        </h3>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="space-y-4">
            {submissionChecklist.map((item) => (
              <div key={item.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {item.completed ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${item.completed ? 'text-green-900' : 'text-yellow-900'}`}>
                    {item.label}
                  </div>
                  <div className="text-sm text-gray-600">
                    {item.description}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {allRequirementsMet ? (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
                <span className="text-green-800 font-medium">
                  All requirements met! Your paper is ready for submission.
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-3" />
                <span className="text-yellow-800 font-medium">
                  Please complete all requirements before submitting.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cover Letter (Optional) */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Cover Letter (Optional)</h3>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-2">
            Message to Editors
          </label>
          <textarea
            id="coverLetter"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Dear Editors,

Please consider our manuscript for publication. This research contributes to the field by...

Thank you for your consideration.

Best regards,
[Your name]"
            maxLength={2000}
          />
          <div className="flex justify-between mt-2">
            <p className="text-xs text-gray-500">
              Optional message to accompany your submission
            </p>
            <span className="text-xs text-gray-500">
              {coverLetter.length}/2000 characters
            </span>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Terms and Conditions</h3>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="space-y-4 text-sm text-gray-700">
            <h4 className="font-medium text-gray-900">By submitting this paper, you confirm that:</h4>
            <ul className="space-y-2 pl-4">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>This work is original and has not been published elsewhere</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>All authors have contributed significantly to the research and agree to the submission</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>The work complies with ethical standards and has appropriate approvals</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>You have the right to grant publication rights for this work</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>All data and materials are accurate and properly cited</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>You understand the peer review process may require revisions</span>
              </li>
            </ul>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Review Process</h4>
              <p className="text-blue-800 text-sm">
                Your submission will undergo peer review by experts in your field. 
                You will receive notifications about the review progress and any 
                required revisions. The typical review process takes 2-8 weeks 
                depending on the complexity of your research.
              </p>
            </div>

            <div className="mt-4">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="font-medium text-gray-900">
                  I agree to the terms and conditions and confirm the accuracy of all information provided.
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">Ready to Submit</h3>
        <div className="text-blue-800 space-y-2">
          <p className="font-medium">Paper: {paper.title}</p>
          <p>Submission ID: {paper.submissionId}</p>
          <p>Authors: {paper.authors?.length} author(s)</p>
          <p>Files: Manuscript + {(paper.files?.supplementaryMaterials?.length || 0) + (paper.files?.figures?.length || 0)} supporting files</p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-4 h-4 mr-2 text-amber-500" />
            <span>Submission cannot be edited after this step</span>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!allRequirementsMet || !agreed || submitting}
          className="flex items-center px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Submitting...
            </>
          ) : (
            <>
              <PaperAirplaneIcon className="w-5 h-5 mr-3" />
              Submit Paper for Review
            </>
          )}
        </button>
      </div>

      {/* Success Message */}
      {paper.status === 'submitted' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Submission Successful!
            </h3>
            <p className="text-gray-600 mb-4">
              Your paper has been submitted for review. You will receive email 
              notifications about the review progress.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Submission ID: <span className="font-mono">{paper.submissionId}</span>
            </p>
            <button
              onClick={() => navigate(`/dashboard/papers/${paper._id}`)}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              View Submission
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Static validation function for the wizard
SubmitStep.validate = (paper) => {
  return !!(
    paper?.submissionProgress?.step1_basic_info?.completed &&
    paper?.submissionProgress?.step2_authors?.completed &&
    paper?.submissionProgress?.step3_manuscript?.completed &&
    paper?.authors?.some(author => author.isCorresponding)
  );
};

export default SubmitStep;