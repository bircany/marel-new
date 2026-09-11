import { requireAdminApi } from "@/app/lib/admin-auth";
import { ensureDatabase, getDb } from "@/db";

function slugify(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function handleUpdate(request: Request, id: string) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;

  let title = "";
  let slugInput = "";
  let summary = "";
  let body = "";
  let imageUrl = "/images/real/diamond-beyaz-siyah-ip.jpeg";
  let published = false;
  let featured = false;

  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const input = (await request.json()) as {
      title?: string;
      slug?: string;
      summary?: string;
      body?: string;
      imageUrl?: string;
      published?: boolean | string;
      featured?: boolean | string;
    };
    title = String(input.title ?? "").trim().slice(0, 250);
    slugInput = String(input.slug ?? "").trim();
    summary = String(input.summary ?? "").trim().slice(0, 1500);
    body = String(input.body ?? "").trim().slice(0, 100000);
    if (input.imageUrl) imageUrl = String(input.imageUrl).trim();
    published = input.published === true || input.published === "true" || input.published === "1";
    featured = input.featured === true || input.featured === "true" || input.featured === "1";
  } else {
    const formData = await request.formData();
    title = String(formData.get("title") ?? "").trim().slice(0, 250);
    slugInput = String(formData.get("slug") ?? "").trim();
    summary = String(formData.get("summary") ?? "").trim().slice(0, 1500);
    body = String(formData.get("body") ?? "").trim().slice(0, 100000);
    const img = formData.get("imageUrl");
    if (img && typeof img === "string" && img.trim()) imageUrl = img.trim();
    published = formData.get("published") === "true" || formData.get("published") === "on" || formData.get("published") === "1";
    featured = formData.get("featured") === "true" || formData.get("featured") === "on" || formData.get("featured") === "1";
  }

  if (title.length < 3 || summary.length < 5 || body.length < 10) {
    return Response.json(
      { error: "Başlık, özet ve içerik metni alanları gereklidir." },
      { status: 400 }
    );
  }

  await ensureDatabase();
  const db = getDb();
  const current = await db
    .prepare("SELECT slug, published_at AS publishedAt FROM announcements WHERE id = ?")
    .bind(id)
    .first<{ slug: string; publishedAt: string | null }>();

  if (!current) {
    return Response.json({ error: "Güncellenecek blog yazısı bulunamadı." }, { status: 404 });
  }

  const slug = slugInput ? slugify(slugInput) : current.slug;
  const now = new Date().toISOString();
  const publishedAt = published ? (current.publishedAt || now) : null;

  try {
    await db
      .prepare(
        "UPDATE announcements SET title = ?, slug = ?, summary = ?, body = ?, image_url = ?, published = ?, featured = ?, published_at = ?, updated_at = ? WHERE id = ?"
      )
      .bind(
        title,
        slug,
        summary,
        body,
        imageUrl,
        published ? 1 : 0,
        featured ? 1 : 0,
        publishedAt,
        now,
        id
      )
      .run();
  } catch (err) {
    console.error("Announcement update error:", err);
    return Response.json({ error: "Blog güncellenemedi veya slug çakışması var." }, { status: 400 });
  }

  return Response.json({ ok: true, id, slug });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handleUpdate(request, id);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handleUpdate(request, id);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  const { id } = await params;
  await ensureDatabase();
  await getDb().prepare("DELETE FROM announcements WHERE id = ?").bind(id).run();
  return Response.json({ ok: true });
}
