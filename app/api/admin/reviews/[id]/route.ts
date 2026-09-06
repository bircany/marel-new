import { getDb } from "@/db";
import { requireAdminApi } from "@/app/lib/admin-auth";
import { laravel } from "@/app/lib/laravel-auth";

const allowed = new Set(["pending", "approved", "rejected"]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  const { id } = await params;
  const input = await request.json() as { status?: string };
  const status = String(input.status ?? "");
  if (!allowed.has(status)) return Response.json({ error: "Geçersiz yorum durumu." }, { status: 400 });
  const result = await laravel(`/admin/reviews/${id}/status`, {
    method: "PUT",
    token: true,
    body: JSON.stringify({ status }),
  });
  if (!result.ok) {
    try {
      const db = getDb();
      const now = new Date().toISOString();
      await db.prepare("UPDATE reviews SET status = ?, updated_at = ? WHERE id = ?").bind(status, now, id).run();
      return Response.json({ ok: true });
    } catch {
      return Response.json({ error: result.message }, { status: result.status });
    }
  }
  return Response.json({ ok: true });
}
