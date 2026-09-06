import { laravel } from "@/app/lib/laravel-auth";
import type { OrderPayload } from "@/app/api/orders/route";

export type CargoTrackPayload = {
  company: string | null;
  company_label: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  live_status: string | null;
  events: Array<{ date?: string | null; description: string }>;
  source: string;
};

export type GuestTrackResponse = {
  order: OrderPayload;
  cargo: CargoTrackPayload;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { orderNumber?: string; email?: string };
  const orderNumber = String(body.orderNumber ?? "").trim();
  const email = String(body.email ?? "").trim();
  if (orderNumber.length < 5 || !email.includes("@")) {
    return Response.json({ error: "Sipariş numarası ve e-posta gerekli." }, { status: 400 });
  }

  const result = await laravel<GuestTrackResponse>("/orders/track", {
    method: "POST",
    body: JSON.stringify({ order_number: orderNumber, email }),
  });

  if (!result.ok) {
    return Response.json({ error: result.message || "Sipariş bulunamadı." }, { status: result.status || 404 });
  }

  return Response.json(result.data);
}
