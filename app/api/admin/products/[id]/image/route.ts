import { requireAdminApi } from "@/app/lib/admin-auth";
import { saveProductImage } from "@/app/lib/product-images";
import { ensureDatabase, getDb } from "@/db";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  await ensureDatabase();
  const { id } = await params;
  const product = await getDb().prepare("SELECT name FROM products WHERE id = ?").bind(id).first<{ name: string }>();
  if (!product) return Response.json({ error: "Ürün bulunamadı." }, { status: 404 });
  const image = (await request.formData()).get("image");
  if (!(image instanceof File) || image.size === 0) return Response.json({ error: "Bir görsel seçin." }, { status: 400 });
  try {
    const url = await saveProductImage(id, product.name, image);
    return Response.json({ ok: true, url });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Görsel yüklenemedi." }, { status: 400 });
  }
}
