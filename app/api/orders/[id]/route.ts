import { laravel } from "@/app/lib/laravel-auth";
import type { OrderPayload } from "@/app/api/orders/route";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isFinite(id) || id <= 0) return Response.json({ error: "Geçersiz sipariş." }, { status: 400 });
  const result = await laravel<OrderPayload>(`/orders/${id}`, { token: true });
  if (!result.ok) return Response.json({ error: result.message }, { status: result.status });
  return Response.json(result.data);
}
