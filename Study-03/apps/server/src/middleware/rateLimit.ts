import { Context } from 'hono';

interface RateLimitConfig {
  windowMs: number; // milliseconds
  maxRequests: number;
}

const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function getRateLimitKey(ctx: Context): string {
  const ip = ctx.req.header('x-forwarded-for') || ctx.req.header('x-real-ip') || 'unknown';
  const sessionId = ctx.req.query('sessionId') || ctx.req.header('x-session-id') || '';
  return sessionId ? `session:${sessionId}` : `ip:${ip}`;
}

export function rateLimit(config: RateLimitConfig) {
  return async (ctx: Context, next: () => Promise<void>) => {
    const key = getRateLimitKey(ctx);
    const now = Date.now();

    let entry = requestCounts.get(key);

    if (!entry || now > entry.resetTime) {
      entry = { count: 0, resetTime: now + config.windowMs };
      requestCounts.set(key, entry);
    }

    entry.count++;

    const remainingTime = Math.ceil((entry.resetTime - now) / 1000);

    if (entry.count > config.maxRequests) {
      ctx.header('Retry-After', String(remainingTime));
      return ctx.json(
        { error: 'Rate limit exceeded', retryAfter: remainingTime },
        429
      );
    }

    ctx.header('X-RateLimit-Limit', String(config.maxRequests));
    ctx.header('X-RateLimit-Remaining', String(Math.max(0, config.maxRequests - entry.count)));
    ctx.header('X-RateLimit-Reset', String(entry.resetTime));

    await next();
  };
}

// Cleanup old entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of requestCounts.entries()) {
    if (now > entry.resetTime) {
      requestCounts.delete(key);
    }
  }
}, 60000);
