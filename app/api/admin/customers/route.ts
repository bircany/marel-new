import { requireAdminApi } from "@/app/lib/admin-auth";
import { listCustomersFromDb } from "@/db";

export async function GET() {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  try {
    const customers = await listCustomersFromDb();
    return Response.json(customers);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Müşteri listesi yüklenemedi." }, { status: 500 });
  }
}
export async function PUT(request: Request) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;

  try {
    const data = (await request.json()) as { originalEmail?: string; fullName?: string; email?: string; phone?: string };
    const { originalEmail, fullName, email, phone } = data;

    if (!originalEmail || !email) {
      return Response.json({ error: "Orijinal ve yeni e-posta adresi zorunludur." }, { status: 400 });
    }

    // Import lazily to avoid circular dependencies if any
    const { updateCustomerInDb } = await import("@/db");
    
    await updateCustomerInDb(originalEmail, { fullName: fullName || "", email, phone: phone || "" });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Müşteri güncellenemedi." }, { status: 500 });
  }
}
