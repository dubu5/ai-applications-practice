import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { initDatabase, closeDatabase } from './db/db.js';
import { rateLimit } from './middleware/rateLimit.js';
import sessionsRouter from './routes/sessions.js';
import answersRouter from './routes/answers.js';
import leaderboardRouter from './routes/leaderboard.js';

// Initialize database
const dbPath = process.env.DATABASE_URL || './quiz.db';
initDatabase(dbPath);

const app = new Hono();

// CORS middleware
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',');
app.use('*', cors({
  origin: (origin) => {
    if (!origin) return '*';
    return allowedOrigins.some(allowed => origin.includes(allowed.trim())) ? origin : '';
  },
  credentials: true,
}));

// Rate limiting middleware
const maxRequestsPerMinute = parseInt(process.env.MAX_REQUESTS_PER_MINUTE || '30', 10);
app.use('/api/*', rateLimit({
  windowMs: 60000, // 1 minute
  maxRequests: maxRequestsPerMinute,
}));

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }));

// API routes
app.route('/api/sessions', sessionsRouter);
app.route('/api/sessions', answersRouter);
app.route('/api/leaderboard', leaderboardRouter);

// 404 handler
app.notFound((c) => c.json({ error: 'Not found' }, 404));

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  closeDatabase();
  process.exit(0);
});

const port = parseInt(process.env.PORT || '3000', 10);

console.log(`🚀 Server starting on port ${port}`);
console.log(`📊 Database: ${dbPath}`);

export default {
  port,
  fetch: app.fetch,
};
