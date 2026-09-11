import { ensureDatabase, getDb } from "../db/index";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const SOURCE_DIR = "C:\\Users\\birca\\OneDrive\\Desktop\\marel-new\\marel-katalog-fotolar";
const DEST_DIR = "C:\\Users\\birca\\OneDrive\\Desktop\\marel-new\\public\\images\\products";

async function main() {
  await ensureDatabase();
  const db = getDb();
  
  console.log("Deleting existing products and images...");
  await db.prepare("DELETE FROM products").run();
  await db.prepare("DELETE FROM product_images").run();
  
  if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
  }

  const folders = fs.readdirSync(SOURCE_DIR).filter(f => fs.statSync(path.join(SOURCE_DIR, f)).isDirectory());
  
  const ALLOWED_SERIES = ["arda", "asel", "bambu", "blackout", "dark", "dia", "ece", "efe", "gold", "honeycomb", "new", "pars", "reina", "silver", "touch", "tulle", "venus"];
  
  let sortOrder = 0;
  for (const rawFolder of folders) {
    const normalized = rawFolder.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    let isAllowed = ALLOWED_SERIES.includes(normalized);
    
    if (!isAllowed) {
      console.log(`Skipping folder: ${rawFolder}`);
      continue;
    }
    
    // Format name
    let baseName = rawFolder.charAt(0).toUpperCase() + rawFolder.slice(1);
    if (normalized === "dia") baseName = "Diamond";
    if (normalized === "tulle") baseName = "Tülle";
    
    const productName = `${baseName} Series Plise Perde`;
    const slug = `${baseName.toLowerCase().replace(/ü/g, 'u')}-series-plise-perde`;
    
    console.log(`Creating product: ${productName}`);
    
    const productId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const destProductDir = path.join(DEST_DIR, rawFolder);
    if (!fs.existsSync(destProductDir)) {
      fs.mkdirSync(destProductDir, { recursive: true });
    }
    
    const files = fs.readdirSync(path.join(SOURCE_DIR, rawFolder)).filter(f => f.match(/\.(png|jpe?g)$/i));
    
    await db.prepare(`
      INSERT INTO products (
        id, slug, sku, name, category, root_category, description, price, currency, stock, availability, brand, google_product_category, active, featured, colors, options, dimensions, installments, installment_text, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, 'TRY', 100, 'in_stock', 'Marel Plise', 'Home & Garden > Decor > Window Treatments', 1, ?, '[]', NULL, 'Özel Ölçüye Göre Üretim', 3, 'Peşin Fiyatına 3 Taksit', ?, ?
      )
    `).bind(
      productId,
      slug,
      `${baseName.toUpperCase().substring(0, 4)}-${Math.floor(Math.random() * 1000)}`,
      productName,
      "Plise Perdeler",
      "Perdeler",
      `${baseName} Series Plise Perde ile yaşam alanlarınıza şıklık katın. Özel ölçüye göre üretilir.`,
      60500, // 605 TL
      sortOrder < 4 ? 1 : 0, // feature first 4
      now,
      now
    ).run();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const sourcePath = path.join(SOURCE_DIR, rawFolder, file);
      const destPath = path.join(destProductDir, file);
      try {
        fs.copyFileSync(sourcePath, destPath);
      } catch (err) {
        console.warn("Could not copy file:", err);
      }
      
      const imageUrl = `/images/products/${rawFolder}/${file}`;
      
      await db.prepare(`
        INSERT INTO product_images (id, product_id, source_url, alt_text, sort_order, created_at) 
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        crypto.randomUUID(),
        productId,
        imageUrl,
        `${productName} - ${i+1}`,
        i,
        now
      ).run();
    }
    
    sortOrder++;
  }
  
  console.log("Done seeding catalog.");
}

main().catch(console.error);
