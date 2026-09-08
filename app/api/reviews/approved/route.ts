import { getDb, ensureDatabase } from "@/db";
import type { ReviewPayload } from "@/app/api/reviews/route";

export async function GET() {
  try {
    await ensureDatabase();
    const db = getDb();
    const { results } = await db
      .prepare(
        `SELECT r.id, r.rating, r.title, r.body AS comment, r.status, 1 AS is_verified_purchase, r.created_at, 
                p.id AS p_id, p.name AS p_name, p.slug AS p_slug,
                COALESCE(u.full_name, 'Müşteri') AS user_name
         FROM reviews r 
         LEFT JOIN products p ON r.product_id = p.id 
         LEFT JOIN users u ON r.user_id = u.id
         WHERE r.status = 'approved' 
         ORDER BY r.created_at DESC 
         LIMIT 6`
      )
      .all<any>();

    const data: ReviewPayload[] = (results || []).map((row) => ({
      id: Number(String(row.id).replace(/\D/g, "")) || 1,
      rating: row.rating,
      title: row.title,
      comment: row.comment,
      status: row.status,
      is_verified_purchase: true,
      user: { name: row.user_name || "Müşteri", avatar: null },
      product: row.p_id ? { id: Number(String(row.p_id).replace(/\D/g, "")) || 1, name: row.p_name || "", slug: row.p_slug || "" } : null,
      created_at: row.created_at,
    }));
    return Response.json(data);
  } catch (err) {
    console.error("Failed to fetch approved reviews:", err);
    return Response.json([]);
  }
}
