import { laravel, setTokenCookie, getSessionId } from "@/app/lib/laravel-auth";
import type { LaravelUser } from "@/app/lib/laravel-auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: string; password?: string };
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  if (!email.includes("@") || password.length < 1) {
    return Response.json({ error: "E-posta ve şifre gerekli." }, { status: 400 });
  }

  const sessionId = await getSessionId();
  const result = await laravel<{ user: LaravelUser; access_token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, session_id: sessionId }),
  });

  if (!result.ok) {
    return Response.json({ error: result.message }, { status: result.status });
  }

  await setTokenCookie(result.data.access_token);
  return Response.json({ success: true, user: result.data.user });
}
