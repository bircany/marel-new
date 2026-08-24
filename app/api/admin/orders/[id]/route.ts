import { requireAdminApi } from "@/app/lib/admin-auth";
import { stUpdateOrderStatus } from "@/app/lib/softtrade";

const orderStatuses = new Set(["pending", "processing", "shipped", "delivered", "cancelled", "refunded"]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  const { id } = await params;
  const body = (await request.json()) as { status?: string; note?: string };
  if (!body.status || !orderStatuses.has(body.status)) return Response.json({ error: "Geçersiz sipariş durumu." }, { status: 400 });
  try {
    await stUpdateOrderStatus(id, body.status, body.note);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Sipariş güncellenemedi." }, { status: 400 });
  }
}
