import postgres from "postgres";
import { GENERATED_SEEDS } from "./generated-catalog";
import { GENERATED_PLISE_SEEDS } from "./generated-plise";

const ALL_FALLBACK_PRODUCTS: CatalogProduct[] = [...(GENERATED_SEEDS as any), ...(GENERATED_PLISE_SEEDS as any)];

export type CatalogProduct = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  category: string;
  rootCategory?: string;
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
  colors?: string;
  dimensions?: string;
  installments?: number;
  installmentText?: string;
  image: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
};

export type OrderItemRecord = {
  id: string;
  orderId: string;
  productId: string | null;
  sku: string;
  name: string;
  unitPrice: number;
  quantity: number;
  configuration: string;
};

export type OrderRecord = {
  id: string;
  orderNumber: string;
  userId: string | null;
  email: string;
  customerName: string;
  phone: string;
  status: string;
  paymentMethod?: string;
  paymentStatus?: string;
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  city?: string | null;
  district?: string | null;
  shippingAddress: string;
  notes: string;
  cargoCompany: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  items?: OrderItemRecord[];
  createdAt: string;
  updatedAt: string;
};

export type CouponRecord = {
  id: string;
  code: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  minimumSubtotal: number;
  usageLimit: number | null;
  usageCount: number;
  active: boolean | number;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CustomerRecord = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string | null;
  createdAt: string;
};

export type SiteSettingsRecord = Record<string, string>;

export type ReviewRecord = {
  id: string;
  userId: string | null;
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

export interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  all<T = Record<string, any>>(): Promise<{ results: T[]; success: boolean }>;
  first<T = Record<string, any>>(colName?: string): Promise<T | null>;
  run(): Promise<{ success: boolean; meta: any }>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<any[]>;
  exec?(query: string): Promise<any>;
}

export interface R2Bucket {
  put(key: string, value: any, options?: any): Promise<any>;
  get(key: string): Promise<any>;
}

let sqlClient: any = null;

export function getPostgresClient() {
  if (sqlClient) return sqlClient;
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return null;
  try {
    sqlClient = postgres(dbUrl, {
      prepare: false,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    return sqlClient;
  } catch (err) {
    console.error("[db] PostgreSQL connection error:", err);
    return null;
  }
}

function transformQuery(query: string, params: any[] = []) {
  let paramIndex = 1;
  let pgQuery = query.replace(/\?/g, () => `$${paramIndex++}`);
  pgQuery = pgQuery.replace(/json_group_array\((.*?)\)/gi, "COALESCE(json_agg($1), '[]'::json)");
  return { pgQuery, pgParams: params };
}

export function getDb(): D1Database {
  const sql = getPostgresClient();
  if (sql) {
    return {
      prepare(query: string): D1PreparedStatement {
        let boundParams: any[] = [];
        const stmt: D1PreparedStatement = {
          bind(...args: any[]) {
            boundParams = args;
            return stmt;
          },
          async run() {
            try {
              if (query.trim().toUpperCase().startsWith("PRAGMA")) return { success: true, meta: {} };
              const { pgQuery, pgParams } = transformQuery(query, boundParams);
              await sql.unsafe(pgQuery, pgParams);
              return { success: true, meta: {} };
            } catch (err) {
              console.warn("[db] SQL run error:", err);
              return { success: false, meta: { error: err } };
            }
          },
          async all<T = Record<string, any>>() {
            try {
              const { pgQuery, pgParams } = transformQuery(query, boundParams);
              const rows = await sql.unsafe(pgQuery, pgParams);
              return { results: Array.from(rows) as T[], success: true };
            } catch (err) {
              console.warn("[db] SQL all error:", err);
              return { results: [], success: false };
            }
          },
          async first<T = Record<string, any>>() {
            try {
              const { pgQuery, pgParams } = transformQuery(query, boundParams);
              const rows = await sql.unsafe(pgQuery, pgParams);
              return (rows[0] as T) ?? null;
            } catch (err) {
              console.warn("[db] SQL first error:", err);
              return null;
            }
          },
        };
        return stmt;
      },
      async batch(statements: D1PreparedStatement[]) {
        const results = [];
        for (const s of statements) {
          try {
            results.push(await s.run());
          } catch {
            results.push({ success: false });
          }
        }
        return results;
      },
    };
  }

  return {
    prepare(_query: string): D1PreparedStatement {
      const stmt: D1PreparedStatement = {
        bind(..._args: any[]) { return stmt; },
        async run() { return { success: true, meta: {} }; },
        async all<T>() { return { results: [] as T[], success: true }; },
        async first<T>() { return null; },
      };
      return stmt;
    },
    async batch(_statements: D1PreparedStatement[]) { return []; },
  };
}

export function getProductImagesBucket(): R2Bucket {
  return {
    async put(_key: string, _value: any, _options?: any) {
      return null;
    },
    async get(_key: string) {
      return null;
    },
  };
}

let dbReady = false;
let initialization: Promise<void> | null = null;

export async function ensureDatabase(): Promise<void> {
  const sql = getPostgresClient();
  if (!sql) return;
  if (dbReady) return;
  if (initialization) return initialization;
  initialization = (async () => {
    try {
      const db = getDb();
      const check = await db.prepare("SELECT 1 FROM products LIMIT 1").first();
      if (check) {
        dbReady = true;
        return;
      }
    } catch {}
    await initializeDatabase();
    dbReady = true;
  })().catch((error) => {
    console.error("[db] Database initialization error:", error);
    initialization = null;
  });
  return initialization;
}

export async function forceReseedDatabase(): Promise<void> {
  dbReady = false;
  initialization = null;
  await initializeDatabase();
  dbReady = true;
}

async function initializeDatabase(): Promise<void> {
  const db = getDb();
  await db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY NOT NULL, email TEXT NOT NULL, full_name TEXT, role TEXT NOT NULL DEFAULT 'customer', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email)"),
    db.prepare("CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY NOT NULL, slug TEXT NOT NULL, sku TEXT NOT NULL, name TEXT NOT NULL, category TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', price INTEGER NOT NULL DEFAULT 0, sale_price INTEGER, currency TEXT NOT NULL DEFAULT 'TRY', stock INTEGER NOT NULL DEFAULT 0, availability TEXT NOT NULL DEFAULT 'in_stock', brand TEXT NOT NULL DEFAULT 'Marel', google_product_category TEXT NOT NULL DEFAULT 'Home & Garden > Decor > Window Treatments', active INTEGER NOT NULL DEFAULT 1, featured INTEGER NOT NULL DEFAULT 0, colors TEXT NOT NULL DEFAULT '[]', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug ON products(slug)"),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku ON products(sku)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_products_active_category ON products(active, category)"),
    db.prepare("CREATE TABLE IF NOT EXISTS product_images (id TEXT PRIMARY KEY NOT NULL, product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE, r2_key TEXT, source_url TEXT NOT NULL, alt_text TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_product_images_product_sort ON product_images(product_id, sort_order)"),
    db.prepare("CREATE TABLE IF NOT EXISTS cart_items (id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE, quantity INTEGER NOT NULL DEFAULT 1, configuration TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id)"),
    db.prepare("CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY NOT NULL, order_number TEXT NOT NULL, user_id TEXT REFERENCES users(id) ON DELETE SET NULL, email TEXT NOT NULL, customer_name TEXT NOT NULL, phone TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', payment_method TEXT NOT NULL DEFAULT 'bank_transfer', payment_status TEXT NOT NULL DEFAULT 'pending', subtotal INTEGER NOT NULL, shipping INTEGER NOT NULL DEFAULT 0, total INTEGER NOT NULL, currency TEXT NOT NULL DEFAULT 'TRY', city TEXT, district TEXT, shipping_address TEXT NOT NULL, notes TEXT NOT NULL DEFAULT '', cargo_company TEXT, tracking_number TEXT, tracking_url TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
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
    db.prepare("CREATE TABLE IF NOT EXISTS coupons (id TEXT PRIMARY KEY NOT NULL, code TEXT NOT NULL, discount_type TEXT NOT NULL DEFAULT 'PERCENT', discount_value INTEGER NOT NULL, minimum_subtotal INTEGER NOT NULL DEFAULT 0, usage_limit INTEGER, usage_count INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1, expires_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code)"),
    db.prepare("CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL)"),
  ]);
  try { await db.prepare("ALTER TABLE products ADD COLUMN colors TEXT NOT NULL DEFAULT '[]'").run(); } catch {}
  try { await db.prepare("ALTER TABLE products ADD COLUMN root_category TEXT").run(); } catch {}
  try { await db.prepare("ALTER TABLE products ADD COLUMN installments INTEGER NOT NULL DEFAULT 3").run(); } catch {}
  try { await db.prepare("ALTER TABLE products ADD COLUMN installment_text TEXT NOT NULL DEFAULT 'Peşin Fiyatına 3 Taksit'").run(); } catch {}
  try { await db.prepare("ALTER TABLE products ADD COLUMN dimensions TEXT NOT NULL DEFAULT 'Özel Ölçüye Göre Üretim'").run(); } catch {}
  try { await db.prepare("ALTER TABLE orders ADD COLUMN cargo_company TEXT").run(); } catch {}
  try { await db.prepare("ALTER TABLE orders ADD COLUMN tracking_number TEXT").run(); } catch {}
  try { await db.prepare("ALTER TABLE orders ADD COLUMN tracking_url TEXT").run(); } catch {}
  try { await db.prepare("ALTER TABLE orders ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'bank_transfer'").run(); } catch {}
  try { await db.prepare("ALTER TABLE orders ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'pending'").run(); } catch {}
  try { await db.prepare("ALTER TABLE orders ADD COLUMN city TEXT").run(); } catch {}
  try { await db.prepare("ALTER TABLE orders ADD COLUMN district TEXT").run(); } catch {}
  await seedCatalog(db);
  await seedAnnouncements(db);
  await seedMockOrders(db);
  await seedContactMessages(db);
  await seedUsers(db);
  await seedMockReviews(db);
  await seedSettings(db);
  await seedCoupons(db);
  await db.prepare("PRAGMA optimize").run();
}

async function seedCatalog(db: D1Database): Promise<void> {
  const allSeeds = [...GENERATED_SEEDS, ...GENERATED_PLISE_SEEDS];
  const result = await db.prepare("SELECT COUNT(*) AS count FROM products").first<{ count: number }>();
  if ((result?.count ?? 0) === allSeeds.length) return; // Skip only if all seeds exist

  const now = new Date().toISOString();
  const statements: D1PreparedStatement[] = [];
  
  // Wipe if count is different to ensure full catalog is fresh
  statements.push(db.prepare("DELETE FROM products"));
  statements.push(db.prepare("DELETE FROM product_images"));

  for (const product of allSeeds) {
    const id = crypto.randomUUID();
    const rootCat = (product as any).rootCategory || (product.category.includes("Plise") ? "Perdeler" : product.category);
    statements.push(
      db.prepare(
        "INSERT INTO products (id, slug, sku, name, category, description, price, sale_price, currency, stock, availability, brand, google_product_category, active, featured, colors, root_category, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'TRY', ?, 'in_stock', 'Marel', 'Home & Garden > Decor > Window Treatments', 1, 1, ?, ?, ?, ?)"
      ).bind(
        id,
        product.slug,
        product.sku,
        product.name,
        product.category,
        product.description,
        product.price,
        product.salePrice ?? null,
        product.stock,
        product.colors,
        rootCat,
        now,
        now
      )
    );
    
    let sortOrder = 0;
    const imagesToSeed = (product as any).images || [product.image];
    for (const image of imagesToSeed) {
      statements.push(
        db.prepare(
          "INSERT INTO product_images (id, product_id, source_url, alt_text, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?)"
        ).bind(crypto.randomUUID(), id, image, product.name, sortOrder++, now)
      );
    }
  }
  
  // Batch execute in safe chunks of 30 statements
  for (let i = 0; i < statements.length; i += 30) {
    const chunk = statements.slice(i, i + 30);
    await db.batch(chunk);
  }
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
    const tracking = status === "shipped" ? "YK1234567890" : null;
    const trackingUrl = tracking ? "https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=YK1234567890" : null;
    await db.prepare(
      "INSERT INTO orders (id, order_number, email, customer_name, phone, status, subtotal, shipping, total, currency, shipping_address, notes, cargo_company, tracking_number, tracking_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, 'TRY', ?, ?, 'yurtici', ?, ?, ?, ?)"
    ).bind(id, orderNumber, email, name, phone, status, subtotal, total, address, notes, tracking, trackingUrl, now, now).run();
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
  const countRes = await db.prepare("SELECT COUNT(*) AS count FROM reviews").first<{ count: number }>();
  if ((countRes?.count ?? 0) >= 500) return;

  await db.prepare("DELETE FROM reviews").run();

  const { results: productRows } = await db.prepare("SELECT id, name FROM products").all<{ id: string; name: string }>();
  if (!productRows || productRows.length === 0) return;

  const reviewTemplates = [
    { title: "İnce ama tam istediğim", body: "Deneme amaçlı aldım ve bayağı iyiymiş. Kalitesi ve duruşu harika.", rating: 5, author: "Muhammed Mustafa Ö." },
    { title: "Çok güzel memnun kaldım", body: "Çok güzel memnun kaldım, ölçüleri birebir uydu satıcıya teşekkür ederim.", rating: 5, author: "Özkan K." },
    { title: "Ellerinize Sağlık", body: "Ürünün kalitesinden ve ölçülerinden çok memnun kaldık ellerinize sağlık. Evimizde diğer perde/sineklik ihtiyaçlarımız için adresimiz belli oldu. Teşekkürler.", rating: 5, author: "Mehmet K." },
    { title: "Plise Perde Kalitesi", body: "Gayet güzel tam ölçü renk de tam istediğim gibiydi. Kesinlikle tavsiye ederim.", rating: 5, author: "Hakan F." },
    { title: "Şahane ürün ve işçilik", body: "Teşekkürler çok memnun kaldık paketlemeden ürün kalitesine kadar. Bütün camlar için tekrar sipariş vereceğiz.", rating: 5, author: "Zeynep T." },
    { title: "Montajı Çok Kolay", body: "Kendim 10 dakikada montajını tamamladım, mekanizması pürüzsüz çalışıyor.", rating: 5, author: "Burak Y." },
    { title: "Beklentimin Üzerinde", body: "Işık yalıtımı ve kumaş dokusu çok kaliteli. Rengi fotoğraftakinden daha da şık durdu.", rating: 5, author: "Ayşe D." },
    { title: "Hızlı Kargo ve Sağlam Paketleme", body: "Kargo 2 gün içinde ulaştı, kutulama ve koruma çok özenliydi. Hiçbir ezilme yoktu.", rating: 5, author: "Serkan A." },
    { title: "Tam Ölçüsünde Geldi", body: "Verdiğim milimetrik ölçüye tam oturdu, vidaları ve aparatları eksiksizdi.", rating: 5, author: "Fatma B." },
    { title: "Fiyat / Performans 10 Numara", body: "Piyasadaki alternatiflerine göre malzeme kalitesi ve profil kalınlığı çok daha iyi.", rating: 4, author: "Ali C." },
    { title: "Harika Bir Deneyim", body: "Güneşi çok güzel kırıyor, içerisi ferahladı. Cam balkonumuza tam uydu.", rating: 5, author: "Emre V." },
    { title: "Tavsiye Ederim", body: "Kumaşın leke tutmaz yapısı ve kolay silinmesi büyük avantaj.", rating: 5, author: "Selin G." },
  ];

  const now = new Date();
  const statements: D1PreparedStatement[] = [];

  for (const prod of productRows) {
    // 10 reviews per product
    for (let i = 0; i < 10; i++) {
      const tpl = reviewTemplates[(i + prod.id.charCodeAt(0)) % reviewTemplates.length];
      const revId = `rev-${prod.id.slice(0, 8)}-${i + 1}`;
      const daysAgo = Math.floor(Math.random() * 90) + 1;
      const reviewDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

      statements.push(
        db.prepare(
          "INSERT INTO reviews (id, user_id, product_id, rating, title, body, status, admin_reply, created_at, updated_at) VALUES (?, 'usr-guest', ?, ?, ?, ?, 'approved', '', ?, ?)"
        ).bind(revId, prod.id, tpl.rating, tpl.title, tpl.body, reviewDate, reviewDate)
      );
    }
  }

  // Execute in batches of 50
  for (let i = 0; i < statements.length; i += 50) {
    const chunk = statements.slice(i, i + 50);
    await db.batch(chunk);
  }
}

async function seedSettings(db: D1Database): Promise<void> {
  const result = await db.prepare("SELECT COUNT(*) AS count FROM settings").first<{ count: number }>();
  if ((result?.count ?? 0) > 0) return;
  const now = new Date().toISOString();
  const defaults: [string, string][] = [
    ["brand_name", "Marel Plise Perde"],
    ["site_phone", "+90 546 735 66 02"],
    ["site_whatsapp", "+90 546 735 66 02"],
    ["site_email", "destek@marel.com.tr"],
    ["site_address", "Elbistan / Kahramanmaraş"],
    ["free_shipping_threshold", "2000"],
    ["shipping_fee", "150"],
    ["default_cargo_company", "yurtici"],
    ["bank_name", "Ziraat Bankası"],
    ["bank_iban", "TR33 0001 0001 2345 6789 0050 01"],
    ["bank_holder", "Marel Perde Sistemleri San. Tic."],
    ["maintenance_mode", "false"],
    ["maintenance_message", "Sistemlerimizde planlı bakım çalışması yapılmaktadır. En kısa sürede hizmetinizdeyiz."],
  ];
  for (const [k, v] of defaults) {
    await db.prepare("INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)").bind(k, v, now).run();
  }
}

async function seedCoupons(db: D1Database): Promise<void> {
  const result = await db.prepare("SELECT COUNT(*) AS count FROM coupons").first<{ count: number }>();
  if ((result?.count ?? 0) > 0) return;
  const now = new Date().toISOString();
  await db.prepare(
    "INSERT INTO coupons (id, code, discount_type, discount_value, minimum_subtotal, usage_limit, usage_count, active, expires_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 1, NULL, ?, ?)"
  ).bind(crypto.randomUUID(), "HOSGELDIN10", "PERCENT", 10, 50000, 100, 0, now, now).run();
}

interface ProductCacheEntry {
  data: CatalogProduct[];
  timestamp: number;
}
let activeProductsCache: ProductCacheEntry | null = null;
let allProductsCache: ProductCacheEntry | null = null;
const CACHE_TTL_MS = 60 * 1000;

export function invalidateProductCache(): void {
  activeProductsCache = null;
  allProductsCache = null;
}

export async function listProducts(includeInactive = false): Promise<CatalogProduct[]> {
  const cached = includeInactive ? allProductsCache : activeProductsCache;
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    await ensureDatabase();
    const where = includeInactive ? "" : "WHERE p.active = 1";
    const db = getDb();
    const { results: products } = await db
      .prepare(
        `SELECT p.id, p.slug, p.sku, p.name, p.category, p.root_category AS rootCategory, p.description, p.price, p.sale_price AS salePrice, p.currency, p.stock, p.availability, p.brand, p.google_product_category AS googleProductCategory, p.active, p.featured, p.colors, p.dimensions, p.installments, p.installment_text AS installmentText, p.created_at AS createdAt, p.updated_at AS updatedAt FROM products p ${where} ORDER BY p.featured DESC, p.updated_at DESC`
      )
      .all<CatalogProduct>();

    if (products && products.length > 0) {
      const { results: imageRows } = await db
        .prepare(`SELECT product_id, source_url FROM product_images ORDER BY sort_order ASC, created_at ASC`)
        .all<{ product_id: string; source_url: string }>();

      const imagesByProduct = new Map<string, string[]>();
      if (imageRows) {
        for (const img of imageRows) {
          const list = imagesByProduct.get(img.product_id);
          if (list) {
            list.push(img.source_url);
          } else {
            imagesByProduct.set(img.product_id, [img.source_url]);
          }
        }
      }

      const mapped: CatalogProduct[] = products.map((row) => {
        const productImages = imagesByProduct.get(row.id) || [];
        const primaryImage = productImages[0] || "/images/catalog/diamond.webp";
        const images = productImages.length > 0 ? productImages : [primaryImage];

        return {
          ...row,
          image: primaryImage,
          images,
          installments: row.installments ?? 3,
          installmentText: row.installmentText || "Peşin Fiyatına 3 Taksit",
          dimensions: row.dimensions || "Özel Ölçüye Göre Üretim",
        };
      });

      const entry: ProductCacheEntry = { data: mapped, timestamp: Date.now() };
      if (includeInactive) {
        allProductsCache = entry;
      } else {
        activeProductsCache = entry;
      }

      return mapped;
    }
  } catch (err) {
    console.warn("[db] listProducts fallback to generated catalog:", err);
  }
  return ALL_FALLBACK_PRODUCTS;
}

export async function getProductBySlug(slug: string): Promise<CatalogProduct | null> {
  try {
    await ensureDatabase();
    const row = await getDb()
      .prepare(
        `SELECT p.id, p.slug, p.sku, p.name, p.category, p.root_category AS rootCategory, p.description, p.price, p.sale_price AS salePrice, p.currency, p.stock, p.availability, p.brand, p.google_product_category AS googleProductCategory, p.active, p.featured, p.colors, p.dimensions, p.installments, p.installment_text AS installmentText, p.created_at AS createdAt, p.updated_at AS updatedAt, COALESCE((SELECT source_url FROM product_images WHERE product_id = p.id ORDER BY sort_order, created_at LIMIT 1), '/images/catalog/diamond.webp') AS image, (SELECT json_group_array(source_url) FROM (SELECT source_url FROM product_images WHERE product_id = p.id ORDER BY sort_order, created_at)) AS imagesJson FROM products p WHERE p.slug = ? AND p.active = 1`
      )
      .bind(slug)
      .first<CatalogProduct & { imagesJson?: string }>();

    if (row) {
      let images: string[] = [];
      if (row.imagesJson) {
        try {
          images = typeof row.imagesJson === "string" ? JSON.parse(row.imagesJson) : (Array.isArray(row.imagesJson) ? row.imagesJson : []);
        } catch {}
      }
      if (!images || images.length === 0) {
        images = [row.image];
      }
      return {
        ...row,
        images,
        installments: row.installments ?? 3,
        installmentText: row.installmentText || "Peşin Fiyatına 3 Taksit",
        dimensions: row.dimensions || "Özel Ölçüye Göre Üretim",
      };
    }
  } catch (err) {
    console.warn("[db] getProductBySlug fallback:", err);
  }
  return ALL_FALLBACK_PRODUCTS.find((p) => p.slug === slug) ?? null;
}

export async function createProductRecord(data: {
  name: string;
  slug?: string;
  sku?: string;
  category: string;
  rootCategory?: string;
  brand?: string;
  description?: string;
  price: number;
  salePrice?: number | null;
  stock?: number;
  availability?: string;
  active?: boolean | number;
  featured?: boolean | number;
  colors?: string;
  dimensions?: string;
  installments?: number;
  installmentText?: string;
  image?: string;
  images?: string[];
}): Promise<CatalogProduct> {
  await ensureDatabase();
  const db = getDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const slug =
    data.slug ||
    data.name
      .toLowerCase()
      .replace(/[^a-z0-9ğüşıöç]+/g, "-")
      .replace(/^-|-$/g, "") +
      "-" +
      id.slice(0, 8);
  const sku = data.sku || ("SKU-" + id.slice(0, 8)).toUpperCase();
  const active = data.active === false || data.active === 0 ? 0 : 1;
  const featured = data.featured ? 1 : 0;
  const brand = data.brand || "Marel";
  const rootCategory = data.rootCategory || data.category;
  const stock = data.stock ?? 10;
  const availability = data.availability || (stock > 0 ? "in_stock" : "out_of_stock");
  const installments = data.installments ?? 3;
  const installmentText = data.installmentText || `Peşin Fiyatına ${installments} Taksit`;
  const dimensions = data.dimensions || "Özel Ölçüye Göre Üretim";
  const colors = data.colors || "[]";
  const description = data.description || "";

  await db
    .prepare(
      `INSERT INTO products (id, slug, sku, name, category, root_category, description, price, sale_price, currency, stock, availability, brand, google_product_category, active, featured, colors, dimensions, installments, installment_text, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'TRY', ?, ?, ?, 'Home & Garden > Decor > Window Treatments', ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      slug,
      sku,
      data.name,
      data.category,
      rootCategory,
      description,
      data.price,
      data.salePrice ?? null,
      stock,
      availability,
      brand,
      active,
      featured,
      colors,
      dimensions,
      installments,
      installmentText,
      now,
      now
    )
    .run();

  const imagesToSave =
    data.images && data.images.length > 0
      ? data.images
      : data.image
      ? [data.image]
      : ["/images/catalog/diamond.webp"];
  let sortOrder = 0;
  for (const imgUrl of imagesToSave) {
    if (!imgUrl) continue;
    await db
      .prepare("INSERT INTO product_images (id, product_id, source_url, alt_text, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(crypto.randomUUID(), id, imgUrl, data.name, sortOrder++, now)
      .run();
  }

  invalidateProductCache();
  const created = await getProductBySlug(slug);
  return created || ({} as CatalogProduct);
}

export async function updateProductRecord(
  id: string,
  updates: {
    name?: string;
    slug?: string;
    sku?: string;
    category?: string;
    rootCategory?: string;
    brand?: string;
    description?: string;
    price?: number;
    salePrice?: number | null;
    stock?: number;
    availability?: string;
    active?: boolean | number;
    featured?: boolean | number;
    colors?: string;
    dimensions?: string;
    installments?: number;
    installmentText?: string;
    image?: string;
    images?: string[];
  }
): Promise<void> {
  await ensureDatabase();
  const db = getDb();
  const now = new Date().toISOString();

  const existing = await db.prepare("SELECT * FROM products WHERE id = ? OR slug = ? OR sku = ?").bind(id, id, id).first<any>();
  if (!existing) throw new Error("Ürün bulunamadı");
  const actualId = existing.id;

  const name = updates.name !== undefined ? updates.name : existing.name;
  const slug = updates.slug !== undefined ? updates.slug : existing.slug;
  const sku = updates.sku !== undefined ? updates.sku : existing.sku;
  const category = updates.category !== undefined ? updates.category : existing.category;
  const rootCategory = updates.rootCategory !== undefined ? updates.rootCategory : existing.root_category;
  const brand = updates.brand !== undefined ? updates.brand : existing.brand;
  const description = updates.description !== undefined ? updates.description : existing.description;
  const price = updates.price !== undefined ? updates.price : existing.price;
  const salePrice = updates.salePrice !== undefined ? updates.salePrice : existing.sale_price;
  const stock = updates.stock !== undefined ? updates.stock : existing.stock;
  const availability = updates.availability !== undefined ? updates.availability : stock > 0 ? "in_stock" : "out_of_stock";
  const active = updates.active !== undefined ? (updates.active ? 1 : 0) : existing.active;
  const featured = updates.featured !== undefined ? (updates.featured ? 1 : 0) : existing.featured;
  const colors = updates.colors !== undefined ? updates.colors : existing.colors;
  const dimensions = updates.dimensions !== undefined ? updates.dimensions : existing.dimensions;
  const installments = updates.installments !== undefined ? updates.installments : existing.installments;
  const installmentText = updates.installmentText !== undefined ? updates.installmentText : existing.installment_text;

  await db
    .prepare(
      `UPDATE products SET name = ?, slug = ?, sku = ?, category = ?, root_category = ?, brand = ?, description = ?, price = ?, sale_price = ?, stock = ?, availability = ?, active = ?, featured = ?, colors = ?, dimensions = ?, installments = ?, installment_text = ?, updated_at = ? WHERE id = ?`
    )
    .bind(
      name,
      slug,
      sku,
      category,
      rootCategory,
      brand,
      description,
      price,
      salePrice,
      stock,
      availability,
      active,
      featured,
      colors,
      dimensions,
      installments,
      installmentText,
      now,
      actualId
    )
    .run();

  if (updates.images || updates.image) {
    let newImages: string[] = [];
    if (updates.images && updates.images.length > 0) {
      newImages = [...updates.images];
      if (updates.image && !newImages.includes(updates.image)) {
        newImages.unshift(updates.image);
      }
    } else if (updates.image) {
      newImages = [updates.image];
    }

    if (newImages.length > 0) {
      await db.prepare("DELETE FROM product_images WHERE product_id = ?").bind(actualId).run();
      let sortOrder = 0;
      for (const imgUrl of newImages) {
        if (!imgUrl) continue;
        await db
          .prepare("INSERT INTO product_images (id, product_id, source_url, alt_text, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?)")
          .bind(crypto.randomUUID(), actualId, imgUrl, name, sortOrder++, now)
          .run();
      }
    }
  }
  invalidateProductCache();
}

export async function deleteProductRecord(id: string): Promise<void> {
  await ensureDatabase();
  const db = getDb();
  await db.prepare("DELETE FROM product_images WHERE product_id = ?").bind(id).run();
  await db.prepare("DELETE FROM reviews WHERE product_id = ?").bind(id).run();
  await db.prepare("DELETE FROM products WHERE id = ? OR slug = ? OR sku = ?").bind(id, id, id).run();
  invalidateProductCache();
}

export async function duplicateProductRecord(id: string): Promise<CatalogProduct> {
  await ensureDatabase();
  const db = getDb();
  const original = await db.prepare("SELECT * FROM products WHERE id = ? OR slug = ?").bind(id, id).first<any>();
  if (!original) throw new Error("Kopyalanacak ürün bulunamadı");

  const newId = crypto.randomUUID();
  const now = new Date().toISOString();
  const newName = `${original.name} (Kopya)`;
  const newSku = `${original.sku}-KOPYA-${newId.slice(0, 4).toUpperCase()}`;
  const newSlug = `${original.slug}-kopya-${newId.slice(0, 6)}`;

  await db
    .prepare(
      `INSERT INTO products (id, slug, sku, name, category, root_category, description, price, sale_price, currency, stock, availability, brand, google_product_category, active, featured, colors, dimensions, installments, installment_text, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'TRY', ?, ?, ?, ?, 1, 0, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      newId,
      newSlug,
      newSku,
      newName,
      original.category,
      original.root_category,
      original.description,
      original.price,
      original.sale_price,
      original.stock,
      original.availability,
      original.brand,
      original.google_product_category,
      original.colors,
      original.dimensions,
      original.installments,
      original.installment_text,
      now,
      now
    )
    .run();

  const { results: images } = await db
    .prepare("SELECT source_url, alt_text, sort_order FROM product_images WHERE product_id = ? ORDER BY sort_order")
    .bind(original.id)
    .all<any>();
  if (images && images.length > 0) {
    for (const img of images) {
      await db
        .prepare("INSERT INTO product_images (id, product_id, source_url, alt_text, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?)")
        .bind(crypto.randomUUID(), newId, img.source_url, newName, img.sort_order, now)
        .run();
    }
  }

  invalidateProductCache();
  const copy = await getProductBySlug(newSlug);
  return copy || ({} as CatalogProduct);
}

export async function listAnnouncements(publishedOnly = true): Promise<AnnouncementRecord[]> {
  await ensureDatabase();
  const where = publishedOnly ? "WHERE published = 1" : "";
  const { results } = await getDb().prepare(`SELECT id, slug, title, summary, body, image_url AS imageUrl, published, featured, published_at AS publishedAt, created_at AS createdAt, updated_at AS updatedAt FROM announcements ${where} ORDER BY featured DESC, COALESCE(published_at, created_at) DESC`).all<AnnouncementRecord>();
  return results;
}

export async function listApprovedReviews(limit = 12): Promise<Array<{
  id: string;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  productName?: string;
  createdAt: string;
}>> {
  await ensureDatabase();
  const db = getDb();
  const { results } = await db
    .prepare(
      `SELECT r.id, r.rating, r.title, r.body, r.status, COALESCE(u.full_name, 'Müşteri') AS authorName, COALESCE(p.name, 'Marel Plise Perde') AS productName, r.created_at AS createdAt 
       FROM reviews r 
       LEFT JOIN products p ON r.product_id = p.id 
       LEFT JOIN users u ON r.user_id = u.id 
       WHERE r.status = 'approved' 
       ORDER BY r.created_at DESC LIMIT ?`
    )
    .bind(limit)
    .all<any>();
  return results;
}

export async function createOrderInDb(data: {
  orderNumber?: string;
  userId?: string | null;
  email: string;
  customerName: string;
  phone: string;
  paymentMethod?: string;
  paymentStatus?: string;
  subtotal: number;
  shipping?: number;
  total: number;
  currency?: string;
  city?: string;
  district?: string;
  shippingAddress: string;
  notes?: string;
  items: Array<{
    productId?: string | null;
    sku?: string;
    name: string;
    unitPrice: number;
    quantity: number;
    configuration?: Record<string, unknown> | string;
  }>;
}): Promise<OrderRecord> {
  await ensureDatabase();
  const db = getDb();
  const id = crypto.randomUUID();
  const orderNumber = data.orderNumber || `MRL-${Math.floor(100000 + Math.random() * 900000)}`;
  const now = new Date().toISOString();
  const shipping = data.shipping ?? 0;
  const currency = data.currency ?? "TRY";
  const paymentMethod = data.paymentMethod ?? "bank_transfer";
  const paymentStatus = data.paymentStatus ?? "pending";
  const notes = data.notes ?? "";
  const city = data.city ?? null;
  const district = data.district ?? null;

  await db.prepare(
    `INSERT INTO orders (id, order_number, user_id, email, customer_name, phone, status, payment_method, payment_status, subtotal, shipping, total, currency, city, district, shipping_address, notes, cargo_company, tracking_number, tracking_url, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, ?, ?)`
  ).bind(
    id,
    orderNumber,
    data.userId ?? null,
    data.email,
    data.customerName,
    data.phone,
    paymentMethod,
    paymentStatus,
    data.subtotal,
    shipping,
    data.total,
    currency,
    city,
    district,
    data.shippingAddress,
    notes,
    now,
    now
  ).run();

  const savedItems: OrderItemRecord[] = [];
  if (data.items && data.items.length > 0) {
    for (const item of data.items) {
      const itemId = crypto.randomUUID();
      const configStr = typeof item.configuration === "string" ? item.configuration : JSON.stringify(item.configuration || {});
      let resolvedProductId: string | null = item.productId ?? null;
      if (resolvedProductId) {
        const prodExists = await db.prepare("SELECT 1 FROM products WHERE id = ?").bind(resolvedProductId).first();
        if (!prodExists) {
          resolvedProductId = null;
        }
      }
      await db.prepare(
        `INSERT INTO order_items (id, order_id, product_id, sku, name, unit_price, quantity, configuration) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        itemId,
        id,
        resolvedProductId,
        item.sku ?? "",
        item.name,
        item.unitPrice,
        item.quantity,
        configStr
      ).run();
      savedItems.push({
        id: itemId,
        orderId: id,
        productId: resolvedProductId,
        sku: item.sku ?? "",
        name: item.name,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        configuration: configStr,
      });
    }
  }

  return {
    id,
    orderNumber,
    userId: data.userId ?? null,
    email: data.email,
    customerName: data.customerName,
    phone: data.phone,
    status: "pending",
    paymentMethod,
    paymentStatus,
    subtotal: data.subtotal,
    shipping,
    total: data.total,
    currency,
    city,
    district,
    shippingAddress: data.shippingAddress,
    notes,
    cargoCompany: null,
    trackingNumber: null,
    trackingUrl: null,
    items: savedItems,
    createdAt: now,
    updatedAt: now,
  };
}

function normalizeOrder(o: any): OrderRecord {
  return {
    id: o.id,
    orderNumber: o.orderNumber || o.ordernumber || o.order_number,
    userId: o.userId ?? o.userid ?? o.user_id ?? null,
    email: o.email,
    customerName: o.customerName || o.customername || o.customer_name,
    phone: o.phone,
    status: o.status,
    paymentMethod: o.paymentMethod || o.paymentmethod || o.payment_method,
    paymentStatus: o.paymentStatus || o.paymentstatus || o.payment_status,
    subtotal: Number(o.subtotal || 0),
    shipping: Number(o.shipping || 0),
    total: Number(o.total || 0),
    currency: o.currency || "TRY",
    city: o.city ?? null,
    district: o.district ?? null,
    shippingAddress: o.shippingAddress || o.shippingaddress || o.shipping_address,
    notes: o.notes || "",
    cargoCompany: o.cargoCompany ?? o.cargocompany ?? o.cargo_company ?? null,
    trackingNumber: o.trackingNumber ?? o.trackingnumber ?? o.tracking_number ?? null,
    trackingUrl: o.trackingUrl ?? o.trackingurl ?? o.tracking_url ?? null,
    createdAt: o.createdAt || o.createdat || o.created_at,
    updatedAt: o.updatedAt || o.updatedat || o.updated_at,
  };
}

function normalizeOrderItem(it: any): OrderItemRecord {
  return {
    id: it.id,
    orderId: it.orderId || it.orderid || it.order_id,
    productId: it.productId ?? it.productid ?? it.product_id ?? null,
    sku: it.sku,
    name: it.name,
    unitPrice: Number(it.unitPrice ?? it.unitprice ?? it.unit_price ?? 0),
    quantity: Number(it.quantity || 1),
    configuration: it.configuration || "{}",
  };
}

export async function listOrdersWithDetails(): Promise<OrderRecord[]> {
  await ensureDatabase();
  const db = getDb();
  const { results: orders } = await db.prepare(
    `SELECT id, order_number AS "orderNumber", user_id AS "userId", email, customer_name AS "customerName", phone, status, 
            payment_method AS "paymentMethod", payment_status AS "paymentStatus", subtotal, shipping, total, currency, 
            city, district, shipping_address AS "shippingAddress", notes, cargo_company AS "cargoCompany", 
            tracking_number AS "trackingNumber", tracking_url AS "trackingUrl", created_at AS "createdAt", updated_at AS "updatedAt" 
     FROM orders ORDER BY created_at DESC`
  ).all<any>();

  if (!orders || orders.length === 0) return [];

  const { results: allItems } = await db.prepare(
    `SELECT id, order_id AS "orderId", product_id AS "productId", sku, name, unit_price AS "unitPrice", quantity, configuration 
     FROM order_items`
  ).all<any>();

  const itemMap = new Map<string, OrderItemRecord[]>();
  for (const rawIt of allItems || []) {
    const it = normalizeOrderItem(rawIt);
    const list = itemMap.get(it.orderId) || [];
    list.push(it);
    itemMap.set(it.orderId, list);
  }

  return orders.map((rawO) => {
    const o = normalizeOrder(rawO);
    return {
      ...o,
      items: itemMap.get(o.id) || [],
    };
  });
}

export async function getOrderDetailsById(idOrNumber: string): Promise<OrderRecord | null> {
  await ensureDatabase();
  const db = getDb();
  const rawOrder = await db.prepare(
    `SELECT id, order_number AS "orderNumber", user_id AS "userId", email, customer_name AS "customerName", phone, status, 
            payment_method AS "paymentMethod", payment_status AS "paymentStatus", subtotal, shipping, total, currency, 
            city, district, shipping_address AS "shippingAddress", notes, cargo_company AS "cargoCompany", 
            tracking_number AS "trackingNumber", tracking_url AS "trackingUrl", created_at AS "createdAt", updated_at AS "updatedAt" 
     FROM orders WHERE id = ? OR order_number = ? LIMIT 1`
  ).bind(idOrNumber, idOrNumber).first<any>();

  if (!rawOrder) return null;
  const order = normalizeOrder(rawOrder);

  const { results: rawItems } = await db.prepare(
    `SELECT id, order_id AS "orderId", product_id AS "productId", sku, name, unit_price AS "unitPrice", quantity, configuration 
     FROM order_items WHERE order_id = ?`
  ).bind(order.id).all<any>();

  return {
    ...order,
    items: (rawItems || []).map(normalizeOrderItem),
  };
}

export async function updateOrderInDb(
  id: string,
  data: {
    status?: string;
    cargoCompany?: string | null;
    trackingNumber?: string | null;
    trackingUrl?: string | null;
    notes?: string;
    paymentStatus?: string;
  }
): Promise<void> {
  await ensureDatabase();
  const db = getDb();
  const now = new Date().toISOString();
  await db.prepare(
    `UPDATE orders SET 
      status = COALESCE(?, status),
      cargo_company = COALESCE(?, cargo_company),
      tracking_number = COALESCE(?, tracking_number),
      tracking_url = COALESCE(?, tracking_url),
      notes = COALESCE(?, notes),
      payment_status = COALESCE(?, payment_status),
      updated_at = ?
     WHERE id = ? OR order_number = ?`
  ).bind(
    data.status ?? null,
    data.cargoCompany ?? null,
    data.trackingNumber ?? null,
    data.trackingUrl ?? null,
    data.notes ?? null,
    data.paymentStatus ?? null,
    now,
    id,
    id
  ).run();
}

export async function listCouponsFromDb(): Promise<CouponRecord[]> {
  await ensureDatabase();
  const db = getDb();
  const { results } = await db.prepare(
    `SELECT id, code, discount_type AS discountType, discount_value AS discountValue, 
            minimum_subtotal AS minimumSubtotal, usage_limit AS usageLimit, usage_count AS usageCount, 
            active, expires_at AS expiresAt, created_at AS createdAt, updated_at AS updatedAt 
     FROM coupons ORDER BY created_at DESC`
  ).all<CouponRecord>();
  return results || [];
}

export async function createCouponInDb(data: {
  code: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  minimumSubtotal?: number;
  usageLimit?: number | null;
  active?: boolean;
  expiresAt?: string | null;
}): Promise<CouponRecord> {
  await ensureDatabase();
  const db = getDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const code = data.code.trim().toUpperCase();
  const active = data.active !== false ? 1 : 0;
  const minSubtotal = data.minimumSubtotal ?? 0;
  const usageLimit = data.usageLimit ?? null;

  await db.prepare(
    `INSERT INTO coupons (id, code, discount_type, discount_value, minimum_subtotal, usage_limit, usage_count, active, expires_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)`
  ).bind(id, code, data.discountType, data.discountValue, minSubtotal, usageLimit, active, data.expiresAt ?? null, now, now).run();

  return {
    id,
    code,
    discountType: data.discountType,
    discountValue: data.discountValue,
    minimumSubtotal: minSubtotal,
    usageLimit,
    usageCount: 0,
    active: Boolean(active),
    expiresAt: data.expiresAt ?? null,
    createdAt: now,
    updatedAt: now,
  };
}

export async function deleteCouponInDb(id: string): Promise<void> {
  await ensureDatabase();
  await getDb().prepare("DELETE FROM coupons WHERE id = ?").bind(id).run();
}

export async function getSettingsFromDb(): Promise<SiteSettingsRecord> {
  await ensureDatabase();
  const { results } = await getDb().prepare("SELECT key, value FROM settings").all<{ key: string; value: string }>();
  const map: SiteSettingsRecord = {};
  for (const row of results || []) {
    map[row.key] = row.value;
  }
  return map;
}

export async function updateSettingsInDb(newSettings: Record<string, string>): Promise<void> {
  await ensureDatabase();
  const db = getDb();
  const now = new Date().toISOString();
  for (const [key, value] of Object.entries(newSettings)) {
    await db.prepare(
      `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
    ).bind(key, String(value ?? ""), now).run();
  }
}

export async function listCustomersFromDb(): Promise<CustomerRecord[]> {
  await ensureDatabase();
  const db = getDb();
  const { results } = await db.prepare(
    `SELECT 
        COALESCE(MIN(u.id), MIN(o.id)) AS "id",
        COALESCE(NULLIF(MAX(o.customer_name), ''), MAX(u.full_name), 'Misafir Müşteri') AS "fullName",
        LOWER(TRIM(o.email)) AS "email",
        COALESCE(MAX(o.phone), '') AS "phone",
        COUNT(o.id) AS "orderCount",
        COALESCE(SUM(o.total), 0) AS "totalSpent",
        MAX(o.created_at) AS "lastOrderDate",
        COALESCE(MIN(u.created_at), MIN(o.created_at)) AS "createdAt"
     FROM orders o
     LEFT JOIN users u ON o.user_id = u.id OR LOWER(TRIM(o.email)) = LOWER(TRIM(u.email))
     GROUP BY LOWER(TRIM(o.email))
     ORDER BY "lastOrderDate" DESC`
  ).all<any>();

  return (results || []).map((c) => ({
    id: c.id || "cust-unknown",
    fullName: c.fullName || c.fullname || "Misafir Müşteri",
    email: c.email || "",
    phone: c.phone || "",
    orderCount: Number(c.orderCount ?? c.ordercount ?? 0),
    totalSpent: Number(c.totalSpent ?? c.totalspent ?? 0),
    lastOrderDate: c.lastOrderDate ?? c.lastorderdate ?? null,
    createdAt: c.createdAt ?? c.createdat ?? new Date().toISOString(),
  }));
}

