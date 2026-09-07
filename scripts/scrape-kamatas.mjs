import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import https from 'https';
import * as cheerio from 'cheerio';
import { randomUUID } from 'crypto';

const CATEGORIES = [
  // Sineklikler
  { url: 'https://kamatas.com/sineklikler', name: 'Sineklikler', slug: 'sineklikler', autoSubcat: true },

  // Separatör Kapı
  { url: 'https://kamatas.com/sperator-perdeler', name: 'Separatör Kapı', slug: 'separator-kapi', fixedSubcat: 'Separatör Kapı' },

  // Tutamaklar
  { url: 'https://kamatas.com/tutamaklar', name: 'Tutamaklar', slug: 'tutamaklar', fixedSubcat: 'Merdiven Tutamakları' },

  // Aksesuarlar Subcategories
  { url: 'https://kamatas.com/sineklik-aksesuarlari', name: 'Aksesuarlar', slug: 'aksesuarlar', fixedSubcat: 'Sineklik Aksesuarları' },
  { url: 'https://kamatas.com/sineklik-aksesuarlari?page=2', name: 'Aksesuarlar', slug: 'aksesuarlar', fixedSubcat: 'Sineklik Aksesuarları' },
  { url: 'https://kamatas.com/sineklik-tulleri', name: 'Aksesuarlar', slug: 'aksesuarlar', fixedSubcat: 'Sineklik Tülleri' },
  { url: 'https://kamatas.com/yirtilmaz-kedi-tulleri', name: 'Aksesuarlar', slug: 'aksesuarlar', fixedSubcat: 'Yırtılmaz Kedi Tülleri' },
  { url: 'https://kamatas.com/pencere-ve-kapi-aksesuarlari', name: 'Aksesuarlar', slug: 'aksesuarlar', fixedSubcat: 'Pencere ve Kapı Aksesuarları' },
];

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    if (fsSync.existsSync(dest)) {
      return resolve(dest); // already downloaded
    }
    const file = fsSync.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(file);
        file.on('finish', () => {
          file.close(() => resolve(dest));
        });
      } else {
        file.close();
        resolve(null);
      }
    }).on('error', (err) => {
      fsSync.unlink(dest, () => reject(err));
    });
  });
}

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function main() {
  console.log("Kamatas comprehensive scraping started...");
  const dbDir = path.resolve('db');
  const imgDir = path.resolve('public/images/products/kamatas');
  await fs.mkdir(imgDir, { recursive: true });

  const allProducts = [];
  const seenSlugs = new Set();

  for (const cat of CATEGORIES) {
    console.log(`Fetching ${cat.name} (${cat.fixedSubcat || 'auto'}) from ${cat.url}`);
    const html = await fetchHtml(cat.url);
    const $ = cheerio.load(html);
    
    let productsList = [];
    $('script[type="application/ld+json"]').each((i, el) => {
      try {
        const json = JSON.parse($(el).html());
        if (json['@type'] === 'ItemList' && json.itemListElement) {
          productsList = json.itemListElement.map(e => e.item);
        }
      } catch (e) {}
    });

    if (productsList.length === 0) {
      console.log(`No products found in JSON-LD for ${cat.url}.`);
      continue;
    }

    console.log(`Found ${productsList.length} products for ${cat.url}.`);

    for (const item of productsList) {
      if (item['@type'] !== 'Product') continue;

      let subcat = cat.fixedSubcat || cat.name;
      const lowerName = item.name.toLowerCase();

      if (cat.autoSubcat) {
        if (lowerName.includes('akordeon') || lowerName.includes('akordiyon')) subcat = 'Akordiyon Sineklikler';
        else if (lowerName.includes('menteseli') || lowerName.includes('menteşeli')) subcat = 'Menteşeli Sineklikler';
        else if (lowerName.includes('sabit')) subcat = 'Sabit Sök-Tak Sineklikler';
        else if (lowerName.includes('kedi')) subcat = 'Kedi Sineklikleri';
        else if (lowerName.includes('surme') || lowerName.includes('sürme')) subcat = 'Sürme Sineklikler';
        else if (lowerName.includes('plise')) subcat = 'Plise Sineklikler';
      }
      
      const priceRaw = item.offers?.price || '1000';
      const price = Math.round(parseFloat(priceRaw) * 100);

      const baseSlug = slugify(item.name);
      if (seenSlugs.has(baseSlug)) continue;
      seenSlugs.add(baseSlug);

      const ext = path.extname(new URL(item.image).pathname) || '.webp';
      const localFilename = `${baseSlug.substring(0, 35)}-${randomUUID().split('-')[0]}${ext}`;
      const localPath = path.join(imgDir, localFilename);
      
      try {
        await downloadImage(item.image, localPath);
      } catch (e) {
        console.error(`Failed to download image for ${item.name}`, e);
      }

      const marelName = item.name.replace(/Kamataş/gi, 'Marel');

      allProducts.push({
        id: randomUUID(),
        name: marelName,
        slug: baseSlug,
        sku: `MRL-${randomUUID().split('-')[0].toUpperCase()}`,
        description: `${marelName} - Dayanıklı ve kaliteli Marel garantisiyle üretilmiştir.`,
        price: price,
        salePrice: price,
        currency: 'TRY',
        stock: 100,
        category: subcat,
        image: `/images/products/kamatas/${localFilename}`,
        images: [`/images/products/kamatas/${localFilename}`],
        colors: "[]"
      });
    }
  }

  const catalogTs = `import type { CatalogProduct } from "./index";

export const GENERATED_SEEDS: Omit<CatalogProduct, "id">[] = ${JSON.stringify(allProducts, null, 2).replace(/"([^"]+)":/g, '$1:')};
`;

  await fs.writeFile(path.join(dbDir, 'generated-catalog.ts'), catalogTs);
  console.log(`Successfully seeded ${allProducts.length} total products to db/generated-catalog.ts`);
}

main().catch(console.error);
