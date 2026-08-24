import { requireAdminApi } from "@/app/lib/admin-auth";
import { stCreateProduct, stListProducts } from "@/app/lib/softtrade";

export async function GET() {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  return Response.json({ products: await stListProducts(true, "Marel") });
}

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  try {
    const form = await request.formData();
    const created = await stCreateProduct(form);
    return Response.json({ ok: true, id: created.id }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Ürün kaydedilemedi." }, { status: 400 });
  }
}
