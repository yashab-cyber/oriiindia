import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

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

// Import services
import EventReminderService from './services/EventReminderService.js';

// Load environment variables
dotenv.config();

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