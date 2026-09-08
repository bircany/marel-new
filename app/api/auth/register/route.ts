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

  // 1. Native Supabase PostgreSQL registration
  if (process.env.DATABASE_URL) {
    try {
      const { getDb, ensureDatabase } = await import("@/db");
      await ensureDatabase();
      const db = getDb();

      const existing = await db
        .prepare("SELECT id, email FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1")
        .bind(email)
        .first<{ id: string; email: string }>();

      if (existing) {
        return Response.json(
          { error: "Bu e-posta adresi ile kayıtlı bir hesap zaten bulunmaktadır." },
          { status: 400 }
        );
      }

      const userId = "usr-" + crypto.randomUUID();
      const fullName = `${firstName} ${lastName}`.trim();
      await db
        .prepare(
          "INSERT INTO users (id, email, full_name, role, created_at, updated_at) VALUES (?, ?, ?, 'customer', NOW(), NOW())"
        )
        .bind(userId, email, fullName)
        .run();

      const token = `marel-usr:${userId}:${Buffer.from(email).toString("base64")}`;
      await setTokenCookie(token);

      return Response.json(
        {
          success: true,
          user: {
            id: 1000 + Math.floor(Math.random() * 9000),
            first_name: firstName,
            last_name: lastName,
            full_name: fullName,
            email,
            phone: phone || null,
            role: "customer",
            is_active: true,
            created_at: new Date().toISOString(),
          },
        },
        { status: 201 }
      );
    } catch (dbErr) {
      console.warn("Direct Supabase registration failed, falling back to backend API:", dbErr);
    }
  }

  // 2. Fallback to external backend API if running
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
