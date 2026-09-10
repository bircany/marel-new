import { ensureDatabase, getDb } from "../db/index";
import fs from "fs";
import path from "path";
import crypto from "crypto";

async function main() {
  await ensureDatabase();
  const db = getDb();
  
  const rawFolder = 'tülle';
  const SOURCE_DIR = 'C:\\Users\\birca\\OneDrive\\Desktop\\marel-new\\marel-katalog-fotolar';
  const DEST_DIR = 'C:\\Users\\birca\\OneDrive\\Desktop\\marel-new\\public\\images\\products';
  
  const baseName = 'Tulle';
  const productName = 'Tülle Series Plise Perde';
  const slug = 'tulle-series-plise-perde';
  const productId = crypto.randomUUID();
  const now = new Date().toISOString();
  
  const destProductDir = path.join(DEST_DIR, rawFolder);
  if (!fs.existsSync(destProductDir)) {
    fs.mkdirSync(destProductDir, { recursive: true });
  }
  
  const files = fs.readdirSync(path.join(SOURCE_DIR, rawFolder)).filter(f => f.match(/\.(png|jpe?g)$/i));
  let mainImageUrl = '';
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    fs.copyFileSync(path.join(SOURCE_DIR, rawFolder, file), path.join(destProductDir, file));
    const imageUrl = `/images/products/${rawFolder}/${file}`;
    if (i === 0) mainImageUrl = imageUrl;
    
    db.prepare(`INSERT INTO product_images (id, product_id, source_url, alt_text, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?)`).bind(
      crypto.randomUUID(), productId, imageUrl, `${productName} - ${i+1}`, i, now
    ).run();
  }
  
  db.prepare(`
    INSERT INTO products (
      id, slug, sku, name, category, root_category, description, price, currency, stock, availability, brand, google_product_category, active, featured, colors, options, dimensions, installments, installment_text, created_at, updated_at, image
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, 'TRY', 100, 'in_stock', 'Marel Plise', 'Home & Garden', 1, 0, '[]', NULL, 'Özel Ölçüye Göre Üretim', 3, 'Peşin Fiyatına 3 Taksit', ?, ?, ?
    )
  `).bind(
    productId, slug, 'TULL-' + Math.floor(Math.random() * 1000), productName, 'Plise Perdeler', 'Perdeler', 'Tülle Series Plise Perde ile yaşam alanlarınıza şıklık katın.', 60500, now, now, mainImageUrl
  ).run();
  
  console.log('Tülle added successfully');
}

main().catch(console.error);
