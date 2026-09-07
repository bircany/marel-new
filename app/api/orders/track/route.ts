import { getDb } from "@/db";
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

const CARGO_COMPANIES: Record<string, { label: string; url: (trackingNo: string) => string }> = {
  mng: {
    label: "MNG Kargo",
    url: (no) => `https://www.mngkargo.com.tr/gonderitakip?kodu=${encodeURIComponent(no)}`,
  },
  yurtici: {
    label: "Yurtiçi Kargo",
    url: (no) => `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${encodeURIComponent(no)}`,
  },
  aras: {
    label: "Aras Kargo",
    url: (no) => `https://www.araskargo.com.tr/kargo-takip?kodu=${encodeURIComponent(no)}`,
  },
  surat: {
    label: "Sürat Kargo",
    url: (no) => `https://www.suratkargo.com.tr/KargoTakip/?kargotakipno=${encodeURIComponent(no)}`,
  },
  ptt: {
    label: "PTT Kargo",
    url: (no) => `https://gonderitakip.ptt.gov.tr/Track/Verify?q=${encodeURIComponent(no)}`,
  },
  hepsijet: {
    label: "HepsiJET",
    url: (no) => `https://www.hepsijet.com/gonderi-takibi/${encodeURIComponent(no)}`,
  },
  sendeo: {
    label: "Sendeo Kargo",
    url: (no) => `https://kargotakip.sendeo.com.tr/kargo-takip?takipNo=${encodeURIComponent(no)}`,
  },
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { orderNumber?: string; email?: string };
  const rawOrderNumber = String(body.orderNumber ?? "").trim();
  const cleanOrderNumber = rawOrderNumber.replace(/^#/, "");
  const email = String(body.email ?? "").trim().toLowerCase();

  if (!cleanOrderNumber || !email.includes("@")) {
    return Response.json({ error: "Sipariş numarası ve geçerli e-posta adresi gereklidir." }, { status: 400 });
  }

  try {
    const db = getDb();

    // Query D1 database for the matching order
    const order = await db
      .prepare(
        `SELECT * FROM orders 
         WHERE LOWER(email) = ? 
         AND (
           order_number = ? 
           OR order_number = ? 
           OR id = ? 
           OR order_number LIKE ?
         ) 
         LIMIT 1`
      )
      .bind(
        email,
        cleanOrderNumber,
        `MRL-${cleanOrderNumber}`,
        cleanOrderNumber,
        `%${cleanOrderNumber}`
      )
      .first<any>();

    if (!order) {
      return Response.json(
        { error: "Girdiğiniz bilgilere ait sipariş bulunamadı. Lütfen e-posta adresinizi ve sipariş numaranızı kontrol ediniz." },
        { status: 404 }
      );
    }

    // Fetch order items
    const { results: items } = await db
      .prepare(
        `SELECT id, order_id, product_id, sku, name, unit_price, quantity, configuration 
         FROM order_items WHERE order_id = ?`
      )
      .bind(order.id)
      .all<any>();

    const companyKey = (order.cargo_company || "").toLowerCase();
    const cargoMeta = CARGO_COMPANIES[companyKey] || {
      label: order.cargo_company || "Kargo Firması Belirtilmedi",
      url: (no: string) => order.tracking_url || `https://www.google.com/search?q=${encodeURIComponent(no)}`,
    };

    const trackingNumber = order.tracking_number || null;
    const trackingUrl = trackingNumber ? (order.tracking_url || cargoMeta.url(trackingNumber)) : null;

    let liveStatus = "Sipariş Alındı";
    if (order.status === "shipped") {
      liveStatus = `Kargoya Verildi - Taşıma Durumunda (${cargoMeta.label})`;
    } else if (order.status === "delivered") {
      liveStatus = "Teslim Edildi";
    } else if (order.status === "processing") {
      liveStatus = "Üretim / Hazırlık Aşamasında";
    } else if (order.status === "measure_ok") {
      liveStatus = "Ölçü Onaylandı";
    } else if (order.status === "awaiting_measurement") {
      liveStatus = "Ölçü Teyidi Bekleniyor";
    }

    const orderPayload: OrderPayload = {
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      payment_status: order.payment_status || "pending",
      payment_method: order.payment_method || "bank_transfer",
      subtotal: (order.subtotal || 0) / 100,
      discount_amount: 0,
      shipping_cost: (order.shipping || 0) / 100,
      total: (order.total || 0) / 100,
      formatted_total: new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format((order.total || 0) / 100),
      shipping_address: {
        name: order.customer_name,
        phone: order.phone,
        city: order.city || "",
        district: order.district || "",
        neighborhood: null,
        full_address: order.shipping_address,
        zip_code: null,
      },
      items: (items || []).map((it) => ({
        id: it.id,
        product_id: it.product_id,
        product_name: it.name,
        variant_label: null,
        sku: it.sku,
        unit_price: (it.unit_price || 0) / 100,
        quantity: it.quantity || 1,
        subtotal: ((it.unit_price || 0) * (it.quantity || 1)) / 100,
        configuration: it.configuration,
      })),
      notes: order.notes || null,
      cargo_company: order.cargo_company,
      cargo_company_label: cargoMeta.label,
      tracking_number: trackingNumber,
      tracking_url: trackingUrl,
      created_at: order.created_at,
    };

    const cargoPayload: CargoTrackPayload = {
      company: order.cargo_company || null,
      company_label: cargoMeta.label,
      tracking_number: trackingNumber,
      tracking_url: trackingUrl,
      live_status: liveStatus,
      events: trackingNumber
        ? [
            {
              date: order.updated_at,
              description: `${cargoMeta.label} transfer merkezine teslim edildi / çıkış yapıldı.`,
            },
            {
              date: order.created_at,
              description: "Kargo gönderi takip fişi oluşturuldu.",
            },
          ]
        : [],
      source: "d1",
    };

    return Response.json({
      order: orderPayload,
      cargo: cargoPayload,
    });
  } catch (err) {
    console.error("Local db order tracking error:", err);
    return Response.json(
      { error: "Sipariş takip sorgulanırken teknik bir sorun oluştu." },
      { status: 500 }
    );
  }
}
