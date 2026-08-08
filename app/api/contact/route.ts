import { ensureDatabase, getDb } from "@/db";

export async function POST(request: Request) {
  const input = await request.json() as { name?: string; email?: string; phone?: string; subject?: string; message?: string; website?: string };
  if (input.website) return Response.json({ ok: true });
  const name = String(input.name ?? "").trim().slice(0, 100);
  const email = String(input.email ?? "").trim().toLowerCase().slice(0, 160);
  const phone = String(input.phone ?? "").trim().slice(0, 40);
  const subject = String(input.subject ?? "").trim().slice(0, 120);
  const message = String(input.message ?? "").trim().slice(0, 2500);
  if (name.length < 2 || !email.includes("@") || subject.length < 3 || message.length < 10) return Response.json({ error: "Lütfen zorunlu alanları eksiksiz doldurun." }, { status: 400 });
  await ensureDatabase();
  const now = new Date().toISOString();
  await getDb().prepare("INSERT INTO contact_messages (id, name, email, phone, subject, message, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'new', ?, ?)").bind(crypto.randomUUID(), name, email, phone, subject, message, now, now).run();
  return Response.json({ ok: true, message: "Mesajınız Marel ekibine ulaştı." }, { status: 201 });
}
