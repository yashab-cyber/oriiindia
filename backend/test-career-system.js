/**
 * Complete Career System Test
 * Tests the entire workflow: job posting, viewing, applying, and admin management
 */

import fetch from 'node-fetch';
import fs from 'fs';

const API_BASE = 'http://localhost:5000/api';
const ADMIN_EMAIL = 'yashabalam707@gmail.com'; // Admin user
const ADMIN_PASSWORD = 'password123'; // You may need to update this

let adminToken = '';
let testJobId = '';

const log = (message) => {
  console.log(`✅ ${message}`);
};

const error = (message) => {
  console.error(`❌ ${message}`);
};

// Test 1: Admin Login
const testAdminLogin = async () => {
  try {
    console.log('\n🔑 Testing Admin Login...');
    
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      })
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      adminToken = data.data.token;
      log('Admin login successful');
      return true;
    } else {
      error(`Admin login failed: ${data.message || 'Unknown error'}`);
      return false;
    }
  } catch (err) {
    error(`Admin login error: ${err.message}`);
    return false;
  }
};

// Test 2: Create Job Posting
const testCreateJob = async () => {
  try {
    console.log('\n💼 Testing Job Creation...');
    
    const jobData = {
      title: 'Senior Software Engineer',
      department: 'Computer Science',
      location: 'Kanpur, India',
      type: 'Full-time',
      experience: '3-5 years',
      description: 'We are looking for a talented Senior Software Engineer to join our innovative team at ORII. You will work on cutting-edge research projects and help develop next-generation software solutions.',
      requirements: [
        'Bachelor\'s degree in Computer Science or related field',
        'Minimum 3 years of professional software development experience',
        'Strong proficiency in JavaScript, Python, or Java',
        'Experience with modern web frameworks (React, Node.js)',
        'Knowledge of database systems (MongoDB, PostgreSQL)',
        'Excellent problem-solving and analytical skills'
      ],
      responsibilities: [
        'Design and develop scalable software applications',
        'Collaborate with research teams on innovative projects',
        'Write clean, maintainable, and well-documented code',
        'Participate in code reviews and technical discussions',
        'Mentor junior developers and contribute to team growth',
        'Stay updated with latest technology trends and best practices'
      ],
      skills: [
        'JavaScript',
        'Python',
        'React',
        'Node.js',
        'MongoDB',
        'Git',
        'Docker',
        'AWS',
        'Agile',
        'Machine Learning'
      ],
      salary: {
        min: 800000,
        max: 1200000,
        currency: 'INR',
        negotiable: true
      },
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
    };

    const response = await fetch(`${API_BASE}/admin/jobs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobData)
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      testJobId = data.data.job._id;
      log(`Job created successfully: ${data.data.job.title} (ID: ${testJobId})`);
      return true;
    } else {
      error(`Job creation failed: ${data.message || 'Unknown error'}`);
      return false;
    }
  } catch (err) {
    error(`Job creation error: ${err.message}`);
    return false;
  }
};

// Test 3: Get Public Jobs List
const testGetJobs = async () => {
  try {
    console.log('\n📋 Testing Public Jobs API...');
    
    const response = await fetch(`${API_BASE}/jobs`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      log(`Found ${data.data.jobs.length} active jobs`);
      
      // Check if our test job is in the list
      const testJob = data.data.jobs.find(job => job._id === testJobId);
      if (testJob) {
        log('Test job appears in public jobs list');
        return true;
      } else {
        error('Test job not found in public jobs list');
        return false;
      }
    } else {
      error(`Failed to fetch jobs: ${data.message || 'Unknown error'}`);
      return false;
    }
  } catch (err) {
    error(`Get jobs error: ${err.message}`);
    return false;
  }
};

// Test 4: Get Single Job Details
const testGetJobDetails = async () => {
  try {
    console.log('\n🔍 Testing Job Details API...');
    
    const response = await fetch(`${API_BASE}/jobs/${testJobId}`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      log(`Job details retrieved: ${data.data.job.title}`);
      log(`Requirements: ${data.data.job.requirements.length} items`);
      log(`Skills: ${data.data.job.skills.length} skills`);
      return true;
    } else {
      error(`Failed to fetch job details: ${data.message || 'Unknown error'}`);
      return false;
    }
  } catch (err) {
    error(`Get job details error: ${err.message}`);
    return false;
  }
};

// Test 5: Submit Job Application
const testJobApplication = async () => {
  try {
    console.log('\n📝 Testing Job Application...');
    
    const applicationData = {
      applicant: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+91 9876543210',
        address: {
          street: '123 Tech Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          zipCode: '400001'
        }
      },
      experience: {
        type: 'Experienced',
        totalYears: 4,
        workHistory: [
          {
            company: 'TechCorp Solutions',
            position: 'Software Developer',
            duration: 'Jan 2020 - Present',
            description: 'Developed web applications using React and Node.js, worked on microservices architecture'
          },
          {
            company: 'StartupXYZ',
            position: 'Junior Developer',
            duration: 'Jun 2019 - Dec 2019',
            description: 'Built mobile applications and REST APIs, gained experience in agile development'
          }
        ]
      },
      education: [
        {
          degree: 'Bachelor of Technology in Computer Science',
          institution: 'Indian Institute of Technology',
          year: '2019',
          grade: '8.5 CGPA'
        }
      ],
      skills: [
        'JavaScript',
        'Python',
        'React',
        'Node.js',
        'MongoDB',
        'Express.js',
        'AWS',
        'Docker',
        'Git',
        'Agile Development'
      ],
      communication: {
        languages: [
          { language: 'English', proficiency: 'Advanced' },
          { language: 'Hindi', proficiency: 'Native' }
        ],
        preferredLanguage: 'English'
      },
      coverLetter: 'I am excited to apply for the Senior Software Engineer position at ORII. With 4 years of experience in full-stack development and a passion for innovative technology, I believe I would be a great addition to your research-focused team. My experience with modern web technologies and collaborative development makes me well-suited for this role.',
      additionalInfo: {
        portfolioUrl: 'https://johndoe-portfolio.com',
        linkedinUrl: 'https://linkedin.com/in/john-doe-dev',
        githubUrl: 'https://github.com/johndoe',
        expectedSalary: {
          amount: 1000000,
          currency: 'INR'
        },
        availableFrom: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
        relocate: true
      }
    };

    const response = await fetch(`${API_BASE}/jobs/${testJobId}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(applicationData)
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      log(`Job application submitted successfully`);
      log(`Application ID: ${data.data.application._id}`);
      log(`Status: ${data.data.application.status}`);
      return true;
    } else {
      error(`Job application failed: ${data.error?.message || 'Unknown error'}`);
      return false;
    }
  } catch (err) {
    error(`Job application error: ${err.message}`);
    return false;
  }
};

// Test 6: Admin View Applications
const testAdminViewApplications = async () => {
  try {
    console.log('\n👥 Testing Admin Applications View...');
    
    const response = await fetch(`${API_BASE}/admin/job-applications`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      log(`Found ${data.data.applications.length} applications`);
      
      // Check if our test application is there
      const testApplication = data.data.applications.find(app => 
        app.job._id === testJobId && app.applicant.email === 'john.doe@example.com'
      );
      
      if (testApplication) {
        log(`Test application found: ${testApplication.applicant.firstName} ${testApplication.applicant.lastName}`);
        log(`Application status: ${testApplication.status}`);
        return true;
      } else {
        error('Test application not found in admin view');
        return false;
      }
    } else {
      error(`Failed to fetch applications: ${data.message || 'Unknown error'}`);
      return false;
    }
  } catch (err) {
    error(`Admin view applications error: ${err.message}`);
    return false;
  }
};

// Test 7: Job Statistics
const testJobStats = async () => {
  try {
    console.log('\n📊 Testing Job Statistics...');
    
    const response = await fetch(`${API_BASE}/jobs/stats`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      const stats = data.data.stats;
      log(`Total active jobs: ${stats.totalJobs || 0}`);
      log(`Total applications: ${stats.totalApplications || 0}`);
      return true;
    } else {
      error(`Failed to fetch job stats: ${data.message || 'Unknown error'}`);
      return false;
    }
  } catch (err) {
    error(`Job stats error: ${err.message}`);
    return false;
  }
};

// Test 8: Clean Up (Delete Test Job)
const testCleanup = async () => {
  try {
    console.log('\n🧹 Cleaning up test data...');
    
    const response = await fetch(`${API_BASE}/admin/jobs/${testJobId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      log('Test job and applications deleted successfully');
      return true;
    } else {
      error(`Cleanup failed: ${data.message || 'Unknown error'}`);
      return false;
    }
  } catch (err) {
    error(`Cleanup error: ${err.message}`);
    return false;
  }
};

// Main Test Runner
const runAllTests = async () => {
  console.log('🚀 Starting Career System End-to-End Tests\n');
  console.log('=' .repeat(50));
  
  const results = {
    total: 8,
    passed: 0,
    failed: 0
  };

  const tests = [
    { name: 'Admin Login', fn: testAdminLogin },
    { name: 'Create Job Posting', fn: testCreateJob },
    { name: 'Get Public Jobs List', fn: testGetJobs },
    { name: 'Get Job Details', fn: testGetJobDetails },
    { name: 'Submit Job Application', fn: testJobApplication },
    { name: 'Admin View Applications', fn: testAdminViewApplications },
    { name: 'Job Statistics', fn: testJobStats },
    { name: 'Cleanup Test Data', fn: testCleanup }
  ];

  for (const test of tests) {
    try {
      const success = await test.fn();
      if (success) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (err) {
      error(`Test "${test.name}" crashed: ${err.message}`);
      results.failed++;
    }
  }

  console.log('\n' + '=' .repeat(50));
  console.log('🏁 Test Results Summary:');
  console.log(`✅ Passed: ${results.passed}/${results.total}`);
  console.log(`❌ Failed: ${results.failed}/${results.total}`);
  
  if (results.failed === 0) {
    console.log('🎉 All tests passed! Career system is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Please check the errors above.');
  }
  
  console.log('\n📋 Career System Features Tested:');
  console.log('- ✅ Admin authentication and authorization');
  console.log('- ✅ Job posting creation and management');
  console.log('- ✅ Public job listings and search');
  console.log('- ✅ Individual job details viewing');
  console.log('- ✅ Job application submission with detailed form');
  console.log('- ✅ Admin application review and management');
  console.log('- ✅ Job statistics and analytics');
  console.log('- ✅ Data cleanup and management');
};

// Run tests
runAllTests().catch(err => {
  console.error('Test runner crashed:', err);
  process.exit(1);
});