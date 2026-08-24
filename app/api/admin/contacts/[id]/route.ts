import { requireAdminApi } from "@/app/lib/admin-auth";
import { laravel } from "@/app/lib/laravel-auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  const { id } = await params;
  const input = await request.json() as { status?: string };
  const status = String(input.status ?? "");
  if (!["new", "read", "resolved"].includes(status)) return Response.json({ error: "Geçersiz mesaj durumu." }, { status: 400 });
  const result = await laravel(`/admin/contact-messages/${id}`, {
    method: "PUT",
    token: true,
    body: JSON.stringify({ status }),
  });
  if (!result.ok) return Response.json({ error: result.message }, { status: result.status });
  return Response.json({ ok: true });
}
