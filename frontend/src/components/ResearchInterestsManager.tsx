'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ResearchInterestsManagerProps {
  initialInterests?: string[];
  onChange: (interests: string[]) => void;
  maxInterests?: number;
}

const SUGGESTED_INTERESTS = [
  'Artificial Intelligence',
  'Machine Learning',
  'Deep Learning',
  'Natural Language Processing',
  'Computer Vision',
  'Data Science',
  'Big Data',
  'Cloud Computing',
  'Cybersecurity',
  'Blockchain',
  'Internet of Things',
  'Robotics',
  'Quantum Computing',
  'Bioinformatics',
  'Software Engineering',
  'Human-Computer Interaction',
  'Database Systems',
  'Distributed Systems',
  'Network Security',
  'Mobile Computing',
  'Web Development',
  'DevOps',
  'Augmented Reality',
  'Virtual Reality',
  'Neural Networks',
  'Algorithms',
  'Data Mining',
  'Information Retrieval',
  'Social Network Analysis',
  'Computational Biology'
];

const ResearchInterestsManager: React.FC<ResearchInterestsManagerProps> = ({
  initialInterests = [],
  onChange,
  maxInterests = 10
}) => {
  const [interests, setInterests] = useState<string[]>(initialInterests);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInterests(initialInterests);
  }, [initialInterests]);

  useEffect(() => {
    onChange(interests);
  }, [interests, onChange]);

  useEffect(() => {
    if (inputValue.length > 1) {
      const filtered = SUGGESTED_INTERESTS.filter(
        interest =>
          interest.toLowerCase().includes(inputValue.toLowerCase()) &&
          !interests.includes(interest)
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setActiveSuggestionIndex(-1);
  }, [inputValue, interests]);

  const addInterest = (interest: string) => {
    const trimmedInterest = interest.trim();
    if (
      trimmedInterest &&
      !interests.includes(trimmedInterest) &&
      interests.length < maxInterests
    ) {
      setInterests([...interests, trimmedInterest]);
      setInputValue('');
      setShowSuggestions(false);
      inputRef.current?.focus();
    }
  };

  const removeInterest = (indexToRemove: number) => {
    setInterests(interests.filter((_, index) => index !== indexToRemove));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
        addInterest(suggestions[activeSuggestionIndex]);
      } else if (inputValue.trim()) {
        addInterest(inputValue);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex(
        activeSuggestionIndex < suggestions.length - 1 ? activeSuggestionIndex + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex(
        activeSuggestionIndex > 0 ? activeSuggestionIndex - 1 : suggestions.length - 1
      );
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
    } else if (e.key === 'Backspace' && inputValue === '' && interests.length > 0) {
      removeInterest(interests.length - 1);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    addInterest(suggestion);
  };

  const getPopularSuggestions = () => {
    return SUGGESTED_INTERESTS.filter(interest => !interests.includes(interest)).slice(0, 8);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Research Interests ({interests.length}/{maxInterests})
        </label>
        
        {/* Selected Interests */}
        <div className="flex flex-wrap gap-2 mb-3 min-h-[2.5rem] p-2 border border-gray-300 rounded-md bg-gray-50">
          {interests.map((interest, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
            >
              {interest}
              <button
                type="button"
                onClick={() => removeInterest(index)}
                className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-600 hover:bg-blue-200 hover:text-blue-800 focus:outline-none focus:bg-blue-200"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </span>
          ))}
          
          {interests.length === 0 && (
            <span className="text-gray-400 italic">No research interests added yet</span>
          )}
        </div>

        {/* Input Field */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            onFocus={() => inputValue.length > 1 && setShowSuggestions(true)}
            placeholder={
              interests.length < maxInterests
                ? "Type to add research interests..."
                : `Maximum ${maxInterests} interests reached`
            }
            disabled={interests.length >= maxInterests}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          
          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
                    index === activeSuggestionIndex ? 'bg-blue-50 text-blue-800' : 'text-gray-700'
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="mt-1 text-sm text-gray-500">
          Type to search or add custom research interests. Press Enter to add.
        </p>
      </div>

      {/* Popular Suggestions */}
      {interests.length < maxInterests && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Popular Research Areas:</h4>
          <div className="flex flex-wrap gap-2">
            {getPopularSuggestions().map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addInterest(suggestion)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {interests.length > 0 && (
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setInterests([])}
            className="text-sm text-red-600 hover:text-red-800 focus:outline-none"
          >
            Clear All
          </button>
          <span className="text-sm text-gray-500">
            {interests.length} of {maxInterests} interests added
          </span>
        </div>
      )}
    </div>
  );
};

export default ResearchInterestsManager;