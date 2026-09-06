#!/usr/bin/env node
/** Sıralı API smoke: A sağlık → C misafir sipariş → D status → E kargo */
const API = process.env.SOFTRADE_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8081/api/v1";
const SESSION = `smoke-${Date.now()}`;
const GUEST_EMAIL = `misafir.smoke.${Date.now()}@example.com`;

async function req(method, path, { token, headers = {}, body } = {}) {
  const h = { Accept: "application/json", ...headers };
  if (token) h.Authorization = `Bearer ${token}`;
  let payload;
  if (body instanceof FormData) payload = body;
  else if (body != null) {
    h["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${API}${path}`, { method, headers: h, body: payload });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  return { ok: res.ok, status: res.status, json };
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function step(title) {
  console.log(`\n== ${title}`);
}

async function main() {
  step("A. Sağlık");
  const settings = await req("GET", "/settings/public");
  assert(settings.ok, `settings/public ${settings.status}`);
  console.log("settings/public OK", Object.keys(settings.json?.data || settings.json || {}));

  const products = await req("GET", "/products?per_page=5");
  assert(products.ok, `products ${products.status}`);
  const list = products.json?.data || [];
  assert(list.length > 0, "ürün yok");
  const product = list[0];
  console.log("products OK", list.length, "örnek:", product.slug);

  step("B. Katalog + price-preview");
  const detail = await req("GET", `/products/${product.slug}`);
  assert(detail.ok, `product show ${detail.status}`);
  console.log("product detail OK", detail.json?.data?.slug || product.slug);

  const preview = await req("POST", `/products/${product.slug}/price-preview`, {
    body: { width: 120, height: 150, quantity: 1 },
  });
  console.log("price-preview", preview.status, preview.ok ? "OK" : JSON.stringify(preview.json)?.slice(0, 200));

  step("C. Misafir sepet → sipariş");
  const add = await req("POST", "/cart", {
    headers: { "X-Session-ID": SESSION },
    body: { product_id: product.id, quantity: 1 },
  });
  assert(add.ok, `cart add ${add.status} ${JSON.stringify(add.json)}`);
  console.log("cart add OK");

  const cart = await req("GET", "/cart", { headers: { "X-Session-ID": SESSION } });
  assert(cart.ok, `cart get ${cart.status}`);
  console.log("cart get OK");

  const order = await req("POST", "/orders", {
    headers: { "X-Session-ID": SESSION },
    body: {
      payment_method: "bank_transfer",
      shipping: {
        name: "Smoke Misafir",
        phone: "05551234567",
        email: GUEST_EMAIL,
        city: "Düzce",
        district: "Merkez",
        neighborhood: "Aziziye",
        full_address: "Test Mah. Smoke Sk. No:1",
        zip_code: "81000",
      },
      notes: "smoke test misafir sipariş",
    },
  });
  assert(order.ok, `order ${order.status} ${JSON.stringify(order.json)}`);
  const orderData = order.json?.data || order.json;
  const orderNumber = orderData.order_number || orderData.orderNumber;
  const orderId = orderData.id;
  console.log("order OK", orderNumber, "status=", orderData.status);

  const track = await req("POST", "/orders/track", {
    body: { order_number: orderNumber, email: GUEST_EMAIL },
  });
  assert(track.ok, `track ${track.status} ${JSON.stringify(track.json)}`);
  console.log("track OK");

  step("D. Admin status workflow");
  const login = await req("POST", "/auth/login", {
    body: { email: "admin@softtrade.com", password: "admin123" },
  });
  assert(login.ok, `login ${login.status}`);
  const token = login.json?.data?.access_token;
  assert(token, "token yok");

  const chain = ["awaiting_measurement", "measure_ok", "processing", "shipped", "delivered"].filter(
    (s) => s !== orderData.status,
  );
  // start from measure_ok if pending, else walk remaining
  const statuses = ["measure_ok", "processing", "shipped", "delivered"];
  for (const status of statuses) {
    const upd = await req("PUT", `/admin/orders/${orderId}/status`, {
      token,
      body: { status },
    });
    assert(upd.ok, `status ${status} → ${upd.status} ${JSON.stringify(upd.json)}`);
    console.log("status →", status, "OK");
  }

  step("E. Kargo alanları");
  const cargo = await req("PUT", `/admin/orders/${orderId}/status`, {
    token,
    body: {
      status: "shipped",
      cargo_company: "mng",
      tracking_number: "SMOKE123456",
      tracking_url: "https://www.mngkargo.com.tr/tr/tracking?code=SMOKE123456",
    },
  });
  // may already be delivered — try dedicated update if available
  console.log("cargo via status", cargo.status, cargo.ok ? "OK" : JSON.stringify(cargo.json)?.slice(0, 180));

  const track2 = await req("POST", "/orders/track", {
    body: { order_number: orderNumber, email: GUEST_EMAIL },
  });
  console.log("track after cargo", track2.status, JSON.stringify(track2.json?.data || track2.json)?.slice(0, 300));

  step("F. Auth me");
  const me = await req("GET", "/auth/me", { token });
  assert(me.ok, `me ${me.status}`);
  console.log("me OK", me.json?.data?.email || me.json?.data?.user?.email);

  step("G. Admin products list");
  const adminOrders = await req("GET", "/admin/orders?per_page=3", { token });
  assert(adminOrders.ok, `admin orders ${adminOrders.status}`);
  console.log("admin orders OK");

  console.log("\nTÜM CURL SMOKE GEÇTİ");
  console.log({ orderNumber, orderId, guestEmail: GUEST_EMAIL, session: SESSION });
}

main().catch((e) => {
  console.error("\nSMOKE FAIL:", e.message);
  process.exit(1);
});
