import fs from 'fs/promises';
import path from 'path';
import https from 'https';
import * as cheerio from 'cheerio';
import { randomUUID } from 'crypto';

const URLS = [
  { root: 'Sineklikler', category: 'Sineklik', url: 'https://www.marelpliseperde.com.tr/sineklikler' },
  { root: 'Seperatör Kapı', category: 'Seperatör', url: 'https://www.marelpliseperde.com.tr/separator-kapi' },
  { root: 'Otomatik Panjurlar', category: 'Panjur', url: 'https://www.marelpliseperde.com.tr/otomatik-panjurlar' },
  { root: 'Tutamaklar', category: 'Tutamak', url: 'https://www.marelpliseperde.com.tr/tutamaklar' },
  { root: 'Aksesuarlar', category: 'Aksesuar', url: 'https://www.marelpliseperde.com.tr/aksesuarlar' }
];

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-')
    .replace(/^-+/, '').replace(/-+$/, '');
}

async function scrape() {
  const newProducts = [];
  
  for (const item of URLS) {
    console.log('Fetching', item.url);
    const html = await fetchHtml(item.url);
    const $ = cheerio.load(html);
    
    // Custom logic based on the markdown scrape of marelpliseperde.com.tr
    // Products are in elements with classes like .product-item or we can just find 'a' tags that have 'urunler/' in href
    
    // Based on the markdown output, products are linked like: /urunler/akordeon-pencere-sineklik-antrasit
    const productLinks = [];
    $('a').each((_, el) => {
      const href = $(el).attr('href');
      if (href && href.includes('/urunler/')) {
        const text = $(el).text().trim();
        if (text) {
          productLinks.push({ href, text, el });
        }
      }
    });

    // Alternatively, look for standard e-commerce grid classes
    let foundCards = false;
    $('.col-md-3, .col-sm-4, .col-xs-6, .product-item, .fl, .product-detail-card').each((_, el) => {
      const titleEl = $(el).find('.productName, .product-title, h3, h2, a.product-link').first();
      let title = titleEl.text().trim() || $(el).find('a').first().text().trim();
      const imgEl = $(el).find('img').first();
      let img = imgEl.attr('data-src') || imgEl.attr('src') || '';
      
      const priceEl = $(el).find('.discountPrice, .product-price, .current-price, .price').first();
      let priceText = priceEl.text().trim();

      if (title && title.length > 3) {
        if (img && !img.startsWith('http')) {
          if (img.startsWith('//')) img = 'https:' + img;
          else if (img.startsWith('/')) img = 'https://www.marelpliseperde.com.tr' + img;
        }

        const priceParsed = parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.')) || 2000;
        const priceKurus = Math.round(priceParsed * 100);
        const slug = slugify(title);

        if (!newProducts.find(p => p.slug === slug)) {
          newProducts.push({
            id: randomUUID(),
            name: title,
            slug: slug,
            sku: `MRL-${randomUUID().slice(0, 8).toUpperCase()}`,
            description: title + " - Marel yüksek kalite güvencesi.",
            price: Math.round(priceKurus * 1.3),
            salePrice: priceKurus,
            currency: 'TRY',
            stock: 100,
            availability: 'in_stock',
            brand: 'Marel',
            googleProductCategory: 'Home & Garden',
            active: 1,
            featured: 1,
            category: item.category,
            rootCategory: item.rootCategory,
            image: img || '/images/products/kamatas/placeholder.webp',
            images: img ? [img] : ['/images/products/kamatas/placeholder.webp'],
            colors: '[]',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          foundCards = true;
        }
      }
    });
    
    // Fallback if the DOM classes don't match (e.g. IdeaSoft structure)
    if (!foundCards) {
        // Just extract from the raw a-tags that have "urunler/"
        productLinks.forEach(({ href, text }) => {
            // "PEŞİNFİYATINA3 TAKSİTMarelAkordeon Pencere Sineklik Antrasit★★★★★90 Yorum₺2.033,641 Renk"
            // We can try to parse this
            // Let's just regex out the price and title
            const priceMatch = text.match(/₺([\d.,]+)/);
            let priceText = priceMatch ? priceMatch[1] : '2000';
            
            // The title is usually after "Marel" or "TAKSİT" and before "★★★★★"
            let title = text;
            const starMatch = text.indexOf('★');
            if (starMatch > 0) {
               title = text.substring(0, starMatch);
            }
            title = title.replace(/PEŞİNFİYATINA3 TAKSİT/, '').replace(/Marel/, '').trim();
            
            if (title.length > 5) {
                const slug = slugify(title);
                const priceParsed = parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.')) || 2000;
                const priceKurus = Math.round(priceParsed * 100);
                
                if (!newProducts.find(p => p.slug === slug)) {
                    newProducts.push({
                        id: randomUUID(),
                        name: title,
                        slug: slug,
                        sku: `MRL-${randomUUID().slice(0, 8).toUpperCase()}`,
                        description: title + " - Marel yüksek kalite güvencesi.",
                        price: Math.round(priceKurus * 1.3),
                        salePrice: priceKurus,
                        currency: 'TRY',
                        stock: 100,
                        availability: 'in_stock',
                        brand: 'Marel',
                        googleProductCategory: 'Home & Garden',
                        active: 1,
                        featured: 1,
                        category: item.category,
                        rootCategory: item.rootCategory,
                        image: '/images/products/kamatas/placeholder.webp',
                        images: ['/images/products/kamatas/placeholder.webp'],
                        colors: '[]',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                      });
                }
            }
        });
    }
  }
  
  console.log('Found new products:', newProducts.length);
  
  // Read existing catalog
  const catalogPath = path.resolve('db/generated-catalog.ts');
  let content = await fs.readFile(catalogPath, 'utf8');
  
  // Remove the mock products I added earlier
  content = content.replace(/\{\s*id:\s*"snklk-001"[\s\S]*?updatedAt:[\s\S]*?\},?\s*/g, '');
  content = content.replace(/\{\s*id:\s*"pnjr-001"[\s\S]*?updatedAt:[\s\S]*?\},?\s*/g, '');
  content = content.replace(/\{\s*id:\s*"ttmk-001"[\s\S]*?updatedAt:[\s\S]*?\},?\s*/g, '');
  content = content.replace(/\{\s*id:\s*"aks-001"[\s\S]*?updatedAt:[\s\S]*?\}\s*(?:\];)?/g, '');
  
  // Clean up end of array
  content = content.replace(/,\s*\];/, '];');
  if (!content.trim().endsWith('];')) {
     content = content.trim();
     if (content.endsWith(',')) content = content.slice(0, -1);
     content += '\n];\n';
  }
  
  // Append new products
  const productsJson = JSON.stringify(newProducts, null, 2).replace(/"([^"]+)":/g, '$1:');
  const innerJson = productsJson.substring(2, productsJson.length - 2);
  
  if (newProducts.length > 0) {
    content = content.replace(/\];$/, '  ,\n' + innerJson + '\n];');
  }
  
  await fs.writeFile(catalogPath, content, 'utf8');
  console.log('Updated db/generated-catalog.ts');
}

scrape().catch(console.error);
