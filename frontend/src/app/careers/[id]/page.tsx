'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getApiUrl } from '@/lib/config';
import { 
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ChevronLeftIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface Job {
  _id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  salary: {
    min?: number;
    max?: number;
    currency: string;
    negotiable: boolean;
  };
  applicationDeadline: string;
  applicationsCount: number;
  postedBy: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchJob();
    }
  }, [params.id]);

  const fetchJob = async () => {
    try {
      const response = await fetch(getApiUrl(`/jobs/${params.id}`));
      if (response.ok) {
        const data = await response.json();
        setJob(data.data.job);
      } else {
        console.error('Failed to fetch job');
        router.push('/careers');
      }
    } catch (error) {
      console.error('Error fetching job:', error);
      router.push('/careers');
    } finally {
      setLoading(false);
    }
  };

  const formatSalary = (salary: Job['salary']) => {
    if (salary.negotiable) return 'Negotiable';
    if (salary.min && salary.max) {
      return `${salary.currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
    }
    if (salary.min) {
      return `${salary.currency} ${salary.min.toLocaleString()}+`;
    }
    return 'Competitive';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: 'Expired', className: 'text-red-600' };
    } else if (diffDays === 0) {
      return { text: 'Today', className: 'text-red-600' };
    } else if (diffDays === 1) {
      return { text: 'Tomorrow', className: 'text-orange-600' };
    } else if (diffDays <= 7) {
      return { text: `${diffDays} days left`, className: 'text-orange-600' };
    } else {
      return { text: `${diffDays} days left`, className: 'text-green-600' };
    }
  };

  const isApplicationDeadlinePassed = () => {
    return new Date(job?.applicationDeadline || '') < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-xl text-gray-600">Loading job details...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
            <p className="text-gray-600 mb-6">This job posting is no longer available.</p>
            <button
              onClick={() => router.push('/careers')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Back to Careers
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (applicationSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Application Submitted Successfully!
            </h2>
            <p className="text-gray-600 mb-6">
              Thank you for your interest in the {job.title} position. We have received your application 
              and will review it shortly. You will be contacted if your profile matches our requirements.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/careers')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Browse More Jobs
              </button>
              <button
                onClick={() => {
                  setApplicationSubmitted(false);
                  setShowApplicationForm(false);
                }}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                View Job Details
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const deadline = formatDate(job.applicationDeadline);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/careers')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ChevronLeftIcon className="h-5 w-5" />
          Back to Careers
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-8">
              {/* Job Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-gray-600">
                    <BuildingOfficeIcon className="h-5 w-5" />
                    <span>{job.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPinIcon className="h-5 w-5" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <ClockIcon className="h-5 w-5" />
                    <span>{job.type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <UserGroupIcon className="h-5 w-5" />
                    <span>{job.experience} Experience</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green-600 text-lg font-semibold">
                    <CurrencyDollarIcon className="h-5 w-5" />
                    <span>{formatSalary(job.salary)}</span>
                  </div>
                  <div className={`flex items-center gap-2 ${deadline.className}`}>
                    <CalendarIcon className="h-5 w-5" />
                    <span className="font-medium">{deadline.text}</span>
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed">{job.description}</p>
                </div>
              </div>

              {/* Responsibilities */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Responsibilities</h2>
                <ul className="space-y-2">
                  {job.responsibilities.map((responsibility, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-600">{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requirements */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {job.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-600">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Skills */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <span className="text-sm text-gray-500">Department:</span>
                  <p className="font-medium">{job.department}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Job Type:</span>
                  <p className="font-medium">{job.type}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Experience Level:</span>
                  <p className="font-medium">{job.experience}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Location:</span>
                  <p className="font-medium">{job.location}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Salary:</span>
                  <p className="font-medium text-green-600">{formatSalary(job.salary)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Application Deadline:</span>
                  <p className={`font-medium ${deadline.className}`}>
                    {new Date(job.applicationDeadline).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Applications:</span>
                  <p className="font-medium">{job.applicationsCount} received</p>
                </div>
              </div>

              {!isApplicationDeadlinePassed() ? (
                <button
                  onClick={() => setShowApplicationForm(true)}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Apply Now
                </button>
              ) : (
                <div className="w-full bg-red-100 text-red-800 py-3 px-4 rounded-lg text-center font-medium">
                  Application Deadline Passed
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Posted on {new Date(job.createdAt).toLocaleDateString()} by {job.postedBy.firstName} {job.postedBy.lastName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <ApplicationForm 
          job={job} 
          onClose={() => setShowApplicationForm(false)}
          onSuccess={() => {
            setApplicationSubmitted(true);
            setShowApplicationForm(false);
          }}
        />
      )}

      <Footer />
    </div>
  );
}

// Application Form Component
function ApplicationForm({ job, onClose, onSuccess }: { job: Job; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    applicant: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: 'India',
        zipCode: ''
      }
    },
    experience: {
      type: 'Fresher',
      totalYears: 0,
      workHistory: [{ company: '', position: '', duration: '', description: '' }]
    },
    education: [{ degree: '', institution: '', year: '', grade: '' }],
    skills: [''],
    communication: {
      languages: [{ language: 'English', proficiency: 'Advanced' }],
      preferredLanguage: 'English'
    },
    coverLetter: '',
    additionalInfo: {
      portfolioUrl: '',
      linkedinUrl: '',
      githubUrl: '',
      expectedSalary: {
        amount: '',
        currency: 'INR'
      },
      availableFrom: '',
      relocate: false
    }
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (path: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      
      return newData;
    });
  };

  const addArrayItem = (path: string, item: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = [...current[keys[keys.length - 1]], item];
      
      return newData;
    });
  };

  const removeArrayItem = (path: string, index: number) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = current[keys[keys.length - 1]].filter((_: any, i: number) => i !== index);
      
      return newData;
    });
  };

  const handleArrayItemChange = (path: string, index: number, value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]][index] = value;
      
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add form data
      submitData.append('data', JSON.stringify(formData));
      
      // Add resume file if selected
      if (resumeFile) {
        submitData.append('resume', resumeFile);
      }

      const response = await fetch(getApiUrl(`/jobs/${job._id}/apply`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onSuccess();
      } else {
        const errorData = await response.json();
        alert(errorData.error?.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Error submitting application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Apply for {job.title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Personal Information */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name *"
                value={formData.applicant.firstName}
                onChange={(e) => handleInputChange('applicant.firstName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <input
                type="text"
                placeholder="Last Name *"
                value={formData.applicant.lastName}
                onChange={(e) => handleInputChange('applicant.lastName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <input
                type="email"
                placeholder="Email Address *"
                value={formData.applicant.email}
                onChange={(e) => handleInputChange('applicant.email', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <input
                type="tel"
                placeholder="Phone Number *"
                value={formData.applicant.phone}
                onChange={(e) => handleInputChange('applicant.phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </section>

          {/* Experience */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={formData.experience.type}
                  onChange={(e) => handleInputChange('experience.type', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Fresher">Fresher</option>
                  <option value="Experienced">Experienced</option>
                </select>
                {formData.experience.type === 'Experienced' && (
                  <input
                    type="number"
                    placeholder="Total Years of Experience"
                    value={formData.experience.totalYears}
                    onChange={(e) => handleInputChange('experience.totalYears', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                )}
              </div>

              {formData.experience.type === 'Experienced' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Work History</h4>
                    <button
                      type="button"
                      onClick={() => addArrayItem('experience.workHistory', { company: '', position: '', duration: '', description: '' })}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Add Experience
                    </button>
                  </div>
                  {formData.experience.workHistory.map((work, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 mb-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        <input
                          type="text"
                          placeholder="Company Name"
                          value={work.company}
                          onChange={(e) => handleArrayItemChange('experience.workHistory', index, { ...work, company: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          placeholder="Position"
                          value={work.position}
                          onChange={(e) => handleArrayItemChange('experience.workHistory', index, { ...work, position: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Duration (e.g., Jan 2020 - Dec 2022)"
                        value={work.duration}
                        onChange={(e) => handleArrayItemChange('experience.workHistory', index, { ...work, duration: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                      />
                      <textarea
                        placeholder="Job Description"
                        value={work.description}
                        onChange={(e) => handleArrayItemChange('experience.workHistory', index, { ...work, description: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                      />
                      {formData.experience.workHistory.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('experience.workHistory', index)}
                          className="text-red-600 hover:text-red-800 text-sm mt-2"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Skills */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
            <div className="space-y-2">
              {formData.skills.map((skill, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter a skill"
                    value={skill}
                    onChange={(e) => handleArrayItemChange('skills', index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {formData.skills.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('skills', index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('skills', '')}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Add Skill
              </button>
            </div>
          </section>

          {/* Resume Upload */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume</h3>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              Please upload your resume in PDF, DOC, or DOCX format (max 5MB)
            </p>
          </section>

          {/* Cover Letter */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cover Letter</h3>
            <textarea
              placeholder="Tell us why you're interested in this position and what makes you a great fit..."
              value={formData.coverLetter}
              onChange={(e) => handleInputChange('coverLetter', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={5}
              maxLength={2000}
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.coverLetter.length}/2000 characters
            </p>
          </section>

          {/* Additional Information */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="url"
                placeholder="Portfolio URL (optional)"
                value={formData.additionalInfo.portfolioUrl}
                onChange={(e) => handleInputChange('additionalInfo.portfolioUrl', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="url"
                placeholder="LinkedIn URL (optional)"
                value={formData.additionalInfo.linkedinUrl}
                onChange={(e) => handleInputChange('additionalInfo.linkedinUrl', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Expected Salary (optional)"
                value={formData.additionalInfo.expectedSalary.amount}
                onChange={(e) => handleInputChange('additionalInfo.expectedSalary.amount', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="date"
                placeholder="Available From"
                value={formData.additionalInfo.availableFrom}
                onChange={(e) => handleInputChange('additionalInfo.availableFrom', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="mt-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.additionalInfo.relocate}
                  onChange={(e) => handleInputChange('additionalInfo.relocate', e.target.checked)}
                  className="rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">I am willing to relocate for this position</span>
              </label>
            </div>
          </section>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}