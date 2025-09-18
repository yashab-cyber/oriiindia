import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  TrashIcon, 
  UserIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  ClipboardDocumentListIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';

const authorRoles = [
  { value: 'primary_author', label: 'Primary Author', description: 'Lead researcher and writer' },
  { value: 'co_author', label: 'Co-Author', description: 'Contributing researcher' },
  { value: 'corresponding_author', label: 'Corresponding Author', description: 'Primary contact for correspondence' },
  { value: 'supervisor', label: 'Supervisor', description: 'Research supervisor or advisor' }
];

const AuthorsStep = ({ paper, updatePaper, onComplete, errors, saving }) => {
  const [authors, setAuthors] = useState([]);
  const [newAuthor, setNewAuthor] = useState({
    email: '',
    order: 1,
    role: 'co_author',
    affiliation: '',
    contribution: '',
    isCorresponding: false
  });
  const [isAddingAuthor, setIsAddingAuthor] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [searchingUser, setSearchingUser] = useState(false);

  useEffect(() => {
    if (paper && paper.authors) {
      setAuthors(paper.authors);
      setNewAuthor(prev => ({ ...prev, order: paper.authors.length + 1 }));
    }
  }, [paper]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddAuthor = async () => {
    setValidationErrors({});

    // Validation
    const errors = {};
    if (!newAuthor.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(newAuthor.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!newAuthor.affiliation.trim()) {
      errors.affiliation = 'Affiliation is required';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Check if author already exists
    const existingAuthor = authors.find(author => 
      author.user?.email === newAuthor.email || 
      author.email === newAuthor.email
    );

    if (existingAuthor) {
      toast.error('This author is already added to the paper');
      return;
    }

    try {
      setIsAddingAuthor(true);

      const response = await fetch(`/api/papers/${paper._id}/authors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          email: newAuthor.email,
          order: newAuthor.order,
          role: newAuthor.role,
          affiliation: newAuthor.affiliation,
          contribution: newAuthor.contribution
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAuthors(data.data.authors);
        updatePaper({ authors: data.data.authors });
        
        // Reset form
        setNewAuthor({
          email: '',
          order: data.data.authors.length + 1,
          role: 'co_author',
          affiliation: '',
          contribution: '',
          isCorresponding: false
        });

        toast.success('Author added successfully');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to add author');
      }
    } catch (error) {
      console.error('Error adding author:', error);
      toast.error('Failed to add author');
    } finally {
      setIsAddingAuthor(false);
    }
  };

  const handleRemoveAuthor = async (authorId) => {
    const authorToRemove = authors.find(author => author._id === authorId);
    
    if (authorToRemove && authorToRemove.role === 'primary_author') {
      toast.error('Cannot remove the primary author');
      return;
    }

    try {
      const response = await fetch(`/api/papers/${paper._id}/authors/${authorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAuthors(data.data.authors);
        updatePaper({ authors: data.data.authors });
        toast.success('Author removed successfully');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to remove author');
      }
    } catch (error) {
      console.error('Error removing author:', error);
      toast.error('Failed to remove author');
    }
  };

  const handleUpdateAuthorOrder = (authorId, newOrder) => {
    const updatedAuthors = authors.map(author => 
      author._id === authorId ? { ...author, order: newOrder } : author
    );
    
    // Sort by order
    updatedAuthors.sort((a, b) => a.order - b.order);
    
    setAuthors(updatedAuthors);
    updatePaper({ authors: updatedAuthors });
  };

  const handleSetCorresponding = (authorId) => {
    const updatedAuthors = authors.map(author => ({
      ...author,
      isCorresponding: author._id === authorId
    }));
    
    setAuthors(updatedAuthors);
    updatePaper({ authors: updatedAuthors });
  };

  const handleComplete = async (e) => {
    e.preventDefault();

    if (authors.length === 0) {
      toast.error('At least one author is required');
      return;
    }

    // Check if there's a corresponding author
    const hasCorrespondingAuthor = authors.some(author => author.isCorresponding);
    if (!hasCorrespondingAuthor) {
      toast.error('Please designate a corresponding author');
      return;
    }

    try {
      await onComplete({ authors });
    } catch (error) {
      console.error('Error completing authors step:', error);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'primary_author':
        return 'bg-purple-100 text-purple-800';
      case 'corresponding_author':
        return 'bg-green-100 text-green-800';
      case 'supervisor':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'primary_author':
        return '👑';
      case 'corresponding_author':
        return '📧';
      case 'supervisor':
        return '🎓';
      default:
        return '👤';
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Authors */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Current Authors</h3>
        
        {authors.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No authors added yet</p>
            <p className="text-sm text-gray-400">Add authors to continue with the submission</p>
          </div>
        ) : (
          <div className="space-y-4">
            {authors
              .sort((a, b) => a.order - b.order)
              .map((author, index) => (
                <div
                  key={author._id || index}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getRoleIcon(author.role)}</span>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {author.user ? 
                                `${author.user.firstName} ${author.user.lastName}` : 
                                author.email
                              }
                            </h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(author.role)}`}>
                                {authorRoles.find(r => r.value === author.role)?.label || author.role}
                              </span>
                              {author.isCorresponding && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <StarIconSolid className="w-3 h-3 mr-1" />
                                  Corresponding
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <EnvelopeIcon className="w-4 h-4 mr-2" />
                          {author.user?.email || author.email}
                        </div>
                        {author.affiliation && (
                          <div className="flex items-center text-sm text-gray-600">
                            <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                            {author.affiliation}
                          </div>
                        )}
                      </div>

                      {author.contribution && (
                        <div className="mt-3">
                          <div className="flex items-start text-sm text-gray-600">
                            <ClipboardDocumentListIcon className="w-4 h-4 mr-2 mt-0.5" />
                            <span>{author.contribution}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-4 mt-4">
                        <div className="flex items-center space-x-2">
                          <label className="text-sm text-gray-600">Order:</label>
                          <select
                            value={author.order}
                            onChange={(e) => handleUpdateAuthorOrder(author._id, parseInt(e.target.value))}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            {Array.from({ length: authors.length }, (_, i) => i + 1).map(num => (
                              <option key={num} value={num}>{num}</option>
                            ))}
                          </select>
                        </div>

                        {author.role !== 'corresponding_author' && (
                          <button
                            onClick={() => handleSetCorresponding(author._id)}
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            <StarIcon className="w-4 h-4 mr-1" />
                            Set as Corresponding
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="ml-4">
                      {author.role !== 'primary_author' && (
                        <button
                          onClick={() => handleRemoveAuthor(author._id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Remove author"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Add New Author */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add Author</h3>
        
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                value={newAuthor.email}
                onChange={(e) => setNewAuthor(prev => ({ ...prev, email: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  validationErrors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="colleague@university.edu"
              />
              {validationErrors.email && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <select
                id="role"
                value={newAuthor.role}
                onChange={(e) => setNewAuthor(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                {authorRoles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="affiliation" className="block text-sm font-medium text-gray-700 mb-2">
                Affiliation *
              </label>
              <input
                type="text"
                id="affiliation"
                value={newAuthor.affiliation}
                onChange={(e) => setNewAuthor(prev => ({ ...prev, affiliation: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  validationErrors.affiliation ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="University or Institution"
              />
              {validationErrors.affiliation && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.affiliation}</p>
              )}
            </div>

            <div>
              <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
                Author Order
              </label>
              <select
                id="order"
                value={newAuthor.order}
                onChange={(e) => setNewAuthor(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                {Array.from({ length: authors.length + 1 }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="contribution" className="block text-sm font-medium text-gray-700 mb-2">
              Contribution (Optional)
            </label>
            <textarea
              id="contribution"
              value={newAuthor.contribution}
              onChange={(e) => setNewAuthor(prev => ({ ...prev, contribution: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Describe this author's contribution to the research..."
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {newAuthor.contribution.length}/500 characters
            </p>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={handleAddAuthor}
              disabled={isAddingAuthor}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
            >
              {isAddingAuthor ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                <>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Author
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Information Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Author Guidelines</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• All authors must have contributed significantly to the research</li>
          <li>• The corresponding author will receive all communications about the paper</li>
          <li>• Author order reflects the level of contribution to the work</li>
          <li>• You can invite collaborators who aren't registered on the platform</li>
        </ul>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          onClick={handleComplete}
          disabled={saving || authors.length === 0}
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
AuthorsStep.validate = (paper) => {
  if (!paper || !paper.authors || paper.authors.length === 0) return false;
  
  // Check if there's a corresponding author
  const hasCorrespondingAuthor = paper.authors.some(author => author.isCorresponding);
  return hasCorrespondingAuthor;
};

export default AuthorsStep;