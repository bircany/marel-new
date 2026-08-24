import { laravel, setTokenCookie, getSessionId } from "@/app/lib/laravel-auth";
import type { LaravelUser } from "@/app/lib/laravel-auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const firstName = String(body.firstName ?? body.first_name ?? "").trim();
  const lastName = String(body.lastName ?? body.last_name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const phone = String(body.phone ?? "").trim();
  const password = String(body.password ?? "");
  const passwordConfirmation = String(body.passwordConfirmation ?? body.password_confirmation ?? password);

  if (!firstName || !lastName || !email.includes("@") || password.length < 8) {
    return Response.json({ error: "Ad, soyad, geçerli e-posta ve en az 8 karakterlik şifre gerekli." }, { status: 400 });
  }

  const sessionId = await getSessionId();
  const result = await laravel<{ user: LaravelUser; access_token: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      first_name: firstName,
      last_name: lastName,
      email,
      phone: phone || undefined,
      password,
      password_confirmation: passwordConfirmation,
      session_id: sessionId,
    }),
  });

  if (!result.ok) {
    return Response.json({ error: result.message, errors: result.errors }, { status: result.status });
  }

  await setTokenCookie(result.data.access_token);
  return Response.json({ success: true, user: result.data.user }, { status: 201 });
}
