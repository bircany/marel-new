import { requireAdminApi } from "@/app/lib/admin-auth";
import { ensureDatabase, getDb } from "@/db";

const allowed = new Set(["pending", "approved", "rejected"]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  const { id } = await params;
  const input = await request.json() as { status?: string; adminReply?: string };
  const status = String(input.status ?? "");
  if (!allowed.has(status)) return Response.json({ error: "Geçersiz yorum durumu." }, { status: 400 });
  await ensureDatabase();
  await getDb().prepare("UPDATE reviews SET status = ?, admin_reply = ?, updated_at = ? WHERE id = ?").bind(status, String(input.adminReply ?? "").trim().slice(0, 800), new Date().toISOString(), id).run();
  return Response.json({ ok: true });
}
