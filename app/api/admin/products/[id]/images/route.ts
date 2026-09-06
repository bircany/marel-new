import { requireAdminApi } from "@/app/lib/admin-auth";
import { stUploadImages } from "@/app/lib/softtrade";

const MAX_FILES = 10;
const MAX_TOTAL_BYTES = 40 * 1024 * 1024;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  const { id } = await params;
  const entries = (await request.formData()).getAll("images");
  const files = entries.filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (files.length === 0) return Response.json({ error: "En az bir görsel seçin." }, { status: 400 });
  if (files.length > MAX_FILES) return Response.json({ error: "En fazla " + MAX_FILES + " görsel yükleyebilirsiniz." }, { status: 400 });
  if (files.some((file) => !/^image\/(jpeg|png|webp)$/.test(file.type))) return Response.json({ error: "Sadece JPG, PNG ve WEBP yükleyebilirsiniz." }, { status: 400 });
  if (files.some((file) => file.size > 10 * 1024 * 1024)) return Response.json({ error: "Her görsel en fazla 10MB olabilir." }, { status: 400 });
  if (files.reduce((total, file) => total + file.size, 0) > MAX_TOTAL_BYTES) return Response.json({ error: "Toplam görsel boyutu 40MB sınırını aşamaz." }, { status: 400 });
  try {
    const images = await stUploadImages(id, files);
    return Response.json({ ok: true, images });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Görseller yüklenemedi." }, { status: 400 });
  }
}

