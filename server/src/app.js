import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { sendSuccess, sendError } from './lib/response.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import internshipRoutes from './routes/internshipRoutes.js';
import roadmapRoutes from './routes/roadmapRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

dotenv.config();

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((o) => o.trim());

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  })
);
app.use(express.json({ limit: '256kb' }));
app.use(cookieParser());

// Health endpoint (Section 9)
app.get('/api/health', (req, res) => {
  return sendSuccess(
    res,
    {
      status: 'ok',
      service: 'skillbridge-ai-server',
      timestamp: new Date().toISOString(),
      aiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim())
    },
    'SkillBridge AI API is healthy.'
  );
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api', internshipRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler
app.use((req, res) => {
  return sendError(res, 'NOT_FOUND', `Route ${req.method} ${req.originalUrl} not found.`, 404);
});

// Central error handler (never expose stack traces in production per Section 10)
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err.message);
  return sendError(
    res,
    'SERVER_ERROR',
    'An unexpected error occurred on the server.',
    500
  );
});

export default app;
