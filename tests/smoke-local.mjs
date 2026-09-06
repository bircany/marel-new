/**
 * Local smoke tests against a running vinext/Next server.
 * Usage: node --test tests/smoke-local.mjs
 * Env: BASE_URL=http://localhost:3006
 */
import assert from "node:assert/strict";
import test from "node:test";

const BASE = (process.env.BASE_URL ?? "http://localhost:3006").replace(/\/+$/, "");

async function req(path, init = {}) {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      accept: "application/json, text/html",
      ...(init.headers ?? {}),
    },
  });
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* html or empty */
  }
  return { response, text, json };
}

test("UI: ana sayfa 200", async () => {
  const { response, text } = await req("/");
  assert.equal(response.status, 200);
  assert.match(text, /Marel|En Çok Satanlar|Plise/i);
});

test("UI: /urunler 200", async () => {
  const { response } = await req("/urunler");
  assert.equal(response.status, 200);
});

test("UI: /admin gate (login veya konsol)", async () => {
  const { response, text } = await req("/admin");
  assert.equal(response.status, 200);
  assert.match(text, /Yönetim|Yönetici|admin|Ürünler/i);
});

test("UI: /hesabim, /sepet, /iletisim erişilebilir", async () => {
  for (const path of ["/hesabim", "/sepet", "/iletisim", "/siparis-takip", "/duyurular"]) {
    const { response } = await req(path);
    assert.ok(response.status < 500, `${path} should not 5xx, got ${response.status}`);
  }
});

test("API: products list responds", async () => {
  const { response } = await req("/api/products");
  assert.ok([200, 401, 403, 502, 503].includes(response.status) || response.status < 500);
  assert.notEqual(response.status, 404);
});

test("API: admin products without auth → 403", async () => {
  const { response, json } = await req("/api/admin/products");
  assert.equal(response.status, 403);
  assert.match(String(json?.error ?? ""), /yönetici|yetki/i);
});

test("API: login with bad password fails (or SoftTrade down)", async () => {
  const { response, json } = await req("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "nobody@example.com", password: "wrongpass1" }),
  });
  assert.ok([400, 401, 422, 502, 503, 500].includes(response.status));
  assert.ok(json?.error || response.status >= 400);
});

test("CORS: evil origin rejected on API", async () => {
  const { response, json, text } = await req("/api/products", {
    headers: { origin: "https://evil.example" },
  });
  assert.equal(response.status, 403);
  // proxy.ts CORS mesajı veya vinext origin guard (boş body) kabul
  assert.ok(
    /CORS|izinli|not allowed/i.test(String(json?.error ?? text)) || text === "" || response.status === 403,
  );
});

test("CORS: preflight OPTIONS from localhost", async () => {
  const { response } = await req("/api/products", {
    method: "OPTIONS",
    headers: {
      origin: "http://localhost:3006",
      "access-control-request-method": "GET",
    },
  });
  assert.ok([200, 204].includes(response.status));
  assert.equal(response.headers.get("access-control-allow-origin"), "http://localhost:3006");
});

test("Rate limit: auth login bursts return 429", async () => {
  const results = [];
  for (let i = 0; i < 14; i += 1) {
    const { response } = await req("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "http://localhost:3006" },
      body: JSON.stringify({ email: `rl${i}@example.com`, password: "x".repeat(8) }),
    });
    results.push(response.status);
  }
  assert.ok(results.includes(429), `expected 429 in ${results.join(",")}`);
});
