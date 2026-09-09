import { requireAdminApi } from "@/app/lib/admin-auth";
import { getPostgresClient } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;

  const configured = {
    databaseUrl: Boolean(process.env.DATABASE_URL),
    supabaseUrl: Boolean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL),
    anonKey: Boolean(process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    serviceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  };

  const sql = getPostgresClient();
  if (!sql) {
    return Response.json({
      ok: false,
      provider: "postgres",
      configured,
      error: "DATABASE_URL production ortamında tanımlı değil.",
    }, { status: 503 });
  }

  try {
    const rows = await sql.unsafe(`
      SELECT
        (SELECT COUNT(*)::int FROM products) AS products,
        (SELECT COUNT(*)::int FROM orders) AS orders,
        (SELECT COUNT(*)::int FROM users WHERE role = 'customer') AS customers,
        (SELECT COUNT(*)::int FROM coupons) AS coupons,
        (SELECT COUNT(*)::int FROM announcements) AS announcements,
        (SELECT COUNT(*)::int FROM reviews) AS reviews,
        (SELECT COUNT(*)::int FROM contact_messages) AS messages,
        (SELECT COUNT(*)::int FROM settings) AS settings
    `);
    return Response.json({
      ok: true,
      provider: "postgres",
      configured,
      counts: rows[0] ?? {},
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({
      ok: false,
      provider: "postgres",
      configured,
      error: error instanceof Error ? error.message : "Veritabanı kontrolü başarısız.",
    }, { status: 503 });
  }
}
