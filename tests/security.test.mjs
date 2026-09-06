import assert from "node:assert/strict";
import test from "node:test";
import {
  checkRateLimit,
  limitForPath,
  resetRateLimitBuckets,
  resolveCorsOrigin,
} from "../app/lib/security.ts";

test("auth login path uses strict rate limit", () => {
  const cfg = limitForPath("/api/auth/login");
  assert.equal(cfg.limit, 10);
  assert.equal(cfg.windowMs, 60_000);
});

test("cors allows localhost origin by default", () => {
  assert.equal(resolveCorsOrigin("http://localhost:3006"), "http://localhost:3006");
  assert.equal(resolveCorsOrigin("https://evil.example"), null);
});

test("rate limit blocks after threshold", () => {
  resetRateLimitBuckets();
  const key = "test-ip:/api/auth/login:POST";
  for (let i = 0; i < 10; i += 1) {
    const r = checkRateLimit(key, 10, 60_000);
    assert.equal(r.allowed, true);
  }
  const blocked = checkRateLimit(key, 10, 60_000);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.remaining, 0);
});
