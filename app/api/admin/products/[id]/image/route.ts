import { requireAdminApi } from "@/app/lib/admin-auth";
import { stUploadImage } from "@/app/lib/softtrade";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  const { id } = await params;
  const image = (await request.formData()).get("image");
  if (!(image instanceof File) || image.size === 0) return Response.json({ error: "Bir görsel seçin." }, { status: 400 });
  try {
    const { url } = await stUploadImage(id, image);
    return Response.json({ ok: true, url });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Görsel yüklenemedi." }, { status: 400 });
  }
}
