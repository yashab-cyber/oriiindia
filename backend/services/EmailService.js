import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = null;
    this.init();
  }

  async init() {
    if (process.env.NODE_ENV === 'production') {
      // Production: Use actual SMTP server
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } else {
      // Development: Use Ethereal for testing
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
}

export default new EmailService();