import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Import configurations and middleware
import { connectDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { authMiddleware } from './middleware/auth';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import competitionRoutes from './routes/competitions';
import quizRoutes from './routes/quiz';
import uploadRoutes from './routes/upload';
import supportRoutes from './routes/support';
import notificationRoutes from './routes/notifications';
import adminRoutes from './routes/admin';

const app = express();
app.set('trust proxy', 1); // Trust first proxy (Render)
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// CORS configuration (allow multiple dev origins like localhost and 127.0.0.1)
const allowedOrigins = (process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173']
);
app.use(cors({
  origin: allowedOrigins,
  credentials: (process.env.CORS_CREDENTIALS ?? 'true') === 'true',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Sarvagyyam Prashanasaar API is running',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || 'v1'
  });
});

// API routes
const apiVersion = process.env.API_VERSION || 'v1';
app.use(`/api/${apiVersion}/auth`, authRoutes);
app.use(`/api/${apiVersion}/users`, authMiddleware, userRoutes);
app.use(`/api/${apiVersion}/competitions`, competitionRoutes); // Some routes are public, auth handled per route
app.use(`/api/${apiVersion}/quiz`, authMiddleware, quizRoutes);
app.use(`/api/${apiVersion}/upload`, authMiddleware, uploadRoutes);
app.use(`/api/${apiVersion}/support`, supportRoutes);
app.use(`/api/${apiVersion}/notifications`, notificationRoutes);
app.use(`/api/${apiVersion}/admin`, adminRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Log notification provider info (helpful for debugging env issues)
    try {
      const provider = (process.env.WHATSAPP_PROVIDER || '').toLowerCase() || 'none';
      const twSid = process.env.TWILIO_ACCOUNT_SID || '';
      const twToken = process.env.TWILIO_AUTH_TOKEN ? '*****' : '';
      const twFrom = process.env.TWILIO_WHATSAPP_FROM || '';
      console.log(`[notificationService] Provider: ${provider}`);
      if (provider === 'twilio') {
        console.log(`[notificationService] Twilio SID: ${twSid ? 'present' : 'missing'}, Auth Token: ${twToken ? 'present' : 'missing'}, From: ${twFrom ? twFrom : 'missing'}`);
      } else {
        const apiUrl = process.env.WHATSAPP_API_URL || '';
        const apiKey = process.env.WHATSAPP_API_KEY ? '*****' : '';
        console.log(`[notificationService] Generic API URL: ${apiUrl ? 'present' : 'missing'}, API Key: ${apiKey ? 'present' : 'missing'}`);
      }
    } catch (e) {
      // ignore logging errors
    }
    // Try to connect to database (non-blocking)
    let dbStatusSummary = '';
    try {
      await connectDatabase();
      dbStatusSummary = '✅ DB: Connected';
      console.log('✅ Database connected successfully');
    } catch (dbError) {
      const msg = (dbError as Error).message || String(dbError);
      dbStatusSummary = `❌ DB: Not connected - ${msg}`;
      console.warn('⚠️ Database connection failed, server will start without DB:', msg);
      console.warn('🔧 Please check your database configuration and connection');
    }

    // Start listening
    app.listen(PORT, () => {
      console.log('================ Sarvagyyam Prashanasaar Backend =================');
      console.log(`🟢 Server: http://localhost:${PORT}`);
      console.log(dbStatusSummary);
      console.log(`📖 Env: ${process.env.NODE_ENV}`);
      console.log(`🔗 API: http://localhost:${PORT}/api/${apiVersion}`);
      console.log(`💚 Health: http://localhost:${PORT}/health`);
      console.log('-------------------------------------------------------');
      console.log('📋 Endpoints:');
      console.log(`   GET  /health - Health check`);
      console.log(`   POST /api/${apiVersion}/auth/login - User login`);
      console.log(`   POST /api/${apiVersion}/auth/register - User registration`);
      console.log('-------------------------------------------------------');
      console.log('🔧 DB help if needed:');
      console.log('   1) Ensure SQL Server/LocalDB is running');
      console.log('   2) Check backend/src/config/database.ts');
      console.log('   3) Verify DB exists and tables created');
      console.log('=======================================================');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

startServer();

export default app;
