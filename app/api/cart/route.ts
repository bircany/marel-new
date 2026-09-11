import { laravel } from "@/app/lib/laravel-auth";

export type CartItemPayload = {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    slug: string;
    sku: string;
    cover_image: string | null;
    stock: number;
    in_stock: boolean;
  } | null;
  unit_price: number;
  line_total: number;
};

export type CartPayload = {
  items: CartItemPayload[];
  summary: { item_count: number; total_quantity: number; subtotal: number };
};

export async function GET() {
  const result = await laravel<CartPayload>("/cart", { session: true });
  if (!result.ok) return Response.json({ error: result.message }, { status: result.status });
  return Response.json(result.data);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { productId?: string | number; product_id?: string | number; quantity?: number };
  const rawId = body.productId ?? body.product_id;
  const productId = String(rawId ?? "").trim();
  const quantity = Math.max(1, Math.min(100, Math.floor(Number(body.quantity) || 1)));
  if (!productId) {
    return Response.json({ error: "Ürün seçimi gerekli." }, { status: 400 });
  }
  const numericId = Number(productId);
  const payloadId = Number.isFinite(numericId) && numericId > 0 ? numericId : productId;
  const result = await laravel<CartPayload>("/cart", {
    method: "POST",
    session: true,
    body: JSON.stringify({ product_id: payloadId, quantity }),
  });
  if (!result.ok) return Response.json({ error: result.message }, { status: result.status });
  return Response.json(result.data, { status: 201 });
}

export async function PUT(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { itemId?: string | number; quantity?: number };
  const id = String(body.itemId ?? "").trim();
  if (!id) return Response.json({ error: "Sepet ürünü gerekli." }, { status: 400 });
  const quantity = Math.max(0, Math.min(100, Math.floor(Number(body.quantity) || 0)));
  const result = await laravel<CartPayload>(`/cart/${id}`, { method: "PUT", session: true, body: JSON.stringify({ quantity }) });
  if (!result.ok) return Response.json({ error: result.message }, { status: result.status });
  return Response.json(result.data);
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const itemId = url.searchParams.get("itemId");
  const result = itemId
    ? await laravel<CartPayload>(`/cart/${itemId}`, { method: "DELETE", session: true })
    : await laravel<unknown>("/cart", { method: "DELETE", session: true });
  if (!result.ok) {
    if (result.status === 204) return Response.json({ success: true });
    return Response.json({ error: result.message }, { status: result.status });
  }
  return Response.json(result.data ?? { success: true });
}
