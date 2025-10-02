'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, FileText, Users, ArrowLeft, Plus, X } from 'lucide-react';
import { getApiUrl } from '@/lib/config';
import toast from 'react-hot-toast';

interface EmailTemplate {
  _id: string;
  name: string;
  subject: string;
  htmlContent: string;
  category: string;
  variables: Array<{
    name: string;
    description: string;
    type: string;
    required: boolean;
    defaultValue: string;
  }>;
  isActive: boolean;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isApproved: boolean;
}

const SendEmailPage = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [customEmail, setCustomEmail] = useState('');
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  const [emailMode, setEmailMode] = useState<'template' | 'custom'>('template');
  const [customSubject, setCustomSubject] = useState('');
  const [customContent, setCustomContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
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
      
      fetchData();
    };

    checkAdminAccess();
  }, [router]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [templatesRes, usersRes] = await Promise.all([
        fetch(getApiUrl('/admin/email/templates'), {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(getApiUrl('/admin/email/users'), {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (templatesRes.ok) {
        const templatesData = await templatesRes.json();
        setTemplates(templatesData.data.templates);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.data.users);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    
    // Initialize template variables with default values
    const initialVariables: Record<string, string> = {};
    template.variables.forEach(variable => {
      initialVariables[variable.name] = variable.defaultValue || '';
    });
    setTemplateVariables(initialVariables);
  };

  const handleVariableChange = (variableName: string, value: string) => {
    setTemplateVariables(prev => ({
      ...prev,
      [variableName]: value
    }));
  };

  const handleUserSelect = (user: User) => {
    if (selectedUsers.find(u => u._id === user._id)) {
      setSelectedUsers(prev => prev.filter(u => u._id !== user._id));
    } else {
      setSelectedUsers(prev => [...prev, user]);
    }
  };

  const addCustomEmail = () => {
    if (customEmail && customEmail.includes('@')) {
      const customUser: User = {
        _id: `custom_${Date.now()}`,
        firstName: '',
        lastName: '',
        email: customEmail,
        role: 'external',
        isApproved: true
      };
      setSelectedUsers(prev => [...prev, customUser]);
      setCustomEmail('');
    } else {
      toast.error('Please enter a valid email address');
    }
  };

  const removeSelectedUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u._id !== userId));
  };

  const validateTemplateVariables = () => {
    if (!selectedTemplate) return true;
    
    const missingRequired = selectedTemplate.variables
      .filter(v => v.required && !templateVariables[v.name])
      .map(v => v.name);
    
    if (missingRequired.length > 0) {
      toast.error(`Missing required variables: ${missingRequired.join(', ')}`);
      return false;
    }
    
    return true;
  };

  const handleSendEmail = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }

    if (emailMode === 'template') {
      if (!selectedTemplate) {
        toast.error('Please select a template');
        return;
      }
      
      if (!validateTemplateVariables()) {
        return;
      }
    } else {
      if (!customSubject.trim() || !customContent.trim()) {
        toast.error('Please fill in subject and content');
        return;
      }
    }

    setIsSending(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (selectedUsers.length === 1) {
        // Single email
        const endpoint = emailMode === 'template' ? '/admin/email/send/template' : '/admin/email/send/custom';
        const payload = emailMode === 'template' ? {
          templateId: selectedTemplate!._id,
          recipientEmail: selectedUsers[0].email,
          variables: templateVariables
        } : {
          to: selectedUsers[0].email,
          subject: customSubject,
          html: customContent
        };

        const response = await fetch(getApiUrl(endpoint), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          toast.success('Email sent successfully!');
        } else {
          throw new Error('Failed to send email');
        }
      } else {
        // Bulk email
        if (emailMode !== 'template') {
          toast.error('Bulk emails must use templates');
          return;
        }

        const recipients = selectedUsers.map(user => ({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim() || user.email,
          userId: user._id.startsWith('custom_') ? null : user._id,
          variables: {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            ...templateVariables
          }
        }));

        const response = await fetch(getApiUrl('/admin/email/send/bulk'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            templateId: selectedTemplate!._id,
            recipients,
            variables: templateVariables,
            campaignName: `Bulk Email - ${selectedTemplate!.name} - ${new Date().toLocaleDateString()}`
          })
        });

        if (response.ok) {
          const result = await response.json();
          toast.success(`Bulk email initiated! ${result.data.successCount} emails queued for sending.`);
        } else {
          throw new Error('Failed to send bulk email');
        }
      }

      // Reset form
      setSelectedUsers([]);
      setSelectedTemplate(null);
      setTemplateVariables({});
      setCustomSubject('');
      setCustomContent('');
      
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  const filteredUsers = users.filter(user => 
    `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/email')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Email Dashboard
              </button>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Send Email</h1>
          <p className="text-gray-600 mt-2">Send emails to users using templates or custom content</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Email Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Email Mode Selection */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Type</h3>
              <div className="flex space-x-4">
                <button
                  onClick={() => setEmailMode('template')}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium ${
                    emailMode === 'template'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Template Email
                </button>
                <button
                  onClick={() => setEmailMode('custom')}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium ${
                    emailMode === 'custom'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Custom Email
                </button>
              </div>
            </div>

            {/* Template Selection */}
            {emailMode === 'template' && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Template</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map(template => (
                    <div
                      key={template._id}
                      onClick={() => handleTemplateSelect(template)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedTemplate?._id === template._id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h4 className="font-semibold text-gray-900">{template.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{template.subject}</p>
                      <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded mt-2">
                        {template.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Template Variables */}
            {emailMode === 'template' && selectedTemplate && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Variables</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedTemplate.variables.map(variable => (
                    <div key={variable.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {variable.description}
                        {variable.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <input
                        type={variable.type === 'email' ? 'email' : variable.type === 'url' ? 'url' : 'text'}
                        value={templateVariables[variable.name] || ''}
                        onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                        placeholder={variable.defaultValue}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Email Content */}
            {emailMode === 'custom' && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Content</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject *
                    </label>
                    <input
                      type="text"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      placeholder="Email subject"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      HTML Content *
                    </label>
                    <textarea
                      value={customContent}
                      onChange={(e) => setCustomContent(e.target.value)}
                      placeholder="Email HTML content"
                      rows={12}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recipients Panel */}
          <div className="space-y-6">
            {/* User Selection */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Recipients</h3>
              
              {/* Search Users */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Custom Email Input */}
              <div className="mb-4">
                <div className="flex space-x-2">
                  <input
                    type="email"
                    placeholder="Enter custom email..."
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={addCustomEmail}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* User List */}
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredUsers.map(user => (
                  <div
                    key={user._id}
                    onClick={() => handleUserSelect(user)}
                    className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                      selectedUsers.find(u => u._id === user._id) ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <span className="text-xs text-gray-500">{user.role}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={!!selectedUsers.find(u => u._id === user._id)}
                        onChange={() => {}}
                        className="h-4 w-4 text-blue-600"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Recipients */}
            {selectedUsers.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Selected Recipients ({selectedUsers.length})
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedUsers.map(user => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {user.firstName} {user.lastName} {!user.firstName && !user.lastName && user.email}
                        </p>
                        {(user.firstName || user.lastName) && (
                          <p className="text-xs text-gray-600">{user.email}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeSelectedUser(user._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Send Button */}
            <div className="bg-white p-6 rounded-lg shadow">
              <button
                onClick={handleSendEmail}
                disabled={isSending || selectedUsers.length === 0}
                className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium ${
                  isSending || selectedUsers.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                <Send className="h-5 w-5 mr-2" />
                {isSending ? 'Sending...' : `Send Email${selectedUsers.length > 1 ? 's' : ''}`}
              </button>
              
              {selectedUsers.length > 1 && (
                <p className="text-sm text-gray-600 text-center mt-2">
                  This will send {selectedUsers.length} emails
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendEmailPage;