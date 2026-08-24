import { laravel, clearTokenCookie } from "@/app/lib/laravel-auth";

export async function POST() {
  const result = await laravel<unknown>("/auth/logout", { method: "POST", token: true });
  await clearTokenCookie();
  if (!result.ok && result.status === 401) return Response.json({ success: true });
  return Response.json({ success: true });
}
