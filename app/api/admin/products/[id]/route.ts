import { requireAdminApi } from "@/app/lib/admin-auth";
import { ensureDatabase, getDb } from "@/db";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  await ensureDatabase();
  const { id } = await params;
  const body = await request.json() as { price?: number; salePrice?: number | null; stock?: number; active?: boolean; featured?: boolean; availability?: string };
  const statuses = new Set(["in_stock", "out_of_stock", "preorder", "backorder"]);
  const current = await getDb().prepare("SELECT price, sale_price AS salePrice, stock, active, featured, availability FROM products WHERE id = ?").bind(id).first<{ price: number; salePrice: number | null; stock: number; active: number; featured: number; availability: string }>();
  if (!current) return Response.json({ error: "Ürün bulunamadı." }, { status: 404 });
  const price = Number.isFinite(body.price) ? Math.max(0, Math.round(body.price as number)) : current.price;
  const salePrice = body.salePrice === null ? null : Number.isFinite(body.salePrice) ? Math.max(0, Math.round(body.salePrice as number)) : current.salePrice;
  const stock = Number.isFinite(body.stock) ? Math.max(0, Math.round(body.stock as number)) : current.stock;
  const availability = body.availability && statuses.has(body.availability) ? body.availability : stock === 0 ? "out_of_stock" : current.availability;
  await getDb().prepare("UPDATE products SET price = ?, sale_price = ?, stock = ?, active = ?, featured = ?, availability = ?, updated_at = ? WHERE id = ?").bind(price, salePrice, stock, body.active === undefined ? current.active : body.active ? 1 : 0, body.featured === undefined ? current.featured : body.featured ? 1 : 0, availability, new Date().toISOString(), id).run();
  return Response.json({ ok: true });
}
