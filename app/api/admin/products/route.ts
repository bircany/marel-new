import { requireAdminApi } from "@/app/lib/admin-auth";
import { ensureDatabase, getDb, listProducts } from "@/db";
import { saveProductImage } from "@/app/lib/product-images";

function slugify(value: string): string {
  return value.toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function integer(form: FormData, key: string, fallback = 0): number {
  const value = Number(form.get(key));
  return Number.isFinite(value) ? Math.max(0, Math.round(value)) : fallback;
}

function money(form: FormData, key: string): number | null {
  const raw = String(form.get(key) ?? "").trim().replace(",", ".");
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? Math.max(0, Math.round(value * 100)) : null;
}

export async function GET() {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  return Response.json({ products: await listProducts(true) });
}

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  await ensureDatabase();
  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  const sku = String(form.get("sku") ?? "").trim().toUpperCase();
  const category = String(form.get("category") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const slug = slugify(String(form.get("slug") ?? name));
  const price = money(form, "price") ?? 0;
  const salePrice = money(form, "salePrice");
  const stock = integer(form, "stock");
  if (!name || !sku || !category || !slug) return Response.json({ error: "Ad, SKU, kategori ve slug gerekli." }, { status: 400 });

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  try {
    await getDb().prepare("INSERT INTO products (id, slug, sku, name, category, description, price, sale_price, currency, stock, availability, brand, google_product_category, active, featured, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'TRY', ?, ?, 'Marel', ?, 1, ?, ?, ?)").bind(id, slug, sku, name, category, description, price, salePrice, stock, stock > 0 ? "in_stock" : "out_of_stock", String(form.get("googleProductCategory") ?? "Home & Garden > Decor > Window Treatments"), form.get("featured") ? 1 : 0, now, now).run();
    const image = form.get("image");
    if (image instanceof File && image.size > 0) await saveProductImage(id, name, image);
  } catch (error) {
    return Response.json({ error: error instanceof Error && error.message.includes("UNIQUE") ? "SKU veya slug zaten kullanılıyor." : "Ürün kaydedilemedi." }, { status: 400 });
  }
  return Response.json({ ok: true, id }, { status: 201 });
}
