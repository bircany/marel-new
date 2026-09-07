import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function titleCase(str) {
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

async function main() {
  const imagesDir = path.resolve('public/images/products');
  const dbDir = path.resolve('db');
  
  const entries = await fs.readdir(imagesDir, { withFileTypes: true });
  const allProducts = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const folderName = entry.name;
    
    // Skip specific folders
    if (['kamatas', '.DS_Store'].includes(folderName)) continue;

    const catName = `${titleCase(folderName)} Plise Perdeler`;
    console.log(`Processing category: ${catName}`);
    
    const folderPath = path.join(imagesDir, folderName);
    const files = await fs.readdir(folderPath);

    for (const file of files) {
      if (file.startsWith('.')) continue; // skip hidden files

      const ext = path.extname(file);
      const baseName = path.basename(file, ext).replace(/[_-]/g, ' ');
      
      const productName = `${titleCase(folderName)} Plise Perde - ${titleCase(baseName)}`;
      const price = 59900; // 599.00 TRY

      allProducts.push({
        id: randomUUID(),
        name: productName,
        slug: slugify(productName) + '-' + randomUUID().split('-')[0],
        sku: `PLISE-${randomUUID().split('-')[0].toUpperCase()}`,
        description: `${catName} özel üretim plise perde. Marel garantisiyle.`,
        price: price,
        salePrice: price,
        currency: 'TRY',
        stock: 100,
        category: catName,
        image: `/images/products/${folderName}/${file}`,
        images: [`/images/products/${folderName}/${file}`],
        colors: "[]"
      });
    }
  }

  const catalogTs = `import type { CatalogProduct } from "./index";\n\nexport const GENERATED_PLISE_SEEDS: Omit<CatalogProduct, "id">[] = ${JSON.stringify(allProducts, null, 2).replace(/"([^"]+)":/g, '$1:')};\n`;
  await fs.writeFile(path.join(dbDir, 'generated-plise.ts'), catalogTs);
  console.log(`Successfully seeded ${allProducts.length} plise products to db/generated-plise.ts`);
}

main().catch(console.error);
