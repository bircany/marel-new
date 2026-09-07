import { getDb } from "@/db";
import { requireAdminApi } from "@/app/lib/admin-auth";
import { laravel } from "@/app/lib/laravel-auth";

const allowed = new Set(["pending", "approved", "rejected"]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  const { id } = await params;
  const input = (await request.json().catch(() => ({}))) as { status?: string; adminReply?: string };
  const status = input.status ? String(input.status) : undefined;
  if (status && !allowed.has(status)) return Response.json({ error: "Geçersiz yorum durumu." }, { status: 400 });
  const adminReply = typeof input.adminReply === "string" ? input.adminReply : undefined;

  try {
    const db = getDb();
    const now = new Date().toISOString();
    if (status && adminReply !== undefined) {
      await db
        .prepare("UPDATE reviews SET status = ?, admin_reply = ?, updated_at = ? WHERE id = ?")
        .bind(status, adminReply, now, id)
        .run();
    } else if (status) {
      await db
        .prepare("UPDATE reviews SET status = ?, updated_at = ? WHERE id = ?")
        .bind(status, now, id)
        .run();
    } else if (adminReply !== undefined) {
      await db
        .prepare("UPDATE reviews SET admin_reply = ?, updated_at = ? WHERE id = ?")
        .bind(adminReply, now, id)
        .run();
    }
    return Response.json({ ok: true });
  } catch (err: any) {
    return Response.json({ error: err?.message || "Yorum güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  const { id } = await params;

  try {
    const db = getDb();
    await db.prepare("DELETE FROM reviews WHERE id = ?").bind(id).run();
    return Response.json({ ok: true });
  } catch (err: any) {
    return Response.json({ error: err?.message || "Yorum silinemedi." }, { status: 500 });
  }
}

