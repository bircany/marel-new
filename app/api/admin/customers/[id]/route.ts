import { requireAdminApi } from "@/app/lib/admin-auth";
import { deleteCustomerInDb, getCustomerByIdFromDb, updateCustomerInDb } from "@/db";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  const customer = await getCustomerByIdFromDb((await params).id);
  return customer ? Response.json(customer) : Response.json({ error: "Müşteri bulunamadı." }, { status: 404 });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  const body = (await request.json().catch(() => ({}))) as { fullName?: string; email?: string; phone?: string; status?: string };
  try {
    const customer = await updateCustomerInDb((await params).id, body);
    return customer ? Response.json(customer) : Response.json({ error: "Müşteri bulunamadı." }, { status: 404 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Müşteri güncellenemedi." }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  await deleteCustomerInDb((await params).id);
  return Response.json({ ok: true });
}
