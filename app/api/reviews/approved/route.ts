import { laravel } from "@/app/lib/laravel-auth";
import type { ReviewPayload } from "@/app/api/reviews/route";

export async function GET() {
  const result = await laravel<ReviewPayload[]>("/reviews/approved?limit=6");
  if (!result.ok) return Response.json({ error: result.message }, { status: result.status });
  return Response.json(result.data);
}
