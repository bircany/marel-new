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
  if (rating < 1 || rating > 5 || (productId && !Number.isFinite(productId))) {
    return Response.json({ error: "Puan ve geçerli ürün bilgisi gereklidir." }, { status: 400 });
  }
  if (!title && !comment) return Response.json({ error: "Başlık veya yorum içeriği gereklidir." }, { status: 400 });
  const payload: Record<string, unknown> = { rating, title: title || null, comment: comment || null };
  if (productId) payload.product_id = productId;
  const result = await laravel<ReviewPayload>("/reviews", { method: "POST", token: true, body: JSON.stringify(payload) });
  if (!result.ok) return Response.json({ error: result.message }, { status: result.status });
  return Response.json(result.data, { status: 201 });
}

export async function GET() {
  const result = await laravel<ReviewPayload[]>("/reviews/mine", { token: true });
  if (!result.ok) return Response.json({ error: result.message }, { status: result.status });
  return Response.json(result.data);
}
