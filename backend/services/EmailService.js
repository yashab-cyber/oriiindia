import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = null;
    this.init();
  }

  async init() {
    console.log('🔍 Debugging Email Config:');
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
    console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);
    
    // Always use Gmail SMTP if credentials are available
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        // Use Gmail SMTP configuration from .env
        this.transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: parseInt(process.env.EMAIL_PORT) || 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });
        
        // Test the connection
        await this.transporter.verify();
        console.log('✅ Gmail SMTP configured successfully for:', process.env.EMAIL_USER);
        return; // Exit early to avoid creating test account
      } catch (error) {
        console.error('❌ Gmail SMTP configuration failed:', error.message);
        console.log('🔄 Falling back to test email service...');
      }
    } 
    
    if (process.env.NODE_ENV === 'production') {
      // Production: Use actual SMTP server
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } else {
      // Development: Use Ethereal for testing (only if no Gmail config)
      this.createTestAccount();
    }
  }

  async createTestAccount() {
    try {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log('📧 Test email account created:', testAccount.user);
    } catch (error) {
      console.error('Error creating test account:', error);
    }
  }

  async sendEmail(to, subject, html) {
    try {
      if (!this.transporter) {
        console.error('Email transporter not initialized');
        return false;
      }

      const mailOptions = {
        from: process.env.SMTP_FROM || '"ORII Research Platform" <noreply@orii.edu>',
        to: to,
        subject: subject,
        html: html
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
      }

      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendFromTemplate(templateId, recipientEmail, variables = {}, options = {}) {
    try {
      // Import models here to avoid circular dependencies
      const EmailTemplate = (await import('../models/EmailTemplate.js')).default;
      const EmailLog = (await import('../models/EmailLog.js')).default;
      const Handlebars = (await import('handlebars')).default;

      // Get the email template
      const template = await EmailTemplate.findById(templateId);
      if (!template) {
        throw new Error('Email template not found');
      }

      if (!template.isActive) {
        throw new Error('Email template is not active');
      }

      // Merge variables with default values
      const mergedVariables = {
        ...variables,
        recipientEmail: recipientEmail
      };

      // Compile the template with variables
      const subjectTemplate = Handlebars.compile(template.subject);
      const htmlTemplate = Handlebars.compile(template.htmlContent);
      
      const subject = subjectTemplate(mergedVariables);
      const htmlContent = htmlTemplate(mergedVariables);

      // Create email log entry
      const emailLog = new EmailLog({
        templateId: template._id,
        templateName: template.name,
        recipientEmail: recipientEmail,
        subject: subject,
        status: 'pending',
        metadata: {
          variables: mergedVariables,
          senderUserId: options.senderUserId,
          senderName: options.senderName
        }
      });

      await emailLog.save();

      // Send the email
      const result = await this.sendEmail(recipientEmail, subject, htmlContent);

      if (result.success) {
        // Update log status to sent
        emailLog.status = 'sent';
        emailLog.sentAt = new Date();
        await emailLog.save();

        // Update template usage count
        template.metadata.usageCount = (template.metadata.usageCount || 0) + 1;
        template.metadata.lastUsed = new Date();
        await template.save();

        console.log(`✅ Template email sent to ${recipientEmail}`);
        
        return {
          success: true,
          logId: emailLog._id,
          messageId: result.messageId
        };
      } else {
        // Update log status to failed
        emailLog.status = 'failed';
        emailLog.failureReason = result.error;
        await emailLog.save();
        
        return {
          success: false,
          error: result.error,
          logId: emailLog._id
        };
      }

    } catch (error) {
      console.error('Error in sendFromTemplate:', error);
      throw error;
    }
  }

  async sendCustomEmail(to, subject, html, text = null, options = {}) {
    try {
      // Import models here to avoid circular dependencies
      const EmailLog = (await import('../models/EmailLog.js')).default;

      // Create email log entry
      const emailLog = new EmailLog({
        recipientEmail: to,
        subject: subject,
        status: 'pending',
        metadata: {
          emailType: 'custom',
          senderUserId: options.senderUserId,
          senderName: options.senderName
        }
      });

      await emailLog.save();

      // Send the email
      const result = await this.sendEmail(to, subject, html);

      if (result.success) {
        // Update log status to sent
        emailLog.status = 'sent';
        emailLog.sentAt = new Date();
        await emailLog.save();

        console.log(`✅ Custom email sent to ${to}`);
        
        return {
          success: true,
          logId: emailLog._id,
          messageId: result.messageId
        };
      } else {
        // Update log status to failed
        emailLog.status = 'failed';
        emailLog.failureReason = result.error;
        await emailLog.save();
        
        return {
          success: false,
          error: result.error,
          logId: emailLog._id
        };
      }

    } catch (error) {
      console.error('Error in sendCustomEmail:', error);
      throw error;
    }
  }

  // Welcome email for new user registration
  async sendWelcomeEmail(user) {
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'https://oriiindia0.vercel.app';
      const supportEmail = process.env.EMAIL_USER || 'openresearchinstituteofindia@gmail.com';
      
      const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <!-- Header with ORII Logo -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 0;">
          <div style="background: white; padding: 15px; border-radius: 15px; display: inline-block; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #667eea; font-size: 24px; font-weight: bold;">🏛️ ORII</h2>
          </div>
          <h1 style="margin: 0; font-size: 32px; font-weight: bold;">Welcome to ORII!</h1>
          <p style="margin: 10px 0 0; font-size: 18px; opacity: 0.9;">Open Research Institute of India</p>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 40px 30px; background: #ffffff;">
          <h2 style="color: #333; margin-top: 0; font-size: 24px;">Hello ${user.firstName} ${user.lastName}! 👋</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Thank you for registering with the <strong>Open Research Institute of India (ORII)</strong>. We're excited to have you join our community of researchers, scholars, and innovators!
          </p>
          
          <!-- Registration Details -->
          <div style="background: #f8f9fb; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #667eea;">
            <h3 style="color: #333; margin-top: 0; margin-bottom: 15px; font-size: 18px;">📋 Registration Details</h3>
            <div style="color: #555; line-height: 1.6;">
              <p style="margin: 5px 0;"><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
              <p style="margin: 5px 0;"><strong>Role:</strong> ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
              <p style="margin: 5px 0;"><strong>Registration Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
            </div>
          </div>
          
          <!-- Approval Status -->
          ${user.role === 'admin' ? `
            <div style="background: #d4edda; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #28a745;">
              <h3 style="color: #155724; margin-top: 0; margin-bottom: 15px; font-size: 18px;">✅ Account Approved</h3>
              <p style="color: #155724; margin: 0; line-height: 1.6;">
                Your admin account has been automatically approved! You can now log in and access all platform features.
              </p>
            </div>
          ` : `
            <div style="background: #fff3cd; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #ffc107;">
              <h3 style="color: #856404; margin-top: 0; margin-bottom: 15px; font-size: 18px;">⏳ Pending Approval</h3>
              <p style="color: #856404; margin: 0; line-height: 1.6;">
                <strong>Your registration is currently under review.</strong><br>
                Our team will carefully review your application and you'll receive an email notification once your account is approved. This usually takes 1-2 business days.
              </p>
            </div>
          `}
          
          <!-- What's Next -->
          <div style="background: #e8f4fd; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #1976d2;">
            <h3 style="color: #1976d2; margin-top: 0; margin-bottom: 15px; font-size: 18px;">🚀 What's Next?</h3>
            <ul style="color: #333; margin: 0; padding-left: 20px; line-height: 1.8;">
              ${user.role === 'admin' ? `
                <li>Log in to your admin dashboard</li>
                <li>Set up your research profile</li>
                <li>Start managing the platform</li>
              ` : `
                <li>Wait for account approval (you'll get an email notification)</li>
                <li>Once approved, complete your research profile</li>
                <li>Explore research opportunities and collaborations</li>
                <li>Connect with fellow researchers and scholars</li>
              `}
            </ul>
          </div>
          
          <!-- Platform Features -->
          <div style="margin: 30px 0;">
            <h3 style="color: #333; margin-bottom: 20px; font-size: 18px;">🌟 Platform Features</h3>
            <div style="display: grid; gap: 15px;">
              <div style="padding: 15px; background: #f9f9f9; border-radius: 8px; border-left: 3px solid #667eea;">
                <strong style="color: #333;">📚 Research Repository:</strong> <span style="color: #666;">Access and share research papers</span>
              </div>
              <div style="padding: 15px; background: #f9f9f9; border-radius: 8px; border-left: 3px solid #764ba2;">
                <strong style="color: #333;">🤝 Collaboration Hub:</strong> <span style="color: #666;">Connect with researchers worldwide</span>
              </div>
              <div style="padding: 15px; background: #f9f9f9; border-radius: 8px; border-left: 3px solid #667eea;">
                <strong style="color: #333;">📅 Events & Seminars:</strong> <span style="color: #666;">Attend academic events and workshops</span>
              </div>
              <div style="padding: 15px; background: #f9f9f9; border-radius: 8px; border-left: 3px solid #764ba2;">
                <strong style="color: #333;">💼 Career Opportunities:</strong> <span style="color: #666;">Find research positions and funding</span>
              </div>
            </div>
          </div>
          
          <!-- Call to Action -->
          <div style="text-align: center; margin: 35px 0;">
            ${user.role === 'admin' ? `
              <a href="${frontendUrl}/login" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; margin: 10px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                🚀 Login to Dashboard
              </a>
            ` : `
              <a href="${frontendUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; margin: 10px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                🌐 Visit ORII Platform
              </a>
            `}
          </div>
          
          <!-- Support -->
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
            <p style="color: #666; margin: 0; font-size: 14px;">
              <strong>Need Help?</strong><br>
              Contact our support team at <a href="mailto:${supportEmail}" style="color: #667eea; text-decoration: none;">${supportEmail}</a><br>
              or visit our platform for more information.
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #2c3e50; color: #ecf0f1; padding: 25px; text-align: center; border-radius: 0;">
          <p style="margin: 0 0 10px; font-size: 16px; font-weight: bold;">Open Research Institute of India</p>
          <p style="margin: 0; font-size: 14px; opacity: 0.8;">
            Advancing Research • Fostering Innovation • Building Connections<br>
            <a href="${frontendUrl}" style="color: #3498db; text-decoration: none;">${frontendUrl}</a>
          </p>
        </div>
      </div>
      `;

      const subject = `🎉 Welcome to ORII - ${user.role === 'admin' ? 'Admin Account Created!' : 'Registration Received!'}`;
      
      const result = await this.sendEmail(user.email, subject, html);
      
      if (result.success) {
        console.log(`✅ Welcome email sent to ${user.email}`);
        return { success: true, messageId: result.messageId };
      } else {
        console.error(`❌ Failed to send welcome email to ${user.email}:`, result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  // Account approval email
  async sendApprovalEmail(user) {
    try {
      const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <!-- Header with ORII Logo -->
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 40px 20px; text-align: center;">
          <div style="background: white; display: inline-block; padding: 15px; border-radius: 15px; margin-bottom: 20px;">
            <h1 style="margin: 0; color: #28a745; font-size: 24px; font-weight: bold;">ORII</h1>
          </div>
          <h1 style="margin: 0; font-size: 32px; font-weight: bold;">🎉 Account Approved!</h1>
          <p style="margin: 10px 0 0; font-size: 18px; opacity: 0.9;">Welcome to the ORII Community</p>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 40px 30px; background: #ffffff;">
          <h2 style="color: #333; margin-top: 0; font-size: 24px;">Great News, ${user.firstName}! 🎊</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Congratulations! Your account with the <strong>Open Research Institute of India (ORII)</strong> has been approved by our admin team. You can now access all platform features and start your research journey with us!
          </p>
          
          <!-- Approval Details -->
          <div style="background: #d4edda; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #155724; margin-top: 0; margin-bottom: 15px; font-size: 18px;">✅ Approval Confirmed</h3>
            <div style="color: #155724; line-height: 1.6;">
              <p style="margin: 5px 0;"><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
              <p style="margin: 5px 0;"><strong>Role:</strong> ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
              <p style="margin: 5px 0;"><strong>Approval Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
            </div>
          </div>
          
          <!-- Next Steps -->
          <div style="background: #e8f4fd; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #1976d2;">
            <h3 style="color: #1976d2; margin-top: 0; margin-bottom: 15px; font-size: 18px;">🚀 What's Next?</h3>
            <ul style="color: #333; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li><strong>Log in to your account</strong> using your registered email and password</li>
              <li><strong>Complete your research profile</strong> with your areas of interest</li>
              <li><strong>Explore research opportunities</strong> and ongoing projects</li>
              <li><strong>Connect with fellow researchers</strong> and start collaborations</li>
              <li><strong>Submit your research papers</strong> for publication and review</li>
              <li><strong>Participate in events</strong> and academic seminars</li>
            </ul>
          </div>
          
          <!-- Platform Features -->
          <div style="margin: 30px 0;">
            <h3 style="color: #333; margin-bottom: 20px; font-size: 18px;">🌟 Your Access Includes</h3>
            <div style="display: grid; gap: 15px;">
              <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 3px solid #28a745;">
                <strong style="color: #333;">📚 Full Research Repository Access:</strong> <span style="color: #666;">Browse, download, and submit research papers</span>
              </div>
              <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 3px solid #20c997;">
                <strong style="color: #333;">🤝 Collaboration Network:</strong> <span style="color: #666;">Connect with researchers worldwide</span>
              </div>
              <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 3px solid #28a745;">
                <strong style="color: #333;">📅 Event Participation:</strong> <span style="color: #666;">Register for seminars, workshops, and conferences</span>
              </div>
              <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 3px solid #20c997;">
                <strong style="color: #333;">💼 Career Opportunities:</strong> <span style="color: #666;">Access funding and research positions</span>
              </div>
            </div>
          </div>
          
          <!-- Call to Action -->
          <div style="text-align: center; margin: 35px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://oriiindia0.vercel.app'}/login" 
               style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; margin: 10px; box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);">
              🚀 Login to Your Account
            </a>
          </div>
          
          <!-- Support -->
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
            <p style="color: #666; margin: 0; font-size: 14px;">
              <strong>Need Help Getting Started?</strong><br>
              Contact our support team at <a href="mailto:openresearchinstituteofindia@gmail.com" style="color: #28a745; text-decoration: none;">openresearchinstituteofindia@gmail.com</a><br>
              or explore our platform for tutorials and guides.
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #2c3e50; color: #ecf0f1; padding: 25px; text-align: center;">
          <p style="margin: 0 0 10px; font-size: 16px; font-weight: bold;">Open Research Institute of India</p>
          <p style="margin: 0; font-size: 14px; opacity: 0.8;">
            Advancing Research • Fostering Innovation • Building Connections<br>
            <a href="${process.env.FRONTEND_URL || 'https://oriiindia0.vercel.app'}" style="color: #3498db; text-decoration: none;">oriiindia0.vercel.app</a>
          </p>
        </div>
      </div>
      `;

      const subject = `🎉 Account Approved - Welcome to ORII Research Platform!`;
      
      const result = await this.sendEmail(user.email, subject, html);
      
      if (result.success) {
        console.log(`✅ Approval email sent to ${user.email}`);
        return { success: true, messageId: result.messageId };
      } else {
        console.error(`❌ Failed to send approval email to ${user.email}:`, result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error sending approval email:', error);
      return { success: false, error: error.message };
    }
  }

  // Account rejection email
  async sendRejectionEmail(user, reason = '') {
    try {
      const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <!-- Header with ORII Logo -->
        <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 40px 20px; text-align: center;">
          <div style="background: white; display: inline-block; padding: 15px; border-radius: 15px; margin-bottom: 20px;">
            <h1 style="margin: 0; color: #dc3545; font-size: 24px; font-weight: bold;">ORII</h1>
          </div>
          <h1 style="margin: 0; font-size: 32px; font-weight: bold;">Application Status Update</h1>
          <p style="margin: 10px 0 0; font-size: 18px; opacity: 0.9;">Open Research Institute of India</p>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 40px 30px; background: #ffffff;">
          <h2 style="color: #333; margin-top: 0; font-size: 24px;">Dear ${user.firstName} ${user.lastName},</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Thank you for your interest in joining the <strong>Open Research Institute of India (ORII)</strong>. We appreciate the time you took to submit your application.
          </p>
          
          <!-- Status Information -->
          <div style="background: #f8d7da; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #dc3545;">
            <h3 style="color: #721c24; margin-top: 0; margin-bottom: 15px; font-size: 18px;">📋 Application Status</h3>
            <p style="color: #721c24; margin: 0; line-height: 1.6;">
              After careful review, we regret to inform you that your application for ORII membership has not been approved at this time.
            </p>
            ${reason ? `
              <div style="margin-top: 15px; padding: 15px; background: #ffffff; border-radius: 8px;">
                <strong style="color: #721c24;">Reason:</strong>
                <p style="color: #721c24; margin: 5px 0 0;">${reason}</p>
              </div>
            ` : ''}
          </div>
          
          <!-- Encouragement -->
          <div style="background: #e8f4fd; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #1976d2;">
            <h3 style="color: #1976d2; margin-top: 0; margin-bottom: 15px; font-size: 18px;">💡 Moving Forward</h3>
            <p style="color: #333; margin: 0; line-height: 1.6;">
              This decision doesn't reflect your potential or capabilities. We encourage you to:
            </p>
            <ul style="color: #333; margin: 10px 0 0; padding-left: 20px; line-height: 1.8;">
              <li><strong>Consider reapplying</strong> in the future when you meet additional criteria</li>
              <li><strong>Continue your research work</strong> and strengthen your academic profile</li>
              <li><strong>Stay connected</strong> with the research community</li>
              <li><strong>Explore other opportunities</strong> for collaboration and growth</li>
            </ul>
          </div>
          
          <!-- Alternative Resources -->
          <div style="background: #fff3cd; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0; margin-bottom: 15px; font-size: 18px;">🌟 Alternative Resources</h3>
            <p style="color: #856404; margin: 0; line-height: 1.6;">
              While we cannot approve your membership at this time, we encourage you to explore other research opportunities and educational resources available in the academic community.
            </p>
          </div>
          
          <!-- Reapplication Information -->
          <div style="background: #d1ecf1; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #17a2b8;">
            <h3 style="color: #0c5460; margin-top: 0; margin-bottom: 15px; font-size: 18px;">🔄 Future Applications</h3>
            <p style="color: #0c5460; margin: 0; line-height: 1.6;">
              You are welcome to reapply after addressing the feedback provided. We recommend waiting at least 6 months before submitting a new application to allow time for improvement and development.
            </p>
          </div>
          
          <!-- Support -->
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
            <p style="color: #666; margin: 0; font-size: 14px;">
              <strong>Questions or Feedback?</strong><br>
              Contact our support team at <a href="mailto:openresearchinstituteofindia@gmail.com" style="color: #dc3545; text-decoration: none;">openresearchinstituteofindia@gmail.com</a><br>
              We're here to help and provide guidance for your research journey.
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #2c3e50; color: #ecf0f1; padding: 25px; text-align: center;">
          <p style="margin: 0 0 10px; font-size: 16px; font-weight: bold;">Open Research Institute of India</p>
          <p style="margin: 0; font-size: 14px; opacity: 0.8;">
            Thank you for your interest in our research community<br>
            <a href="${process.env.FRONTEND_URL || 'https://oriiindia0.vercel.app'}" style="color: #3498db; text-decoration: none;">oriiindia0.vercel.app</a>
          </p>
        </div>
      </div>
      `;

      const subject = `ORII Application Status - Thank You for Your Interest`;
      
      const result = await this.sendEmail(user.email, subject, html);
      
      if (result.success) {
        console.log(`✅ Rejection email sent to ${user.email}`);
        return { success: true, messageId: result.messageId };
      } else {
        console.error(`❌ Failed to send rejection email to ${user.email}:`, result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error sending rejection email:', error);
      return { success: false, error: error.message };
    }
  }

  // Event reminder email
  async sendEventReminder(recipientId, data) {
    try {
      const User = (await import('../models/User.js')).default;
      const recipient = await User.findById(recipientId);
      
      if (!recipient) {
        throw new Error('Recipient not found');
      }

      const reminderTypeText = {
        '1w': 'in one week',
        '24h': 'tomorrow',
        '1h': 'in one hour'
      };

      const subject = `Event Reminder: ${data.eventTitle} ${reminderTypeText[data.reminderType]}`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">📅 Event Reminder</h2>
          <p>Hello ${recipient.firstName},</p>
          <p>This is a reminder that "<strong>${data.eventTitle}</strong>" is scheduled for:</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Date:</strong> ${data.eventDate}</p>
            <p><strong>Time:</strong> ${data.eventTime}</p>
            <p><strong>Location:</strong> ${data.eventLocation}</p>
          </div>
          <a href="${data.eventUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">View Event Details</a>
          <p>Best regards,<br>ORII Research Platform</p>
        </div>
      `;

      await this.sendEmail(recipient.email, subject, html);
      console.log(`Event reminder email sent to ${recipient.email}`);
    } catch (error) {
      console.error('Error sending event reminder email:', error);
      throw error;
    }
  }

  // Collaboration invitation email
  async sendCollaborationInvitation(recipientId, data) {
    try {
      const User = (await import('../models/User.js')).default;
      const recipient = await User.findById(recipientId);
      
      if (!recipient) {
        throw new Error('Recipient not found');
      }

      const subject = `🤝 Collaboration Invitation: ${data.collaborationTitle}`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #059669;">🤝 Research Collaboration Invitation</h2>
          <p>Hello ${recipient.firstName}!</p>
          <p><strong>${data.inviterName}</strong> has invited you to collaborate on:</p>
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #059669;">
            <h3 style="color: #059669; margin: 0 0 10px 0;">${data.collaborationTitle}</h3>
            <p style="margin: 0;"><strong>Role:</strong> ${data.role}</p>
          </div>
          <p>This is a great opportunity to contribute to meaningful research!</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.acceptUrl}" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 0 10px;">✅ Accept</a>
            <a href="${data.declineUrl}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 0 10px;">❌ Decline</a>
          </div>
          <p style="text-align: center;">
            <a href="${data.viewUrl}">📋 View Full Details</a>
          </p>
          <p>Best regards,<br>ORII Research Platform</p>
        </div>
      `;

      await this.sendEmail(recipient.email, subject, html);
      console.log(`Collaboration invitation email sent to ${recipient.email}`);
    } catch (error) {
      console.error('Error sending collaboration invitation email:', error);
      throw error;
    }
  }

  // Collaboration response email
  async sendCollaborationResponse(recipientId, data) {
    try {
      const User = (await import('../models/User.js')).default;
      const recipient = await User.findById(recipientId);
      
      if (!recipient) {
        throw new Error('Recipient not found');
      }

      const isAccepted = data.status === 'accepted';
      const statusIcon = isAccepted ? '✅' : '❌';
      const statusColor = isAccepted ? '#059669' : '#dc2626';

      const subject = `${statusIcon} Collaboration ${data.status}: ${data.collaborationTitle}`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: ${statusColor};">${statusIcon} Collaboration ${data.status}</h2>
          <p>Hello ${recipient.firstName}!</p>
          <p><strong>${data.responderName}</strong> has <strong>${data.status}</strong> your collaboration invitation:</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin: 0;">${data.collaborationTitle}</h3>
          </div>
          ${isAccepted ? 
            '<p style="color: #059669;">🎉 Great news! You can now start collaborating together.</p>' :
            '<p>Thank you for understanding. You can continue to invite other researchers.</p>'
          }
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.collaborationUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">📋 View Collaboration</a>
          </div>
          <p>Best regards,<br>ORII Research Platform</p>
        </div>
      `;

      await this.sendEmail(recipient.email, subject, html);
      console.log(`Collaboration response email sent to ${recipient.email}`);
    } catch (error) {
      console.error('Error sending collaboration response email:', error);
      throw error;
    }
  }

  // Collaboration update email
  async sendCollaborationUpdate(recipientId, data) {
    try {
      const User = (await import('../models/User.js')).default;
      const recipient = await User.findById(recipientId);
      
      if (!recipient) {
        throw new Error('Recipient not found');
      }

      const subject = `📝 New Update: ${data.collaborationTitle}`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">📝 Collaboration Update</h2>
          <p>Hello ${recipient.firstName}!</p>
          <p><strong>${data.authorName}</strong> posted a new update in your collaboration:</p>
          <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <h3 style="color: #1f2937; margin: 0 0 10px 0;">${data.collaborationTitle}</h3>
            <p style="color: #6b7280; margin: 0; font-weight: 500;">Update: ${data.updateTitle}</p>
          </div>
          <p>Check out the latest update to stay informed about the project progress.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.collaborationUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">📋 View Update</a>
          </div>
          <p>Best regards,<br>ORII Research Platform</p>
        </div>
      `;

      await this.sendEmail(recipient.email, subject, html);
      console.log(`Collaboration update email sent to ${recipient.email}`);
    } catch (error) {
      console.error('Error sending collaboration update email:', error);
      throw error;
    }
  }

  // Collaboration completion email
  async sendCollaborationCompletion(recipientId, data) {
    try {
      const User = (await import('../models/User.js')).default;
      const recipient = await User.findById(recipientId);
      
      if (!recipient) {
        throw new Error('Recipient not found');
      }

      const subject = `🎉 Collaboration Completed: ${data.collaborationTitle}`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #059669;">🎉 Collaboration Completed!</h2>
          <p>Congratulations ${recipient.firstName}!</p>
          <p>The collaboration project has been successfully completed:</p>
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #059669;">
            <h3 style="color: #1f2937; margin: 0 0 10px 0;">${data.collaborationTitle}</h3>
            <p style="color: #059669; margin: 0; font-weight: 500;">Completed on: ${new Date(data.completionDate).toLocaleDateString()}</p>
          </div>
          <p>Thank you for your valuable contribution to this research project!</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.collaborationUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 0 10px;">📋 View Results</a>
            <a href="${data.reportUrl}" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 0 10px;">📄 Download Report</a>
          </div>
          <p>Best regards,<br>ORII Research Platform</p>
        </div>
      `;

      await this.sendEmail(recipient.email, subject, html);
      console.log(`Collaboration completion email sent to ${recipient.email}`);
    } catch (error) {
      console.error('Error sending collaboration completion email:', error);
      throw error;
    }
  }

  // Generic notification email
  async sendNotificationEmail(recipientId, data) {
    try {
      const User = (await import('../models/User.js')).default;
      const recipient = await User.findById(recipientId);
      
      if (!recipient) {
        throw new Error('Recipient not found');
      }

      const subject = data.title || 'Notification from ORII Research Platform';
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Notification</h2>
          <p>Hello ${recipient.firstName},</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin: 0 0 10px 0;">${data.title}</h3>
            <p style="margin: 0;">${data.message}</p>
          </div>
          <p>Best regards,<br>ORII Research Platform</p>
        </div>
      `;

      await this.sendEmail(recipient.email, subject, html);
      console.log(`Notification email sent to ${recipient.email}`);
    } catch (error) {
      console.error('Error sending notification email:', error);
      throw error;
    }
  }

  async sendBulkEmail(templateId, recipients, variables = {}, options = {}) {
    try {
      if (!templateId || !recipients || !Array.isArray(recipients)) {
        throw new Error('Template ID and recipients array are required');
      }

      // Import models here to avoid circular dependencies
      const EmailTemplate = (await import('../models/EmailTemplate.js')).default;
      const EmailLog = (await import('../models/EmailLog.js')).default;
      const Handlebars = (await import('handlebars')).default;

      // Get the email template
      const template = await EmailTemplate.findById(templateId);
      if (!template) {
        throw new Error('Email template not found');
      }

      if (!template.isActive) {
        throw new Error('Email template is not active');
      }

      let successCount = 0;
      let failureCount = 0;
      const results = [];

      // Process each recipient
      for (const recipient of recipients) {
        try {
          // Merge template variables with recipient-specific variables
          const mergedVariables = {
            ...variables,
            ...recipient.variables,
            recipientName: recipient.name || recipient.email,
            recipientEmail: recipient.email
          };

          // Compile the template with variables
          const subjectTemplate = Handlebars.compile(template.subject);
          const htmlTemplate = Handlebars.compile(template.htmlContent);
          
          const subject = subjectTemplate(mergedVariables);
          const htmlContent = htmlTemplate(mergedVariables);

          // Create email log entry
          const emailLog = new EmailLog({
            templateId: template._id,
            templateName: template.name,
            recipientEmail: recipient.email,
            recipientName: recipient.name,
            recipientUserId: recipient.userId,
            subject: subject,
            status: 'pending',
            campaignId: options.campaignId,
            campaignName: options.campaignName,
            metadata: {
              variables: mergedVariables,
              senderUserId: options.senderUserId,
              senderName: options.senderName
            }
          });

          await emailLog.save();

          // Send the email
          await this.sendEmail(recipient.email, subject, htmlContent);

          // Update log status to sent
          emailLog.status = 'sent';
          emailLog.sentAt = new Date();
          await emailLog.save();

          successCount++;
          results.push({
            email: recipient.email,
            status: 'sent',
            logId: emailLog._id
          });

          console.log(`✅ Bulk email sent to ${recipient.email}`);

        } catch (emailError) {
          failureCount++;
          console.error(`❌ Failed to send email to ${recipient.email}:`, emailError);
          
          results.push({
            email: recipient.email,
            status: 'failed',
            error: emailError.message
          });

          // Try to update log if it exists
          try {
            const failedLog = await EmailLog.findOne({
              templateId: template._id,
              recipientEmail: recipient.email,
              status: 'pending'
            }).sort({ createdAt: -1 });

            if (failedLog) {
              failedLog.status = 'failed';
              failedLog.failureReason = emailError.message;
              await failedLog.save();
            }
          } catch (logError) {
            console.error('Failed to update email log:', logError);
          }
        }
      }

      // Update template usage count
      template.metadata.usageCount = (template.metadata.usageCount || 0) + successCount;
      template.metadata.lastUsed = new Date();
      await template.save();

      return {
        success: successCount > 0,
        successCount,
        failureCount,
        totalCount: recipients.length,
        results,
        message: `Bulk email completed: ${successCount} sent, ${failureCount} failed`
      };

    } catch (error) {
      console.error('Error in sendBulkEmail:', error);
      throw error;
    }
  }
}

export default EmailService;