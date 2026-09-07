import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import https from 'https';
import * as cheerio from 'cheerio';
import { randomUUID } from 'crypto';

const TARGET_PAGES = [
  // 1. Otomatik Panjurlar
  { rootCategory: 'Otomatik Panjurlar', url: 'https://kamatas.com/otomatik-panjurlar' },
  { rootCategory: 'Otomatik Panjurlar', url: 'https://kamatas.com/pencere-panjur' },
  { rootCategory: 'Otomatik Panjurlar', url: 'https://kamatas.com/kapi-panjuru' },
  { rootCategory: 'Otomatik Panjurlar', url: 'https://kamatas.com/maximum-kapi' },
  { rootCategory: 'Otomatik Panjurlar', url: 'https://kamatas.com/panjur-aksesuarlari' },

  // 2. Seperatör Kapı
  { rootCategory: 'Separatör Kapı', url: 'https://kamatas.com/sperator-perdeler' },
  { rootCategory: 'Separatör Kapı', url: 'https://kamatas.com/orjin-seperator-kapilar' },
  { rootCategory: 'Separatör Kapı', url: 'https://kamatas.com/100-isik-yalitimli-kapilar' },
  { rootCategory: 'Separatör Kapı', url: 'https://kamatas.com/termal-100-isi-ve-isik-yalitimli-kapilar' },

  // 3. Tutamaklar
  { rootCategory: 'Tutamaklar', url: 'https://kamatas.com/tutamaklar' },

  // 4. Aksesuarlar
  { rootCategory: 'Aksesuarlar', url: 'https://kamatas.com/aksesuarlar' },
  { rootCategory: 'Aksesuarlar', url: 'https://kamatas.com/sineklik-aksesuarlari' },
  { rootCategory: 'Aksesuarlar', url: 'https://kamatas.com/sineklik-aksesuarlari?page=2' },
  { rootCategory: 'Aksesuarlar', url: 'https://kamatas.com/sineklik-tulleri' },
  { rootCategory: 'Aksesuarlar', url: 'https://kamatas.com/yirtilmaz-kedi-tulleri' },
  { rootCategory: 'Aksesuarlar', url: 'https://kamatas.com/pencere-ve-kapi-aksesuarlari' },

  // 5. Sineklikler
  { rootCategory: 'Sineklikler', url: 'https://kamatas.com/sineklikler' },
  { rootCategory: 'Sineklikler', url: 'https://kamatas.com/menteseli-sineklik' },
  { rootCategory: 'Sineklikler', url: 'https://kamatas.com/sabit-sok-tak-sineklik' },
  { rootCategory: 'Sineklikler', url: 'https://kamatas.com/akordiyon-sineklik' },
  { rootCategory: 'Sineklikler', url: 'https://kamatas.com/kedi-sinekligi' },
  { rootCategory: 'Sineklikler', url: 'https://kamatas.com/surme-sineklik' },

  // 6. Perdeler
  { rootCategory: 'Perdeler', url: 'https://kamatas.com/perdeler' },
];

function fetchHtml(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', (err) => {
      console.error(`Error fetching ${url}:`, err.message);
      resolve('');
    });
  });
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    if (fsSync.existsSync(dest)) {
      return resolve(dest);
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

async function scrape() {
  console.log("=== STARTING FULL KAMATAS SCRAPER ===");
  const imgDir = path.resolve('public/images/products/kamatas');
  await fs.mkdir(imgDir, { recursive: true });

  const allProducts = [];
  const seenSlugs = new Set();

  for (const item of TARGET_PAGES) {
    console.log(`\nFetching [${item.rootCategory}]: ${item.url}`);
    const html = await fetchHtml(item.url);
    if (!html) continue;

    const $ = cheerio.load(html);

    // 1. Try to extract product items from JSON-LD
    let productsList = [];
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).html());
        if (json['@type'] === 'ItemList' && json.itemListElement) {
          productsList = json.itemListElement.map(e => e.item || e);
        }
      } catch {}
    });

    // 2. Also parse product cards from HTML if JSON-LD is missing items
    if (productsList.length === 0) {
      $('[class*="product-card"], [class*="product-item"], article').each((_, el) => {
        const title = $(el).find('h2, h3, [class*="title"]').first().text().trim();
        const link = $(el).find('a').first().attr('href');
        const imgSrc = $(el).find('img').first().attr('src');
        const priceText = $(el).find('[class*="price"]').first().text().trim();
        if (title && (imgSrc || link)) {
          productsList.push({
            '@type': 'Product',
            name: title,
            url: link,
            image: imgSrc,
            offers: { price: priceText.replace(/[^\d.,]/g, '').replace(',', '.') }
          });
        }
      });
    }

    console.log(`-> Found ${productsList.length} items on ${item.url}`);

    for (const p of productsList) {
      const rawName = p.name || '';
      if (!rawName) continue;

      const baseSlug = slugify(rawName);
      if (seenSlugs.has(baseSlug)) {
        continue;
      }
      seenSlugs.add(baseSlug);

      // Determine subcategory
      let subcat = item.rootCategory;
      const lowerName = rawName.toLowerCase();

      if (item.rootCategory === 'Otomatik Panjurlar') {
        if (lowerName.includes('surme') || lowerName.includes('sürme') || lowerName.includes('maximum') || lowerName.includes('maksimum')) {
          subcat = 'Maximum Kapı';
        } else if (lowerName.includes('kapi') || lowerName.includes('kapı')) {
          subcat = 'Kapı Panjurları';
        } else if (lowerName.includes('pencere')) {
          subcat = 'Pencere Panjurları';
        } else if (lowerName.includes('aksesuar') || lowerName.includes('kumanda') || lowerName.includes('motor')) {
          subcat = 'Panjur Aksesuarları';
        } else {
          subcat = 'Pencere Panjurları';
        }
      } else if (item.rootCategory === 'Separatör Kapı') {
        if (lowerName.includes('termal') || lowerName.includes('isi')) {
          subcat = 'Termal %100 Isı ve Işık Yalıtımlı Kapılar';
        } else if (lowerName.includes('isik') || lowerName.includes('ışık') || lowerName.includes('%100')) {
          subcat = '%100 Işık Yalıtımlı Kapılar';
        } else {
          subcat = 'Orjin Seperatör Kapılar';
        }
      } else if (item.rootCategory === 'Tutamaklar') {
        subcat = 'Merdiven Tutamakları';
      } else if (item.rootCategory === 'Aksesuarlar') {
        if (lowerName.includes('kedi')) {
          subcat = 'Yırtılmaz Kedi Tülleri';
        } else if (lowerName.includes('tul') || lowerName.includes('tül')) {
          subcat = 'Sineklik Tülleri';
        } else if (lowerName.includes('pencere') || lowerName.includes('kapi') || lowerName.includes('tutamak') || lowerName.includes('kolu') || lowerName.includes('kilit')) {
          subcat = 'Pencere ve Kapı Aksesuarları';
        } else {
          subcat = 'Sineklik Aksesuarları';
        }
      } else if (item.rootCategory === 'Sineklikler') {
        if (lowerName.includes('mentese') || lowerName.includes('menteşeli')) subcat = 'Menteşeli Sineklikler';
        else if (lowerName.includes('sabit') || lowerName.includes('sok-tak')) subcat = 'Sabit Sök-Tak Sineklikler';
        else if (lowerName.includes('akordiyon') || lowerName.includes('akordeon')) subcat = 'Akordiyon Sineklikler';
        else if (lowerName.includes('kedi')) subcat = 'Kedi Sineklikleri';
        else if (lowerName.includes('surme') || lowerName.includes('sürme')) subcat = 'Sürme Sineklikler';
        else if (lowerName.includes('balkon')) subcat = 'Cam Balkon Sineklikleri';
        else subcat = 'Akordiyon Sineklikler';
      } else if (item.rootCategory === 'Perdeler') {
        if (lowerName.includes('orjin')) subcat = 'Orjin Plise Perdeler';
        else if (lowerName.includes('bambu')) subcat = 'Bambu Plise Perdeler';
        else if (lowerName.includes('dimout')) subcat = 'Dimout Plise Perdeler';
        else subcat = 'Plise Perdeler';
      }

      // Clean price
      let priceVal = 1000;
      const rawPrice = p.offers?.price || p.offers?.lowPrice;
      if (rawPrice) {
        const parsed = parseFloat(String(rawPrice).replace(/[^\d.]/g, ''));
        if (!isNaN(parsed) && parsed > 0) {
          priceVal = parsed;
        }
      }
      const priceKurus = Math.round(priceVal * 100);
      const originalPriceKurus = Math.round(priceKurus * 1.35); // simulated strikethrough original price

      // Download image
      let localImage = '/images/catalog/diamond.webp';
      if (p.image) {
        try {
          const imgUrl = String(p.image).startsWith('http') ? p.image : `https://kamatas.com${p.image}`;
          const ext = path.extname(new URL(imgUrl).pathname) || '.webp';
          const filename = `${baseSlug.slice(0, 30)}-${randomUUID().slice(0, 6)}${ext}`;
          const dest = path.join(imgDir, filename);
          const dl = await downloadImage(imgUrl, dest);
          if (dl) {
            localImage = `/images/products/kamatas/${filename}`;
          }
        } catch (e) {
          console.error(`Image download error for ${rawName}:`, e.message);
        }
      }

      // Rebrand Kamataş to Marel
      const marelName = rawName.replace(/Kamataş/gi, 'Marel').trim();

      allProducts.push({
        id: randomUUID(),
        name: marelName,
        slug: baseSlug,
        sku: `MRL-${randomUUID().slice(0, 8).toUpperCase()}`,
        description: `${marelName} - Marel yüksek kalite güvencesiyle özel ölçü üretilmektedir.`,
        price: originalPriceKurus,
        salePrice: priceKurus,
        currency: 'TRY',
        stock: 150,
        availability: 'in_stock',
        brand: 'Marel',
        googleProductCategory: 'Home & Garden > Decor > Window Treatments',
        active: 1,
        featured: 1,
        category: subcat,
        rootCategory: item.rootCategory,
        image: localImage,
        images: [localImage],
        colors: JSON.stringify(['Beyaz', 'Antrasit', 'Krem', 'Gri', 'Kahve']),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  }

  // Ensure Panjur Aksesuarları (2 products to match Kamataş 14 items)
  const existingAksesuar = allProducts.filter(p => p.rootCategory === 'Otomatik Panjurlar' && p.category === 'Panjur Aksesuarları');
  if (existingAksesuar.length < 2) {
    allProducts.push({
      id: randomUUID(),
      name: 'Otomatik Panjur Çok Kanallı Uzaktan Kumanda',
      slug: 'otomatik-panjur-cok-kanalli-uzaktan-kumanda',
      sku: 'MRL-PNJ-KMD01',
      description: 'Marel Otomatik Panjur sistemleri için çok kanallı kablosuz uzaktan kumanda.',
      price: 110000,
      salePrice: 75000,
      currency: 'TRY',
      stock: 100,
      availability: 'in_stock',
      brand: 'Marel',
      googleProductCategory: 'Home & Garden > Decor > Window Treatments',
      active: 1,
      featured: 1,
      category: 'Panjur Aksesuarları',
      rootCategory: 'Otomatik Panjurlar',
      image: '/images/products/kamatas/otomatik-kumandali-pencere-pan-ad4f11.webp',
      images: ['/images/products/kamatas/otomatik-kumandali-pencere-pan-ad4f11.webp'],
      colors: '["Beyaz","Siyah"]',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    allProducts.push({
      id: randomUUID(),
      name: 'Otomatik Panjur Tüp Motor ve Dahili Alıcı Seti',
      slug: 'otomatik-panjur-tup-motor-ve-dahili-alici-seti',
      sku: 'MRL-PNJ-MTR02',
      description: 'Yüksek torklu sessiz çalışma özellikli Marel otomatik panjur motoru ve alıcı seti.',
      price: 450000,
      salePrice: 325000,
      currency: 'TRY',
      stock: 100,
      availability: 'in_stock',
      brand: 'Marel',
      googleProductCategory: 'Home & Garden > Decor > Window Treatments',
      active: 1,
      featured: 1,
      category: 'Panjur Aksesuarları',
      rootCategory: 'Otomatik Panjurlar',
      image: '/images/products/kamatas/otomatik-kumandali-kapi-panjuru-0b3252.webp',
      images: ['/images/products/kamatas/otomatik-kumandali-kapi-panjuru-0b3252.webp'],
      colors: '["Metalik"]',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  console.log(`\nTOTAL UNIQUE PRODUCTS SCRAPED: ${allProducts.length}`);
  
  // Save to db/generated-catalog.ts
  const outputCode = `import type { CatalogProduct } from "./index";

export type SeedProduct = Omit<CatalogProduct, "id"> & { rootCategory: string };

export const GENERATED_SEEDS: SeedProduct[] = ${JSON.stringify(allProducts, null, 2).replace(/"([^"]+)":/g, '$1:')};
`;

  await fs.writeFile(path.resolve('db/generated-catalog.ts'), outputCode, 'utf8');
  console.log('Saved to db/generated-catalog.ts successfully!');
}

scrape().catch(console.error);
