import { requireAdminApi } from "@/app/lib/admin-auth";
import { ensureDatabase, getDb } from "@/db";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  const { id } = await params;
  const input = await request.json() as { status?: string };
  const status = String(input.status ?? "");
  if (!["new", "read", "resolved"].includes(status)) return Response.json({ error: "Geçersiz mesaj durumu." }, { status: 400 });
  await ensureDatabase();
  await getDb().prepare("UPDATE contact_messages SET status = ?, updated_at = ? WHERE id = ?").bind(status, new Date().toISOString(), id).run();
  return Response.json({ ok: true });
}
