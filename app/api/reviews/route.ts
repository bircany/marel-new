import { getDb } from "@/db";
import { laravel } from "@/app/lib/laravel-auth";

export type ReviewPayload = {
  id: number;
  rating: number;
  title: string | null;
  comment: string | null;
  status: string;
  is_verified_purchase: boolean;
  user?: { name: string; avatar: string | null } | null;
  product?: { id: number; name: string; slug: string } | null;
  created_at: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    productId?: string | number | null;
    rating?: number;
    title?: string;
    body?: string;
  };
  const rating = Math.round(Number(body.rating));
  const title = String(body.title ?? "").trim().slice(0, 150);
  const comment = String(body.body ?? "").trim().slice(0, 1000);
  const productIdRaw = String(body.productId ?? "").trim();
  const productId = productIdRaw ? Number(productIdRaw) : null;
  if (rating < 1 || rating > 5) {
    return Response.json({ error: "Geçerli bir puan (1-5) gereklidir." }, { status: 400 });
  }
  if (!title && !comment) return Response.json({ error: "Başlık veya yorum içeriği gereklidir." }, { status: 400 });
  const payload: Record<string, unknown> = { rating, title: title || null, comment: comment || null };
  if (productId) payload.product_id = productId;

  const result = await laravel<ReviewPayload>("/reviews", { method: "POST", token: true, body: JSON.stringify(payload) });
  if (!result.ok) {
    try {
      const db = getDb();
      const now = new Date().toISOString();
      const newId = "rev-" + Date.now();
      await db
        .prepare(
          "INSERT INTO reviews (id, user_id, product_id, rating, title, body, status, admin_reply, created_at, updated_at) VALUES (?, 'usr-guest', ?, ?, ?, ?, 'pending', '', ?, ?)"
        )
        .bind(newId, productIdRaw || null, rating, title || "Müşteri Yorumu", comment || "", now, now)
        .run();

      return Response.json(
        {
          id: Date.now(),
          rating,
          title: title || "Müşteri Yorumu",
          comment: comment || "",
          status: "pending",
          is_verified_purchase: true,
          created_at: now,
        },
        { status: 201 }
      );
    } catch {
      return Response.json({ error: result.message }, { status: result.status });
    }
  }
  return Response.json(result.data, { status: 201 });
}

export async function GET() {
  const result = await laravel<ReviewPayload[]>("/reviews/mine", { token: true });
  if (!result.ok) {
    try {
      const db = getDb();
      const { results } = await db
        .prepare(
          "SELECT r.id, r.rating, r.title, r.body AS comment, r.status, 1 AS is_verified_purchase, r.created_at, p.id AS p_id, p.name AS p_name, p.slug AS p_slug FROM reviews r LEFT JOIN products p ON r.product_id = p.id ORDER BY r.created_at DESC"
        )
        .all<{
          id: string;
          rating: number;
          title: string;
          comment: string;
          status: string;
          is_verified_purchase: number;
          created_at: string;
          p_id?: string;
          p_name?: string;
          p_slug?: string;
        }>();

      const data: ReviewPayload[] = results.map((row) => ({
        id: Number(row.id.replace(/\D/g, "")) || Date.now(),
        rating: row.rating,
        title: row.title,
        comment: row.comment,
        status: row.status,
        is_verified_purchase: true,
        user: { name: "Müşteri", avatar: null },
        product: row.p_id ? { id: Number(row.p_id.replace(/\D/g, "")) || 1, name: row.p_name || "", slug: row.p_slug || "" } : null,
        created_at: row.created_at,
      }));
      return Response.json(data);
    } catch {
      return Response.json({ error: result.message }, { status: result.status });
    }
  }
  return Response.json(result.data);
}
