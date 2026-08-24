import { laravel } from "@/app/lib/laravel-auth";

export type AddressPayload = {
  id: number;
  title: string;
  name: string;
  phone: string;
  city: string;
  district: string;
  neighborhood: string | null;
  full_address: string;
  zip_code: string | null;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
};

type AddressListPayload = AddressPayload[];

export async function GET() {
  const result = await laravel<AddressListPayload>("/addresses", { token: true });
  if (!result.ok) return Response.json({ error: result.message }, { status: result.status });
  return Response.json(result.data);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Partial<AddressPayload>;
  const title = String(body.title ?? "").trim().slice(0, 80);
  const name = String(body.name ?? "").trim().slice(0, 150);
  const phone = String(body.phone ?? "").trim().slice(0, 20);
  const city = String(body.city ?? "").trim().slice(0, 80);
  const district = String(body.district ?? "").trim().slice(0, 80);
  const full_address = String(body.full_address ?? "").trim();
  if (!title || !name || !phone || !city || !district || !full_address) {
    return Response.json({ error: "Adres bilgileri eksik." }, { status: 400 });
  }
  const result = await laravel<AddressPayload>("/addresses", {
    method: "POST",
    token: true,
    body: JSON.stringify({
      title,
      name,
      phone,
      city,
      district,
      neighborhood: body.neighborhood?.trim().slice(0, 100) || null,
      full_address,
      zip_code: body.zip_code?.trim().slice(0, 10) || null,
      is_default: Boolean(body.is_default),
    }),
  });
  if (!result.ok) return Response.json({ error: result.message }, { status: result.status });
  return Response.json(result.data, { status: 201 });
}
