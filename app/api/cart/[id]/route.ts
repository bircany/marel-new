import { laravel } from "@/app/lib/laravel-auth";
import type { CartPayload } from "@/app/api/cart/route";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { quantity?: number };
  const quantity = Math.max(0, Math.min(100, Math.floor(Number(body.quantity) || 0)));
  const result = await laravel<CartPayload>(`/cart/${id}`, {
    method: "PUT",
    session: true,
    body: JSON.stringify({ quantity }),
  });
  if (!result.ok) return Response.json({ error: result.message }, { status: result.status });
  return Response.json(result.data);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await laravel<CartPayload>(`/cart/${id}`, { method: "DELETE", session: true });
  if (!result.ok) return Response.json({ error: result.message }, { status: result.status });
  return Response.json(result.data);
}
