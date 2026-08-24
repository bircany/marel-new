import { laravel } from "@/app/lib/laravel-auth";
import type { LaravelUser } from "@/app/lib/laravel-auth";

export async function GET() {
  const result = await laravel<LaravelUser>("/auth/me", { token: true });
  if (!result.ok) return Response.json({ user: null }, { status: 200 });
  return Response.json({ user: result.data });
}
