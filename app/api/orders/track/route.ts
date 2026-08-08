import { ensureDatabase, getDb } from "@/db";

export async function GET(request: Request) {
  await ensureDatabase();
  const url = new URL(request.url);
  const email = url.searchParams.get("email")?.trim().toLowerCase() ?? "";
  const orderNumber = url.searchParams.get("orderNumber")?.trim().toUpperCase() ?? "";
  if (!email || !orderNumber) return Response.json({ error: "E-posta ve sipariş numarası gerekli." }, { status: 400 });
  const order = await getDb().prepare("SELECT order_number AS orderNumber, status, total, currency, created_at AS createdAt, updated_at AS updatedAt FROM orders WHERE lower(email) = ? AND order_number = ?").bind(email, orderNumber).first();
  return order ? Response.json({ order }) : Response.json({ error: "Sipariş bulunamadı." }, { status: 404 });
}
