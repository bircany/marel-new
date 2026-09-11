import { getDb, ensureDatabase } from '../db/index';
import fs from 'fs';
import path from 'path';

async function main() {
  await ensureDatabase();
  const db = getDb();
  
  const products = await db.prepare('SELECT * FROM products').all();
  const productImages = await db.prepare('SELECT * FROM product_images ORDER BY sort_order ASC').all();
  
  const productsArray = products.results || products;
  const imagesArray = productImages.results || productImages;
  
  const formattedProducts = (productsArray as any[]).map(p => {
    const pImages = (imagesArray as any[]).filter(img => img.product_id === p.id).map(img => img.source_url);
    return {
      slug: p.slug,
      sku: p.sku,
      name: p.name,
      category: p.category,
      description: p.description,
      price: p.price,
      salePrice: p.sale_price || null,
      currency: p.currency,
      stock: p.stock,
      availability: p.availability,
      brand: p.brand,
      googleProductCategory: p.google_product_category,
      active: p.active,
      featured: p.featured,
      colors: p.colors,
      dimensions: p.dimensions,
      installments: p.installments,
      installmentText: p.installment_text,
      image: pImages[0] || "/images/real/diamond-beyaz-siyah-ip.jpeg",
      images: pImages
    };
  });
  
  const content = `export const GENERATED_SEEDS = ${JSON.stringify(formattedProducts, null, 2)};\n`;
  fs.writeFileSync(path.join(process.cwd(), 'db', 'generated-catalog.ts'), content);
  fs.writeFileSync(path.join(process.cwd(), 'db', 'generated-plise.ts'), `export const GENERATED_PLISE_SEEDS = [];\n`);
  
  console.log('Exported local db to generated-catalog.ts');
}
main();
