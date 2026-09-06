/**
 * Marel admin CRUD + storefront sync E2E
 * Requires: API :8081, storefront :3000
 * Run: node --test tests/admin-crud-e2e.mjs
 */
import assert from "node:assert/strict";
import test from "node:test";

const API = (process.env.API_URL ?? "http://localhost:8081/api/v1").replace(/\/+$/, "");
const APP = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
const ADMIN = {
  email: process.env.ADMIN_EMAIL ?? "admin@softtrade.com",
  password: process.env.ADMIN_PASSWORD ?? "admin123",
};

const results = [];
function record(id, ok, detail = "") {
  results.push({ id, ok, detail });
  if (!ok) console.error(`FAIL ${id}: ${detail}`);
  else console.log(`PASS ${id}${detail ? ` — ${detail}` : ""}`);
}

async function api(path, { method = "GET", token, body, formData, headers = {} } = {}) {
  const h = { accept: "application/json", ...headers };
  if (token) h.authorization = `Bearer ${token}`;
  let payload = body;
  if (body && !(body instanceof FormData) && formData !== true) {
    h["content-type"] = "application/json";
    payload = JSON.stringify(body);
  }
  if (formData === true) payload = body;
  const res = await fetch(`${API}${path}`, { method, headers: h, body: payload });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* */ }
  return { res, json, text };
}

async function app(path, { method = "GET", cookie, body, formData, headers = {} } = {}) {
  const h = { accept: "application/json", ...headers };
  if (cookie) h.cookie = cookie;
  let payload = body;
  if (body && !formData && typeof body === "object" && !(body instanceof FormData)) {
    h["content-type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${APP}${path}`, { method, headers: h, body: formData ? body : payload, redirect: "manual" });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* */ }
  const setCookie = res.headers.getSetCookie?.() ?? [];
  return { res, json, text, setCookie };
}

function cookieJar(setCookie) {
  return setCookie.map((c) => c.split(";")[0]).join("; ");
}

let adminToken = "";
let marelCookie = "";
let createdProductId = "";
let createdProductSlug = "";
let orderId = "";
let reviewId = "";
let announcementId = "";
const stamp = Date.now();

test("01 SoftTrade health", async () => {
  const res = await fetch("http://localhost:8081/up");
  record("API-HEALTH", res.status === 200, `status=${res.status}`);
  assert.equal(res.status, 200);
});

test("02 SoftTrade admin login", async () => {
  const { res, json } = await api("/auth/login", { method: "POST", body: ADMIN });
  const ok = res.status === 200 && json?.success && json?.data?.access_token && json?.data?.user?.role === "admin";
  adminToken = json?.data?.access_token ?? "";
  record("API-ADMIN-LOGIN", ok, `role=${json?.data?.user?.role}`);
  assert.ok(ok);
});

test("03 SoftTrade products list (Marel brand)", async () => {
  const { res, json } = await api("/products?status=active&per_page=50");
  const items = json?.data ?? [];
  const ok = res.status === 200 && Array.isArray(items) && items.length > 0;
  record("API-PRODUCTS-LIST", ok, `count=${items.length}`);
  assert.ok(ok);
});

test("04 SoftTrade admin CREATE product", async () => {
  const brands = await api("/brands");
  const brandId = (brands.json?.data ?? []).find((b) => b.slug === "marel" || b.name === "Marel")?.id;
  const cats = await api("/categories");
  const flat = [];
  const walk = (list) => { for (const c of list ?? []) { flat.push(c); if (c.children) walk(c.children); } };
  walk(cats.json?.data);
  const categoryId = flat.find((c) => /plise|honeycomb|diamond/i.test(c.slug + c.name))?.id ?? flat[0]?.id;

  const form = new FormData();
  form.set("category_id", String(categoryId));
  if (brandId) form.set("brand_id", String(brandId));
  form.set("name", `E2E Test Perde ${stamp}`);
  form.set("slug", `e2e-test-perde-${stamp}`);
  form.set("sku", `E2E-${stamp}`);
  form.set("description", "Otomatik E2E test ürünü — silinebilir.");
  form.set("price", "1999.50");
  form.set("stock", "7");
  form.set("status", "active");
  form.set("is_featured", "1");

  const { res, json } = await api("/admin/products", { method: "POST", token: adminToken, body: form, formData: true });
  const ok = (res.status === 200 || res.status === 201) && json?.success && json?.data?.id;
  createdProductId = String(json?.data?.id ?? "");
  createdProductSlug = json?.data?.slug ?? `e2e-test-perde-${stamp}`;
  record("API-PRODUCT-CREATE", ok, `id=${createdProductId} slug=${createdProductSlug}`);
  assert.ok(ok);
});

test("05 SoftTrade admin UPDATE product price/stock", async () => {
  const { res, json } = await api(`/admin/products/${createdProductId}`, {
    method: "PUT",
    token: adminToken,
    body: { price: 1888.0, stock: 11, status: "active", is_featured: true },
  });
  const ok = res.status === 200 && json?.success;
  record("API-PRODUCT-UPDATE", ok, `status=${res.status}`);
  assert.ok(ok);
});

test("06 SYNC: storefront sees updated product via SoftTrade", async () => {
  const { res, json } = await api(`/products/${createdProductSlug}`);
  const p = json?.data;
  const ok = res.status === 200 && p?.slug === createdProductSlug && Number(p?.price) === 1888;
  record("SYNC-PRODUCT-SOFTTRADE", ok, `price=${p?.price} stock=${p?.stock}`);
  assert.ok(ok);
});

test("07 Marel BFF login sets cookie", async () => {
  const { res, json, setCookie } = await app("/api/auth/login", { method: "POST", body: ADMIN });
  marelCookie = cookieJar(setCookie);
  const ok = res.status === 200 && json?.success && /marel_token=/.test(marelCookie);
  record("MAREL-LOGIN", ok, `cookies=${marelCookie.slice(0, 40)}…`);
  assert.ok(ok);
});

test("08 Marel /api/admin/products requires auth", async () => {
  const { res } = await app("/api/admin/products");
  record("MAREL-ADMIN-UNAUTH", res.status === 403, `status=${res.status}`);
  assert.equal(res.status, 403);
});

test("09 Marel admin products list", async () => {
  const { res, json } = await app("/api/admin/products", { cookie: marelCookie });
  const products = json?.products ?? [];
  const found = products.some((p) => String(p.id) === createdProductId || p.slug === createdProductSlug);
  const ok = res.status === 200 && found;
  record("MAREL-ADMIN-PRODUCTS", ok, `count=${products.length} found=${found}`);
  assert.ok(ok);
});

test("10 Marel admin PATCH product (BFF → SoftTrade) + sync", async () => {
  const { res, json } = await app(`/api/admin/products/${createdProductId}`, {
    method: "PATCH",
    cookie: marelCookie,
    body: { price: 177700, stock: 15, active: true, featured: true }, // kuruş
  });
  const patchOk = res.status === 200 && json?.ok;
  const check = await api(`/products/${createdProductSlug}`);
  const price = Number(check.json?.data?.price);
  const syncOk = price === 1777;
  record("MAREL-PRODUCT-PATCH-SYNC", patchOk && syncOk, `patch=${patchOk} softtradePrice=${price}`);
  assert.ok(patchOk && syncOk);
});

test("11 Customer register + cart + order CREATE", async () => {
  const email = `e2e.customer.${stamp}@marel.test`;
  const password = "testpass12";
  const phone = `555${String(stamp).slice(-7)}`;
  const reg = await api("/auth/register", {
    method: "POST",
    body: {
      first_name: "E2E",
      last_name: "Musteri",
      email,
      phone,
      password,
      password_confirmation: password,
    },
  });
  let token = reg.json?.data?.access_token;
  if (!token) {
    const login = await api("/auth/login", { method: "POST", body: { email, password } });
    token = login.json?.data?.access_token;
    record("CUSTOMER-REGISTER", Boolean(token), `reg=${reg.res.status} ${JSON.stringify(reg.json?.errors ?? reg.json?.message)} login=${login.res.status}`);
  } else {
    record("CUSTOMER-REGISTER", true, "direct softtrade");
  }
  assert.ok(token);

  const add = await api("/cart", {
    method: "POST",
    token,
    body: { product_id: Number(createdProductId), quantity: 1 },
  });
  record("CART-ADD", add.res.status < 400, `status=${add.res.status} ${add.json?.message ?? ""}`);
  assert.ok(add.res.status < 400);

  const addr = await api("/addresses", {
    method: "POST",
    token,
    body: {
      title: "Ev",
      name: "E2E Musteri",
      phone,
      city: "Istanbul",
      district: "Kadikoy",
      neighborhood: "Moda",
      full_address: "E2E Test Mah. No:1 Daire:2",
      zip_code: "34000",
      is_default: true,
    },
  });
  const addressId = addr.json?.data?.id;
  record("ADDRESS-CREATE", addr.res.status < 400 && Boolean(addressId), `status=${addr.res.status} id=${addressId} ${addr.json?.message ?? ""}`);
  assert.ok(addressId);

  const order = await api("/orders", {
    method: "POST",
    token,
    body: {
      address_id: addressId,
      payment_method: "cash_on_delivery",
      notes: "E2E test order",
    },
  });
  orderId = String(order.json?.data?.id ?? "");
  record(
    "ORDER-CREATE",
    order.res.status < 400 && Boolean(orderId),
    `status=${order.res.status} id=${orderId} ${order.json?.message ?? ""} ${JSON.stringify(order.json?.errors ?? {})}`,
  );
  assert.ok(orderId);

  // processing → delivered so review is allowed
  const processing = await api(`/admin/orders/${orderId}/status`, {
    method: "PUT",
    token: adminToken,
    body: { status: "processing", note: "E2E processing" },
  });
  record("ORDER-PROCESSING", processing.res.status === 200, `status=${processing.res.status}`);

  const delivered = await api(`/admin/orders/${orderId}/status`, {
    method: "PUT",
    token: adminToken,
    body: { status: "delivered", note: "E2E deliver for review" },
  });
  record("ORDER-DELIVER", delivered.res.status === 200, `status=${delivered.res.status}`);
});

test("12 Admin orders list + UPDATE status via Marel BFF", async () => {
  const list = await api("/admin/orders?per_page=50", { token: adminToken });
  const orders = list.json?.data ?? [];
  const arr = Array.isArray(orders) ? orders : [];
  if (!orderId && arr[0]) orderId = String(arr[0].id);
  record("ADMIN-ORDERS-LIST", list.res.status === 200 && arr.length > 0, `count=${arr.length}`);

  assert.ok(orderId);
  // Reset to processing so BFF patch can move to shipped
  await api(`/admin/orders/${orderId}/status`, {
    method: "PUT",
    token: adminToken,
    body: { status: "processing", admin_notes: "E2E reset before BFF" },
  });

  const marelUpd = await app(`/api/admin/orders/${orderId}`, {
    method: "PATCH",
    cookie: marelCookie,
    body: { status: "shipped", note: "Marel BFF sync" },
  });
  record("MAREL-ORDER-PATCH", marelUpd.res.status === 200, `status=${marelUpd.res.status} ${marelUpd.json?.error ?? ""}`);

  const softUpd = await api(`/admin/orders/${orderId}/status`, {
    method: "PUT",
    token: adminToken,
    body: { status: "processing", admin_notes: "E2E admin update" },
  });
  record("ADMIN-ORDER-UPDATE", softUpd.res.status === 200, `status=${softUpd.res.status}`);
});

test("13 Reviews: create after purchase + admin moderate", async () => {
  const email = `e2e.customer.${stamp}@marel.test`;
  const login = await api("/auth/login", { method: "POST", body: { email, password: "testpass12" } });
  const token = login.json?.data?.access_token;
  assert.ok(token);

  // ensure delivered
  if (orderId) {
    await api(`/admin/orders/${orderId}/status`, {
      method: "PUT",
      token: adminToken,
      body: { status: "delivered", note: "for review" },
    });
  }

  const create = await api("/reviews", {
    method: "POST",
    token,
    body: {
      product_id: Number(createdProductId),
      rating: 5,
      title: "E2E Yorum",
      comment: "Otomatik test yorumu — kaliteli ürün.",
    },
  });
  reviewId = String(create.json?.data?.id ?? "");
  record("REVIEW-CREATE", create.res.status < 400 && Boolean(reviewId), `status=${create.res.status} ${create.json?.message ?? ""} id=${reviewId}`);
  assert.ok(reviewId);

  const mod = await api(`/admin/reviews/${reviewId}/status`, {
    method: "PUT",
    token: adminToken,
    body: { status: "approved", admin_note: "Teşekkürler — E2E" },
  });
  record("ADMIN-REVIEW-APPROVE", mod.res.status === 200, `status=${mod.res.status}`);

  const marelMod = await app(`/api/admin/reviews/${reviewId}`, {
    method: "PATCH",
    cookie: marelCookie,
    body: { status: "approved", adminReply: "Marel yanıtı" },
  });
  record("MAREL-REVIEW-PATCH", marelMod.res.status === 200, `status=${marelMod.res.status}`);
});

test("14 Announcements CRUD via Marel D1", async () => {
  const create = await app("/api/admin/announcements", {
    method: "POST",
    cookie: marelCookie,
    body: {
      title: `E2E Duyuru ${stamp}`,
      slug: `e2e-duyuru-${stamp}`,
      summary: "Bu bir otomatik E2E test duyurusudur.",
      body: "Detaylı duyuru metni — en az yirmi karakter olmalı buraya.",
      imageUrl: "/images/hero/marel-honeycomb-hero-v3.png",
      published: true,
      featured: true,
    },
  });
  announcementId = String(create.json?.id ?? "");
  record(
    "ANNOUNCE-CREATE",
    (create.res.status === 201 || create.res.status === 200) && Boolean(announcementId),
    `status=${create.res.status} id=${announcementId} ${create.json?.error ?? ""}`,
  );

  const page = await fetch(`${APP}/duyurular`);
  const html = await page.text();
  const visible = html.includes(`E2E Duyuru ${stamp}`) || html.includes(`e2e-duyuru-${stamp}`);
  record("ANNOUNCE-UI-SYNC", page.status === 200 && visible, `page=${page.status} visible=${visible}`);

  assert.ok(announcementId);
  const upd = await app(`/api/admin/announcements/${announcementId}`, {
    method: "PATCH",
    cookie: marelCookie,
    body: {
      title: `E2E Duyuru Güncel ${stamp}`,
      summary: "Güncellenmiş otomatik E2E test duyurusu özeti.",
      body: "Güncellenmiş detaylı duyuru metni — en az yirmi karakter.",
      imageUrl: "/images/hero/marel-honeycomb-hero-v3.png",
      published: true,
      featured: false,
    },
  });
  record("ANNOUNCE-UPDATE", upd.res.status === 200, `status=${upd.res.status}`);

  const page2 = await fetch(`${APP}/duyurular`);
  const html2 = await page2.text();
  record("ANNOUNCE-UI-AFTER-UPDATE", html2.includes(`E2E Duyuru Güncel ${stamp}`), "title on /duyurular");

  const del = await app(`/api/admin/announcements/${announcementId}`, {
    method: "DELETE",
    cookie: marelCookie,
  });
  record("ANNOUNCE-DELETE", del.res.status === 200 || del.res.status === 204, `status=${del.res.status}`);

  const page3 = await fetch(`${APP}/duyurular`);
  const html3 = await page3.text();
  record(
    "ANNOUNCE-UI-AFTER-DELETE",
    !html3.includes(`E2E Duyuru Güncel ${stamp}`) && !html3.includes(`e2e-duyuru-${stamp}`),
    "removed from /duyurular",
  );
});

test("15 Contact message + admin status", async () => {
  const send = await app("/api/contact", {
    method: "POST",
    body: {
      name: "E2E Iletisim",
      email: `e2e.contact.${stamp}@marel.test`,
      phone: "5551112233",
      subject: "E2E Mesaj",
      message: "Otomatik iletişim formu testi.",
    },
  });
  record("CONTACT-CREATE", send.res.status < 400, `status=${send.res.status} ${send.json?.error ?? send.json?.message ?? ""}`);

  // SoftTrade contact messages if available
  const list = await api("/admin/contact-messages?per_page=50", { token: adminToken });
  const items = list.json?.data ?? [];
  const arr = Array.isArray(items) ? items : [];
  const found = arr.find((m) => String(m.email ?? "").includes(`e2e.contact.${stamp}`));
  record("ADMIN-CONTACTS-LIST", list.res.status === 200 || list.res.status === 404, `status=${list.res.status} count=${arr.length}`);

  if (found) {
    const id = found.id;
    const marel = await app(`/api/admin/contacts/${id}`, {
      method: "PATCH",
      cookie: marelCookie,
      body: { status: "read" },
    });
    record("MAREL-CONTACT-PATCH", marel.res.status === 200, `status=${marel.res.status}`);
  } else {
    record("MAREL-CONTACT-PATCH", false, "contact not in SoftTrade admin list (may be D1-only)");
  }
});

test("16 UI pages smoke (admin + storefront)", async () => {
  const paths = ["/", "/urunler", `/urunler/${createdProductSlug}`, "/admin", "/hesabim", "/sepet", "/iletisim", "/duyurular", "/siparis-takip"];
  for (const path of paths) {
    const res = await fetch(`${APP}${path}`);
    const ok = res.status === 200;
    record(`UI-${path}`, ok, `status=${res.status}`);
    assert.ok(ok, `${path} => ${res.status}`);
  }
});

test("17 SoftTrade admin DELETE product cleanup", async () => {
  if (!createdProductId) {
    record("API-PRODUCT-DELETE", false, "no id");
    return;
  }
  const { res, json } = await api(`/admin/products/${createdProductId}`, { method: "DELETE", token: adminToken });
  const ok = res.status === 200 || res.status === 204 || json?.success !== false;
  record("API-PRODUCT-DELETE", ok, `status=${res.status}`);

  const check = await api(`/products/${createdProductSlug}`);
  record("SYNC-PRODUCT-DELETED", check.res.status === 404 || check.json?.success === false, `status=${check.res.status}`);
});

test("18 CORS + rate-limit still active on Marel", async () => {
  const cors = await fetch(`${APP}/api/products`, { headers: { origin: "https://evil.example" } });
  record("CORS-EVIL", cors.status === 403, `status=${cors.status}`);

  const statuses = [];
  for (let i = 0; i < 14; i += 1) {
    const r = await fetch(`${APP}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json", origin: "http://localhost:3000" },
      body: JSON.stringify({ email: `rl${stamp}${i}@x.com`, password: "wrongpass" }),
    });
    statuses.push(r.status);
  }
  record("RATE-LIMIT", statuses.includes(429), `statuses=${statuses.join(",")}`);
});

test("19 Summary report", async () => {
  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);
  console.log("\n========== E2E SUMMARY ==========");
  console.log(`PASS ${passed}/${results.length}`);
  for (const f of failed) console.log(`  ✗ ${f.id}: ${f.detail}`);
  console.log("=================================\n");
  assert.ok(failed.length === 0, `${failed.length} test(s) failed`);
});
