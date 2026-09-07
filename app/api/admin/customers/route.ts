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
