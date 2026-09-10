import { ensureDatabase, getDb } from "../db/index";
import crypto from "crypto";

async function main() {
  await ensureDatabase();
  const db = getDb();
  
  console.log("Deleting unwanted products...");
  // Delete "Orjin Bambu" and "Dimout"
  await db.prepare("DELETE FROM products WHERE name LIKE '%Orjin Bambu%' OR name LIKE '%Dimout%'").run();
  
  // Also delete from other non-plise categories if any
  // But wait, the user said "Sadece Perdeler kalıcak şekilde", actually the Orjin Bambu and Dimout were categories. Let's just delete by category name.
  await db.prepare("DELETE FROM products WHERE category LIKE '%Orjin Bambu%' OR category LIKE '%Dimout%'").run();
  
  // Check if New Series exists
  const existing = await db.prepare("SELECT * FROM products WHERE name = 'New Series (%30/40 Karartma) Plise Perde'").first();
  
  if (!existing) {
    console.log("Inserting New Series...");
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    await db.prepare(`
      INSERT INTO products (
        id, slug, sku, name, category, root_category, description, price, currency, stock, availability, brand, google_product_category, active, featured, colors, options, dimensions, installments, installment_text, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, 'TRY', 100, 'in_stock', 'Yaren Plise', 'Home & Garden', 1, 1, '[]', NULL, 'Özel Ölçüye Göre Üretim', 3, 'Peşin Fiyatına 3 Taksit', ?, ?
      )
    `).bind(
      id,
      "new-30-40-karartma-plise-perde",
      "NEW-3040",
      "New Series (%30/40 Karartma) Plise Perde",
      "Plise Perdeler",
      "Perdeler",
      "Desenli Plise Perde, özgün desen tasarımlarıyla yaşam alanlarınıza dinamizm ve karakter kazandırır. Estetik detaylarıyla öne çıkan bu perde modeli, mekânlarınıza zarif ve modern bir görünüm sunar.",
      60500, // 605.00 TL per m2
      now,
      now
    ).run();
    
    // Add image
    await db.prepare("INSERT INTO product_images (id, product_id, source_url, alt_text, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?)").bind(
      crypto.randomUUID(),
      id,
      "/images/real/diamond-beyaz-siyah-ip.jpeg", // fallback image
      "New Series",
      0,
      now
    ).run();
  }
  
  console.log("Done.");
}

main().catch(console.error);
