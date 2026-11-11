const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
const { checkEscalations } = require('./services/escalationService');
const { ESCALATION_CRON } = require('./config/scoring');

// Import routes
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Fail fast on missing critical configuration
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  console.error('JWT_SECRET must be set in .env (at least 16 characters).');
  process.exit(1);
}
if (!process.env.GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY is not set - complaints will use the keyword fallback classifier.');
}

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize Express app
const app = express();

// Middleware - allow both localhost and 127.0.0.1 so frontend works either way
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((o) => o.trim())
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: (origin, callback) => {
    // No origin = server-to-server / curl / Postman
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    // In development, allow any localhost / 127.0.0.1 port (Vite may pick 3001, 5173, ...)
    const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    if (process.env.NODE_ENV !== 'production' && isLocal) return callback(null, true);
    const err = new Error(`Origin ${origin} is not allowed. Add it to CLIENT_URL in server/.env.`);
    err.status = 403;
    callback(err);
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Serve uploaded files (no /api prefix so URL is /uploads/...)
app.use('/uploads', express.static(uploadsDir));

// Rate limiting: strict on auth (brute force), moderate on complaint creation (AI cost)
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again later.' } });
const createLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false,
  skip: (req) => req.method !== 'POST',
  message: { success: false, message: 'Complaint submission limit reached. Please try again later.' } });
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/complaints', createLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.status && err.status < 500 ? err.message : 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Database connection
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not defined in .env');
    process.exit(1);
  }
  try {
    // Ensure database name is in Atlas URI (add /smart-city-grievance before ?)
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`Gemini model: ${process.env.GEMINI_MODEL || 'gemini-2.5-flash'}`);
    });

    // Automatic escalation check (default: hourly) + once at startup
    cron.schedule(ESCALATION_CRON, async () => {
      try {
        const r = await checkEscalations();
        console.log(`[cron] escalation check done: ${r.updated} updated, ${r.escalated} escalated`);
      } catch (e) {
        console.error('[cron] escalation check failed:', e.message);
      }
    });
    checkEscalations().catch((e) => console.error('Initial escalation check failed:', e.message));
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});
