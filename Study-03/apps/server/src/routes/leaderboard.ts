import { Hono } from 'hono';
import { getLeaderboard, getMyRank } from '../services/leaderboardService.js';

const router = new Hono();

// GET /api/leaderboard - Get leaderboard
router.get('/', async (c) => {
  try {
    const limitStr = c.req.query('limit') || '100';
    const limit = Math.min(parseInt(limitStr), 100);

    const entries = getLeaderboard(limit);

    return c.json({
      entries,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// GET /api/leaderboard/me - Get my rank
router.get('/me', async (c) => {
  try {
    const sessionId = c.req.query('sessionId');

    if (!sessionId) {
      return c.json({ error: 'sessionId is required' }, 400);
    }

    const result = getMyRank(sessionId);

    if (!result) {
      return c.json({ error: 'No leaderboard entry found' }, 404);
    }

    return c.json(result);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export default router;
