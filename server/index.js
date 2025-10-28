#!/usr/bin/env node

/**
 * Platform Admin Portal - Node.js Server
 * Multi-tenant platform administration for pet care ecosystem
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import route modules
import authRoutes from './routes/auth.js';
import organizationsRoutes from './routes/organizations.js';
import usersRoutes from './routes/users.js';
import subscriptionsRoutes from './routes/subscriptions.js';
import settingsRoutes from './routes/settings.js';
import petsRoutes from './routes/pets.js';
import emrRoutes from './routes/emr.js';
import channelPartnersRoutes from './routes/channel-partners.js';
import couponsRoutes from './routes/coupons.js';

// ES modules equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://xnetjsifkhtbbpadwlxy.supabase.co"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
});

// Middleware
app.use(limiter);
app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:8080'],
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/pets', petsRoutes);
app.use('/api/emr', emrRoutes);
app.use('/api/channel-partners', channelPartnersRoutes);
app.use('/api/coupons', couponsRoutes);

// Static files (if serving frontend)
if (process.env.SERVE_FRONTEND === 'true') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  // Catch all handler for SPA routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(isDevelopment && { stack: err.stack }),
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      path: req.path,
    },
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`[rocket] Platform Admin Portal API Server running on port ${PORT}`);
  console.log(`[chart] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[link] Health check: http://localhost:${PORT}/health`);
});

export default app;