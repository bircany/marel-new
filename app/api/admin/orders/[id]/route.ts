import { requireAdminApi } from "@/app/lib/admin-auth";
import { getOrderDetailsById, updateOrderInDb } from "@/db";
import { stUpdateOrderStatus } from "@/app/lib/softtrade";

const orderStatuses = new Set([
  "pending",
  "awaiting_measurement",
  "measure_ok",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]);

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  const { id } = await params;
  try {
    const order = await getOrderDetailsById(id);
    if (!order) return Response.json({ error: "Sipariş bulunamadı." }, { status: 404 });
    return Response.json(order);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Sipariş okunamadı." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  const { id } = await params;
  const body = (await request.json()) as {
    status?: string;
    note?: string;
    cargoCompany?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    paymentStatus?: string;
  };
  if (body.status && !orderStatuses.has(body.status)) {
    return Response.json({ error: "Geçersiz sipariş durumu." }, { status: 400 });
  }

  // Calculate live tracking URL if company and tracking number exist
  let trackingUrl = body.trackingUrl;
  if (!trackingUrl && body.cargoCompany && body.trackingNumber) {
    const num = encodeURIComponent(body.trackingNumber.trim());
    if (body.cargoCompany === "mng") trackingUrl = `https://www.mngkargo.com.tr/gonderitakip?kodu=${num}`;
    else if (body.cargoCompany === "yurtici") trackingUrl = `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${num}`;
    else if (body.cargoCompany === "aras") trackingUrl = `https://www.araskargo.com.tr/kargo-takip?kodu=${num}`;
    else if (body.cargoCompany === "surat") trackingUrl = `https://www.suratkargo.com.tr/KargoTakip/?kargotakipno=${num}`;
    else if (body.cargoCompany === "ptt") trackingUrl = `https://gonderitakip.ptt.gov.tr/Track/Verify?q=${num}`;
    else if (body.cargoCompany === "hepsijet") trackingUrl = `https://www.hepsijet.com/gonderi-takibi/${num}`;
    else if (body.cargoCompany === "sendeo") trackingUrl = `https://kargotakip.sendeo.com.tr/kargo-takip?takipNo=${num}`;
  }

  try {
    // 1. Update in local D1 database
    await updateOrderInDb(id, {
      status: body.status,
      cargoCompany: body.cargoCompany,
      trackingNumber: body.trackingNumber,
      trackingUrl: trackingUrl || undefined,
      notes: body.note,
      paymentStatus: body.paymentStatus,
    });

    // 2. Sync to SoftTrade if configured
    try {
      if (body.status) {
        await stUpdateOrderStatus(id, body.status, body.note ?? "", {
          cargoCompany: body.cargoCompany,
          trackingNumber: body.trackingNumber,
        });
      }
    } catch {}

    const updated = await getOrderDetailsById(id);
    return Response.json({ ok: true, order: updated });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Sipariş güncellenemedi." }, { status: 400 });
  }
}

