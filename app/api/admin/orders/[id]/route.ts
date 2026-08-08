import { requireAdminApi } from "@/app/lib/admin-auth";
import { ensureDatabase, getDb } from "@/db";

const orderStatuses = new Set(["pending", "confirmed", "production", "shipped", "delivered", "cancelled"]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  await ensureDatabase();
  const { id } = await params;
  const body = await request.json() as { status?: string; note?: string };
  if (!body.status || !orderStatuses.has(body.status)) return Response.json({ error: "Geçersiz sipariş durumu." }, { status: 400 });
  const now = new Date().toISOString();
  await getDb().batch([
    getDb().prepare("UPDATE orders SET status = ?, updated_at = ? WHERE id = ?").bind(body.status, now, id),
    getDb().prepare("INSERT INTO order_events (id, order_id, status, note, actor_user_id, created_at) VALUES (?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), id, body.status, body.note?.trim() ?? "", admin.userId, now),
  ]);
  return Response.json({ ok: true });
}
