import React, { useState, useEffect } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const researchFields = [
  { value: 'computer_science', label: 'Computer Science' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'physics', label: 'Physics' },
  { value: 'chemistry', label: 'Chemistry' },
  { value: 'biology', label: 'Biology' },
  { value: 'medicine', label: 'Medicine' },
  { value: 'social_sciences', label: 'Social Sciences' },
  { value: 'economics', label: 'Economics' },
  { value: 'psychology', label: 'Psychology' },
  { value: 'education', label: 'Education' },
  { value: 'environmental_science', label: 'Environmental Science' },
  { value: 'other', label: 'Other' }
];

const researchTypes = [
  { value: 'original_research', label: 'Original Research' },
  { value: 'review_article', label: 'Review Article' },
  { value: 'case_study', label: 'Case Study' },
  { value: 'technical_note', label: 'Technical Note' },
  { value: 'survey', label: 'Survey' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'position_paper', label: 'Position Paper' },
  { value: 'short_communication', label: 'Short Communication' }
];

const methodologies = [
  { value: 'experimental', label: 'Experimental' },
  { value: 'theoretical', label: 'Theoretical' },
  { value: 'computational', label: 'Computational' },
  { value: 'observational', label: 'Observational' },
  { value: 'mixed_methods', label: 'Mixed Methods' },
  { value: 'qualitative', label: 'Qualitative' },
  { value: 'quantitative', label: 'Quantitative' },
  { value: 'systematic_review', label: 'Systematic Review' },
  { value: 'meta_analysis', label: 'Meta Analysis' }
];

const BasicInfoStep = ({ paper, updatePaper, onComplete, errors, saving }) => {
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    keywords: [],
    field: '',
    subfield: '',
    researchType: '',
    methodology: ''
  });
  const [keywordInput, setKeywordInput] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (paper) {
      setFormData({
        title: paper.title || '',
        abstract: paper.abstract || '',
        keywords: paper.keywords || [],
        field: paper.field || '',
        subfield: paper.subfield || '',
        researchType: paper.researchType || '',
        methodology: paper.methodology || ''
      });
    }
  }, [paper]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }

    // Update parent component
    updatePaper({ [field]: value });
  };

  const handleAddKeyword = () => {
    const keyword = keywordInput.trim();
    if (keyword && !formData.keywords.includes(keyword)) {
      const newKeywords = [...formData.keywords, keyword];
      setFormData(prev => ({ ...prev, keywords: newKeywords }));
      updatePaper({ keywords: newKeywords });
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (index) => {
    const newKeywords = formData.keywords.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, keywords: newKeywords }));
    updatePaper({ keywords: newKeywords });
  };

  const handleKeywordKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.length > 300) {
      errors.title = 'Title cannot exceed 300 characters';
    }

    if (!formData.abstract.trim()) {
      errors.abstract = 'Abstract is required';
    } else if (formData.abstract.length > 3000) {
      errors.abstract = 'Abstract cannot exceed 3000 characters';
    }

    if (formData.keywords.length === 0) {
      errors.keywords = 'At least one keyword is required';
    } else if (formData.keywords.length > 10) {
      errors.keywords = 'Maximum 10 keywords allowed';
    }

    if (!formData.field) {
      errors.field = 'Research field is required';
    }

    if (!formData.researchType) {
      errors.researchType = 'Research type is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    try {
      await onComplete(formData);
    } catch (error) {
      console.error('Error submitting basic info:', error);
    }
  };

  const getCharacterCount = (text, limit) => {
    const count = text.length;
    const color = count > limit * 0.9 ? 'text-red-500' : count > limit * 0.7 ? 'text-yellow-500' : 'text-gray-500';
    return <span className={`text-xs ${color}`}>{count}/{limit}</span>;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-800 mb-1">Before You Start</h3>
            <p className="text-sm text-blue-700">
              Please ensure you have your research paper ready with a clear title, comprehensive abstract, 
              and relevant keywords. This information will help reviewers understand your work and ensure 
              proper categorization.
            </p>
          </div>
        </div>
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Paper Title *
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            validationErrors.title || errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter your paper title..."
          maxLength={300}
        />
        <div className="flex justify-between mt-1">
          {(validationErrors.title || errors.title) && (
            <p className="text-sm text-red-600">{validationErrors.title || errors.title}</p>
          )}
          <div className="ml-auto">
            {getCharacterCount(formData.title, 300)}
          </div>
        </div>
      </div>

      {/* Abstract */}
      <div>
        <label htmlFor="abstract" className="block text-sm font-medium text-gray-700 mb-2">
          Abstract *
        </label>
        <textarea
          id="abstract"
          value={formData.abstract}
          onChange={(e) => handleInputChange('abstract', e.target.value)}
          rows={8}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            validationErrors.abstract || errors.abstract ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Provide a comprehensive abstract of your research..."
          maxLength={3000}
        />
        <div className="flex justify-between mt-1">
          {(validationErrors.abstract || errors.abstract) && (
            <p className="text-sm text-red-600">{validationErrors.abstract || errors.abstract}</p>
          )}
          <div className="ml-auto">
            {getCharacterCount(formData.abstract, 3000)}
          </div>
        </div>
      </div>

      {/* Keywords */}
      <div>
        <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-2">
          Keywords * (3-10 keywords recommended)
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.keywords.map((keyword, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              {keyword}
              <button
                type="button"
                onClick={() => handleRemoveKeyword(index)}
                className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            id="keywords"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyPress={handleKeywordKeyPress}
            className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              validationErrors.keywords || errors.keywords ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Type a keyword and press Enter..."
            maxLength={100}
          />
          <button
            type="button"
            onClick={handleAddKeyword}
            disabled={!keywordInput.trim() || formData.keywords.length >= 10}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
        </div>
        {(validationErrors.keywords || errors.keywords) && (
          <p className="text-sm text-red-600 mt-1">{validationErrors.keywords || errors.keywords}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Keywords help categorize your paper and make it discoverable. Use specific terms that describe your research.
        </p>
      </div>

      {/* Research Field */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="field" className="block text-sm font-medium text-gray-700 mb-2">
            Research Field *
          </label>
          <select
            id="field"
            value={formData.field}
            onChange={(e) => handleInputChange('field', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              validationErrors.field || errors.field ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select a field...</option>
            {researchFields.map(field => (
              <option key={field.value} value={field.value}>
                {field.label}
              </option>
            ))}
          </select>
          {(validationErrors.field || errors.field) && (
            <p className="text-sm text-red-600 mt-1">{validationErrors.field || errors.field}</p>
          )}
        </div>

        <div>
          <label htmlFor="subfield" className="block text-sm font-medium text-gray-700 mb-2">
            Subfield (Optional)
          </label>
          <input
            type="text"
            id="subfield"
            value={formData.subfield}
            onChange={(e) => handleInputChange('subfield', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="e.g., Machine Learning, Organic Chemistry..."
            maxLength={100}
          />
        </div>
      </div>

      {/* Research Type and Methodology */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="researchType" className="block text-sm font-medium text-gray-700 mb-2">
            Research Type *
          </label>
          <select
            id="researchType"
            value={formData.researchType}
            onChange={(e) => handleInputChange('researchType', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              validationErrors.researchType || errors.researchType ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select research type...</option>
            {researchTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {(validationErrors.researchType || errors.researchType) && (
            <p className="text-sm text-red-600 mt-1">{validationErrors.researchType || errors.researchType}</p>
          )}
        </div>

        <div>
          <label htmlFor="methodology" className="block text-sm font-medium text-gray-700 mb-2">
            Methodology (Optional)
          </label>
          <select
            id="methodology"
            value={formData.methodology}
            onChange={(e) => handleInputChange('methodology', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">Select methodology...</option>
            {methodologies.map(method => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          type="submit"
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
    </form>
  );
};

// Static validation function for the wizard
BasicInfoStep.validate = (paper) => {
  if (!paper) return false;
  return !!(
    paper.title?.trim() &&
    paper.abstract?.trim() &&
    paper.keywords?.length > 0 &&
    paper.field &&
    paper.researchType
  );
};

export default BasicInfoStep;