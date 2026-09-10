import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import { URL } from "url";

const TARGET_URL = "https://www.yarenpliseperde.com/ana-sayfa/";

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(filepath))
           .on('error', reject)
           .once('close', () => resolve(filepath));
      } else {
        res.resume();
        reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
      }
    });
  });
};

async function scrape() {
  console.log("Fetching: " + TARGET_URL);
  const response = await fetch(TARGET_URL);
  const html = await response.text();

  const products = [];
  
  const productBlockRegex = /<li[^>]*class="[^"]*product[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;
  let match;
  let i = 1;

  while ((match = productBlockRegex.exec(html)) !== null) {
    const block = match[1];
    
    const titleMatch = block.match(/<h2[^>]*>(.*?)<\/h2>/i);
    let title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : `Product ${i}`;
    
    const priceMatch = block.match(/<span class="woocommerce-Price-amount amount">.*?<bdi>([\d,.]+).*?<\/bdi><\/span>/i);
    let price = priceMatch ? priceMatch[1].trim() : "0.00";

    const imgMatch = block.match(/<img[^>]+src="([^"]+)"/i);
    let imgUrl = imgMatch ? imgMatch[1] : null;

    if (title && imgUrl) {
      if (imgUrl.startsWith("/")) {
        imgUrl = "https://www.yarenpliseperde.com" + imgUrl;
      }
      
      const ext = path.extname(new URL(imgUrl).pathname) || ".jpg";
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const localFilename = `${slug}${ext}`;
      const localPath = path.join(process.cwd(), "public", "images", "catalog", localFilename);

      console.log(`Downloading ${imgUrl} -> ${localPath}`);
      try {
        await downloadImage(imgUrl, localPath);
        products.push({
          name: title,
          price: price,
          image: `/images/catalog/${localFilename}`,
          slug: slug
        });
      } catch (err) {
        console.error("Failed to download image: " + imgUrl, err);
      }
    }
    i++;
  }

  if (products.length === 0) {
    console.log("No products found using strict regex. Let's try finding all product links and images.");
    const linkRegex = /<a href="([^"]+\/product\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    const foundProducts = new Map();
    let match2;
    while ((match2 = linkRegex.exec(html)) !== null) {
      const href = match2[1];
      const inner = match2[2];
      
      const imgMatch = inner.match(/<img[^>]+src="([^"]+)"/i);
      const titleMatch = inner.match(/<h2[^>]*>(.*?)<\/h2>/i) || inner.match(/woocommerce-loop-product__title[^>]*>(.*?)<\//i);
      
      if (imgMatch) {
         let title = titleMatch ? titleMatch[1].trim() : href.split('/').filter(Boolean).pop();
         if (!foundProducts.has(href)) {
            foundProducts.set(href, { title, imgUrl: imgMatch[1] });
         }
      }
    }

    let idx = 1;
    for (const [href, data] of foundProducts.entries()) {
      let { title, imgUrl } = data;
      const ext = path.extname(new URL(imgUrl).pathname) || ".jpg";
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const localFilename = `scraped-${slug}${ext}`;
      const localPath = path.join(process.cwd(), "public", "images", "catalog", localFilename);
      
      console.log(`Fallback Downloading ${imgUrl} -> ${localPath}`);
      try {
        await downloadImage(imgUrl, localPath);
        products.push({
          name: title,
          price: "0.00", 
          image: `/images/catalog/${localFilename}`,
          slug: slug
        });
      } catch(e) {
        console.error(e);
      }
    }
  }

  fs.writeFileSync("scraped_products.json", JSON.stringify(products, null, 2));
  console.log(`Scraped ${products.length} products. Wrote to scraped_products.json`);
}

scrape().catch(console.error);
