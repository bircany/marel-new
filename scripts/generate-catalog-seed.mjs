import fs from 'fs';
import path from 'path';

const productsDir = path.join(process.cwd(), 'public/images/products');
const dirs = fs.readdirSync(productsDir).filter(d => fs.statSync(path.join(productsDir, d)).isDirectory());

const seeds = [];
let globalIndex = 1;

const imageExts = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const colorHints = [
  ["acik-gri", ["acik gri", "açık gri", "acik-gri", "light gray", "light grey"]],
  ["ara-gri", ["aragri", "ara gri"]],
  ["antrasit", ["antrasit", "ant"]],
  ["beyaz", ["beyaz", "white"]],
  ["siyah", ["siyah", "black"]],
  ["krem", ["krem", "cream"]],
  ["kahve", ["kahve", "brown"]],
  ["bej", ["bej", "beige"]],
  ["gri", ["gri", "gray", "grey"]],
  ["gold", ["gold", "altin", "altın"]],
  ["silver", ["silver", "gumus", "gümüş"]],
];

const colorHex = {
  "acik-gri": "#d8dcdf",
  "ara-gri": "#a7adb0",
  antrasit: "#343a40",
  beyaz: "#f8f8f2",
  siyah: "#151515",
  krem: "#eadfc9",
  kahve: "#73543c",
  bej: "#d8c29c",
  gri: "#8a9094",
  gold: "#b89b54",
  silver: "#b8bec3",
  standart: "#cccccc",
};

function slugify(input) {
  return String(input)
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleCase(input) {
  return String(input)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((part) => part.charAt(0).toLocaleUpperCase("tr-TR") + part.slice(1))
    .join(" ");
}

function cleanProductToken(file) {
  return path
    .basename(file, path.extname(file))
    .replace(/^texture[_-\s]*/i, "")
    .replace(/[_-\s]*7plise/i, "")
    .replace(/[_-\s]*square/i, "")
    .replace(/[_-\s]*transparent/i, "")
    .replace(/[_-\s]*kare/i, "")
    .replace(/[_-\s]*[0-9a-f]{6}$/i, "")
    .replace(/^chatgpt image\s*/i, "Model")
    .replace(/^gemini generated image\s*/i, "Model")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectColor(file) {
  const base = path.basename(file, path.extname(file)).toLocaleLowerCase("tr-TR");
  for (const [color, tokens] of colorHints) {
    if (tokens.some((token) => base.includes(token))) return color;
  }
  const hexMatch = file.match(/_([0-9a-fA-F]{6})\./);
  if (hexMatch) return hexMatch[1].toLowerCase();
  return "standart";
}

function publicImage(dir, file) {
  return `/images/products/${dir}/${file}`;
}

for (const dir of dirs) {
  const dirPath = path.join(productsDir, dir);
  const files = fs
    .readdirSync(dirPath)
    .filter((file) => imageExts.has(path.extname(file).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, "tr"));

  const seriesName = titleCase(dir === "dia" ? "diamond" : dir.replace(/^tülle$/i, "tulle"));

  for (const [index, file] of files.entries()) {
    const image = publicImage(dir, file);
    const color = detectColor(file);
    const cleanedToken = cleanProductToken(file);
    const colorLabel = color.length === 6 ? "Özel Renk" : titleCase(color);
    const detailLabel = cleanedToken && !cleanedToken.match(/^\d+$/) ? titleCase(cleanedToken) : `${String(index + 1).padStart(2, "0")} Model`;
    const slug = slugify(`${seriesName}-${detailLabel}-${globalIndex}`);
    const skuPrefix = slugify(seriesName).slice(0, 3).toUpperCase().padEnd(3, "M");
    const sku = `${skuPrefix}-${String(globalIndex).padStart(3, "0")}`;
    const basePrice = 59900 + (Math.floor((globalIndex - 1) / 12) * 5000);

    seeds.push({
      sku,
      slug,
      name: `${seriesName} ${detailLabel} Plise Perde`,
      category: "Plise Perdeler",
      description: `${seriesName} serisi ${detailLabel} plise perde. Her katalog fotoğrafı ayrı ürün olarak tanımlanmıştır; ölçüye özel en ve boy bilgisiyle sipariş verilebilir.`,
      price: basePrice,
      salePrice: Math.round(basePrice * 0.82),
      stock: 50,
      colors: JSON.stringify([
        {
          id: slugify(`${color}-${globalIndex}`),
          name: colorLabel,
          hex: color.length === 6 ? `#${color}` : colorHex[color] ?? colorHex.standart,
          image,
        },
      ]),
      images: [image],
    });
    globalIndex += 1;
  }
}

const output = `export const GENERATED_SEEDS = ${JSON.stringify(seeds, null, 2)};\n`;
fs.writeFileSync('db/generated-catalog.ts', output);
console.log(`Catalog seed data generated in db/generated-catalog.ts (${seeds.length} products)`);
