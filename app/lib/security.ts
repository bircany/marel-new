/**
 * Edge-safe CORS + sliding-window rate limit helpers for Marel API middleware.
 * Prod: UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN → distributed Redis.
 * Local/dev: in-memory Map (tek instance).
 */

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSec: number;
};

type WindowBucket = { count: number; resetAt: number };

const buckets = new Map<string, WindowBucket>();

const DEFAULT_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3005",
  "http://localhost:3006",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3006",
];

export function getAllowedOrigins(): string[] {
  const fromEnv =
    typeof process !== "undefined" && process.env?.CORS_ALLOWED_ORIGINS
      ? process.env.CORS_ALLOWED_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
  return fromEnv.length ? fromEnv : DEFAULT_ORIGINS;
}

export function resolveCorsOrigin(requestOrigin: string | null): string | null {
  if (!requestOrigin) return null;
  const allowed = getAllowedOrigins();
  if (allowed.includes("*")) return "*";
  return allowed.includes(requestOrigin) ? requestOrigin : null;
}

export function applyCorsHeaders(headers: Headers, request: Request, allowCredentials = true): void {
  const origin = resolveCorsOrigin(request.headers.get("origin"));
  if (!origin) return;
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Vary", "Origin");
  if (allowCredentials && origin !== "*") {
    headers.set("Access-Control-Allow-Credentials", "true");
  }
  headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  headers.set(
    "Access-Control-Allow-Headers",
    request.headers.get("access-control-request-headers") ?? "content-type, authorization, x-session-id",
  );
  headers.set("Access-Control-Max-Age", "86400");
}

export function corsPreflightResponse(request: Request): Response {
  const headers = new Headers();
  applyCorsHeaders(headers, request);
  const origin = resolveCorsOrigin(request.headers.get("origin"));
  if (!origin && request.headers.get("origin")) {
    return new Response(JSON.stringify({ error: "CORS: origin izinli değil." }), {
      status: 403,
      headers: { "content-type": "application/json" },
    });
  }
  return new Response(null, { status: 204, headers });
}

/** Route-aware limits (requests per windowMs). */
export function limitForPath(pathname: string): { limit: number; windowMs: number } {
  if (pathname.startsWith("/api/auth/login") || pathname.startsWith("/api/auth/register")) {
    return { limit: 10, windowMs: 60_000 };
  }
  if (pathname.startsWith("/api/contact")) {
    return { limit: 8, windowMs: 60_000 };
  }
  if (pathname.startsWith("/api/orders/track")) {
    return { limit: 12, windowMs: 60_000 };
  }
  if (pathname.startsWith("/api/admin")) {
    return { limit: 60, windowMs: 60_000 };
  }
  if (pathname.startsWith("/api/")) {
    return { limit: 120, windowMs: 60_000 };
  }
  return { limit: 300, windowMs: 60_000 };
}

export function clientKey(request: Request): string {
  const forwarded =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  return forwarded;
}

function memoryRateLimit(key: string, limit: number, windowMs: number, now = Date.now()): RateLimitResult {
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, limit, remaining: limit - 1, retryAfterSec: Math.ceil(windowMs / 1000) };
  }
  if (existing.count >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }
  existing.count += 1;
  return {
    allowed: true,
    limit,
    remaining: Math.max(0, limit - existing.count),
    retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
  };
}

function upstashConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

/** Upstash REST: INCR + EXPIRE sliding fixed window. */
async function redisRateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  const redisKey = `rl:${key}`;
  const ttlSec = Math.max(1, Math.ceil(windowMs / 1000));

  const pipeline = [
    ["INCR", redisKey],
    ["EXPIRE", redisKey, String(ttlSec), "NX"],
    ["TTL", redisKey],
  ];

  const response = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(pipeline),
  });

  if (!response.ok) {
    return memoryRateLimit(key, limit, windowMs);
  }

  const rows = (await response.json()) as Array<{ result?: number }>;
  const count = Number(rows?.[0]?.result ?? 1);
  const ttl = Number(rows?.[2]?.result ?? ttlSec);
  const retryAfterSec = ttl > 0 ? ttl : ttlSec;

  if (count > limit) {
    return { allowed: false, limit, remaining: 0, retryAfterSec };
  }
  return {
    allowed: true,
    limit,
    remaining: Math.max(0, limit - count),
    retryAfterSec,
  };
}

/** Sync helper (tests / memory-only). */
export function checkRateLimit(key: string, limit: number, windowMs: number, now = Date.now()): RateLimitResult {
  return memoryRateLimit(key, limit, windowMs, now);
}

/** Preferred: Redis when configured, else memory. */
export async function checkRateLimitAsync(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  if (upstashConfigured()) {
    try {
      return await redisRateLimit(key, limit, windowMs);
    } catch {
      return memoryRateLimit(key, limit, windowMs);
    }
  }
  return memoryRateLimit(key, limit, windowMs);
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "Retry-After": String(result.retryAfterSec),
  };
}

/** Test helper — clears in-memory buckets. */
export function resetRateLimitBuckets(): void {
  buckets.clear();
}
