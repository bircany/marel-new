import { laravel } from "@/app/lib/laravel-auth";
import type { AddressPayload } from "@/app/api/addresses/route";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isFinite(id) || id <= 0) return Response.json({ error: "Geçersiz adres." }, { status: 400 });
  const body = (await request.json().catch(() => ({}))) as Partial<AddressPayload>;
  const payload: Record<string, unknown> = {};
  if (typeof body.title === "string") payload.title = body.title.trim().slice(0, 80);
  if (typeof body.name === "string") payload.name = body.name.trim().slice(0, 150);
  if (typeof body.phone === "string") payload.phone = body.phone.trim().slice(0, 20);
  if (typeof body.city === "string") payload.city = body.city.trim().slice(0, 80);
  if (typeof body.district === "string") payload.district = body.district.trim().slice(0, 80);
  if (typeof body.neighborhood === "string") payload.neighborhood = body.neighborhood.trim().slice(0, 100) || null;
  if (typeof body.full_address === "string") payload.full_address = body.full_address.trim();
  if (typeof body.zip_code === "string") payload.zip_code = body.zip_code.trim().slice(0, 10) || null;
  if (typeof body.is_default === "boolean") payload.is_default = body.is_default;
  const result = await laravel<AddressPayload>(`/addresses/${id}`, { method: "PUT", token: true, body: JSON.stringify(payload) });
  if (!result.ok) return Response.json({ error: result.message }, { status: result.status });
  return Response.json(result.data);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isFinite(id) || id <= 0) return Response.json({ error: "Geçersiz adres." }, { status: 400 });
  const result = await laravel(`/addresses/${id}`, { method: "DELETE", token: true });
  if (!result.ok) return Response.json({ error: result.message }, { status: result.status });
  return Response.json({ ok: true });
}
