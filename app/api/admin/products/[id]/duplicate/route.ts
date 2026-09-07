import { requireAdminApi } from "@/app/lib/admin-auth";
import { duplicateProductRecord } from "@/db";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  const { id } = await params;

  try {
    const copy = await duplicateProductRecord(id);
    return Response.json({ ok: true, product: copy }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Ürün çoğaltılamadı." }, { status: 400 });
  }
}
