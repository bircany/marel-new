import { requireAdminApi } from "@/app/lib/admin-auth";
import { ensureDatabase, getDb } from "@/db";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  const { id } = await params;
  const input = await request.json() as { title?: string; summary?: string; body?: string; imageUrl?: string; published?: boolean; featured?: boolean };
  const title = String(input.title ?? "").trim().slice(0, 180);
  const summary = String(input.summary ?? "").trim().slice(0, 320);
  const body = String(input.body ?? "").trim().slice(0, 6000);
  if (title.length < 3 || summary.length < 10 || body.length < 20) return Response.json({ error: "Duyuru alanları eksik." }, { status: 400 });
  await ensureDatabase();
  const current = await getDb().prepare("SELECT published_at AS publishedAt FROM announcements WHERE id = ?").bind(id).first<{ publishedAt: string | null }>();
  const now = new Date().toISOString();
  await getDb().prepare("UPDATE announcements SET title = ?, summary = ?, body = ?, image_url = ?, published = ?, featured = ?, published_at = ?, updated_at = ? WHERE id = ?").bind(title, summary, body, String(input.imageUrl ?? "/images/hero/marel-honeycomb-hero-v3.png"), input.published ? 1 : 0, input.featured ? 1 : 0, input.published ? current?.publishedAt ?? now : null, now, id).run();
  return Response.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  const { id } = await params;
  await ensureDatabase();
  await getDb().prepare("DELETE FROM announcements WHERE id = ?").bind(id).run();
  return Response.json({ ok: true });
}
