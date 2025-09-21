import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Configure dotenv FIRST before importing services
dotenv.config();

// Import services
import EmailService from './services/EmailService.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import researchRoutes from './routes/research.js';
import eventRoutes from './routes/events.js';
import contactRoutes from './routes/contact.js';
import fileRoutes from './routes/files.js';
import adminRoutes from './routes/admin.js';
import reportRoutes from './routes/reports.js';
import notificationRoutes from './routes/notifications.js';
import collaborationRoutes from './routes/collaborations.js';
import jobRoutes from './routes/jobs.js';
import employeeRoutes from './routes/employee.js';
import attendanceRoutes from './routes/attendance.js';

// Import services
import EventReminderService from './services/EventReminderService.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());

// CORS configuration for production and development
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'https://oriiindia0.vercel.app', // Your actual Vercel URL
  'https://oriiindia.vercel.app', // Alternative Vercel URL
  'https://oriiindia-git-main-yashab-cyber.vercel.app', // Git branch URL
  'https://oriiindia-yashab-cyber.vercel.app' // User-specific URL
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Orii API Server is running',
    timestamp: new Date().toISOString()
  });
});

// Test email endpoint
app.post('/api/test-email', async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    
    if (!to) {
      return res.status(400).json({
        success: false,
        message: 'Recipient email is required'
      });
    }
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🚀 ORII Email Test</h1>
          <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Open Research Institute of India</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Email System Test Successful! ✅</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Great news! Your email system is working perfectly. This test email was sent from the ORII backend system.
          </p>
          
          ${message ? `
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Custom Message:</h3>
              <p style="color: #555; margin-bottom: 0;">${message}</p>
            </div>
          ` : ''}
          
          <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1976d2; margin-top: 0;">System Information:</h3>
            <ul style="color: #555; margin: 0; padding-left: 20px;">
              <li><strong>Sent At:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</li>
              <li><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</li>
              <li><strong>Email Service:</strong> Gmail SMTP</li>
              <li><strong>Status:</strong> Active and Functional</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #888; font-size: 14px; margin: 0;">
              This is an automated test email from ORII Research Platform<br>
              <a href="https://oriiindia0.vercel.app" style="color: #667eea; text-decoration: none;">Visit our platform</a>
            </p>
          </div>
        </div>
      </div>
    `;

    const emailService = new EmailService();
    await emailService.init(); // Initialize with current environment variables
    
    const result = await emailService.sendEmail(
      to,
      subject || '🚀 ORII Email System Test - Success!',
      html
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Test email sent successfully!',
        messageId: result.messageId,
        recipient: to
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: result.error
      });
    }

  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/collaborations', collaborationRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// 404 handler - must be last
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: `Route ${req.originalUrl} not found`,
      status: 404
    }
  });
});

// Database connection
const connectDB = async () => {
  try {
    // Check if MongoDB URI is properly configured
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('username:password')) {
      console.log('⚠️  MongoDB URI not configured - running in development mode without database');
      console.log('📝 Please update MONGODB_URI in .env file with your Atlas credentials');
      return false;
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🚀 Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.log('📝 Server will continue running without database connection');
    return false;
  }
};

// Start server
const startServer = async () => {
  const dbConnected = await connectDB();
  app.listen(PORT, () => {
    console.log(`🌟 Orii API Server running on port ${PORT}`);
    console.log(`📍 API URL: http://localhost:${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    if (!dbConnected) {
      console.log('⚠️  Database not connected - some API endpoints may not work');
    }
  });
};

startServer();

export default app;