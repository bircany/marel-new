import { requireAdminApi } from "@/app/lib/admin-auth";
import { getSettingsFromDb, updateSettingsInDb } from "@/db";

export async function GET() {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  try {
    const settings = await getSettingsFromDb();
    return Response.json(settings);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Ayarlar yüklenemedi." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;

  const body = (await request.json().catch(() => ({}))) as { settings?: Record<string, string> };
  const incoming = body.settings || (body as Record<string, string>);

  if (!incoming || typeof incoming !== "object") {
    return Response.json({ error: "Geçersiz ayarlar verisi." }, { status: 400 });
  }

  try {
    await updateSettingsInDb(incoming);
    const updated = await getSettingsFromDb();
    return Response.json({ ok: true, settings: updated });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Ayarlar güncellenemedi." }, { status: 500 });
  }
}
