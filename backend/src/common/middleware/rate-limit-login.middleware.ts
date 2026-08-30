import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// In-memory store; swap for Redis in production for multi-instance
const attempts = new Map<string, { count: number; lastAttempt: number; lockedUntil: number }>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 15 * 60 * 1000; // 15-minute lockout after max attempts

@Injectable()
export class RateLimitLoginMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const key = req.body?.email?.toLowerCase()?.trim() || req.ip || 'unknown';
    const now = Date.now();
    const record = attempts.get(key);

    if (record) {
      // Currently locked out
      if (record.lockedUntil > now) {
        const retryAfter = Math.ceil((record.lockedUntil - now) / 1000);
        throw new HttpException(
          `Too many login attempts. Try again in ${Math.ceil(retryAfter / 60)} minutes.`,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      // Window expired — reset
      if (now - record.lastAttempt > WINDOW_MS) {
        attempts.delete(key);
      }
    }

    // Attach a helper so the auth service can record failures
    (req as any).__recordLoginFailure = () => {
      const rec = attempts.get(key) || { count: 0, lastAttempt: 0, lockedUntil: 0 };
      rec.count += 1;
      rec.lastAttempt = now;
      if (rec.count >= MAX_ATTEMPTS) {
        rec.lockedUntil = now + LOCKOUT_MS;
      }
      attempts.set(key, rec);
    };

    (req as any).__clearLoginAttempts = () => {
      attempts.delete(key);
    };

    next();
  }
}
