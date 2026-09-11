import fs from "fs";
import path from "path";

const items = JSON.parse(fs.readFileSync("gallery_extracted.json", "utf8"));
const destDir = path.resolve("public/images/yaren");
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

async function downloadAll() {
  console.log(`Starting download of ${items.length} images...`);
  let downloaded = 0;
  
  // Concurrency pool
  const queue = [...items];
  const workers = Array(5).fill(null).map(async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item || !item.src) continue;
      
      const filename = path.basename(item.src);
      const targetPath = path.join(destDir, filename);
      
      if (!fs.existsSync(targetPath)) {
        try {
          const res = await fetch(item.src);
          if (res.ok) {
            const buf = Buffer.from(await res.arrayBuffer());
            fs.writeFileSync(targetPath, buf);
            downloaded++;
            process.stdout.write(`\rDownloaded ${downloaded}/${items.length}: ${filename}`);
          } else {
            console.error(`\nFailed ${item.src}: ${res.status}`);
          }
        } catch (err) {
          console.error(`\nError ${item.src}:`, err.message);
        }
      } else {
        downloaded++;
      }
    }
  });

  await Promise.all(workers);
  console.log(`\nCompleted! Total downloaded/present: ${downloaded}`);
}

downloadAll().catch(console.error);
