import { Hono } from 'hono';
import { createSession, getSessionWithQuestions, getAnsweredQuestionsCount, calculateSessionStats } from '../services/sessionService.js';

const router = new Hono();

// POST /api/sessions - Create a new session
router.post('/', async (c) => {
  try {
    const body = await c.req.json() as any;

    const response = createSession({
      nickname: body.nickname,
    });

    return c.json(response, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
});

// GET /api/sessions/:id - Get session details
router.get('/:id', async (c) => {
  try {
    const sessionId = c.req.param('id');
    const session = getSessionWithQuestions(sessionId);

    if (!session) {
      return c.json({ error: 'Session not found' }, 404);
    }

    const answeredCount = getAnsweredQuestionsCount(sessionId);
    const stats = calculateSessionStats(sessionId);

    return c.json({
      sessionId: session.id,
      nickname: session.nickname,
      status: session.status,
      currentQuestionIndex: answeredCount,
      answeredCount,
      totalScore: session.total_score,
      totalTime: session.total_time,
      questions: session.questions,
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export default router;
