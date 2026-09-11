import { requireAdminApi } from "@/app/lib/admin-auth";
import { ensureDatabase, getDb, listAnnouncements } from "@/db";

function slugify(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET() {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  await ensureDatabase();
  const announcements = await listAnnouncements(false);
  return Response.json({ ok: true, announcements });
}

export async function POST(request: Request) {
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

  const slug = slugify(slugInput || title);

  if (title.length < 3 || !slug || summary.length < 5 || body.length < 10) {
    return Response.json(
      { error: "Başlık (en az 3 harf), özet ve detaylı içerik metni gereklidir." },
      { status: 400 }
    );
  }

  await ensureDatabase();
  const now = new Date().toISOString();
  const id = `ann-${crypto.randomUUID()}`;

  try {
    await getDb()
      .prepare(
        "INSERT INTO announcements (id, slug, title, summary, body, image_url, published, featured, published_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .bind(
        id,
        slug,
        title,
        summary,
        body,
        imageUrl,
        published ? 1 : 0,
        featured ? 1 : 0,
        published ? now : null,
        now,
        now
      )
      .run();
  } catch (err) {
    console.error("Announcements insert error:", err);
    return Response.json({ error: "Bu URL adı (slug) zaten başka bir yazıda kullanılıyor." }, { status: 400 });
  }

  return Response.json({ ok: true, id, slug }, { status: 201 });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;

  const { id } = await params;
  const contentType = request.headers.get("content-type") || "";
  let title = "";
  let slugInput = "";
  let summary = "";
  let body = "";
  let imageUrl = "/images/real/diamond-beyaz-siyah-ip.jpeg";
  let published = false;
  let featured = false;

  if (contentType.includes("application/json")) {
    const input = (await request.json()) as Record<string, unknown>;
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

  const slug = slugify(slugInput || title);
  if (title.length < 3 || !slug || summary.length < 5 || body.length < 10) {
    return Response.json({ error: "Başlık (en az 3 harf), özet ve detaylı içerik metni gereklidir." }, { status: 400 });
  }

  await ensureDatabase();
  const now = new Date().toISOString();
  try {
    const result = await getDb()
      .prepare(
        "UPDATE announcements SET slug = ?, title = ?, summary = ?, body = ?, image_url = ?, published = ?, featured = ?, published_at = ?, updated_at = ? WHERE id = ?"
      )
      .bind(slug, title, summary, body, imageUrl, published ? 1 : 0, featured ? 1 : 0, published ? now : null, now, id)
      .run();

    if ((result.meta?.changes ?? 0) === 0) return Response.json({ error: "Blog yazısı bulunamadı." }, { status: 404 });
    return Response.json({ ok: true, id, slug });
  } catch (err) {
    console.error("Announcements update error:", err);
    return Response.json({ error: "Blog yazısı güncellenemedi veya slug zaten kullanılıyor." }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;

  const { id } = await params;
  await ensureDatabase();
  const result = await getDb().prepare("DELETE FROM announcements WHERE id = ?").bind(id).run();
  if ((result.meta?.changes ?? 0) === 0) return Response.json({ error: "Blog yazısı bulunamadı." }, { status: 404 });
  return Response.json({ ok: true });
}
