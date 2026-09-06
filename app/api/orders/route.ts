import { getToken, getSessionId, laravel } from "@/app/lib/laravel-auth";

export type OrderItemPayload = {
  id: number;
  product_id: number | null;
  product_name: string | null;
  variant_label: string | null;
  sku: string | null;
  unit_price: number;
  quantity: number;
  subtotal: number;
  product_slug?: string | null;
};

export type OrderAddressPayload = {
  name: string;
  phone: string;
  city: string;
  district: string;
  neighborhood: string | null;
  full_address: string;
  zip_code: string | null;
};

export type OrderPayload = {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  total: number;
  formatted_total: string;
  shipping_address: OrderAddressPayload | null;
  items?: OrderItemPayload[];
  notes: string | null;
  cargo_company?: string | null;
  cargo_company_label?: string | null;
  tracking_number?: string | null;
  tracking_url?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  measurement_confirmed_at?: string | null;
  measurement_notes?: string | null;
  created_at: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    addressId?: number;
    paymentMethod?: string;
    notes?: string;
    couponCode?: string;
    shipping?: {
      name?: string;
      phone?: string;
      email?: string;
      city?: string;
      district?: string;
      neighborhood?: string;
      full_address?: string;
      zip_code?: string;
    };
  };

  const paymentMethod = String(body.paymentMethod ?? "").trim();
  if (!["bank_transfer", "cash_on_delivery"].includes(paymentMethod)) {
    return Response.json(
      { error: "Geçerli bir ödeme yöntemi seçiniz (Havale/WhatsApp veya kapıda)." },
      { status: 400 },
    );
  }

  const payload: Record<string, unknown> = {
    payment_method: paymentMethod,
    notes: String(body.notes ?? "").trim().slice(0, 500) || null,
    coupon_code: String(body.couponCode ?? "").trim() || null,
    session_id: await getSessionId(),
  };

  const addressId = Number(body.addressId);
  if (Number.isFinite(addressId) && addressId > 0) {
    payload.address_id = addressId;
  } else if (body.shipping) {
    payload.shipping = {
      name: String(body.shipping.name ?? "").trim(),
      phone: String(body.shipping.phone ?? "").trim(),
      email: String(body.shipping.email ?? "").trim(),
      city: String(body.shipping.city ?? "").trim(),
      district: String(body.shipping.district ?? "").trim(),
      neighborhood: String(body.shipping.neighborhood ?? "").trim() || null,
      full_address: String(body.shipping.full_address ?? "").trim(),
      zip_code: String(body.shipping.zip_code ?? "").trim() || null,
    };
  } else {
    return Response.json({ error: "Teslimat adresi zorunludur." }, { status: 400 });
  }

  const hasToken = Boolean(await getToken());
  const result = await laravel<OrderPayload>("/orders", {
    method: "POST",
    token: hasToken,
    session: true,
    body: JSON.stringify(payload),
  });

  if (!result.ok) return Response.json({ error: result.message }, { status: result.status });
  return Response.json(result.data, { status: 201 });
}

export async function GET() {
  const result = await laravel<OrderPayload[]>("/orders", { token: true });
  if (!result.ok) return Response.json({ error: result.message }, { status: result.status });
  return Response.json(result.data);
}
