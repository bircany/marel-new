import { requireAdminApi } from "@/app/lib/admin-auth";
import { stDeleteProduct, stUpdateProduct } from "@/app/lib/softtrade";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  const { id } = await params;
  const body = (await request.json()) as { price?: number; salePrice?: number | null; stock?: number; active?: boolean; featured?: boolean; availability?: string };
  try {
    await stUpdateProduct(id, body);
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
    await stDeleteProduct(id);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Ürün silinemedi." }, { status: 400 });
  }
}
