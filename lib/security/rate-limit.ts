import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

type RateLimitResult = {
  success: boolean;
  reset: number;
  remaining: number;
};

const memoryStore = new Map<string, { count: number; resetAt: number }>();

let limiter: Ratelimit | null = null;

function getUpstashLimiter(): Ratelimit | null {
  if (limiter) return limiter;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const redis = new Redis({ url, token });
  limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '10 m'),
    analytics: true,
    prefix: 'camboea:pin:verify',
  });
  return limiter;
}

function hitMemoryWindow(identifier: string, now: number): RateLimitResult {
  const windowMs = 10 * 60 * 1000;
  const maxHits = 5;
  const resetAtDefault = now + windowMs;
  const current = memoryStore.get(identifier);

  if (!current || current.resetAt <= now) {
    memoryStore.set(identifier, { count: 1, resetAt: resetAtDefault });
    return { success: true, reset: resetAtDefault, remaining: maxHits - 1 };
  }

  const next = { count: current.count + 1, resetAt: current.resetAt };
  memoryStore.set(identifier, next);
  return {
    success: next.count <= maxHits,
    reset: current.resetAt,
    remaining: Math.max(0, maxHits - next.count),
  };
}

export async function limitAdminPinVerify(identifier: string): Promise<RateLimitResult> {
  const candidate = getUpstashLimiter();
  if (!candidate) {
    return hitMemoryWindow(identifier, Date.now());
  }

  const result = await candidate.limit(identifier);
  return {
    success: result.success,
    reset: result.reset,
    remaining: result.remaining,
  };
}
