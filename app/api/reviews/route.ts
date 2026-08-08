import { getChatGPTUser } from "@/app/chatgpt-auth";
import { ensureDatabase, getDb, upsertUser } from "@/db";

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Yorum yazmak için giriş yapmalısınız." }, { status: 401 });
  await upsertUser(user);
  const input = await request.json() as { productId?: string; rating?: number; title?: string; body?: string };
  const rating = Math.round(Number(input.rating));
  const title = String(input.title ?? "").trim().slice(0, 100);
  const body = String(input.body ?? "").trim().slice(0, 1200);
  const productId = String(input.productId ?? "").trim() || null;
  if (rating < 1 || rating > 5 || title.length < 3 || body.length < 10) return Response.json({ error: "Puan, başlık ve en az 10 karakterlik yorum gereklidir." }, { status: 400 });
  await ensureDatabase();
  if (productId) {
    const product = await getDb().prepare("SELECT id FROM products WHERE id = ? AND active = 1").bind(productId).first();
    if (!product) return Response.json({ error: "Seçilen ürün bulunamadı." }, { status: 400 });
  }
  const now = new Date().toISOString();
  await getDb().prepare("INSERT INTO reviews (id, user_id, product_id, rating, title, body, status, admin_reply, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'pending', '', ?, ?)").bind(crypto.randomUUID(), user.userId, productId, rating, title, body, now, now).run();
  return Response.json({ ok: true, message: "Yorumunuz onaya gönderildi." }, { status: 201 });
}
