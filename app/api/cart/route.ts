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
  const body = (await request.json().catch(() => ({}))) as { productId?: string | number; quantity?: number };
  const productId = Number(body.productId);
  const quantity = Math.max(1, Math.min(100, Math.floor(Number(body.quantity) || 1)));
  if (!Number.isFinite(productId) || productId <= 0) {
    return Response.json({ error: "Ürün seçimi gerekli." }, { status: 400 });
  }
  const result = await laravel<CartPayload>("/cart", {
    method: "POST",
    session: true,
    body: JSON.stringify({ product_id: productId, quantity }),
  });
  if (!result.ok) return Response.json({ error: result.message }, { status: result.status });
  return Response.json(result.data, { status: 201 });
}
