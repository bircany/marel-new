import { getOrderDetailsById } from "@/db";
import type { CargoTrackPayload } from "@/app/api/orders/track/route";

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

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  if (!rawId) return Response.json({ error: "Geçersiz sipariş." }, { status: 400 });

  try {
    const order = await getOrderDetailsById(rawId);
    if (!order) {
      return Response.json({ error: "Sipariş bulunamadı." }, { status: 404 });
    }

    const companyKey = (order.cargoCompany || "").toLowerCase();
    const cargoMeta = CARGO_COMPANIES[companyKey] || {
      label: order.cargoCompany || "Kargo Firması Belirtilmedi",
      url: (no: string) => order.trackingUrl || `https://www.google.com/search?q=${encodeURIComponent(no)}`,
    };

    const trackingNumber = order.trackingNumber || null;
    const trackingUrl = trackingNumber ? (order.trackingUrl || cargoMeta.url(trackingNumber)) : null;

    let liveStatus = "Sipariş Alındı";
    if (order.status === "shipped") {
      liveStatus = `Kargoya Verildi - Taşıma Durumunda (${cargoMeta.label})`;
    } else if (order.status === "delivered") {
      liveStatus = "Teslim Edildi";
    } else if (order.status === "processing") {
      liveStatus = "Üretim / Hazırlık Aşamasında";
    } else if (order.status === "measure_ok") {
      liveStatus = "Ölçü Teyit Edildi";
    } else if (order.status === "awaiting_measurement") {
      liveStatus = "Ölçü Teyidi Bekleniyor";
    }

    const payload: CargoTrackPayload = {
      company: order.cargoCompany || null,
      company_label: cargoMeta.label,
      tracking_number: trackingNumber,
      tracking_url: trackingUrl,
      live_status: liveStatus,
      events: trackingNumber
        ? [
            {
              date: order.updatedAt,
              description: `${cargoMeta.label} transfer merkezine teslim edildi / çıkış yapıldı.`,
            },
            {
              date: order.createdAt,
              description: "Sipariş kaydı ve kargo fişi oluşturuldu.",
            },
          ]
        : [],
      source: "d1",
    };

    return Response.json(payload);
  } catch (error) {
    console.error("Cargo track error:", error);
    return Response.json({ error: "Kargo bilgisi alınamadı." }, { status: 500 });
  }
}
