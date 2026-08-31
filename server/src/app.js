/**
 * app.js
 * Express application configuration, CORS handling, and route registration.
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

import interviewRoutes from './routes/interviewRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';

const app = express();

// Permissive CORS for local and Vercel domains
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));
app.options('*', cors());

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure DB is connected for API operations
app.use(async (req, res, next) => {
  if (req.path === '/api/health' || req.path === '/' || req.method === 'OPTIONS') {
    return next();
  }
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection error in request middleware:', err.message);
    next();
  }
});

// Root welcome & API index
app.get(['/', '/api'], (req, res) => {
  res.status(200).json({
    status: 'active',
    service: 'MockMate AI Backend REST API',
    version: '2.0.0',
    endpoints: {
      health: '/api/health',
      interviews: '/api/interviews',
      resumes: '/api/resumes',
      reports: '/api/reports',
      analytics: '/api/analytics',
      recommendations: '/api/recommendations',
    },
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
  });
});

// Register REST API Routes
app.use('/api/interviews', interviewRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
