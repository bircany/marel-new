import { requireAdminApi } from "@/app/lib/admin-auth";
import { createCustomerInDb, listCustomersFromDb } from "@/db";

export async function GET(request: Request) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  try {
    const customers = await listCustomersFromDb();
    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.trim().toLowerCase();
    const status = url.searchParams.get("status");
    const filtered = customers.filter((customer) =>
      (!q || [customer.fullName, customer.email, customer.phone].some((value) => value.toLowerCase().includes(q))) &&
      (!status || customer.status === status)
    );
    return Response.json(filtered);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Müşteri listesi yüklenemedi." }, { status: 500 });
  }
}

export async function POST(request: Request) {
    const admin = await requireAdminApi();
    if (admin instanceof Response) return admin;
    const body = (await request.json().catch(() => ({}))) as { fullName?: string; email?: string; phone?: string; status?: string };
    if (!body.fullName?.trim() || !body.email?.includes("@")) {
      return Response.json({ error: "Ad soyad ve geçerli e-posta gereklidir." }, { status: 400 });
    }
    try {
      return Response.json(await createCustomerInDb({ fullName: body.fullName!, email: body.email!, phone: body.phone, status: body.status }), { status: 201 });
    } catch (error) {
      return Response.json({ error: error instanceof Error ? error.message : "Müşteri oluşturulamadı." }, { status: 400 });
  }
}
