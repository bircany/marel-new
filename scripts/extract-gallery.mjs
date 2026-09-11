import fs from "fs";

const html = fs.readFileSync("yaren_urun_cesitleri.html", "utf8");

// Look for gallery items or image blocks
const items = [];
const dlRegex = /<dl[^>]*class=['"]gallery-item['"][^>]*>([\s\S]*?)<\/dl>/gi;
let match;
while ((match = dlRegex.exec(html)) !== null) {
  const block = match[1];
  const src = block.match(/src=['"]([^'"]+)['"]/i)?.[1];
  const caption = block.match(/class=['"][^'"]*wp-caption-text[^'"]*['"][^>]*>([\s\S]*?)<\/dd>/i)?.[1]?.replace(/<[^>]+>/g, "").trim() || "";
  items.push({ src, caption });
}

console.log("Found gallery items from dl:", items.length);

if (items.length === 0) {
  // Try figure
  const figRegex = /<figure[^>]*>([\s\S]*?)<\/figure>/gi;
  while ((match = figRegex.exec(html)) !== null) {
    const block = match[1];
    const src = block.match(/src=['"]([^'"]+)['"]/i)?.[1];
    const caption = block.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i)?.[1]?.replace(/<[^>]+>/g, "").trim() || "";
    if (src) items.push({ src, caption });
  }
  console.log("Found gallery items from figure:", items.length);
}

fs.writeFileSync("gallery_extracted.json", JSON.stringify(items, null, 2));
console.log("First 5:", items.slice(0, 5));
