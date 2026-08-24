import { laravel } from "@/app/lib/laravel-auth";

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
  created_at: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { addressId?: number; paymentMethod?: string; notes?: string; couponCode?: string };
  const addressId = Number(body.addressId);
  const paymentMethod = String(body.paymentMethod ?? "").trim();
  if (!Number.isFinite(addressId) || addressId <= 0) {
    return Response.json({ error: "Teslimat adresi seçimi zorunludur." }, { status: 400 });
  }
  if (!["credit_card", "bank_transfer", "cash_on_delivery"].includes(paymentMethod)) {
    return Response.json({ error: "Geçerli bir ödeme yöntemi seçiniz." }, { status: 400 });
  }
  const payload = {
    address_id: addressId,
    payment_method: paymentMethod,
    notes: String(body.notes ?? "").trim().slice(0, 500) || null,
    coupon_code: String(body.couponCode ?? "").trim() || null,
  };
  const result = await laravel<OrderPayload>("/orders", { method: "POST", token: true, body: JSON.stringify(payload) });
  if (!result.ok) return Response.json({ error: result.message }, { status: result.status });
  return Response.json(result.data, { status: 201 });
}

export async function GET() {
  const result = await laravel<OrderPayload[]>("/orders", { token: true });
  if (!result.ok) return Response.json({ error: result.message }, { status: result.status });
  return Response.json(result.data);
}
