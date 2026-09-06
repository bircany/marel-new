#!/usr/bin/env node
/**
 * Toplu katalog foto import:
 * Klasör → seri/kategori → ürün (yoksa oluştur) → images[] (max 10/istek)
 *
 * Kullanım:
 *   node scripts/import-katalog-photos.mjs
 *   node scripts/import-katalog-photos.mjs --dry-run
 *   node scripts/import-katalog-photos.mjs --dir "C:/path/to/marel-katalog-fotolar"
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const API = process.env.SOFTRADE_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8081/api/v1";
const EMAIL = process.env.SOFTRADE_ADMIN_EMAIL || "admin@softtrade.com";
const PASSWORD = process.env.SOFTRADE_ADMIN_PASSWORD || "admin123";
const DEFAULT_DIR = "C:\\Users\\birca\\OneDrive\\Desktop\\transfer-01a0711f\\marel-katalog-fotolar";

const args = process.argv.slice(2);
const DRY = args.includes("--dry-run");
const dirArgIdx = args.indexOf("--dir");
const KATALOG_DIR = dirArgIdx >= 0 ? args[dirArgIdx + 1] : process.env.MAREL_KATALOG_DIR || DEFAULT_DIR;
const valueArg = (name, fallback) => { const index = args.indexOf(name); return index >= 0 ? args[index + 1] : fallback; };
const IMPORT_PRICE = Number(valueArg("--price", process.env.MAREL_IMPORT_PRICE || "1166"));
const IMPORT_STOCK = Number(valueArg("--stock", process.env.MAREL_IMPORT_STOCK || "20"));

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const SKIP_NAME = /(chatgpt|gemini_generated|\.rar$|^\.ds_store$)/i;

const FOLDER_ALIAS = {
  dia: "diamond",
  tulle: "tulle",
  new: "new-collection",
};

const SERIES_TITLE = {
  arda: "Arda",
  asel: "Asel",
  bambu: "Bambu",
  blackout: "Blackout",
  dark: "Dark",
  diamond: "Diamond",
  ece: "Ece",
  efe: "Efe",
  gold: "Gold",
  honeycomb: "Honeycomb",
  "new-collection": "New Collection",
  pars: "Pars",
  reina: "Reina",
  silver: "Silver",
  touch: "Touch",
  tulle: "Tulle",
  venus: "Venus",
};

const COLOR_TOKENS = [
  ["acik-gri", ["acik gri", "açık gri", "acik-gri", "light grey", "light gray"]],
  ["antrasit", ["antrasit"]],
  ["aragri", ["aragri", "ara gri"]],
  ["beyaz", ["beyaz", "white"]],
  ["siyah", ["siyah", "black"]],
  ["krem", ["krem", "cream"]],
  ["kahve", ["kahve", "brown"]],
  ["bej", ["bej", "beige"]],
  ["gri", ["gri", "grey", "gray"]],
];

const EXISTING_COLOR_HINTS = [
  { series: "honeycomb", color: "gri", slug: "honeycomb-003-gri" },
  { series: "honeycomb", color: "beyaz", slug: "honeycomb-001-beyaz" },
  { series: "diamond", color: "beyaz", slug: "diamond-100-beyaz" },
  { series: "diamond", color: "gri", slug: "diamond-102-gri" },
  { series: "diamond", color: "krem", slug: "diamond-108-krem" },
  { series: "diamond", color: "acik-gri", slug: "diamond-109-acik-gri" },
  { series: "blackout", color: "siyah", slug: "blackout-05-siyah" },
  { series: "silver", color: "gri", slug: "silver-7002-gri" },
];

function log(...parts) {
  console.log(...parts);
}

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
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function detectColor(filename) {
  const base = path.basename(filename, path.extname(filename)).toLocaleLowerCase("tr-TR");
  for (const [color, tokens] of COLOR_TOKENS) {
    if (tokens.some((t) => base.includes(t))) return color;
  }
  return null;
}

function preferCover(files) {
  const scored = files.map((f) => {
    const n = f.toLowerCase();
    let score = 0;
    if (/texture|kare|square|7plise/.test(n)) score += 3;
    if (/son|cover|ana/.test(n)) score += 2;
    if (/chatgpt|gemini/.test(n)) score -= 5;
    if (/_dsc\d+/i.test(n)) score += 1;
    return { f, score };
  });
  scored.sort((a, b) => b.score - a.score || a.f.localeCompare(b.f));
  return scored.map((s) => s.f);
}

async function api(pathname, { method = "GET", token, body, formData, headers = {} } = {}) {
  const h = { Accept: "application/json", ...headers };
  if (token) h.Authorization = `Bearer ${token}`;
  let payload = body;
  if (formData) {
    payload = formData;
  } else if (body && typeof body === "object" && !(body instanceof FormData)) {
    h["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${API}${pathname}`, { method, headers: h, body: payload });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    const msg = json?.message || json?.error || text || res.statusText;
    const details = json?.errors ? ` | ${JSON.stringify(json.errors)}` : "";
    throw new Error(`${method} ${pathname} → ${res.status}: ${typeof msg === "string" ? msg : JSON.stringify(msg)}${details}`);
  }
  return json;
}

function unwrapList(payload) {
  const d = payload?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  return [];
}

function listImageFiles(folderPath) {
  if (!fs.existsSync(folderPath)) return [];
  return fs
    .readdirSync(folderPath)
    .filter((name) => {
      const ext = path.extname(name).toLowerCase();
      if (!IMAGE_EXT.has(ext)) return false;
      if (SKIP_NAME.test(name)) return false;
      return true;
    })
    .map((name) => path.join(folderPath, name));
}

function flattenCategories(nodes, acc = []) {
  for (const n of nodes || []) {
    acc.push(n);
    if (n.children?.length) flattenCategories(n.children, acc);
  }
  return acc;
}

async function ensureCategory(token, series, parentId, cache) {
  const slug = series;
  if (cache.bySlug.has(slug)) return cache.bySlug.get(slug);
  const title = SERIES_TITLE[series] || series.replace(/(^|-)\w/g, (m) => m.toUpperCase());
  if (DRY) {
    const fake = { id: -cache.bySlug.size - 1, slug, name: title };
    cache.bySlug.set(slug, fake);
    log(`[dry] kategori oluştur: ${title} (${slug})`);
    return fake;
  }
  const created = await api("/admin/categories", {
    method: "POST",
    token,
    body: { name: title, slug, parent_id: parentId, is_active: true, sort_order: 0 },
  });
  const cat = created.data ?? created;
  cache.bySlug.set(cat.slug, cat);
  log(`+ kategori: ${cat.name} (#${cat.id})`);
  return cat;
}

async function ensureProduct(token, { series, color, categoryId, brandId, productsBySlug }) {
  const hint = EXISTING_COLOR_HINTS.find((h) => h.series === series && (!color || h.color === color));
  if (hint && productsBySlug.has(hint.slug)) {
    return productsBySlug.get(hint.slug);
  }

  const titleBase = SERIES_TITLE[series] || series;
  const colorLabel = color
    ? color
        .split("-")
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" ")
    : null;
  const name = colorLabel ? `${titleBase} ${colorLabel} Plise Perde` : `${titleBase} Plise Perde`;
  const slug = slugify(colorLabel ? `${series}-${color}` : `${series}-katalog`);
  if (productsBySlug.has(slug)) return productsBySlug.get(slug);

  const sku = slugify(colorLabel ? `${series}-${color}` : `${series}-kat`)
    .toUpperCase()
    .replace(/-/g, "")
    .slice(0, 20);

  if (DRY) {
    const fake = { id: -productsBySlug.size - 1, slug, name, sku };
    productsBySlug.set(slug, fake);
    log(`[dry] ürün: ${name} (${slug})`);
    return fake;
  }

  const form = new FormData();
  form.set("category_id", String(categoryId));
  if (brandId) form.set("brand_id", String(brandId));
  form.set("name", name);
  form.set("slug", slug);
  form.set("sku", sku);
  form.set("description", `${name} — katalog görselleri otomatik yüklendi.`);
  form.set("price", String(IMPORT_PRICE));
  form.set("stock", String(IMPORT_STOCK));
  form.set("status", "active");
  form.set("measurement_mode", "custom");
  form.set("is_made_to_order", "1");
  form.set("custom_measurement_rule[min_width]", "40");
  form.set("custom_measurement_rule[max_width]", "300");
  form.set("custom_measurement_rule[step_width]", "1");
  form.set("custom_measurement_rule[min_height]", "40");
  form.set("custom_measurement_rule[max_height]", "300");
  form.set("custom_measurement_rule[step_height]", "1");
  form.set("custom_measurement_rule[formula_type]", "area_m2");
  form.set("custom_measurement_rule[unit_price]", String(IMPORT_PRICE));
  form.set("custom_measurement_rule[min_billable_area]", "1");
  form.set("custom_measurement_rule[allow_decimal]", "1");

  try {
    const created = await api("/admin/products", { method: "POST", token, formData: form });
    const product = created.data ?? created;
    productsBySlug.set(product.slug, product);
    log(`+ ürün: ${product.name} (#${product.id} ${product.slug})`);
    return product;
  } catch (err) {
    // slug/sku çakışması → listeyi yenile
    const list = unwrapList(await api("/products?per_page=200"));
    for (const p of list) productsBySlug.set(p.slug, p);
    if (productsBySlug.has(slug)) return productsBySlug.get(slug);
    throw err;
  }
}

async function uploadBatch(token, productId, files, setCover) {
  if (DRY) {
    log(`[dry] upload #${productId}: ${files.length} dosya (cover=${setCover})`);
    return;
  }
  const form = new FormData();
  for (const filePath of files) {
    const buf = fs.readFileSync(filePath);
    const file = new File([buf], path.basename(filePath), { type: mimeFor(filePath) });
    form.append("images[]", file);
  }
  form.set("set_first_as_cover", setCover ? "1" : "0");
  await api(`/admin/products/${productId}/images`, { method: "POST", token, formData: form });
  log(`  ↑ ${files.length} görsel → ürün #${productId}`);
}

function mimeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  return "application/octet-stream";
}

/** Skip empty / tiny / non-image bytes */
function isLikelyImage(filePath) {
  try {
    const st = fs.statSync(filePath);
    if (st.size < 256) return false;
    if (st.size > 10 * 1024 * 1024) return false;
    const fd = fs.openSync(filePath, "r");
    const buf = Buffer.alloc(12);
    fs.readSync(fd, buf, 0, 12, 0);
    fs.closeSync(fd);
    // PNG / JPEG / WEBP
    if (buf[0] === 0x89 && buf[1] === 0x50) return true;
    if (buf[0] === 0xff && buf[1] === 0xd8) return true;
    if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return true;
    return false;
  } catch {
    return false;
  }
}

async function productHasImages(token, productId) {
  if (DRY) return false;
  const payload = await api("/admin/products/" + productId, { token });
  const product = payload?.data ?? payload;
  const images = product?.images?.data ?? product?.images;
  return Array.isArray(images) && images.length > 0;
}

async function uploadAll(token, productId, files, { replaceCover = false } = {}) {
  const chunks = [];
  for (let i = 0; i < files.length; i += 10) chunks.push(files.slice(i, i + 10));
  for (let i = 0; i < chunks.length; i++) {
    await uploadBatch(token, productId, chunks[i], replaceCover && i === 0);
  }
}

async function main() {
  log(`API: ${API}`);
  log(`Katalog: ${KATALOG_DIR}`);
  log(`Mod: ${DRY ? "DRY-RUN" : "IMPORT"}`);

  if (!fs.existsSync(KATALOG_DIR)) {
    throw new Error(`Katalog klasörü yok: ${KATALOG_DIR}`);
  }

  const login = await api("/auth/login", {
    method: "POST",
    body: { email: EMAIL, password: PASSWORD },
  });
  const token =
    login.data?.access_token ||
    login.data?.token ||
    login.access_token ||
    login.token;
  if (!token) throw new Error("Admin token alınamadı.");
  log("Admin login OK");

  const catsPayload = await api("/categories");
  const flat = flattenCategories(unwrapList(catsPayload));
  const cache = { bySlug: new Map(flat.map((c) => [c.slug, c])) };
  const parent = cache.bySlug.get("plise-perde");
  if (!parent) throw new Error("plise-perde kategorisi bulunamadı.");

  const brands = unwrapList(await api("/brands"));
  const brandId = brands.find((b) => /marel/i.test(b.name || b.slug))?.id ?? brands[0]?.id ?? null;

  const productsBySlug = new Map();
  for (const p of unwrapList(await api("/products?per_page=200"))) {
    productsBySlug.set(p.slug, p);
  }

  const folders = fs
    .readdirSync(KATALOG_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  let uploaded = 0;
  let productsTouched = 0;

  for (const folderName of folders) {
    const folderKey = slugify(folderName);
    const series = FOLDER_ALIAS[folderKey] || folderKey;
    const folderPath = path.join(KATALOG_DIR, folderName);
    let files = listImageFiles(folderPath);
    // ChatGPT-only klasörlerde (honeycomb) fallback: isim filtresiz al
    if (files.length === 0) {
      files = fs
        .readdirSync(folderPath)
        .filter((n) => IMAGE_EXT.has(path.extname(n).toLowerCase()) && !/\.rar$/i.test(n))
        .map((n) => path.join(folderPath, n));
    }
    files = preferCover(files);
    if (files.length === 0) {
      log(`· ${folderName}: görsel yok, atlandı`);
      continue;
    }

    const category = await ensureCategory(token, series, parent.id, cache);

    // Renkli dosyaları ayrı ürünlere, kalanları seri kataloğuna
    /** @type {Map<string, string[]>} */
    const buckets = new Map();
    for (const file of files) {
      const color = detectColor(file);
      const key = color || "__series__";
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(file);
    }

    for (const [key, bucketFiles] of buckets) {
      const color = key === "__series__" ? null : key;
      const product = await ensureProduct(token, {
        series,
        color,
        categoryId: category.id,
        brandId,
        productsBySlug,
      });
      productsTouched += 1;
      if (await productHasImages(token, product.id)) {
        log("  · ürün #" + product.id + " zaten görselli, bucket atlandı");
        continue;
      }
      await uploadAll(token, product.id, bucketFiles, { replaceCover: false });
      uploaded += bucketFiles.length;
    }

    log(`✓ ${folderName} → ${series}: ${files.length} dosya`);
  }

  log("\n=== ÖZET ===");
  log(`Ürün dokunulan: ${productsTouched}`);
  log(`Yüklenen görsel: ${uploaded}`);
  log(`Toplam ürün (API): ${productsBySlug.size}`);
}

main().catch((err) => {
  console.error("\nIMPORT HATA:", err.message || err);
  process.exit(1);
});
