import postgres from "postgres";
import { readFileSync } from "fs";
import dns from "dns";

dns.setDefaultResultOrder("verbatim");

const envContent = readFileSync(".env.local", "utf-8");
const dbMatch = envContent.match(/^DATABASE_URL=(.+)$/m);
if (!dbMatch) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}
const DATABASE_URL = dbMatch[1].trim();

const sql = postgres(DATABASE_URL, {
  ssl: { rejectUnauthorized: false },
  connect_timeout: 15,
});

try {
  console.log("Creating/updating realistic test order...");

  const orderId = "ord-test-yurtici-001";
  const orderNumber = "ORD-20260908-00001";
  const email = "bircanyilmaz622@gmail.com";
  const customerName = "Bircan Yılmaz";
  const phone = "05347665616";
  const cargoCompany = "Yurtiçi Kargo";
  const trackingNumber = "123456789012";
  const trackingUrl = "https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=123456789012";

  // Ensure user exists first
  await sql`
    INSERT INTO users (id, email, full_name, role, created_at, updated_at)
    VALUES ('usr-bircan', ${email}, ${customerName}, 'customer', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, full_name = EXCLUDED.full_name
  `;

  // Clean existing test order if present
  await sql`DELETE FROM order_events WHERE order_id = ${orderId}`;
  await sql`DELETE FROM order_items WHERE order_id = ${orderId}`;
  await sql`DELETE FROM orders WHERE id = ${orderId} OR order_number = ${orderNumber}`;

  // Insert order
  await sql`
    INSERT INTO orders (
      id, order_number, user_id, email, customer_name, phone,
      status, payment_method, payment_status, subtotal, shipping, total, currency,
      city, district, shipping_address, notes,
      cargo_company, tracking_number, tracking_url,
      created_at, updated_at
    ) VALUES (
      ${orderId}, ${orderNumber}, 'usr-bircan', ${email}, ${customerName}, ${phone},
      'shipped', 'havale', 'paid', 149900, 0, 149900, 'TRY',
      'İstanbul', 'Kadıköy', 'Bağdat Caddesi No:123 Kadıköy / İstanbul', 'Lütfen kapıda arayınız.',
      ${cargoCompany}, ${trackingNumber}, ${trackingUrl},
      NOW() - INTERVAL '2 days', NOW()
    )
  `;

  // Insert items
  await sql`
    INSERT INTO order_items (
      id, order_id, product_id, sku, name, unit_price, quantity, configuration
    ) VALUES (
      ${orderId + '-item-1'}, ${orderId}, NULL, 'MRL-PLS-DIA-01',
      'Diamond Serisi Plise Perde - Antrasit', 149900, 1,
      '{"width":120,"height":180,"color":"Antrasit","profileColor":"Antrasit","mountType":"Vidalı"}'
    )
  `;

  // Insert order timeline events
  await sql`
    INSERT INTO order_events (id, order_id, status, note, created_at)
    VALUES
      (${crypto.randomUUID()}, ${orderId}, 'pending', 'Siparişiniz başarıyla alındı ve kayda geçirildi.', NOW() - INTERVAL '2 days'),
      (${crypto.randomUUID()}, ${orderId}, 'processing', 'Ölçü onaylandı, perde atölyede milimetrik üretime alındı.', NOW() - INTERVAL '1 day'),
      (${crypto.randomUUID()}, ${orderId}, 'shipped', 'Paketlendi ve Yurtiçi Kargo kuryesine teslim edildi. Takip no: 123456789012', NOW() - INTERVAL '4 hours')
  `;

  console.log(`✅ Test order created successfully!`);
  console.log(`   Order Number: ${orderNumber}`);
  console.log(`   Email:        ${email}`);
  console.log(`   Cargo:        ${cargoCompany} (${trackingNumber})`);
} catch (err) {
  console.error("Error creating test order:", err);
} finally {
  await sql.end();
}
