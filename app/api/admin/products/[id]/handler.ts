import { requireAdminApi } from "@/app/lib/admin-auth";
import { deleteProductRecord, updateProductRecord } from "@/db";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  const { id } = await params;

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

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  const { id } = await params;
  try {
    await deleteProductRecord(id);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Ürün silinemedi." }, { status: 400 });
  }
}
