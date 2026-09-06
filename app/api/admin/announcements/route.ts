import { requireAdminApi } from "@/app/lib/admin-auth";
import { ensureDatabase, getDb } from "@/db";

function slugify(value: string) { return value.toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  const input = await request.json() as { title?: string; slug?: string; summary?: string; body?: string; imageUrl?: string; published?: boolean; featured?: boolean };
  const title = String(input.title ?? "").trim().slice(0, 180);
  const slug = slugify(String(input.slug ?? title));
  const summary = String(input.summary ?? "").trim().slice(0, 320);
  const body = String(input.body ?? "").trim().slice(0, 6000);
  if (title.length < 3 || !slug || summary.length < 10 || body.length < 20) return Response.json({ error: "Başlık, özet ve duyuru metni gereklidir." }, { status: 400 });
  await ensureDatabase();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  try {
    await getDb().prepare("INSERT INTO announcements (id, slug, title, summary, body, image_url, published, featured, published_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(id, slug, title, summary, body, String(input.imageUrl ?? "/images/hero/marel-honeycomb-hero-v3.png"), input.published ? 1 : 0, input.featured ? 1 : 0, input.published ? now : null, now, now).run();
  } catch { return Response.json({ error: "Bu URL adı zaten kullanılıyor." }, { status: 400 }); }
  return Response.json({ ok: true, id, slug }, { status: 201 });
}
