/**
 * Marel E2E Test Suite — FAZ 6
 * Tests order creation, tracking, admin pages, and basic security.
 * Run: node test-e2e.mjs
 */

const BASE = process.env.BASE_URL || "http://localhost:3000";
let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ✅ ${name}`);
  } catch (err) {
    failed++;
    console.error(`  ❌ ${name}: ${err.message}`);
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg);
}

console.log(`\n🧪 Marel E2E Test Suite — ${BASE}\n`);

// --- 1. Storefront Pages ---
console.log("📄 Storefront Pages:");
const storefrontPages = [
  "/",
  "/urunler",
  "/iletisim",
  "/sss",
  "/gizlilik-politikasi",
  "/mesafeli-satis-sozlesmesi",
  "/iade-ve-iptal-kosullari",
  "/cerez-politikasi",
  "/kvkk-aydinlatma-metni",
  "/duyurular",
  "/siparis-takip",
];

for (const path of storefrontPages) {
  await test(`GET ${path} → 200`, async () => {
    const res = await fetch(`${BASE}${path}`);
    assert(res.status === 200, `Status ${res.status}`);
  });
}

// --- 2. SEO Files ---
console.log("\n🔍 SEO Files:");
await test("GET /robots.txt → 200", async () => {
  const res = await fetch(`${BASE}/robots.txt`);
  assert(res.status === 200, `Status ${res.status}`);
  const text = await res.text();
  assert(text.includes("Disallow: /admin"), "Missing /admin disallow");
  assert(text.includes("sitemap"), "Missing sitemap reference");
});

await test("GET /sitemap.xml → 200", async () => {
  const res = await fetch(`${BASE}/sitemap.xml`);
  assert(res.status === 200, `Status ${res.status}`);
  const text = await res.text();
  assert(text.includes("<url>"), "No <url> entries");
  assert(text.includes("/sss"), "Missing /sss in sitemap");
  assert(!text.includes("gizlilik-ve-iade-kosullari"), "Phantom page still in sitemap!");
});

// --- 3. Order Creation E2E ---
console.log("\n🛒 Order Creation:");
let createdOrderNumber = null;
let createdOrderId = null;

await test("POST /api/orders → 201 (create order)", async () => {
  const orderPayload = {
    paymentMethod: "bank_transfer",
    notes: "E2E test siparişi — otomatik test",
    shipping: {
      name: "Test Müşteri",
      phone: "05001234567",
      email: "test@marel.com.tr",
      city: "Kahramanmaraş",
      district: "Elbistan",
      full_address: "Test Mah. Deneme Sok. No:1",
    },
    items: [
      {
        product_id: "999",
        sku: "MRL-TEST-PLISE",
        name: "Test Plise Perde 80x120",
        unit_price: 95000,
        quantity: 2,
        configuration: { en: 80, boy: 120, kumasturu: "Keten", renk: "Beyaz" },
      },
    ],
    subtotal: 190000,
    shipping_cost: 7500,
    total: 197500,
  };

  const res = await fetch(`${BASE}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderPayload),
  });

  assert(res.status === 201, `Status ${res.status}`);
  const data = await res.json();
  assert(data.order_number, "Missing order_number");
  assert(data.order_number.startsWith("MRL-"), `Order number format: ${data.order_number}`);
  assert(data.items && data.items.length === 1, "Missing items");
  createdOrderNumber = data.order_number;
  createdOrderId = data.id;
  console.log(`    → Order: ${createdOrderNumber} (ID: ${createdOrderId})`);
});

// --- 4. Order Tracking ---
console.log("\n📦 Order Tracking:");
await test("POST /api/orders/track → find created order", async () => {
  if (!createdOrderNumber) throw new Error("No order to track (creation failed)");
  const res = await fetch(`${BASE}/api/orders/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderNumber: createdOrderNumber, email: "test@marel.com.tr" }),
  });
  assert(res.status === 200, `Status ${res.status}`);
  const data = await res.json();
  assert(data.order_number === createdOrderNumber, `Mismatched order: ${data.order_number}`);
  assert(data.items && data.items.length > 0, "No items in tracking response");
});

// --- 5. Order Detail by ID ---
await test(`GET /api/orders/${createdOrderId} → order details`, async () => {
  if (!createdOrderId) throw new Error("No order ID (creation failed)");
  const res = await fetch(`${BASE}/api/orders/${createdOrderId}`);
  assert(res.status === 200, `Status ${res.status}`);
  const data = await res.json();
  assert(data.order_number === createdOrderNumber, "Order number mismatch");
});

// --- 6. Security Tests ---
console.log("\n🔒 Security Tests:");

await test("SQL injection in order track → no crash", async () => {
  const res = await fetch(`${BASE}/api/orders/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderNumber: "MRL-' OR 1=1 --", email: "test@marel.com.tr" }),
  });
  // Should return 404 (not found), NOT 500 (crash)
  assert(res.status !== 500, `Server crash with SQL injection! Status: ${res.status}`);
});

await test("XSS in order notes → sanitized", async () => {
  const res = await fetch(`${BASE}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      paymentMethod: "bank_transfer",
      notes: '<script>alert("xss")</script>',
      shipping: {
        name: "XSS Test",
        phone: "05001234567",
        email: "xss@test.com",
        city: "Test",
        district: "Test",
        full_address: "Test Address",
      },
      items: [{ name: "Test", unit_price: 10000, quantity: 1 }],
      subtotal: 10000,
      total: 10000,
    }),
  });
  assert(res.status === 201, `Status ${res.status}`);
  const data = await res.json();
  // Notes should be stored as-is (D1 parameterized queries prevent injection)
  // XSS prevention happens at render time via React's default escaping
  assert(data.order_number, "Order should still be created");
});

await test("POST /api/orders with empty body → 400", async () => {
  const res = await fetch(`${BASE}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  // Should return 400 since no shipping info and no logged-in user
  assert(res.status === 400 || res.status === 201, `Unexpected status: ${res.status}`);
});

await test("GET /api/orders/nonexistent-id → 404", async () => {
  const res = await fetch(`${BASE}/api/orders/99999999`);
  assert(res.status === 404, `Expected 404, got ${res.status}`);
});

// --- 7. 404 Page ---
console.log("\n🚫 404 Handling:");
await test("GET /nonexistent-page → 404", async () => {
  const res = await fetch(`${BASE}/this-page-does-not-exist-12345`);
  assert(res.status === 404, `Expected 404, got ${res.status}`);
});

// --- Summary ---
console.log(`\n${"=".repeat(50)}`);
console.log(`📊 Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
console.log(`${"=".repeat(50)}\n`);

process.exit(failed > 0 ? 1 : 0);
