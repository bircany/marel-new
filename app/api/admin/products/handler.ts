import { requireAdminApi } from "@/app/lib/admin-auth";
import { createProductRecord, listProducts } from "@/db";

export async function GET() {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  const products = await listProducts(true);
  return Response.json({ products });
}

export async function POST(request: Request) {
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
