import { laravel } from "@/app/lib/laravel-auth";

export type InitiatePaymentPayload = {
  redirect_url: string;
  transaction_id: string;
  amount: number;
  currency: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { orderId?: number; method?: string };
  const orderId = Number(body.orderId);
  if (!Number.isFinite(orderId) || orderId <= 0) {
    return Response.json({ error: "Geçersiz sipariş bilgisi." }, { status: 400 });
  }
  const result = await laravel<InitiatePaymentPayload>("/payments/initiate", {
    method: "POST",
    token: true,
    body: JSON.stringify({ order_id: orderId, method: String(body.method ?? "").trim() || "sandbox" }),
  });
  if (!result.ok) return Response.json({ error: result.message }, { status: result.status });
  return Response.json(result.data, { status: 200 });
}
