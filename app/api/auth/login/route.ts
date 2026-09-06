import { checkRateLimitAsync, clientKey, rateLimitHeaders } from "@/app/lib/security";
import { laravel, setTokenCookie, getSessionId } from "@/app/lib/laravel-auth";
import type { LaravelUser } from "@/app/lib/laravel-auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: string; password?: string; website?: string };
  
  // Bot Honeypot Control
  if (body.website) {
    return Response.json({ error: "Erişim engellendi." }, { status: 400 });
  }

  // Rate-limiting check (5 attempts per minute per IP)
  const ipKey = clientKey(request);
  const rateLimit = await checkRateLimitAsync(`login:${ipKey}`, 5, 60_000);
  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({ error: "Çok fazla hatalı giriş denemesi. Güvenliğiniz için 1 dakika engel tanımlandı. Lütfen daha sonra tekrar deneyin." }),
      {
        status: 429,
        headers: {
          "content-type": "application/json",
          ...rateLimitHeaders(rateLimit),
        },
      }
    );
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  if (!email.includes("@") || password.length < 1) {
    return Response.json({ error: "E-posta ve şifre gereklidir." }, { status: 400 });
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
