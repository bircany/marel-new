import * as announcements from "@/server/api/admin/announcements/handler";
import * as adminProducts from "@/server/api/admin/products/handler";
import * as adminProduct from "@/server/api/admin/products/[id]/handler";
import { duplicateProductRecord } from "@/db";
import * as authLogin from "@/server/api/auth/login/handler";
import * as cart from "@/server/api/cart/handler";
import * as orders from "@/server/api/orders/handler";
import { requireAdminApi } from "@/lib/admin-auth";
import { laravel, getSessionId, setTokenCookie } from "@/lib/laravel-auth";
import { getProductBySlug, listProducts, listAnnouncements, getAnnouncementBySlug, listOrdersWithDetails, listCouponsFromDb, getSettingsFromDb, listCustomersFromDb } from "@/db";
import { stListReviews, stListContactMessages } from "@/lib/softtrade";

type RouteContext = { params: Promise<{ path?: string[] }> };
type ProductContext = { params: Promise<{ id: string }> };

/** Public response contract used by the cart UI. */
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
  shipping_address: Record<string, unknown> | null;
  items?: Array<Record<string, unknown>>;
  notes: string | null;
  created_at: string;
};

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

  if (path.length === 1 && path[0] === "cart") return cart.GET();
  if (path.length === 1 && path[0] === "orders") return orders.GET();
  if (path.length === 2 && path[0] === "admin" && path[1] === "announcements") return announcements.GET();
  if (path.length === 2 && path[0] === "admin" && path[1] === "products") return adminProducts.GET();
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

  if (path.length === 1 && path[0] === "cart") return cart.POST(request);
  if (path.length === 1 && path[0] === "orders") return orders.POST(request);
  if (path.length === 2 && path[0] === "auth" && path[1] === "login") return authLogin.POST(request);
  if (path.length === 2 && path[0] === "auth" && path[1] === "register") return register(request);
  if (path.length === 2 && path[0] === "admin" && path[1] === "announcements") return announcements.POST(request);
  if (path.length === 2 && path[0] === "admin" && path[1] === "products") return adminProducts.POST(request);
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
  if (path.length === 1 && path[0] === "cart") return cart.PUT(request);
  if (path.length === 3 && path[0] === "admin" && path[1] === "announcements") {
    return announcements.PUT(request, { params: Promise.resolve({ id: path[2] }) });
  }
  return notFound(path);
}

export async function PATCH(request: Request, context: RouteContext) {
  const path = await getPath(context);
  if (path.length === 3 && path[0] === "admin" && path[1] === "products") {
    return adminProduct.PATCH(request, { params: Promise.resolve({ id: path[2] }) });
  }
  return notFound(path);
}

export async function DELETE(request: Request, context: RouteContext) {
  const path = await getPath(context);
  if (path.length === 1 && path[0] === "cart") return cart.DELETE(request);
  if (path.length === 3 && path[0] === "admin" && path[1] === "announcements") {
    return announcements.DELETE(request, { params: Promise.resolve({ id: path[2] }) });
  }
  if (path.length === 3 && path[0] === "admin" && path[1] === "products") {
    return adminProduct.DELETE(request, { params: Promise.resolve({ id: path[2] }) });
  }
  return notFound(path);
}


