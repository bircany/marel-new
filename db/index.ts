import { env } from "cloudflare:workers";

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
  cargoCompany: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
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
    db.prepare("CREATE TABLE IF NOT EXISTS reviews (id TEXT PRIMARY KEY NOT NULL, user_id TEXT REFERENCES users(id) ON DELETE SET NULL, product_id TEXT REFERENCES products(id) ON DELETE SET NULL, rating INTEGER NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', admin_reply TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
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
  await seedMockOrders(db);
  await seedContactMessages(db);
  await seedUsers(db);
  await seedMockReviews(db);
  await db.prepare("PRAGMA optimize").run();
}

async function seedCatalog(db: D1Database): Promise<void> {
  const now = new Date().toISOString();
  const seeds = [
    ["HC-003", "honeycomb-003-gri", "HC-003", "Honeycomb 003 Gri Isı Yalıtımlı Plise Perde", "Honeycomb", "Hücresel yapılı, ısı yalıtımlı ve ölçüye özel plise perde.", 116600, 12, "/images/real/honeycomb-gri-detay.png"],
    ["DIA-100", "diamond-100-beyaz", "DIA-100", "Diamond 100 Beyaz Plise Perde", "Diamond", "%50 ışık filtrasyonlu, UV dayanımlı ölçüye özel plise perde.", 116600, 18, "/images/real/diamond-beyaz.jpeg"],
    ["DIA-102", "diamond-102-gri", "DIA-102", "Diamond 102 Gri Plise Perde", "Diamond", "Kolay temizlenebilir gri polyester doku.", 116600, 14, "/images/real/diamond-gri.jpeg"],
    ["BLK-05", "blackout-05-siyah", "BLK-05", "Blackout 05 Siyah Tam Karartma", "Blackout", "%100 ışık kontrolü sağlayan tam karartma kumaşı.", 149900, 8, "/images/catalog/blackout.webp"],
    ["HC-001", "honeycomb-001-beyaz", "HC-001", "Honeycomb 001 Beyaz Isı Yalıtımlı Perde", "Honeycomb", "Hücresel dokulu, %100 polyester ve ısı yalıtımlı ölçüye özel plise perde.", 116600, 10, "/images/real/diamond-beyaz-siyah-ip.jpeg"],
    ["DIA-108", "diamond-108-krem", "DIA-108", "Diamond 108 Krem Plise Perde", "Diamond", "%50 ışık filtrasyonlu, yumuşak gün ışığı sağlayan ölçüye özel plise perde.", 116600, 15, "/images/real/diamond-krem.jpeg"],
    ["DIA-109", "diamond-109-acik-gri", "DIA-109", "Diamond 109 Açık Gri Plise Perde", "Diamond", "UV dayanımlı, kolay temizlenebilir açık gri polyester doku.", 116600, 13, "/images/real/diamond-acik-gri.jpeg"],
    ["SLV-7002", "silver-7002-gri", "SLV-7002", "Silver 7002 Gri Plise Perde", "Silver", "%70 ışık filtrasyonlu, 150 gr/m² UV dayanımlı kumaş.", 116600, 16, "/images/catalog/silver.webp"],
  ] as const;
  const statements: D1PreparedStatement[] = [];
  for (const [id, slug, sku, name, category, description, price, stock, image] of seeds) {
    const existing = await db.prepare("SELECT 1 FROM products WHERE slug = ?").bind(slug).first();
    if (existing) continue;
    statements.push(db.prepare("INSERT INTO products (id, slug, sku, name, category, description, price, currency, stock, availability, brand, google_product_category, active, featured, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'TRY', ?, 'in_stock', 'Marel', 'Home & Garden > Decor > Window Treatments', 1, 1, ?, ?)").bind(id, slug, sku, name, category, description, price, stock, now, now));
    statements.push(db.prepare("INSERT INTO product_images (id, product_id, source_url, alt_text, sort_order, created_at) VALUES (?, ?, ?, ?, 0, ?)").bind(crypto.randomUUID(), id, image, name, now));
  }
  if (statements.length) await db.batch(statements);
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

async function seedMockOrders(db: D1Database): Promise<void> {
  const result = await db.prepare("SELECT COUNT(*) AS count FROM orders").first<{ count: number }>();
  if ((result?.count ?? 0) > 0) return;
  const now = new Date().toISOString();
  const mockOrders = [
    ["ord-001", "ORD-20260906-00001", "ahmet@example.com", "Ahmet Yılmaz", "05321112233", "pending", 116600, 116600, "Kadıköy / İstanbul", "Ölçüler 100x150cm"],
    ["ord-002", "ORD-20260906-00002", "mehmet@example.com", "Mehmet Kaya", "05332223344", "measure_ok", 233200, 233200, "Çankaya / Ankara", "2 adet Diamond 100 Beyaz"],
    ["ord-003", "ORD-20260906-00003", "ayse@example.com", "Ayşe Demir", "05354445566", "processing", 149900, 149900, "Karşıyaka / İzmir", "Blackout 05 Siyah karartma"],
    ["ord-004", "ORD-20260906-00004", "can@example.com", "Can Öztürk", "05367778899", "shipped", 210900, 210900, "Nilüfer / Bursa", "Silver 7002 Gri Plise"],
    ["ord-005", "ORD-20260905-00001", "zeynep@example.com", "Zeynep Şahin", "05378889900", "delivered", 150000, 150000, "Muratpaşa / Antalya", "Teslim edildi."],
    ["ord-006", "ORD-20260905-00002", "mustafa@example.com", "Mustafa Yıldız", "05389990011", "delivered", 150000, 150000, "Odunpazarı / Eskişehir", "Teslim edildi."],
  ] as const;
  for (const [id, orderNumber, email, name, phone, status, subtotal, total, address, notes] of mockOrders) {
    await db.prepare(
      "INSERT INTO orders (id, order_number, email, customer_name, phone, status, subtotal, shipping, total, currency, shipping_address, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, 'TRY', ?, ?, ?, ?)"
    ).bind(id, orderNumber, email, name, phone, status, subtotal, total, address, notes, now, now).run();
  }
}

async function seedContactMessages(db: D1Database): Promise<void> {
  const result = await db.prepare("SELECT COUNT(*) AS count FROM contact_messages").first<{ count: number }>();
  if ((result?.count ?? 0) > 0) return;
  const now = new Date().toISOString();
  await db.prepare(
    "INSERT INTO contact_messages (id, name, email, phone, subject, message, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'new', ?, ?)"
  ).bind("cm-001", "Mehmet Demir", "mehmet@example.com", "05339998877", "Ölçü & Kumaş Desteği", "Cam balkon plise perde sistemleri için ölçü ve kumaş kartelası hakkında bilgi rica ediyorum.", now, now).run();
}

async function seedUsers(db: D1Database): Promise<void> {
  const now = new Date().toISOString();
  const seedUsersList = [
    ["usr-101", "selin@example.com", "Selin Yılmaz", "customer"],
    ["usr-102", "burak@example.com", "Burak Kaya", "customer"],
    ["usr-103", "ayse@example.com", "Ayşe Tan", "customer"],
    ["usr-guest", "guest@marel.com", "Müşteri (Misafir)", "customer"],
  ] as const;

  for (const [id, email, fullName, role] of seedUsersList) {
    const existing = await db.prepare("SELECT 1 FROM users WHERE id = ?").bind(id).first();
    if (!existing) {
      await db.prepare(
        "INSERT INTO users (id, email, full_name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
      ).bind(id, email, fullName, role, now, now).run();
    }
  }
}

async function seedMockReviews(db: D1Database): Promise<void> {
  const result = await db.prepare("SELECT COUNT(*) AS count FROM reviews").first<{ count: number }>();
  if ((result?.count ?? 0) > 0) return;
  const now = new Date().toISOString();
  const mockReviews = [
    ["rev-001", "usr-101", "DIA-100", 5, "Mükemmel Plise Perde", "Diamond 100 Beyaz modelini salonumuz için aldık. Ölçüleri birebir uydu, montajı son derece kolay ve malzeme kalitesi harika.", "approved", "Bizi tercih ettiğiniz için teşekkür ederiz!", now],
    ["rev-002", "usr-102", "HC-003", 5, "Yalıtımı Gerçekten Hissediliyor", "Honeycomb gri plise perde çift cam balkonumuza tam oturdu. Güneş sıcaklığını belirgin şekilde kesti.", "pending", "", now],
    ["rev-003", "usr-103", "BLK-05", 4, "Tam Karartma Başarılı", "Yatak odası için aldık, sıfır ışık sızması sağlıyor. Kumaşı kaliteli ve kargo hızlıydı.", "approved", "", now],
  ] as const;

  for (const [id, userId, productId, rating, title, body, status, adminReply, createdAt] of mockReviews) {
    await db.prepare(
      "INSERT INTO reviews (id, user_id, product_id, rating, title, body, status, admin_reply, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(id, userId, productId, rating, title, body, status, adminReply, createdAt, createdAt).run();
  }
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

export async function listAnnouncements(publishedOnly = true): Promise<AnnouncementRecord[]> {
  await ensureDatabase();
  const where = publishedOnly ? "WHERE published = 1" : "";
  const { results } = await getDb().prepare(`SELECT id, slug, title, summary, body, image_url AS imageUrl, published, featured, published_at AS publishedAt, created_at AS createdAt, updated_at AS updatedAt FROM announcements ${where} ORDER BY featured DESC, COALESCE(published_at, created_at) DESC`).all<AnnouncementRecord>();
  return results;
}
