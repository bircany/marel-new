import { env } from "cloudflare:workers";
import type { CatalogProduct, ContactMessageRecord, OrderRecord, ReviewRecord } from "@/db";
import { listProducts as dbListProducts, getProductBySlug as dbGetProductBySlug, getDb } from "@/db";

type RuntimeEnv = {
  SOFTRADE_API_URL?: string;
  SOFTRADE_ADMIN_EMAIL?: string;
  SOFTRADE_ADMIN_PASSWORD?: string;
};

const runtime = env as unknown as RuntimeEnv;

function fromProcess(name: string): string | undefined {
  if (typeof process === "undefined") return undefined;
  return process.env?.[name];
}

export const SOFTRADE_API_URL = (runtime.SOFTRADE_API_URL ?? fromProcess("SOFTRADE_API_URL") ?? "http://localhost:8081/api/v1").replace(/\/+$/, "");
const ADMIN_EMAIL = runtime.SOFTRADE_ADMIN_EMAIL ?? fromProcess("SOFTRADE_ADMIN_EMAIL") ?? "admin@softtrade.com";
const ADMIN_PASSWORD = runtime.SOFTRADE_ADMIN_PASSWORD ?? fromProcess("SOFTRADE_ADMIN_PASSWORD") ?? "admin123";

let adminToken: string | null = null;

async function getAdminToken(): Promise<string> {
  if (adminToken) return adminToken;
  const response = await fetch(`${SOFTRADE_API_URL}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  const json = (await response.json().catch(() => null)) as { success?: boolean; data?: { access_token?: string } } | null;
  if (!response.ok || !json?.success || !json.data?.access_token) throw new Error("SoftTrade admin girişi başarısız.");
  adminToken = json.data.access_token;
  return adminToken;
}

type RequestInitOpts = RequestInit & { admin?: boolean; retry?: boolean };

async function request<T>(path: string, init: RequestInitOpts = {}): Promise<T> {
  const { admin, retry, ...rest } = init;
  const headers = new Headers(rest.headers);
  headers.set("accept", "application/json");
  if (admin) headers.set("authorization", `Bearer ${await getAdminToken()}`);
  const response = await fetch(`${SOFTRADE_API_URL}${path}`, { ...rest, headers });
  if (response.status === 401 && admin && !retry) {
    adminToken = null;
    return request<T>(path, { ...rest, admin, retry: true });
  }
  if (response.status === 204) return undefined as T;
  const json = (await response.json().catch(() => null)) as { success?: boolean; message?: string; data?: T } | null;
  if (!response.ok || !json?.success) throw new Error(json?.message ?? `SoftTrade API hatası (${response.status})`);
  return json.data as T;
}

export type SoftTradeProduct = {
  id: number;
  name: string;
  slug: string;
  short_description?: string | null;
  description?: string | null;
  price: number;
  sale_price: number | null;
  current_price: number;
  stock: number;
  status: string;
  is_featured: boolean;
  sku: string;
  cover_image_url: string | null;
  category?: { id: number; name: string; slug: string } | null;
  brand?: { id: number; name: string } | null;
  images?: Array<{ id: number; url: string; alt_text: string; is_cover: boolean; sort_order: number }>;
  created_at: string;
  updated_at?: string;
};

export type SoftTradeCategory = { id: number; name: string; slug: string; children?: SoftTradeCategory[] };

function toKurus(tl: number): number {
  return Math.round((tl + Number.EPSILON) * 100);
}

export function toCatalogProduct(product: SoftTradeProduct): CatalogProduct {
  const image = product.cover_image_url ?? product.images?.find((img) => img.is_cover)?.url ?? product.images?.[0]?.url ?? "/images/marel-logo.png";
  return {
    id: String(product.id),
    slug: product.slug,
    sku: product.sku ?? "",
    name: product.name,
    category: product.category?.name ?? "",
    description: product.short_description ?? product.description ?? "",
    price: toKurus(product.price),
    salePrice: product.sale_price != null ? toKurus(product.sale_price) : null,
    currency: "TRY",
    stock: product.stock,
    availability: product.stock > 0 ? "in_stock" : "out_of_stock",
    brand: product.brand?.name ?? "Marel",
    googleProductCategory: "Home & Garden > Decor > Window Treatments",
    active: product.status === "active" ? 1 : 0,
    featured: product.is_featured ? 1 : 0,
    image,
    createdAt: product.created_at,
    updatedAt: product.updated_at ?? product.created_at,
  };
}

function slugify(value: string): string {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toNumber(value: unknown): number | null {
  const raw = String(value ?? "").trim().replace(",", ".");
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function toInteger(value: unknown, fallback = 0): number {
  const parsed = toNumber(value);
  return parsed != null ? Math.max(0, Math.round(parsed)) : fallback;
}

export async function stListProducts(includeInactive = false, brandOnly?: string): Promise<CatalogProduct[]> {
  try {
    const brandId = brandOnly ? await findBrandId(brandOnly) : null;
    const statuses = includeInactive ? ["active", "inactive", "draft"] : ["active"];
    const pages = await Promise.all(
      statuses.map((status) => {
        const query = new URLSearchParams({ status, per_page: "100", sort_by: "created_at", sort_dir: "desc" });
        if (brandId) query.set("brand_id", String(brandId));
        return request<SoftTradeProduct[]>(`/products?${query.toString()}`);
      }),
    );
    return pages.flat().map(toCatalogProduct);
  } catch {
    return dbListProducts(includeInactive);
  }
}

export async function stGetProductBySlug(slug: string): Promise<CatalogProduct | null> {
  try {
    const product = await request<SoftTradeProduct>(`/products/${encodeURIComponent(slug)}`);
    return toCatalogProduct(product);
  } catch {
    return dbGetProductBySlug(slug);
  }
}

export async function findBrandId(name: string): Promise<number | null> {
  try {
    const brands = await request<Array<{ id: number; name: string }>>("/brands");
    return brands.find((brand) => brand.name.toLowerCase() === name.toLowerCase())?.id ?? null;
  } catch {
    return null;
  }
}

async function findCategoryId(name: string): Promise<number> {
  const cats = await request<SoftTradeCategory[]>("/categories");
  const flat: SoftTradeCategory[] = [];
  const walk = (list: SoftTradeCategory[]): void => {
    for (const category of list) {
      flat.push(category);
      if (category.children) walk(category.children);
    }
  };
  walk(cats);
  const match = flat.find((category) => category.name.toLowerCase() === name.toLowerCase());
  if (match) return match.id;
  const created = await request<SoftTradeCategory>("/admin/categories", {
    method: "POST",
    admin: true,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name, is_active: true }),
  });
  return created.id;
}

export async function stCreateProduct(form: FormData): Promise<{ id: number; slug: string }> {
  const name = String(form.get("name") ?? "").trim();
  const sku = String(form.get("sku") ?? "").trim().toUpperCase();
  const categoryName = String(form.get("category") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const slug = slugify(String(form.get("slug") ?? name));
  const price = toNumber(form.get("price"));
  const salePrice = form.get("salePrice") ? toNumber(form.get("salePrice")) : null;
  const stock = toInteger(form.get("stock"));
  if (!name || !sku || !categoryName || !slug) throw new Error("Ad, SKU, kategori ve slug gerekli.");
  if (price == null) throw new Error("Geçerli bir fiyat girin.");

  try {
    const categoryId = await findCategoryId(categoryName);
    const brandId = await findBrandId("Marel");

    const payload = new FormData();
    payload.set("category_id", String(categoryId));
    if (brandId) payload.set("brand_id", String(brandId));
    payload.set("name", name);
    payload.set("slug", slug);
    payload.set("sku", sku);
    payload.set("description", description);
    payload.set("price", String(price));
    if (salePrice != null) payload.set("sale_price", String(salePrice));
    payload.set("stock", String(stock));
    payload.set("status", "active");
    payload.set("is_featured", form.get("featured") ? "1" : "0");
    const images = form.getAll("images");
    const legacyImage = form.get("image");
    for (const image of images) {
      if (image instanceof File && image.size > 0) payload.append("images[]", image);
    }
    if (images.length === 0 && legacyImage instanceof File && legacyImage.size > 0) payload.append("images[]", legacyImage);

    const created = await request<SoftTradeProduct>("/admin/products", { method: "POST", admin: true, body: payload });
    return { id: created.id, slug: created.slug };
  } catch {
    const db = getDb();
    const id = sku || slug;
    const now = new Date().toISOString();
    await db
      .prepare(
        "INSERT INTO products (id, slug, sku, name, category, description, price, sale_price, currency, stock, availability, brand, google_product_category, active, featured, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'TRY', ?, ?, 'Marel', 'Home & Garden > Decor > Window Treatments', 1, ?, ?, ?)",
      )
      .bind(id, slug, sku, name, categoryName, description, Math.round(price * 100), salePrice ? Math.round(salePrice * 100) : null, stock, stock > 0 ? "in_stock" : "out_of_stock", form.get("featured") ? 1 : 0, now, now)
      .run();
    return { id: 1, slug };
  }
}

export async function stUpdateProduct(
  id: string,
  body: { price?: number; salePrice?: number | null; stock?: number; active?: boolean; featured?: boolean; availability?: string },
): Promise<void> {
  try {
    const payload: Record<string, unknown> = { status: body.active === false ? "inactive" : "active", is_featured: Boolean(body.featured) };
    if (Number.isFinite(body.price)) payload.price = (body.price as number) / 100;
    if (body.salePrice === null) payload.sale_price = null;
    else if (Number.isFinite(body.salePrice)) payload.sale_price = (body.salePrice as number) / 100;
    if (Number.isFinite(body.stock)) payload.stock = body.stock;
    await request<SoftTradeProduct>(`/admin/products/${id}`, {
      method: "PUT",
      admin: true,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    const db = getDb();
    const active = body.active === false ? 0 : 1;
    const featured = body.featured ? 1 : 0;
    const stock = body.stock ?? 0;
    const availability = body.availability ?? (stock > 0 ? "in_stock" : "out_of_stock");
    const now = new Date().toISOString();
    await db
      .prepare("UPDATE products SET active = ?, featured = ?, stock = ?, availability = ?, updated_at = ? WHERE id = ? OR slug = ? OR sku = ?")
      .bind(active, featured, stock, availability, now, id, id, id)
      .run();
  }
}

export async function stDeleteProduct(id: string): Promise<void> {
  try {
    await request<unknown>(`/admin/products/${id}`, { method: "DELETE", admin: true });
  } catch {
    const db = getDb();
    await db.prepare("DELETE FROM products WHERE id = ? OR slug = ? OR sku = ?").bind(id, id, id).run();
  }
}

export async function stUploadImage(id: string, file: File): Promise<{ url: string }> {
  const images = await stUploadImages(id, [file]);
  return { url: images[0]?.url ?? "" };
}

export async function stUploadImages(id: string, files: File[]): Promise<Array<{ id: number; url: string }>> {
  try {
    const payload = new FormData();
    for (const file of files) payload.append("images[]", file);
    payload.set("set_first_as_cover", "true");
    return await request<Array<{ id: number; url: string }>>(`/admin/products/` + id + `/images`, { method: "POST", admin: true, body: payload });
  } catch {
    return [];
  }
}

export async function stListOrders(): Promise<OrderRecord[]> {
  try {
    const orders = await request<Array<{
      id: number;
      order_number: string;
      status: string;
      subtotal: number;
      shipping_cost: number;
      total: number;
      created_at: string;
      cargo_company?: string | null;
      tracking_number?: string | null;
      tracking_url?: string | null;
      user?: { id: number; full_name: string; email: string; phone?: string | null } | null;
    }>>("/admin/orders?per_page=100", { admin: true });
    return orders.map((order) => ({
      id: String(order.id),
      orderNumber: order.order_number,
      userId: order.user ? String(order.user.id) : null,
      email: order.user?.email ?? "",
      customerName: order.user?.full_name ?? "",
      phone: order.user?.phone ?? "",
      status: order.status,
      subtotal: toKurus(order.subtotal),
      shipping: toKurus(order.shipping_cost ?? 0),
      total: toKurus(order.total),
      currency: "TRY",
      shippingAddress: "",
      notes: "",
      cargoCompany: order.cargo_company ?? null,
      trackingNumber: order.tracking_number ?? null,
      trackingUrl: order.tracking_url ?? null,
      createdAt: order.created_at,
      updatedAt: order.created_at,
    }));
  } catch {
    const db = getDb();
    const { results } = await db
      .prepare(
        "SELECT id, order_number AS orderNumber, user_id AS userId, email, customer_name AS customerName, phone, status, subtotal, shipping, total, currency, shipping_address AS shippingAddress, notes, cargo_company AS cargoCompany, tracking_number AS trackingNumber, created_at AS createdAt, updated_at AS updatedAt FROM orders ORDER BY created_at DESC",
      )
      .all<OrderRecord>();
    return results;
  }
}

export async function stUpdateOrderStatus(
  id: string,
  status: string,
  note = "",
  cargo?: { cargoCompany?: string; trackingNumber?: string },
): Promise<void> {
  try {
    await request<unknown>(`/admin/orders/${id}/status`, {
      method: "PUT",
      admin: true,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        status,
        admin_notes: note || undefined,
        cargo_company: cargo?.cargoCompany || undefined,
        tracking_number: cargo?.trackingNumber || undefined,
      }),
    });
  } catch {
    const db = getDb();
    const now = new Date().toISOString();
    await db
      .prepare(
        "UPDATE orders SET status = ?, cargo_company = COALESCE(?, cargo_company), tracking_number = COALESCE(?, tracking_number), updated_at = ? WHERE id = ? OR order_number = ?",
      )
      .bind(status, cargo?.cargoCompany || null, cargo?.trackingNumber || null, now, id, id)
      .run();
  }
}

export async function stListReviews(): Promise<ReviewRecord[]> {
  try {
    const reviews = await request<Array<{
      id: number;
      rating: number;
      title: string;
      comment: string;
      status: string;
      created_at: string;
      user?: { name?: string } | null;
      product?: { id?: number; name?: string; slug?: string } | null;
    }>>("/admin/reviews?per_page=100", { admin: true });
    return reviews.map((review) => ({
      id: String(review.id),
      userId: "",
      productId: review.product?.id != null ? String(review.product.id) : null,
      productName: review.product?.name ?? null,
      authorName: review.user?.name ?? "",
      rating: review.rating,
      title: review.title,
      body: review.comment,
      status: review.status,
      adminReply: "",
      createdAt: review.created_at,
      updatedAt: review.created_at,
    }));
  } catch {
    const db = getDb();
    const { results } = await db
      .prepare(
        "SELECT r.id, r.user_id AS userId, r.product_id AS productId, COALESCE(p.name, 'Genel Marel Deneyimi') AS productName, COALESCE(u.full_name, 'Müşteri') AS authorName, r.rating, r.title, r.body, r.status, r.admin_reply AS adminReply, r.created_at AS createdAt, r.updated_at AS updatedAt FROM reviews r LEFT JOIN products p ON r.product_id = p.id LEFT JOIN users u ON r.user_id = u.id ORDER BY r.created_at DESC"
      )
      .all<ReviewRecord>();
    return results;
  }
}

export async function stUpdateReviewStatus(id: string, status: string): Promise<void> {
  try {
    await request<unknown>(`/admin/reviews/${id}/status`, {
      method: "PUT",
      admin: true,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
  } catch {
    const db = getDb();
    const now = new Date().toISOString();
    await db.prepare("UPDATE reviews SET status = ?, updated_at = ? WHERE id = ?").bind(status, now, id).run();
  }
}

export type SoftTradeReview = {
  id: number;
  rating: number;
  title: string | null;
  comment: string | null;
  status: string;
  is_verified_purchase: boolean;
  user?: { name: string; avatar: string | null } | null;
  product?: { id: number; name: string; slug: string } | null;
  created_at: string;
};

export async function stListApprovedReviews(limit = 6): Promise<SoftTradeReview[]> {
  try {
    const response = await fetch(`${SOFTRADE_API_URL}/reviews/approved?limit=${limit}`, { cache: "no-store" });
    const json = (await response.json().catch(() => null)) as { success?: boolean; data?: SoftTradeReview[] } | null;
    if (!response.ok || !json?.success) throw new Error("Backend review fetch failed");
    return json.data ?? [];
  } catch {
    try {
      const db = getDb();
      const { results } = await db
        .prepare(
          "SELECT r.id, r.rating, r.title, r.body AS comment, r.status, 1 AS is_verified_purchase, r.created_at, p.id AS p_id, p.name AS p_name, p.slug AS p_slug FROM reviews r LEFT JOIN products p ON r.product_id = p.id WHERE r.status = 'approved' ORDER BY r.created_at DESC LIMIT ?"
        )
        .bind(limit)
        .all<{
          id: string;
          rating: number;
          title: string;
          comment: string;
          status: string;
          is_verified_purchase: number;
          created_at: string;
          p_id?: string;
          p_name?: string;
          p_slug?: string;
        }>();

      return results.map((row) => ({
        id: Number(row.id.replace(/\D/g, "")) || 1,
        rating: row.rating,
        title: row.title,
        comment: row.comment,
        status: row.status,
        is_verified_purchase: true,
        user: { name: "Müşteri", avatar: null },
        product: row.p_id ? { id: Number(row.p_id.replace(/\D/g, "")) || 1, name: row.p_name || "", slug: row.p_slug || "" } : null,
        created_at: row.created_at,
      }));
    } catch {
      return [];
    }
  }
}

export type SoftTradeContactMessage = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  updated_at?: string;
};

export async function stListContactMessages(): Promise<ContactMessageRecord[]> {
  try {
    const response = await fetch(`${SOFTRADE_API_URL}/admin/contact-messages?per_page=100`, {
      headers: { authorization: `Bearer ${await getAdminToken()}` },
      cache: "no-store",
    });
    const json = (await response.json().catch(() => null)) as { success?: boolean; data?: SoftTradeContactMessage[] } | null;
    if (!response.ok || !json?.success) throw new Error("Contact messages fetch failed");
    return (json.data ?? []).map((item) => ({
      id: String(item.id),
      name: item.name,
      email: item.email,
      phone: item.phone ?? "",
      subject: item.subject,
      message: item.message,
      status: item.status,
      createdAt: item.created_at,
      updatedAt: item.updated_at ?? item.created_at,
    }));
  } catch {
    const db = getDb();
    const { results } = await db
      .prepare("SELECT id, name, email, phone, subject, message, status, created_at AS createdAt, updated_at AS updatedAt FROM contact_messages ORDER BY created_at DESC")
      .all<ContactMessageRecord>();
    return results;
  }
}

export async function stUpdateContactStatus(id: number, status: string): Promise<void> {
  try {
    await request<unknown>(`/admin/contact-messages/${id}`, {
      method: "PUT",
      admin: true,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
  } catch {
    const db = getDb();
    const now = new Date().toISOString();
    await db.prepare("UPDATE contact_messages SET status = ?, updated_at = ? WHERE id = ?").bind(status, now, id).run();
  }
}
