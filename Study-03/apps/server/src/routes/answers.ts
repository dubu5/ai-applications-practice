import { Hono } from 'hono';
import { submitAnswer } from '../services/answerService.js';
import { finishGame } from '../services/leaderboardService.js';

const router = new Hono();

// POST /api/sessions/:id/answers - Submit an answer
router.post('/:id/answers', async (c) => {
  try {
    const sessionId = c.req.param('id');
    const body = await c.req.json() as any;

    const response = submitAnswer({
      sessionId,
      questionId: body.questionId,
      answerIndex: body.answerIndex,
      timeSpent: body.timeSpent,
    });

    return c.json(response);
  } catch (error: any) {
    if (error.message === 'This question has already been answered') {
      return c.json({ error: error.message }, 409);
    }
    return c.json({ error: error.message }, 400);
  }
});

// POST /api/sessions/:id/finish - Finish the game
router.post('/:id/finish', async (c) => {
  try {
    const sessionId = c.req.param('id');

    const response = finishGame({
      sessionId,
    });

    return c.json(response, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
});

export default router;
