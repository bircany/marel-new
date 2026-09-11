import * as announcements from "@/app/api/admin/announcements/handler";
import * as adminProducts from "@/app/api/admin/products/handler";
import * as adminProduct from "@/app/api/admin/products/[id]/handler";
import * as authLogin from "@/app/api/auth/login/handler";
import * as cart from "@/app/api/cart/handler";
import * as orders from "@/app/api/orders/handler";

type RouteContext = { params: Promise<{ path?: string[] }> };
type ProductContext = { params: Promise<{ id: string }> };

async function getPath(context: RouteContext): Promise<string[]> {
  const { path } = await context.params;
  return (path ?? []).map((segment) => decodeURIComponent(segment));
}

function notFound(path: string[]) {
  return Response.json({ error: `API endpoint bulunamadı: /api/${path.join("/")}` }, { status: 404 });
}

export async function GET(request: Request, context: RouteContext) {
  const path = await getPath(context);

  if (path.length === 1 && path[0] === "cart") return cart.GET();
  if (path.length === 1 && path[0] === "orders") return orders.GET();
  if (path.length === 2 && path[0] === "admin" && path[1] === "announcements") return announcements.GET();
  if (path.length === 2 && path[0] === "admin" && path[1] === "products") return adminProducts.GET();

  return notFound(path);
}

export async function POST(request: Request, context: RouteContext) {
  const path = await getPath(context);

  if (path.length === 1 && path[0] === "cart") return cart.POST(request);
  if (path.length === 1 && path[0] === "orders") return orders.POST(request);
  if (path.length === 2 && path[0] === "auth" && path[1] === "login") return authLogin.POST(request);
  if (path.length === 2 && path[0] === "admin" && path[1] === "announcements") return announcements.POST(request);
  if (path.length === 2 && path[0] === "admin" && path[1] === "products") return adminProducts.POST(request);

  return notFound(path);
}

export async function PUT(request: Request, context: RouteContext) {
  const path = await getPath(context);
  if (path.length === 1 && path[0] === "cart") return cart.PUT(request);
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
  if (path.length === 3 && path[0] === "admin" && path[1] === "products") {
    return adminProduct.DELETE(request, { params: Promise.resolve({ id: path[2] }) });
  }
  return notFound(path);
}
