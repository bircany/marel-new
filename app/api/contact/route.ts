import { laravel } from "@/app/lib/laravel-auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
    phone?: string;
    subject?: string;
    message?: string;
    website?: string;
  };
  if (body.website) return Response.json({ ok: true }, { status: 201 });
  const name = String(body.name ?? "").trim().slice(0, 100);
  const email = String(body.email ?? "").trim().toLowerCase().slice(0, 160);
  const phone = String(body.phone ?? "").trim().slice(0, 40);
  const subject = String(body.subject ?? "").trim().slice(0, 120);
  const message = String(body.message ?? "").trim().slice(0, 2500);
  if (name.length < 2 || !email.includes("@") || subject.length < 3 || message.length < 10) {
    return Response.json({ error: "Lütfen zorunlu alanları eksiksiz doldurun." }, { status: 400 });
  }
  const result = await laravel<{ id: number; status: string }>("/contact", {
    method: "POST",
    body: JSON.stringify({ name, email, phone: phone || null, subject, message }),
  });
  if (!result.ok) return Response.json({ error: result.message }, { status: result.status });
  return Response.json({ ok: true, message: "Mesajınız Marel ekibine ulaştı." }, { status: 201 });
}
