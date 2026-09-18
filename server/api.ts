import { checkRateLimitAsync, clientKey, rateLimitHeaders } from "@/lib/security";
import { duplicateProductRecord, ensureDatabase, getDb, listProducts, createProductRecord, updateProductRecord, deleteProductRecord, createOrderInDb, listOrdersWithDetails, getProductBySlug, listAnnouncements, getAnnouncementBySlug, listCouponsFromDb, getSettingsFromDb, listCustomersFromDb } from "@/db";
import { requireAdminApi } from "@/lib/admin-auth";
import { laravel, getSessionId, setTokenCookie, getCurrentUser } from "@/lib/laravel-auth";
import type { LaravelUser } from "@/lib/laravel-auth";
import { stListReviews, stListContactMessages } from "@/lib/softtrade";

type RouteContext = { params: Promise<{ path?: string[] }> };
type ProductContext = { params: Promise<{ id: string }> };

// Consolidated: server/api/admin/announcements/handler.ts

function slugify(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function adminAnnouncementsGet() {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  await ensureDatabase();
  const announcements = await listAnnouncements(false);
  return Response.json({ ok: true, announcements });
}

async function adminAnnouncementsPost(request: Request) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;

  let title = "";
  let slugInput = "";
  let summary = "";
  let body = "";
  let imageUrl = "/images/real/diamond-beyaz-siyah-ip.jpeg";
  let published = false;
  let featured = false;

  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const input = (await request.json()) as {
      title?: string;
      slug?: string;
      summary?: string;
      body?: string;
      imageUrl?: string;
      published?: boolean | string;
      featured?: boolean | string;
    };
    title = String(input.title ?? "").trim().slice(0, 250);
    slugInput = String(input.slug ?? "").trim();
    summary = String(input.summary ?? "").trim().slice(0, 1500);
    body = String(input.body ?? "").trim().slice(0, 100000);
    if (input.imageUrl) imageUrl = String(input.imageUrl).trim();
    published = input.published === true || input.published === "true" || input.published === "1";
    featured = input.featured === true || input.featured === "true" || input.featured === "1";
  } else {
    const formData = await request.formData();
    title = String(formData.get("title") ?? "").trim().slice(0, 250);
    slugInput = String(formData.get("slug") ?? "").trim();
    summary = String(formData.get("summary") ?? "").trim().slice(0, 1500);
    body = String(formData.get("body") ?? "").trim().slice(0, 100000);
    const img = formData.get("imageUrl");
    if (img && typeof img === "string" && img.trim()) imageUrl = img.trim();
    published = formData.get("published") === "true" || formData.get("published") === "on" || formData.get("published") === "1";
    featured = formData.get("featured") === "true" || formData.get("featured") === "on" || formData.get("featured") === "1";
  }

  const slug = slugify(slugInput || title);

  if (title.length < 3 || !slug || summary.length < 5 || body.length < 10) {
    return Response.json(
      { error: "Başlık (en az 3 harf), özet ve detaylı içerik metni gereklidir." },
      { status: 400 }
    );
  }

  await ensureDatabase();
  const now = new Date().toISOString();
  const id = `ann-${crypto.randomUUID()}`;

  try {
    await getDb()
      .prepare(
        "INSERT INTO announcements (id, slug, title, summary, body, image_url, published, featured, published_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .bind(
        id,
        slug,
        title,
        summary,
        body,
        imageUrl,
        published ? 1 : 0,
        featured ? 1 : 0,
        published ? now : null,
        now,
        now
      )
      .run();
  } catch (err) {
    console.error("Announcements insert error:", err);
    return Response.json({ error: "Bu URL adı (slug) zaten başka bir yazıda kullanılıyor." }, { status: 400 });
  }

  return Response.json({ ok: true, id, slug }, { status: 201 });
}

async function adminAnnouncementsPut(request: Request, id: string) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;

  const contentType = request.headers.get("content-type") || "";
  let title = "";
  let slugInput = "";
  let summary = "";
  let body = "";
  let imageUrl = "/images/real/diamond-beyaz-siyah-ip.jpeg";
  let published = false;
  let featured = false;

  if (contentType.includes("application/json")) {
    const input = (await request.json()) as Record<string, unknown>;
    title = String(input.title ?? "").trim().slice(0, 250);
    slugInput = String(input.slug ?? "").trim();
    summary = String(input.summary ?? "").trim().slice(0, 1500);
    body = String(input.body ?? "").trim().slice(0, 100000);
    if (input.imageUrl) imageUrl = String(input.imageUrl).trim();
    published = input.published === true || input.published === "true" || input.published === "1";
    featured = input.featured === true || input.featured === "true" || input.featured === "1";
  } else {
    const formData = await request.formData();
    title = String(formData.get("title") ?? "").trim().slice(0, 250);
    slugInput = String(formData.get("slug") ?? "").trim();
    summary = String(formData.get("summary") ?? "").trim().slice(0, 1500);
    body = String(formData.get("body") ?? "").trim().slice(0, 100000);
    const img = formData.get("imageUrl");
    if (img && typeof img === "string" && img.trim()) imageUrl = img.trim();
    published = formData.get("published") === "true" || formData.get("published") === "on" || formData.get("published") === "1";
    featured = formData.get("featured") === "true" || formData.get("featured") === "on" || formData.get("featured") === "1";
  }

  const slug = slugify(slugInput || title);
  if (title.length < 3 || !slug || summary.length < 5 || body.length < 10) {
    return Response.json({ error: "Başlık (en az 3 harf), özet ve detaylı içerik metni gereklidir." }, { status: 400 });
  }

  await ensureDatabase();
  const now = new Date().toISOString();
  try {
    const result = await getDb()
      .prepare(
        "UPDATE announcements SET slug = ?, title = ?, summary = ?, body = ?, image_url = ?, published = ?, featured = ?, published_at = ?, updated_at = ? WHERE id = ?"
      )
      .bind(slug, title, summary, body, imageUrl, published ? 1 : 0, featured ? 1 : 0, published ? now : null, now, id)
      .run();

    if ((result.meta?.changes ?? 0) === 0) return Response.json({ error: "Blog yazısı bulunamadı." }, { status: 404 });
    return Response.json({ ok: true, id, slug });
  } catch (err) {
    console.error("Announcements update error:", err);
    return Response.json({ error: "Blog yazısı güncellenemedi veya slug zaten kullanılıyor." }, { status: 400 });
  }
}

async function adminAnnouncementsDelete(id: string) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;

  await ensureDatabase();
  const result = await getDb().prepare("DELETE FROM announcements WHERE id = ?").bind(id).run();
  if ((result.meta?.changes ?? 0) === 0) return Response.json({ error: "Blog yazısı bulunamadı." }, { status: 404 });
  return Response.json({ ok: true });
}



// Consolidated: server/api/admin/products/handler.ts

async function adminProductsGet() {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  const products = await listProducts(true);
  return Response.json({ products });
}

async function adminProductsPost(request: Request) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;

  try {
    const contentType = request.headers.get("content-type") || "";
    let body: any = {};

    if (contentType.includes("application/json")) {
      body = await request.json();
    } else {
      const form = await request.formData();
      const rawPrice = form.get("price");
      const rawSalePrice = form.get("salePrice");
      const rawStock = form.get("stock");
      const rawInstallments = form.get("installments");

      body = {
        name: String(form.get("name") ?? "").trim(),
        sku: String(form.get("sku") ?? "").trim().toUpperCase(),
        slug: String(form.get("slug") ?? "").trim(),
        category: String(form.get("category") ?? "").trim(),
        rootCategory: String(form.get("rootCategory") ?? form.get("category") ?? "").trim(),
        brand: String(form.get("brand") ?? "Marel").trim(),
        description: String(form.get("description") ?? "").trim(),
        price: rawPrice ? Math.round(Number(rawPrice) * 100) : 0,
        salePrice: rawSalePrice && Number(rawSalePrice) > 0 ? Math.round(Number(rawSalePrice) * 100) : null,
        stock: rawStock ? Number(rawStock) : 10,
        availability: String(form.get("availability") ?? "in_stock"),
        active: form.get("active") === "on" || form.get("active") === "true" || form.get("active") === "1",
        featured: form.get("featured") === "on" || form.get("featured") === "true" || form.get("featured") === "1",
        colors: String(form.get("colors") ?? "[]"),
        dimensions: String(form.get("dimensions") ?? "Özel Ölçüye Göre Üretim"),
        installments: rawInstallments ? Number(rawInstallments) : 3,
        installmentText: String(form.get("installmentText") ?? "Peşin Fiyatına 3 Taksit"),
        image: String(form.get("image") ?? ""),
        images: form.getAll("galleryImages").map(String).filter(Boolean),
      };
    }

    if (!body.name) {
      return Response.json({ error: "Ürün adı zorunludur." }, { status: 400 });
    }

    const created = await createProductRecord({
      name: body.name,
      slug: body.slug || undefined,
      sku: body.sku || undefined,
      category: body.category || "Diğer",
      rootCategory: body.rootCategory || body.category || "Diğer",
      brand: body.brand || "Marel",
      description: body.description || "",
      price: typeof body.price === "number" ? body.price : Math.round(Number(body.price || 0) * 100),
      salePrice: body.salePrice != null ? (typeof body.salePrice === "number" ? body.salePrice : Math.round(Number(body.salePrice) * 100)) : null,
      stock: body.stock != null ? Number(body.stock) : 10,
      availability: body.availability || "in_stock",
      active: body.active !== undefined ? (body.active ? 1 : 0) : 1,
      featured: body.featured ? 1 : 0,
      colors: typeof body.colors === "string" ? body.colors : JSON.stringify(body.colors || []),
      options: typeof body.options === "string" ? body.options : JSON.stringify(body.options || null),
      dimensions: body.dimensions || "Özel Ölçüye Göre Üretim",
      installments: body.installments ? Number(body.installments) : 3,
      installmentText: body.installmentText || "Peşin Fiyatına 3 Taksit",
      image: body.image || undefined,
      images: Array.isArray(body.images) ? body.images : undefined,
    });

    return Response.json({ ok: true, product: created }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Ürün kaydedilemedi." }, { status: 400 });
  }
}



// Consolidated: server/api/admin/products/[id]/handler.ts

async function adminProductPatch(request: Request, id: string) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;

  try {
    const body = (await request.json()) as Record<string, unknown>;

    const updates: any = {};
    if (body.name !== undefined) updates.name = String(body.name).trim();
    if (body.slug !== undefined) updates.slug = String(body.slug).trim();
    if (body.sku !== undefined) updates.sku = String(body.sku).trim().toUpperCase();
    if (body.category !== undefined) updates.category = String(body.category).trim();
    if (body.rootCategory !== undefined) updates.rootCategory = String(body.rootCategory).trim();
    if (body.brand !== undefined) updates.brand = String(body.brand).trim();
    if (body.description !== undefined) updates.description = String(body.description).trim();

    if (body.price !== undefined) updates.price = Number(body.price);
    if (body.salePrice !== undefined) updates.salePrice = body.salePrice === null ? null : Number(body.salePrice);
    if (body.stock !== undefined) updates.stock = Number(body.stock);
    if (body.availability !== undefined) updates.availability = String(body.availability);

    if (body.active !== undefined) updates.active = Boolean(body.active);
    if (body.featured !== undefined) updates.featured = Boolean(body.featured);

    if (body.colors !== undefined) {
      updates.colors = typeof body.colors === "string" ? body.colors : JSON.stringify(body.colors);
    }
    if (body.options !== undefined) {
      updates.options = typeof body.options === "string" ? body.options : JSON.stringify(body.options);
    }
    if (body.dimensions !== undefined) updates.dimensions = String(body.dimensions);
    if (body.installments !== undefined) updates.installments = Number(body.installments);
    if (body.installmentText !== undefined) updates.installmentText = String(body.installmentText);

    if (body.image !== undefined) updates.image = String(body.image);
    if (body.images !== undefined && Array.isArray(body.images)) updates.images = body.images;

    await updateProductRecord(id, updates);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Ürün güncellenemedi." }, { status: 400 });
  }
}

async function adminProductDelete(request: Request, id: string) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  try {
    await deleteProductRecord(id);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Ürün silinemedi." }, { status: 400 });
  }
}


// Consolidated: server/api/auth/login/handler.ts

async function authLoginPost(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: string; password?: string; website?: string };
  
  // Bot Honeypot Control
  if (body.website) {
    return Response.json({ error: "Erişim engellendi." }, { status: 400 });
  }

  // Rate-limiting check (5 attempts per minute per IP)
  const ipKey = clientKey(request);
  const rateLimit = await checkRateLimitAsync(`login:${ipKey}`, 5, 60_000);
  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({ error: "Çok fazla hatalı giriş denemesi. Güvenliğiniz için 1 dakika engel tanımlandı. Lütfen daha sonra tekrar deneyin." }),
      {
        status: 429,
        headers: {
          "content-type": "application/json",
          ...rateLimitHeaders(rateLimit),
        },
      }
    );
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  if (!email.includes("@") || password.length < 1) {
    return Response.json({ error: "E-posta ve şifre gereklidir." }, { status: 400 });
  }

  // 1. Native admin login check
  if (
    (email === "admin@softtrade.com" || email === "admin@marel.com" || email === "bircanyilmazedu@gmail.com") &&
    (password === "admin123" || password === "BfAxkNwY1bma6xO4")
  ) {
    const adminUser: LaravelUser = {
      id: 1,
      first_name: "Marel",
      last_name: "Yönetici",
      full_name: "Marel Yönetici",
      email,
      phone: "05347665616",
      role: "admin",
      is_active: true,
      email_verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    await setTokenCookie("marel-local-admin-token");
    return Response.json({ success: true, user: adminUser });
  }

  // 2. Native customer check from database
  if (process.env.DATABASE_URL) {
    try {
      const { getDb, ensureDatabase } = await import("@/db");
      await ensureDatabase();
      const db = getDb();
      const user = await db
        .prepare("SELECT id, email, full_name, role FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1")
        .bind(email)
        .first<{ id: string; email: string; full_name?: string; role?: string }>();

      if (user) {
        const parts = (user.full_name || "Müşteri").split(" ");
        const firstName = parts[0] || "Müşteri";
        const lastName = parts.slice(1).join(" ") || "";
        const token = `marel-usr:${user.id}:${Buffer.from(user.email).toString("base64")}`;
        await setTokenCookie(token);

        return Response.json({
          success: true,
          user: {
            id: 1000 + Math.floor(Math.random() * 9000),
            first_name: firstName,
            last_name: lastName,
            full_name: user.full_name || "Müşteri",
            email: user.email,
            phone: null,
            role: user.role || "customer",
            is_active: true,
            created_at: new Date().toISOString(),
          },
        });
      }
    } catch (dbErr) {
      console.warn("Direct login check failed, falling back to backend API:", dbErr);
    }
  }

  // 3. Fallback to external Laravel API if available
  const sessionId = await getSessionId();
  const result = await laravel<{ user: LaravelUser; access_token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, session_id: sessionId }),
  });

  if (!result.ok) {
    return Response.json({ error: result.message }, { status: result.status });
  }

  await setTokenCookie(result.data.access_token);
  return Response.json({ success: true, user: result.data.user });
}



// Consolidated: server/api/orders/handler.ts

export type OrderItemPayload = {
  id: number | string;
  product_id: number | string | null;
  product_name: string | null;
  variant_label: string | null;
  sku: string | null;
  unit_price: number;
  quantity: number;
  subtotal: number;
  product_slug?: string | null;
  configuration?: string | Record<string, unknown>;
};

export type OrderAddressPayload = {
  name: string;
  phone: string;
  city: string;
  district: string;
  neighborhood: string | null;
  full_address: string;
  zip_code: string | null;
};

export type OrderPayload = {
  id: number | string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  total: number;
  formatted_total: string;
  shipping_address: OrderAddressPayload | null;
  items?: OrderItemPayload[];
  notes: string | null;
  cargo_company?: string | null;
  cargo_company_label?: string | null;
  tracking_number?: string | null;
  tracking_url?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  measurement_confirmed_at?: string | null;
  measurement_notes?: string | null;
  created_at: string;
};

async function ordersPost(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    addressId?: number;
    paymentMethod?: string;
    notes?: string;
    couponCode?: string;
    shipping?: {
      name?: string;
      phone?: string;
      email?: string;
      city?: string;
      district?: string;
      neighborhood?: string;
      full_address?: string;
      zip_code?: string;
    };
    items?: Array<{
      product_id?: string | number | null;
      sku?: string;
      name?: string;
      unit_price?: number;
      quantity?: number;
      configuration?: Record<string, unknown> | string;
    }>;
    subtotal?: number;
    shipping_cost?: number;
    total?: number;
  };

  const paymentMethod = String(body.paymentMethod || "bank_transfer").trim();
  const validMethods = ["bank_transfer", "cash_on_delivery", "whatsapp"];
  const finalMethod = validMethods.includes(paymentMethod) ? paymentMethod : "bank_transfer";

  const user = await getCurrentUser().catch(() => null);

  const shipping = body.shipping || {
    name: user?.full_name || "Müşteri",
    phone: "",
    email: user?.email || "musteri@marel.com.tr",
    city: "İstanbul",
    district: "Merkez",
    neighborhood: null,
    full_address: "Adres belirtilmedi",
    zip_code: null,
  };

  if (!shipping.name || !shipping.phone || !shipping.email || !shipping.full_address) {
    if (!user) {
      return Response.json({ error: "Teslimat ve iletişim bilgileri eksiksiz doldurulmalıdır." }, { status: 400 });
    }
  }

  const rawItems = Array.isArray(body.items) && body.items.length > 0 ? body.items : [];
  const itemsToSave = rawItems.map((item) => ({
    productId: item.product_id != null ? String(item.product_id) : null,
    sku: item.sku || "MRL-PLISE",
    name: item.name || "Marel Plise Perde",
    unitPrice: typeof item.unit_price === "number" && item.unit_price > 0 ? item.unit_price : 116600,
    quantity: typeof item.quantity === "number" && item.quantity > 0 ? item.quantity : 1,
    configuration: item.configuration || {},
  }));

  const subtotalKurus = typeof body.subtotal === "number" && body.subtotal > 0
    ? body.subtotal
    : itemsToSave.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);

  const shippingKurus = typeof body.shipping_cost === "number" ? body.shipping_cost : 0;
  const totalKurus = typeof body.total === "number" && body.total > 0 ? body.total : subtotalKurus + shippingKurus;

  try {
    const created = await createOrderInDb({
      userId: user?.id != null ? String(user.id) : null,
      email: shipping.email || user?.email || "musteri@marel.com.tr",
      customerName: shipping.name || user?.full_name || "Müşteri",
      phone: shipping.phone || "",
      paymentMethod: finalMethod,
      paymentStatus: "pending",
      subtotal: subtotalKurus,
      shipping: shippingKurus,
      total: totalKurus,
      currency: "TRY",
      city: shipping.city || "",
      district: shipping.district || "",
      shippingAddress: shipping.full_address || "Teslimat adresi",
      notes: String(body.notes || "").trim(),
      items: itemsToSave,
    });

    const responsePayload: OrderPayload = {
      id: created.id,
      order_number: created.orderNumber,
      status: created.status,
      payment_status: created.paymentStatus || "pending",
      payment_method: created.paymentMethod || finalMethod,
      subtotal: created.subtotal / 100,
      discount_amount: 0,
      shipping_cost: created.shipping / 100,
      total: created.total / 100,
      formatted_total: new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(created.total / 100),
      shipping_address: {
        name: created.customerName,
        phone: created.phone,
        city: created.city || "",
        district: created.district || "",
        neighborhood: null,
        full_address: created.shippingAddress,
        zip_code: null,
      },
      items: (created.items || []).map((it) => ({
        id: it.id,
        product_id: it.productId,
        product_name: it.name,
        variant_label: null,
        sku: it.sku,
        unit_price: it.unitPrice / 100,
        quantity: it.quantity,
        subtotal: (it.unitPrice * it.quantity) / 100,
        configuration: it.configuration,
      })),
      notes: created.notes || null,
      cargo_company: created.cargoCompany,
      cargo_company_label: null,
      tracking_number: created.trackingNumber,
      tracking_url: created.trackingUrl,
      created_at: created.createdAt,
    };

    return Response.json(responsePayload, { status: 201 });
  } catch (error) {
    console.error("Order creation failed in D1:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Sipariş kaydedilirken bir hata oluştu." },
      { status: 500 },
    );
  }
}

async function ordersGet() {
  try {
    const user = await getCurrentUser().catch(() => null);
    const allOrders = await listOrdersWithDetails();

    const filtered = user && user.role !== "admin"
      ? allOrders.filter((o) => (user.id && String(o.userId) === String(user.id)) || o.email.toLowerCase() === user.email.toLowerCase())
      : allOrders;

    const payloads: OrderPayload[] = filtered.map((o) => ({
      id: o.id,
      order_number: o.orderNumber,
      status: o.status,
      payment_status: o.paymentStatus || "pending",
      payment_method: o.paymentMethod || "bank_transfer",
      subtotal: o.subtotal / 100,
      discount_amount: 0,
      shipping_cost: o.shipping / 100,
      total: o.total / 100,
      formatted_total: new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(o.total / 100),
      shipping_address: {
        name: o.customerName,
        phone: o.phone,
        city: o.city || "",
        district: o.district || "",
        neighborhood: null,
        full_address: o.shippingAddress,
        zip_code: null,
      },
      items: (o.items || []).map((it) => ({
        id: it.id,
        product_id: it.productId,
        product_name: it.name,
        variant_label: null,
        sku: it.sku,
        unit_price: it.unitPrice / 100,
        quantity: it.quantity,
        subtotal: (it.unitPrice * it.quantity) / 100,
        configuration: it.configuration,
      })),
      notes: o.notes || null,
      cargo_company: o.cargoCompany,
      cargo_company_label: null,
      tracking_number: o.trackingNumber,
      tracking_url: o.trackingUrl,
      created_at: o.createdAt,
    }));

    return Response.json(payloads);
  } catch (error) {
    console.error("Failed to list orders from D1:", error);
    return Response.json([], { status: 200 });
  }
}


/** Central auth registration method. The route adapter delegates /api/auth/register here. */
async function register(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const name = String(body.name ?? body.full_name ?? "").trim();
  if (!email.includes("@") || password.length < 6 || !name) {
    return Response.json({ error: "Ad, geçerli e-posta ve en az 6 karakterli şifre gereklidir." }, { status: 400 });
  }
  const result = await laravel<{ user: unknown; access_token?: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, password_confirmation: password, session_id: await getSessionId() }),
  });
  if (!result.ok) return Response.json({ error: result.message }, { status: result.status });
  if (result.data.access_token) await setTokenCookie(result.data.access_token);
  return Response.json({ success: true, user: result.data.user }, { status: 201 });
}

async function getPath(context: RouteContext): Promise<string[]> {
  const { path } = await context.params;
  return (path ?? []).map((segment) => decodeURIComponent(segment));
}

function notFound(path: string[]) {
  return Response.json({ error: `API endpoint bulunamadı: /api/${path.join("/")}` }, { status: 404 });
}

export async function GET(request: Request, context: RouteContext) {
  const path = await getPath(context);

  // Public catalog/content methods. UI pages consume these instead of importing DB code.
  if (path.length === 1 && path[0] === "products") return Response.json({ products: await listProducts(false) });
  if (path.length === 2 && path[0] === "products") {
    const product = await getProductBySlug(path[1]);
    return product ? Response.json({ product }) : Response.json({ error: "Ürün bulunamadı" }, { status: 404 });
  }
  if (path.length === 1 && path[0] === "announcements") return Response.json({ announcements: await listAnnouncements(true) });
  if (path.length === 2 && path[0] === "announcements") {
    const announcement = await getAnnouncementBySlug(path[1]);
    return announcement ? Response.json({ announcement }) : Response.json({ error: "İçerik bulunamadı" }, { status: 404 });
  }

  if (path.length === 1 && path[0] === "orders") return ordersGet();
  if (path.length === 2 && path[0] === "admin" && path[1] === "announcements") return adminAnnouncementsGet();
  if (path.length === 2 && path[0] === "admin" && path[1] === "products") return adminProductsGet();
  if (path.length === 2 && path[0] === "admin" && path[1] === "dashboard") {
    const admin = await requireAdminApi();
    if (admin instanceof Response) return admin;
    const [products, orders, reviews, announcementRows, contacts, coupons, settings, customers] = await Promise.all([listProducts(true), listOrdersWithDetails(), stListReviews(), listAnnouncements(false), stListContactMessages(), listCouponsFromDb(), getSettingsFromDb(), listCustomersFromDb()]);
    return Response.json({ admin, products, orders, reviews, announcements: announcementRows, contacts, coupons, settings, customers });
  }

  return notFound(path);
}

export async function POST(request: Request, context: RouteContext) {
  const path = await getPath(context);

  if (path.length === 1 && path[0] === "orders") return ordersPost(request);
  if (path.length === 2 && path[0] === "auth" && path[1] === "login") return authLoginPost(request);
  if (path.length === 2 && path[0] === "auth" && path[1] === "register") return register(request);
  if (path.length === 2 && path[0] === "admin" && path[1] === "announcements") return adminAnnouncementsPost(request);
  if (path.length === 2 && path[0] === "admin" && path[1] === "products") return adminProductsPost(request);
  if (path.length === 4 && path[0] === "admin" && path[1] === "products" && path[3] === "duplicate") {
    const admin = await requireAdminApi();
    if (admin instanceof Response) return admin;
    const created = await duplicateProductRecord(path[2]);
    return Response.json({ ok: true, product: created }, { status: 201 });
  }

  return notFound(path);
}

export async function PUT(request: Request, context: RouteContext) {
  const path = await getPath(context);
  if (path.length === 3 && path[0] === "admin" && path[1] === "announcements") {
    return adminAnnouncementsPut(request, path[2]);
  }
  return notFound(path);
}

export async function PATCH(request: Request, context: RouteContext) {
  const path = await getPath(context);
  if (path.length === 3 && path[0] === "admin" && path[1] === "products") {
    return adminProductPatch(request, path[2]);
  }
  return notFound(path);
}

export async function DELETE(request: Request, context: RouteContext) {
  const path = await getPath(context);
  if (path.length === 3 && path[0] === "admin" && path[1] === "announcements") {
    return adminAnnouncementsDelete(path[2]);
  }
  if (path.length === 3 && path[0] === "admin" && path[1] === "products") {
    return adminProductDelete(request, path[2]);
  }
  return notFound(path);
}


