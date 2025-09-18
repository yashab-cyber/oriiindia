import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronRightIcon, 
  ChevronLeftIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CloudArrowUpIcon,
  EyeIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import BasicInfoStep from './steps/BasicInfoStep';
import AuthorsStep from './steps/AuthorsStep';
import ManuscriptStep from './steps/ManuscriptStep';
import ReviewStep from './steps/ReviewStep';
import SubmitStep from './steps/SubmitStep';

const steps = [
  {
    id: 'step1_basic_info',
    name: 'Basic Information',
    description: 'Paper title, abstract, and research details',
    icon: DocumentTextIcon,
    component: BasicInfoStep
  },
  {
    id: 'step2_authors',
    name: 'Authors',
    description: 'Add and manage paper authors',
    icon: UserGroupIcon,
    component: AuthorsStep
  },
  {
    id: 'step3_manuscript',
    name: 'Manuscript',
    description: 'Upload manuscript and supporting files',
    icon: CloudArrowUpIcon,
    component: ManuscriptStep
  },
  {
    id: 'step4_review',
    name: 'Review',
    description: 'Review submission details',
    icon: EyeIcon,
    component: ReviewStep
  },
  {
    id: 'step5_submit',
    name: 'Submit',
    description: 'Final submission and confirmation',
    icon: PaperAirplaneIcon,
    component: SubmitStep
  }
];

const PaperSubmissionWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { paperId } = useParams();

  useEffect(() => {
    if (paperId) {
      fetchPaper();
    } else {
      // Initialize new paper
      setPaper({
        title: '',
        abstract: '',
        keywords: [],
        field: '',
        subfield: '',
        researchType: '',
        methodology: '',
        authors: [],
        files: {
          manuscript: null,
          supplementaryMaterials: [],
          figures: [],
          coverLetter: null
        },
        submissionProgress: {
          step1_basic_info: { completed: false },
          step2_authors: { completed: false },
          step3_manuscript: { completed: false },
          step4_review: { completed: false },
          step5_submit: { completed: false }
        },
        settings: {
          suggestedReviewers: [],
          excludedReviewers: []
        }
      });
    }
  }, [paperId]);

  const fetchPaper = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/papers/${paperId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPaper(data.data);
        
        // Set current step based on progress
        const progress = data.data.submissionProgress;
        let stepIndex = 0;
        
        if (progress.step5_submit.completed) stepIndex = 4;
        else if (progress.step4_review.completed) stepIndex = 4;
        else if (progress.step3_manuscript.completed) stepIndex = 3;
        else if (progress.step2_authors.completed) stepIndex = 2;
        else if (progress.step1_basic_info.completed) stepIndex = 1;
        
        setCurrentStep(stepIndex);
      } else {
        toast.error('Failed to load paper');
        navigate('/dashboard/papers');
      }
    } catch (error) {
      console.error('Error fetching paper:', error);
      toast.error('Failed to load paper');
      navigate('/dashboard/papers');
    } finally {
      setLoading(false);
    }
  };

  const updatePaper = (updates) => {
    setPaper(prev => ({
      ...prev,
      ...updates
    }));
  };

  const handleStepComplete = async (stepData) => {
    try {
      setSaving(true);
      setErrors({});

      let response;

      if (currentStep === 0) {
        // Basic Information Step
        if (paperId) {
          response = await fetch(`/api/papers/${paperId}/basic-info`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(stepData)
          });
        } else {
          response = await fetch('/api/papers/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(stepData)
          });
        }
      }

      if (response && response.ok) {
        const data = await response.json();
        setPaper(data.data);
        
        if (!paperId) {
          // If this was a new paper, update URL
          window.history.replaceState(null, '', `/dashboard/papers/submit/${data.data._id}`);
        }

        toast.success(`Step ${currentStep + 1} completed successfully`);
        
        // Move to next step if not the last one
        if (currentStep < steps.length - 1) {
          setCurrentStep(currentStep + 1);
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to save step');
        setErrors(errorData.errors || {});
      }
    } catch (error) {
      console.error('Error saving step:', error);
      toast.error('Failed to save step');
    } finally {
      setSaving(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    // Validate current step before proceeding
    const currentStepComponent = steps[currentStep].component;
    if (currentStepComponent.validate && !currentStepComponent.validate(paper)) {
      toast.error('Please complete all required fields');
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const getStepStatus = (stepIndex) => {
    if (!paper) return 'pending';
    
    const stepId = steps[stepIndex].id;
    const progress = paper.submissionProgress[stepId];
    
    if (progress && progress.completed) return 'completed';
    if (stepIndex === currentStep) return 'current';
    if (stepIndex < currentStep) return 'completed';
    return 'pending';
  };

  const getStepIcon = (step, stepIndex) => {
    const status = getStepStatus(stepIndex);
    const Icon = step.icon;

    if (status === 'completed') {
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    }

    return <Icon className={`w-5 h-5 ${status === 'current' ? 'text-blue-500' : 'text-gray-400'}`} />;
  };

  const canProceedToNext = () => {
    if (!paper) return false;
    
    const stepId = steps[currentStep].id;
    return paper.submissionProgress[stepId]?.completed || false;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Paper Not Found</h2>
          <p className="text-gray-600 mb-4">The paper you're looking for could not be loaded.</p>
          <button
            onClick={() => navigate('/dashboard/papers')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go Back to Papers
          </button>
        </div>
      </div>
    );
  }

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {paperId ? 'Edit Paper Submission' : 'Submit Research Paper'}
              </h1>
              <p className="mt-2 text-gray-600">
                Complete all steps to submit your research paper for review
              </p>
              {paper.submissionId && (
                <p className="mt-1 text-sm text-blue-600 font-medium">
                  Submission ID: {paper.submissionId}
                </p>
              )}
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((currentStep + 1) / steps.length * 100)}%
              </div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <nav aria-label="Progress">
            <ol className="flex items-center justify-between">
              {steps.map((step, stepIndex) => {
                const status = getStepStatus(stepIndex);
                return (
                  <li key={step.name} className="relative flex-1">
                    <div className="flex items-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                          status === 'completed'
                            ? 'bg-green-500 border-green-500'
                            : status === 'current'
                            ? 'bg-blue-500 border-blue-500'
                            : 'bg-white border-gray-300'
                        }`}
                      >
                        {getStepIcon(step, stepIndex)}
                      </div>
                      <div className="ml-4 min-w-0 flex-1">
                        <div
                          className={`text-sm font-medium transition-colors ${
                            status === 'current'
                              ? 'text-blue-600'
                              : status === 'completed'
                              ? 'text-green-600'
                              : 'text-gray-500'
                          }`}
                        >
                          {step.name}
                        </div>
                        <div className="text-xs text-gray-500">{step.description}</div>
                      </div>
                    </div>
                    {stepIndex < steps.length - 1 && (
                      <div
                        className={`absolute top-5 right-0 h-0.5 w-full transition-colors ${
                          stepIndex < currentStep ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                        style={{ left: '50%', width: 'calc(100% - 2.5rem)' }}
                      />
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              {getStepIcon(steps[currentStep], currentStep)}
              <span className="ml-3">{steps[currentStep].name}</span>
            </h2>
            <p className="mt-1 text-gray-600">{steps[currentStep].description}</p>
          </div>

          <div className="p-6">
            <CurrentStepComponent
              paper={paper}
              updatePaper={updatePaper}
              onComplete={handleStepComplete}
              errors={errors}
              saving={saving}
            />
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentStep === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <ChevronLeftIcon className="w-4 h-4 mr-2" />
              Previous
            </button>

            <div className="text-center">
              <span className="text-sm text-gray-500">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>

            <button
              onClick={handleNext}
              disabled={currentStep === steps.length - 1 || !canProceedToNext()}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentStep === steps.length - 1 || !canProceedToNext()
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Next
              <ChevronRightIcon className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>

        {/* Submission Status */}
        {paper.status !== 'draft' && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-blue-500 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">
                  Paper Status: {paper.status.replace('_', ' ').toUpperCase()}
                </h3>
                <p className="text-sm text-blue-600 mt-1">
                  Your paper has been submitted and is currently {paper.status.replace('_', ' ')}.
                  You will receive notifications about any updates.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaperSubmissionWizard;