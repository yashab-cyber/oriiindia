 import EmailTemplate from '../models/EmailTemplate.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const defaultTemplates = [
  {
    name: 'Welcome Email',
    category: 'user-management',
    subject: '🎉 Welcome to {{instituteName}}!',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="{{logoUrl}}" alt="{{instituteName}} Logo" style="height: 60px; width: auto;" />
            <h1 style="color: #2c3e50; margin: 20px 0 10px 0;">Welcome to {{instituteName}}!</h1>
            <p style="color: #7f8c8d; font-size: 16px; margin: 0;">{{instituteTagline}}</p>
          </div>
          
          <div style="margin-bottom: 25px;">
            <h2 style="color: #34495e; font-size: 20px; margin-bottom: 15px;">Hello {{firstName}} {{lastName}},</h2>
            <p style="color: #555; line-height: 1.6; margin-bottom: 15px;">
              Thank you for registering with {{instituteName}}! We're excited to have you join our community of researchers, innovators, and academic professionals.
            </p>
          </div>

          <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #2c3e50; margin: 0 0 15px 0;">📋 Account Status</h3>
            <p style="color: #555; margin: 0; line-height: 1.6;">
              Your account is currently <strong>pending admin approval</strong>. Our team will review your registration and notify you once your account is approved.
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
            <p style="color: #95a5a6; font-size: 14px; margin: 0;">
              Best regards,<br>
              <strong>The {{instituteName}} Team</strong><br>
              <a href="{{websiteUrl}}" style="color: #3498db; text-decoration: none;">{{websiteUrl}}</a>
            </p>
          </div>
        </div>
      </div>
    `,
    variables: [
      { name: 'firstName', description: 'User first name', type: 'text', required: true },
      { name: 'lastName', description: 'User last name', type: 'text', required: true },
      { name: 'instituteName', description: 'Institution name', type: 'text', required: true, defaultValue: 'Open Research Institute of India' },
      { name: 'instituteTagline', description: 'Institution tagline', type: 'text', required: false, defaultValue: 'Advancing Research Excellence' },
      { name: 'logoUrl', description: 'Logo URL', type: 'url', required: false, defaultValue: 'https://oriiindia0.vercel.app/api/static/logo' },
      { name: 'websiteUrl', description: 'Website URL', type: 'url', required: false, defaultValue: 'https://oriiindia0.vercel.app' }
    ],
    isSystem: true,
    tags: ['welcome', 'registration', 'onboarding'],
    description: 'Default welcome email sent to new users upon registration'
  },
  {
    name: 'Account Approval',
    category: 'user-management',
    subject: '✅ Your {{instituteName}} Account Has Been Approved!',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="{{logoUrl}}" alt="{{instituteName}} Logo" style="height: 60px; width: auto;" />
            <h1 style="color: #27ae60; margin: 20px 0 10px 0;">Account Approved! 🎉</h1>
            <p style="color: #7f8c8d; font-size: 16px; margin: 0;">{{instituteName}}</p>
          </div>
          
          <div style="margin-bottom: 25px;">
            <h2 style="color: #34495e; font-size: 20px; margin-bottom: 15px;">Congratulations {{firstName}}!</h2>
            <p style="color: #555; line-height: 1.6; margin-bottom: 15px;">
              Great news! Your {{instituteName}} account has been approved by our admin team. You can now access all the features and resources available on our platform.
            </p>
          </div>

          <div style="text-align: center; margin-bottom: 25px;">
            <a href="{{loginUrl}}" 
               style="display: inline-block; background-color: #27ae60; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              Login to Your Account
            </a>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
            <p style="color: #95a5a6; font-size: 14px; margin: 0;">
              Welcome to the {{instituteName}} community!<br>
              <strong>The {{instituteName}} Team</strong><br>
              <a href="{{websiteUrl}}" style="color: #3498db; text-decoration: none;">{{websiteUrl}}</a>
            </p>
          </div>
        </div>
      </div>
    `,
    variables: [
      { name: 'firstName', description: 'User first name', type: 'text', required: true },
      { name: 'instituteName', description: 'Institution name', type: 'text', required: true, defaultValue: 'Open Research Institute of India' },
      { name: 'logoUrl', description: 'Logo URL', type: 'url', required: false, defaultValue: 'https://oriiindia0.vercel.app/api/static/logo' },
      { name: 'websiteUrl', description: 'Website URL', type: 'url', required: false, defaultValue: 'https://oriiindia0.vercel.app' },
      { name: 'loginUrl', description: 'Login page URL', type: 'url', required: false, defaultValue: 'https://oriiindia0.vercel.app/login' }
    ],
    isSystem: true,
    tags: ['approval', 'account', 'access'],
    description: 'Email sent when user account is approved by admin'
  },
  {
    name: 'Newsletter Template',
    category: 'newsletter',
    subject: '📰 {{newsletterTitle}} - {{instituteName}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="{{logoUrl}}" alt="{{instituteName}} Logo" style="height: 60px; width: auto;" />
            <h1 style="color: #2c3e50; margin: 20px 0 10px 0;">{{newsletterTitle}}</h1>
            <p style="color: #7f8c8d; font-size: 16px; margin: 0;">{{issueDate}}</p>
          </div>
          
          <div style="margin-bottom: 25px;">
            <h2 style="color: #34495e; font-size: 20px; margin-bottom: 15px;">Dear {{firstName}},</h2>
            <p style="color: #555; line-height: 1.6; margin-bottom: 15px;">
              {{introMessage}}
            </p>
          </div>

          <div style="margin-bottom: 25px;">
            {{contentBody}}
          </div>

          <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #2c3e50; margin: 0 0 15px 0;">📅 Upcoming Events</h3>
            <p style="color: #555; margin: 0; line-height: 1.6;">
              {{upcomingEvents}}
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
            <p style="color: #95a5a6; font-size: 14px; margin: 0;">
              <strong>{{instituteName}}</strong><br>
              <a href="{{websiteUrl}}" style="color: #3498db; text-decoration: none;">{{websiteUrl}}</a><br>
              <a href="{{unsubscribeUrl}}" style="color: #95a5a6; text-decoration: none; font-size: 12px;">Unsubscribe</a>
            </p>
          </div>
        </div>
      </div>
    `,
    variables: [
      { name: 'firstName', description: 'Recipient first name', type: 'text', required: true },
      { name: 'newsletterTitle', description: 'Newsletter title', type: 'text', required: true },
      { name: 'issueDate', description: 'Issue date', type: 'text', required: true },
      { name: 'introMessage', description: 'Introduction message', type: 'text', required: true },
      { name: 'contentBody', description: 'Main newsletter content (HTML)', type: 'text', required: true },
      { name: 'upcomingEvents', description: 'Upcoming events section', type: 'text', required: false, defaultValue: 'Check our website for upcoming events and announcements.' },
      { name: 'instituteName', description: 'Institution name', type: 'text', required: true, defaultValue: 'Open Research Institute of India' },
      { name: 'logoUrl', description: 'Logo URL', type: 'url', required: false, defaultValue: 'https://oriiindia0.vercel.app/api/static/logo' },
      { name: 'websiteUrl', description: 'Website URL', type: 'url', required: false, defaultValue: 'https://oriiindia0.vercel.app' },
      { name: 'unsubscribeUrl', description: 'Unsubscribe URL', type: 'url', required: false, defaultValue: '#' }
    ],
    isSystem: false,
    tags: ['newsletter', 'updates', 'announcements'],
    description: 'Template for sending newsletters and updates to subscribers'
  },
  {
    name: 'Event Invitation',
    category: 'event',
    subject: '🎯 You\'re Invited: {{eventTitle}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="{{logoUrl}}" alt="{{instituteName}} Logo" style="height: 60px; width: auto;" />
            <h1 style="color: #8e44ad; margin: 20px 0 10px 0;">You're Invited!</h1>
            <p style="color: #7f8c8d; font-size: 16px; margin: 0;">{{instituteName}}</p>
          </div>
          
          <div style="margin-bottom: 25px;">
            <h2 style="color: #34495e; font-size: 20px; margin-bottom: 15px;">{{eventTitle}}</h2>
            <p style="color: #555; line-height: 1.6; margin-bottom: 15px;">
              Dear {{firstName}}, you are cordially invited to attend our upcoming event.
            </p>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #8e44ad;">
            <h3 style="color: #8e44ad; margin: 0 0 15px 0;">📅 Event Details</h3>
            <p style="color: #555; margin: 5px 0;"><strong>Date:</strong> {{eventDate}}</p>
            <p style="color: #555; margin: 5px 0;"><strong>Time:</strong> {{eventTime}}</p>
            <p style="color: #555; margin: 5px 0;"><strong>Location:</strong> {{eventLocation}}</p>
            <p style="color: #555; margin: 15px 0 0 0; line-height: 1.6;">{{eventDescription}}</p>
          </div>

          <div style="text-align: center; margin-bottom: 25px;">
            <a href="{{registerUrl}}" 
               style="display: inline-block; background-color: #8e44ad; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              Register Now
            </a>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
            <p style="color: #95a5a6; font-size: 14px; margin: 0;">
              Looking forward to seeing you there!<br>
              <strong>The {{instituteName}} Team</strong><br>
              <a href="{{websiteUrl}}" style="color: #3498db; text-decoration: none;">{{websiteUrl}}</a>
            </p>
          </div>
        </div>
      </div>
    `,
    variables: [
      { name: 'firstName', description: 'Recipient first name', type: 'text', required: true },
      { name: 'eventTitle', description: 'Event title', type: 'text', required: true },
      { name: 'eventDate', description: 'Event date', type: 'text', required: true },
      { name: 'eventTime', description: 'Event time', type: 'text', required: true },
      { name: 'eventLocation', description: 'Event location', type: 'text', required: true },
      { name: 'eventDescription', description: 'Event description', type: 'text', required: true },
      { name: 'registerUrl', description: 'Registration URL', type: 'url', required: true },
      { name: 'instituteName', description: 'Institution name', type: 'text', required: true, defaultValue: 'Open Research Institute of India' },
      { name: 'logoUrl', description: 'Logo URL', type: 'url', required: false, defaultValue: 'https://oriiindia0.vercel.app/api/static/logo' },
      { name: 'websiteUrl', description: 'Website URL', type: 'url', required: false, defaultValue: 'https://oriiindia0.vercel.app' }
    ],
    isSystem: false,
    tags: ['event', 'invitation', 'registration'],
    description: 'Template for sending event invitations and announcements'
  },
  {
    name: 'Research Paper Submission Confirmation',
    category: 'research',
    subject: '📄 Research Paper Submission Received - {{paperTitle}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="{{logoUrl}}" alt="{{instituteName}} Logo" style="height: 60px; width: auto;" />
            <h1 style="color: #3498db; margin: 20px 0 10px 0;">Submission Received</h1>
            <p style="color: #7f8c8d; font-size: 16px; margin: 0;">{{instituteName}}</p>
          </div>
          
          <div style="margin-bottom: 25px;">
            <h2 style="color: #34495e; font-size: 20px; margin-bottom: 15px;">Dear {{firstName}},</h2>
            <p style="color: #555; line-height: 1.6; margin-bottom: 15px;">
              Thank you for submitting your research paper to {{instituteName}}. We have successfully received your submission and it is now under review.
            </p>
          </div>

          <div style="background-color: #e8f5ff; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #3498db;">
            <h3 style="color: #3498db; margin: 0 0 15px 0;">📄 Submission Details</h3>
            <p style="color: #555; margin: 5px 0;"><strong>Title:</strong> {{paperTitle}}</p>
            <p style="color: #555; margin: 5px 0;"><strong>Submission ID:</strong> {{submissionId}}</p>
            <p style="color: #555; margin: 5px 0;"><strong>Submitted Date:</strong> {{submissionDate}}</p>
            <p style="color: #555; margin: 5px 0;"><strong>Category:</strong> {{category}}</p>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="color: #2c3e50; margin-bottom: 15px;">🔍 What's Next?</h3>
            <ul style="color: #555; line-height: 1.8; padding-left: 20px;">
              <li>Your paper will undergo initial screening</li>
              <li>Peer review process will begin</li>
              <li>You will receive feedback within {{reviewTimeframe}}</li>
              <li>Final decision will be communicated via email</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
            <p style="color: #95a5a6; font-size: 14px; margin: 0;">
              Thank you for contributing to research advancement!<br>
              <strong>The {{instituteName}} Review Team</strong><br>
              <a href="{{websiteUrl}}" style="color: #3498db; text-decoration: none;">{{websiteUrl}}</a>
            </p>
          </div>
        </div>
      </div>
    `,
    variables: [
      { name: 'firstName', description: 'Author first name', type: 'text', required: true },
      { name: 'paperTitle', description: 'Research paper title', type: 'text', required: true },
      { name: 'submissionId', description: 'Submission ID', type: 'text', required: true },
      { name: 'submissionDate', description: 'Submission date', type: 'text', required: true },
      { name: 'category', description: 'Paper category', type: 'text', required: true },
      { name: 'reviewTimeframe', description: 'Review timeframe', type: 'text', required: false, defaultValue: '2-4 weeks' },
      { name: 'instituteName', description: 'Institution name', type: 'text', required: true, defaultValue: 'Open Research Institute of India' },
      { name: 'logoUrl', description: 'Logo URL', type: 'url', required: false, defaultValue: 'https://oriiindia0.vercel.app/api/static/logo' },
      { name: 'websiteUrl', description: 'Website URL', type: 'url', required: false, defaultValue: 'https://oriiindia0.vercel.app' }
    ],
    isSystem: false,
    tags: ['research', 'submission', 'confirmation'],
    description: 'Confirmation email sent when research paper is submitted'
  }
];

async function seedEmailTemplates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 Connected to MongoDB');

    // Check if templates already exist
    const existingTemplates = await EmailTemplate.countDocuments();
    if (existingTemplates > 0) {
      console.log(`📋 Found ${existingTemplates} existing templates. Skipping seed.`);
      return;
    }

    // Insert default templates
    const result = await EmailTemplate.insertMany(defaultTemplates);
    console.log(`✅ Successfully seeded ${result.length} email templates`);

    // Log template summary
    result.forEach(template => {
      console.log(`   - ${template.name} (${template.category})`);
    });

  } catch (error) {
    console.error('❌ Error seeding email templates:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedEmailTemplates();
}

export default seedEmailTemplates;