import dotenv from 'dotenv';
dotenv.config();

import EmailService from './services/EmailService.js';

console.log('Testing Email Service...');
console.log('Environment variables:');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);

const emailService = new EmailService();

// Test basic email sending
async function testEmail() {
  try {
    console.log('\n📧 Testing basic email send...');
    const result = await emailService.sendEmail(
      'test@example.com', 
      'Test Email', 
      '<h1>Test Email</h1><p>This is a test email.</p>'
    );
    console.log('Email result:', result);
  } catch (error) {
    console.error('Email test failed:', error);
  }
}

testEmail();