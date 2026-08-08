import { env } from "cloudflare:workers";
import type { ChatGPTUser } from "@/app/chatgpt-auth";

export type CatalogProduct = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  category: string;
  description: string;
  price: number;
  salePrice: number | null;
  currency: string;
  stock: number;
  availability: string;
  brand: string;
  googleProductCategory: string;
  active: number;
  featured: number;
  image: string;
  createdAt: string;
  updatedAt: string;
};

export type OrderRecord = {
  id: string;
  orderNumber: string;
  userId: string | null;
  email: string;
  customerName: string;
  phone: string;
  status: string;
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  shippingAddress: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type ReviewRecord = {
  id: string;
  userId: string;
  productId: string | null;
  productName: string | null;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  status: string;
  adminReply: string;
  createdAt: string;
  updatedAt: string;
};

export type AnnouncementRecord = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  imageUrl: string;
  published: number;
  featured: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ContactMessageRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type RuntimeEnv = {
  DB: D1Database;
  PRODUCT_IMAGES: R2Bucket;
  MAREL_ADMIN_EMAILS?: string;
};

const runtime = env as unknown as RuntimeEnv;
let initialization: Promise<void> | null = null;

export function getDb(): D1Database {
  if (!runtime.DB) throw new Error("D1 binding DB is unavailable");
  return runtime.DB;
}

export function getProductImagesBucket(): R2Bucket {
  if (!runtime.PRODUCT_IMAGES) throw new Error("R2 binding PRODUCT_IMAGES is unavailable");
  return runtime.PRODUCT_IMAGES;
}

export async function ensureDatabase(): Promise<void> {
  if (initialization) return initialization;
  initialization = initializeDatabase().catch((error) => {
    initialization = null;
    throw error;
  });
  return initialization;
}

async function initializeDatabase(): Promise<void> {
  const db = getDb();
  await db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY NOT NULL, email TEXT NOT NULL, full_name TEXT, role TEXT NOT NULL DEFAULT 'customer', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email)"),
    db.prepare("CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY NOT NULL, slug TEXT NOT NULL, sku TEXT NOT NULL, name TEXT NOT NULL, category TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', price INTEGER NOT NULL DEFAULT 0, sale_price INTEGER, currency TEXT NOT NULL DEFAULT 'TRY', stock INTEGER NOT NULL DEFAULT 0, availability TEXT NOT NULL DEFAULT 'in_stock', brand TEXT NOT NULL DEFAULT 'Marel', google_product_category TEXT NOT NULL DEFAULT 'Home & Garden > Decor > Window Treatments', active INTEGER NOT NULL DEFAULT 1, featured INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug ON products(slug)"),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku ON products(sku)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_products_active_category ON products(active, category)"),
    db.prepare("CREATE TABLE IF NOT EXISTS product_images (id TEXT PRIMARY KEY NOT NULL, product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE, r2_key TEXT, source_url TEXT NOT NULL, alt_text TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_product_images_product_sort ON product_images(product_id, sort_order)"),
    db.prepare("CREATE TABLE IF NOT EXISTS cart_items (id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE, quantity INTEGER NOT NULL DEFAULT 1, configuration TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id)"),
    db.prepare("CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY NOT NULL, order_number TEXT NOT NULL, user_id TEXT REFERENCES users(id) ON DELETE SET NULL, email TEXT NOT NULL, customer_name TEXT NOT NULL, phone TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', subtotal INTEGER NOT NULL, shipping INTEGER NOT NULL DEFAULT 0, total INTEGER NOT NULL, currency TEXT NOT NULL DEFAULT 'TRY', shipping_address TEXT NOT NULL, notes TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_orders_user_created ON orders(user_id, created_at)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_orders_email_created ON orders(email, created_at)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_orders_open_status ON orders(status) WHERE status != 'delivered' AND status != 'cancelled'"),
    db.prepare("CREATE TABLE IF NOT EXISTS order_items (id TEXT PRIMARY KEY NOT NULL, order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE, product_id TEXT REFERENCES products(id) ON DELETE SET NULL, sku TEXT NOT NULL, name TEXT NOT NULL, unit_price INTEGER NOT NULL, quantity INTEGER NOT NULL, configuration TEXT NOT NULL DEFAULT '{}')"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)"),
    db.prepare("CREATE TABLE IF NOT EXISTS order_events (id TEXT PRIMARY KEY NOT NULL, order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE, status TEXT NOT NULL, note TEXT NOT NULL DEFAULT '', actor_user_id TEXT REFERENCES users(id) ON DELETE SET NULL, created_at TEXT NOT NULL)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_order_events_order_created ON order_events(order_id, created_at)"),
    db.prepare("CREATE TABLE IF NOT EXISTS reviews (id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, product_id TEXT REFERENCES products(id) ON DELETE SET NULL, rating INTEGER NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', admin_reply TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_reviews_status_created ON reviews(status, created_at)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_reviews_user_created ON reviews(user_id, created_at)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_reviews_product_status ON reviews(product_id, status)"),
    db.prepare("CREATE TABLE IF NOT EXISTS announcements (id TEXT PRIMARY KEY NOT NULL, slug TEXT NOT NULL, title TEXT NOT NULL, summary TEXT NOT NULL, body TEXT NOT NULL, image_url TEXT NOT NULL DEFAULT '/images/hero/marel-honeycomb-hero-v3.png', published INTEGER NOT NULL DEFAULT 0, featured INTEGER NOT NULL DEFAULT 0, published_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_announcements_slug ON announcements(slug)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_announcements_published_date ON announcements(published, published_at)"),
    db.prepare("CREATE TABLE IF NOT EXISTS contact_messages (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL DEFAULT '', subject TEXT NOT NULL, message TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_contact_messages_status_created ON contact_messages(status, created_at)"),
  ]);
  await seedCatalog(db);
  await seedAnnouncements(db);
  await db.prepare("PRAGMA optimize").run();
}

async function seedCatalog(db: D1Database): Promise<void> {
  const result = await db.prepare("SELECT COUNT(*) AS count FROM products").first<{ count: number }>();
  if ((result?.count ?? 0) > 0) return;
  const now = new Date().toISOString();
  const seeds = [
    ["HC-003", "honeycomb-003-gri", "HC-003", "Honeycomb 003 Gri Isı Yalıtımlı Plise Perde", "Honeycomb", "Hücresel yapılı, ısı yalıtımlı ve ölçüye özel plise perde.", 116600, 12, "/images/real/honeycomb-gri-detay.png"],
    ["DIA-100", "diamond-100-beyaz", "DIA-100", "Diamond 100 Beyaz Plise Perde", "Diamond", "%50 ışık filtrasyonlu, UV dayanımlı ölçüye özel plise perde.", 116600, 18, "/images/real/diamond-beyaz.jpeg"],
    ["DIA-102", "diamond-102-gri", "DIA-102", "Diamond 102 Gri Plise Perde", "Diamond", "Kolay temizlenebilir gri polyester doku.", 116600, 14, "/images/real/diamond-gri.jpeg"],
    ["BLK-05", "blackout-05-siyah", "BLK-05", "Blackout 05 Siyah Tam Karartma", "Blackout", "%100 ışık kontrolü sağlayan tam karartma kumaşı.", 149900, 8, "/images/catalog/blackout.webp"],
  ] as const;
  const statements: D1PreparedStatement[] = [];
  for (const [id, slug, sku, name, category, description, price, stock, image] of seeds) {
    statements.push(db.prepare("INSERT INTO products (id, slug, sku, name, category, description, price, currency, stock, availability, brand, google_product_category, active, featured, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'TRY', ?, 'in_stock', 'Marel', 'Home & Garden > Decor > Window Treatments', 1, 1, ?, ?)").bind(id, slug, sku, name, category, description, price, stock, now, now));
    statements.push(db.prepare("INSERT INTO product_images (id, product_id, source_url, alt_text, sort_order, created_at) VALUES (?, ?, ?, ?, 0, ?)").bind(crypto.randomUUID(), id, image, name, now));
  }
  await db.batch(statements);
}

async function seedAnnouncements(db: D1Database): Promise<void> {
  const result = await db.prepare("SELECT COUNT(*) AS count FROM announcements").first<{ count: number }>();
  if ((result?.count ?? 0) > 0) return;
  const now = new Date().toISOString();
  const rows = [
    ["olcuye-ozel-uretim-rehberi", "Ölçüye özel üretim nasıl ilerliyor?", "Ölçü teyidinden üretim ve teslimata kadar Marel sipariş sürecini adım adım keşfedin.", "Siparişiniz sonrasında Marel danışmanı ölçülerinizi ve seçtiğiniz kumaş ile profil rengini teyit eder. Onaylanan bilgiler üretim planına alınır; güncel durumunu Hesabım alanından takip edebilirsiniz.", "/images/real/diamond-beyaz-siyah-ip.jpeg", 1],
    ["honeycomb-isi-yalitimi", "Honeycomb ile dört mevsim konfor", "Hücresel kumaş yapısının ışık ve ısı kontrolüne katkısını yakından inceleyin.", "Honeycomb kumaşın hücresel yapısı, cam yüzeyi ile yaşam alanı arasında ek bir hava katmanı oluşturur. Doğru renk ve ölçü seçimi için fotoğrafınızı WhatsApp danışmanımıza iletebilirsiniz.", "/images/hero/marel-honeycomb-hero-v3.png", 1],
    ["whatsapp-olcu-destegi", "Fotoğrafınızı gönderin, sistemi birlikte seçelim", "Perde, sineklik veya kapı sistemi seçiminde Marel danışmanından hızlı destek alın.", "Mekânın genel görünümünü ve yaklaşık ölçüleri paylaşmanız yeterli. Kullanım alanınıza göre uygun sistem, kumaş ve profil seçeneklerini birlikte belirleyelim.", "/images/catalog/diamond.webp", 0],
  ] as const;
  await db.batch(rows.map(([slug, title, summary, body, image, featured]) => db.prepare("INSERT INTO announcements (id, slug, title, summary, body, image_url, published, featured, published_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)").bind(crypto.randomUUID(), slug, title, summary, body, image, featured, now, now, now)));
}

export async function listProducts(includeInactive = false): Promise<CatalogProduct[]> {
  await ensureDatabase();
  const where = includeInactive ? "" : "WHERE p.active = 1";
  const { results } = await getDb().prepare(`SELECT p.id, p.slug, p.sku, p.name, p.category, p.description, p.price, p.sale_price AS salePrice, p.currency, p.stock, p.availability, p.brand, p.google_product_category AS googleProductCategory, p.active, p.featured, p.created_at AS createdAt, p.updated_at AS updatedAt, COALESCE((SELECT source_url FROM product_images WHERE product_id = p.id ORDER BY sort_order, created_at LIMIT 1), '/images/catalog/diamond.webp') AS image FROM products p ${where} ORDER BY p.featured DESC, p.updated_at DESC`).all<CatalogProduct>();
  return results;
}

export async function getProductBySlug(slug: string): Promise<CatalogProduct | null> {
  await ensureDatabase();
  return getDb().prepare("SELECT p.id, p.slug, p.sku, p.name, p.category, p.description, p.price, p.sale_price AS salePrice, p.currency, p.stock, p.availability, p.brand, p.google_product_category AS googleProductCategory, p.active, p.featured, p.created_at AS createdAt, p.updated_at AS updatedAt, COALESCE((SELECT source_url FROM product_images WHERE product_id = p.id ORDER BY sort_order, created_at LIMIT 1), '/images/catalog/diamond.webp') AS image FROM products p WHERE p.slug = ? AND p.active = 1").bind(slug).first<CatalogProduct>();
}

export async function upsertUser(user: ChatGPTUser, role = "customer"): Promise<void> {
  await ensureDatabase();
  const now = new Date().toISOString();
  await getDb().prepare("INSERT INTO users (id, email, full_name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET email = excluded.email, full_name = excluded.full_name, role = CASE WHEN users.role = 'admin' THEN 'admin' ELSE excluded.role END, updated_at = excluded.updated_at").bind(user.userId, user.email.toLowerCase(), user.fullName, role, now, now).run();
}

export function isAdminUser(user: ChatGPTUser): boolean {
  const allowed = (runtime.MAREL_ADMIN_EMAILS ?? "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
  return allowed.includes(user.email.toLowerCase());
}

export async function listOrdersForUser(userId: string): Promise<OrderRecord[]> {
  await ensureDatabase();
  const { results } = await getDb().prepare("SELECT id, order_number AS orderNumber, user_id AS userId, email, customer_name AS customerName, phone, status, subtotal, shipping, total, currency, shipping_address AS shippingAddress, notes, created_at AS createdAt, updated_at AS updatedAt FROM orders WHERE user_id = ? ORDER BY created_at DESC").bind(userId).all<OrderRecord>();
  return results;
}

export async function listAllOrders(): Promise<OrderRecord[]> {
  await ensureDatabase();
  const { results } = await getDb().prepare("SELECT id, order_number AS orderNumber, user_id AS userId, email, customer_name AS customerName, phone, status, subtotal, shipping, total, currency, shipping_address AS shippingAddress, notes, created_at AS createdAt, updated_at AS updatedAt FROM orders ORDER BY created_at DESC LIMIT 200").all<OrderRecord>();
  return results;
}

export async function listApprovedReviews(limit = 6): Promise<ReviewRecord[]> {
  await ensureDatabase();
  const { results } = await getDb().prepare("SELECT r.id, r.user_id AS userId, r.product_id AS productId, p.name AS productName, COALESCE(NULLIF(u.full_name, ''), substr(u.email, 1, instr(u.email, '@') - 1)) AS authorName, r.rating, r.title, r.body, r.status, r.admin_reply AS adminReply, r.created_at AS createdAt, r.updated_at AS updatedAt FROM reviews r JOIN users u ON u.id = r.user_id LEFT JOIN products p ON p.id = r.product_id WHERE r.status = 'approved' ORDER BY r.created_at DESC LIMIT ?").bind(limit).all<ReviewRecord>();
  return results;
}

export async function listReviewsForUser(userId: string): Promise<ReviewRecord[]> {
  await ensureDatabase();
  const { results } = await getDb().prepare("SELECT r.id, r.user_id AS userId, r.product_id AS productId, p.name AS productName, '' AS authorName, r.rating, r.title, r.body, r.status, r.admin_reply AS adminReply, r.created_at AS createdAt, r.updated_at AS updatedAt FROM reviews r LEFT JOIN products p ON p.id = r.product_id WHERE r.user_id = ? ORDER BY r.created_at DESC").bind(userId).all<ReviewRecord>();
  return results;
}

export async function listAllReviews(): Promise<ReviewRecord[]> {
  await ensureDatabase();
  const { results } = await getDb().prepare("SELECT r.id, r.user_id AS userId, r.product_id AS productId, p.name AS productName, COALESCE(NULLIF(u.full_name, ''), u.email) AS authorName, r.rating, r.title, r.body, r.status, r.admin_reply AS adminReply, r.created_at AS createdAt, r.updated_at AS updatedAt FROM reviews r JOIN users u ON u.id = r.user_id LEFT JOIN products p ON p.id = r.product_id ORDER BY CASE r.status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END, r.created_at DESC LIMIT 300").all<ReviewRecord>();
  return results;
}

export async function listAnnouncements(publishedOnly = true): Promise<AnnouncementRecord[]> {
  await ensureDatabase();
  const where = publishedOnly ? "WHERE published = 1" : "";
  const { results } = await getDb().prepare(`SELECT id, slug, title, summary, body, image_url AS imageUrl, published, featured, published_at AS publishedAt, created_at AS createdAt, updated_at AS updatedAt FROM announcements ${where} ORDER BY featured DESC, COALESCE(published_at, created_at) DESC`).all<AnnouncementRecord>();
  return results;
}

export async function listContactMessages(): Promise<ContactMessageRecord[]> {
  await ensureDatabase();
  const { results } = await getDb().prepare("SELECT id, name, email, phone, subject, message, status, created_at AS createdAt, updated_at AS updatedAt FROM contact_messages ORDER BY CASE status WHEN 'new' THEN 0 WHEN 'read' THEN 1 ELSE 2 END, created_at DESC LIMIT 300").all<ContactMessageRecord>();
  return results;
}
