import { laravel } from "@/app/lib/laravel-auth";

export async function DELETE() {
  const result = await laravel<unknown>("/cart", { method: "DELETE", session: true });
  if (!result.ok && result.status !== 204) return Response.json({ error: result.message }, { status: result.status });
  return Response.json({ success: true });
}
