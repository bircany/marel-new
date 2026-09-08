"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/app/lib/commerce";
import { CARGO_PROVIDERS, cargoLabel, cargoTrackingUrl, type CargoCompany } from "@/app/lib/cargo";
import type { OrderRecord } from "@/db";

const ORDER_STATUSES = [
  { value: "pending", label: "Sipariş Alındı" },
  { value: "awaiting_measurement", label: "Ölçü Onayı Bekliyor" },
  { value: "measure_ok", label: "Ölçü Onaylandı" },
  { value: "processing", label: "Üretimde / Hazırlanıyor" },
  { value: "shipped", label: "Kargoya Verildi" },
  { value: "delivered", label: "Teslim Edildi" },
  { value: "cancelled", label: "İptal Edildi" },
  { value: "refunded", label: "İade Edildi" },
];

const PAYMENT_STATUSES = [
  { value: "pending", label: "Ödeme Bekleniyor" },
  { value: "paid", label: "Ödendi (Onaylandı)" },
  { value: "refunded", label: "İade Edildi" },
];

interface OrderDetailClientProps {
  order: OrderRecord;
}

export function OrderDetailClient({ order: initialOrder }: OrderDetailClientProps) {
  const router = useRouter();
  const [order, setOrder] = useState<OrderRecord>(initialOrder);
  const [status, setStatus] = useState(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus || "pending");
  const [cargoCompany, setCargoCompany] = useState<CargoCompany>((order.cargoCompany as CargoCompany) || "mng");
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
  const [notes, setNotes] = useState(order.notes || "");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Live tracking URL preview
  const liveTrackingUrl = trackingNumber.trim()
    ? cargoTrackingUrl(cargoCompany, trackingNumber.trim())
    : null;

  // Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);

    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          paymentStatus,
          cargoCompany,
          trackingNumber: trackingNumber.trim() || undefined,
          note: notes.trim(),
        }),
      });

      const data = (await res.json()) as any;
      if (!res.ok) throw new Error(data?.error || "Güncelleme başarısız.");

      if (data.order) {
        setOrder(data.order);
      }
      setToast({ type: "success", text: "Sipariş ve kargo bilgileri başarıyla güncellendi!" });
      router.refresh();
    } catch (err) {
      setToast({ type: "error", text: err instanceof Error ? err.message : "Kayıt sırasında hata oluştu." });
    } finally {
      setLoading(false);
    }
  };

  // WhatsApp 1: Workshop cutting list
  const sendWhatsAppWorkshop = () => {
    const itemsLines = (order.items || []).map((it, idx) => {
      let cfgText = "";
      try {
        const cfg = typeof it.configuration === "string" ? JSON.parse(it.configuration) : it.configuration || {};
        const w = cfg.width || cfg.en;
        const h = cfg.height || cfg.boy;
        const area = cfg.areaM2 || (w && h ? ((w * h) / 10000).toFixed(2) : null);
        const fabric = cfg.fabricColor || cfg.fabric || cfg.kumas || "Standart";
        const profile = cfg.profileColor || cfg.profil || "Standart";
        const mech = cfg.mechanism || cfg.mekanizma || "Standart";
        cfgText = `\n   📏 Ölçü: ${w || "?"} x ${h || "?"} cm ${area ? `(${area} m²)` : ""}\n   🎨 Kumaş Kodu/Rengi: ${fabric}\n   🔩 Alüminyum Profil: ${profile}\n   ⚙️ Mekanizma/Sistem: ${mech}`;
      } catch {}
      return `📌 *KALEM ${idx + 1}:* ${it.name}\n   Adet: ${it.quantity}${cfgText}`;
    }).join("\n\n");

    const text = `*🧵 MAREL PLİSE PERDE - İMALAT KESİM LİSTESİ*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `*Sipariş No:* #${order.orderNumber}\n` +
      `*Müşteri:* ${order.customerName}\n` +
      `*Teslim Bölgesi:* ${order.district ? `${order.district} / ` : ""}${order.city || "Belirtilmedi"}\n` +
      `*Müşteri Notu:* ${order.notes || "Yok"}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `*İMAL EDİLECEK PERDE KALEMLERİ:*\n\n` +
      `${itemsLines || "Özel konfigürasyon belirtilmedi"}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Lütfen kumaş stok ve kasa kesim ölçülerini kontrol ediniz.`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  // WhatsApp 2: Customer shipment / status notice
  const sendWhatsAppCustomer = () => {
    const rawPhone = (order.phone || "").replace(/[^0-9]/g, "");
    if (!rawPhone) return alert("Müşteri telefon numarası bulunamadı.");
    const cleanPhone = rawPhone.startsWith("0") ? `9${rawPhone}` : rawPhone.startsWith("90") ? rawPhone : `90${rawPhone}`;

    let msg = `Merhaba Sn. ${order.customerName},\n\n` +
      `Marel Plise Perde siparişiniz (*#${order.orderNumber}*) hakkında bilgilendirme:\n\n`;

    if (status === "shipped" && trackingNumber.trim()) {
      const company = cargoLabel(cargoCompany);
      msg += `📦 Siparişiniz *${company}* firmasına teslim edilmiştir.\n` +
        `🔎 *Kargo Takip No:* ${trackingNumber.trim()}\n` +
        (liveTrackingUrl ? `🔗 *Canlı Takip:* ${liveTrackingUrl}\n\n` : "\n") +
        `Kargonuz en kısa sürede adresinize ulaştırılacaktır.`;
    } else if (status === "awaiting_measurement") {
      msg += `📐 Vermiş olduğunuz plise perde siparişinizin imalata girmeden önce en-boy ölçü teyidi gerekmektedir. Size en uygun zamanda bilgi vermenizi rica ederiz.`;
    } else if (status === "measure_ok" || status === "processing") {
      msg += `⚙️ Ölçüleriniz onaylanmış olup perdeleriniz atölyemizde imalat aşamasındadır.`;
    } else if (status === "delivered") {
      msg += `🎉 Siparişiniz teslim edilmiştir. Marel Plise Perde'yi tercih ettiğiniz için teşekkür eder, keyifle kullanmanızı dileriz!`;
    } else {
      msg += `Siparişiniz başarıyla alınmış olup üretim planlamasına dahil edilmiştir.`;
    }

    msg += `\n\nHerhangi bir sorunuzda bu hat üzerinden bizimle iletişime geçebilirsiniz.\n*Marel Plise Perde*`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 60 }}>
      {/* Toast */}
      {toast && (
        <div
          style={{
            padding: "12px 20px",
            borderRadius: 8,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: toast.type === "success" ? "#dcfce7" : "#fee2e2",
            color: toast.type === "success" ? "#15803d" : "#b91c1c",
            border: `1px solid ${toast.type === "success" ? "#86efac" : "#fca5a5"}`,
            fontWeight: 500,
          }}
        >
          <span>{toast.text}</span>
          <button
            onClick={() => setToast(null)}
            style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header Navigation */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link
            href="/admin/siparisler"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 8,
              backgroundColor: "#ffffff",
              border: "1px solid #cbd5e1",
              color: "#334155",
              fontSize: "0.85rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            ← Sipariş Listesine Dön
          </Link>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.4rem", color: "#0f172a", display: "flex", alignItems: "center", gap: 10 }}>
              Sipariş #{order.orderNumber}
            </h1>
            <small style={{ color: "#64748b" }}>
              Oluşturulma:{" "}
              {new Date(order.createdAt).toLocaleString("tr-TR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </small>
          </div>
        </div>

        {/* WhatsApp Actions Header */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={sendWhatsAppWorkshop}
            style={{
              backgroundColor: "#065f46",
              color: "#ecfdf5",
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            🏢 İmalat / Atölye WhatsApp
          </button>
          <button
            type="button"
            onClick={sendWhatsAppCustomer}
            style={{
              backgroundColor: "#16a34a",
              color: "#ffffff",
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            💬 Müşteriye WhatsApp Gönder
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* LEFT COLUMN: Order Items & Pricing Breakdown */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Plise Items Table Card */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <h2 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", color: "#0f172a" }}>
              Perde Kalemleri & Özel Ölçüler
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {(order.items || []).map((item, index) => {
                let cfg: any = {};
                try {
                  cfg = typeof item.configuration === "string" ? JSON.parse(item.configuration) : item.configuration || {};
                } catch {}

                const width = cfg.width || cfg.en || null;
                const height = cfg.height || cfg.boy || null;
                const area = cfg.areaM2 || (width && height ? ((width * height) / 10000).toFixed(2) : null);
                const fabric = cfg.fabricColor || cfg.fabric || cfg.kumas || null;
                const profile = cfg.profileColor || cfg.profil || null;
                const mechanism = cfg.mechanism || cfg.mekanizma || null;

                return (
                  <div
                    key={item.id}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 10,
                      padding: "16px",
                      backgroundColor: "#f8fafc",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 10,
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: "1rem", color: "#0f172a" }}>
                          {index + 1}. {item.name}
                        </strong>
                        {item.sku && (
                          <span
                            style={{
                              marginLeft: 8,
                              fontSize: "0.75rem",
                              backgroundColor: "#e2e8f0",
                              color: "#475569",
                              padding: "2px 6px",
                              borderRadius: 4,
                            }}
                          >
                            {item.sku}
                          </span>
                        )}
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "1.05rem" }}>
                          {formatMoney(item.unitPrice * item.quantity, order.currency)}
                        </div>
                        <small style={{ color: "#64748b" }}>
                          {item.quantity} Adet x {formatMoney(item.unitPrice, order.currency)}
                        </small>
                      </div>
                    </div>

                    {/* Plise Specification Badges Grid */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                        gap: 8,
                        backgroundColor: "#ffffff",
                        padding: "12px",
                        borderRadius: 8,
                        border: "1px solid #e2e8f0",
                        fontSize: "0.82rem",
                      }}
                    >
                      <div>
                        <span style={{ color: "#64748b", display: "block", fontSize: "0.72rem" }}>ÖLÇÜLER (En x Boy)</span>
                        <strong style={{ color: "#0f172a" }}>
                          {width && height ? `${width} x ${height} cm` : "Standart"}
                        </strong>
                        {area && <small style={{ color: "#0284c7", display: "block" }}>{area} m²</small>}
                      </div>

                      <div>
                        <span style={{ color: "#64748b", display: "block", fontSize: "0.72rem" }}>KUMAŞ TÜRÜ & RENK</span>
                        <strong style={{ color: "#0f172a" }}>{fabric || "Belirtilmedi"}</strong>
                      </div>

                      <div>
                        <span style={{ color: "#64748b", display: "block", fontSize: "0.72rem" }}>PROFİL RENGİ</span>
                        <strong style={{ color: "#0f172a" }}>{profile || "Belirtilmedi"}</strong>
                      </div>

                      <div>
                        <span style={{ color: "#64748b", display: "block", fontSize: "0.72rem" }}>MEKANİZMA / SİSTEM</span>
                        <strong style={{ color: "#0f172a" }}>{mechanism || "İpli Plise"}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Financial Summary */}
            <div
              style={{
                marginTop: 20,
                paddingTop: 16,
                borderTop: "2px dashed #e2e8f0",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                fontSize: "0.9rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
                <span>Ara Toplam:</span>
                <span>{formatMoney(order.subtotal, order.currency)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
                <span>Kargo Bedeli:</span>
                <span>{order.shipping > 0 ? formatMoney(order.shipping, order.currency) : "Ücretsiz Kargo"}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "1.2rem",
                  fontWeight: 800,
                  color: "#0f172a",
                  paddingTop: 8,
                  borderTop: "1px solid #e2e8f0",
                }}
              >
                <span>Genel Toplam:</span>
                <span style={{ color: "#16a34a" }}>{formatMoney(order.total, order.currency)}</span>
              </div>
            </div>
          </div>

          {/* Customer & Operation Notes */}
          {order.notes && (
            <div
              style={{
                backgroundColor: "#fffbeb",
                border: "1px solid #fef3c7",
                borderRadius: 10,
                padding: "16px 20px",
              }}
            >
              <strong style={{ color: "#92400e", display: "block", marginBottom: 4, fontSize: "0.85rem" }}>
                📝 MÜŞTERİ SİPARİŞ NOTU:
              </strong>
              <p style={{ margin: 0, color: "#78350f", fontSize: "0.9rem" }}>{order.notes}</p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Customer Details & Cargo Update Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Customer & Address Card */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <h2 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", color: "#0f172a" }}>
              Teslimat & İletişim Bilgileri
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: "0.9rem" }}>
              <div>
                <small style={{ color: "#64748b", display: "block" }}>Alıcı Ad Soyad</small>
                <strong style={{ color: "#0f172a", fontSize: "1rem" }}>{order.customerName}</strong>
              </div>

              <div>
                <small style={{ color: "#64748b", display: "block" }}>Telefon Numarası</small>
                <a
                  href={`tel:${order.phone}`}
                  style={{ color: "#0284c7", fontWeight: 600, textDecoration: "none" }}
                >
                  📞 {order.phone}
                </a>
              </div>

              <div>
                <small style={{ color: "#64748b", display: "block" }}>E-posta Adresi</small>
                <a
                  href={`mailto:${order.email}`}
                  style={{ color: "#334155", textDecoration: "none" }}
                >
                  ✉️ {order.email}
                </a>
              </div>

              <div>
                <small style={{ color: "#64748b", display: "block" }}>İl / İlçe</small>
                <span style={{ color: "#0f172a", fontWeight: 500 }}>
                  📍 {order.district ? `${order.district} / ` : ""}{order.city || "Belirtilmedi"}
                </span>
              </div>

              <div>
                <small style={{ color: "#64748b", display: "block" }}>Açık Teslimat Adresi</small>
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    color: "#1e293b",
                    marginTop: 4,
                  }}
                >
                  {order.shippingAddress || "Adres girilmedi"}
                </div>
              </div>
            </div>
          </div>

          {/* Cargo & Order Management Form */}
          <form
            onSubmit={handleSave}
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <h2 style={{ margin: 0, fontSize: "1.1rem", color: "#0f172a" }}>
              Sipariş & Kargo Yönetimi
            </h2>

            {/* Status Selector */}
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                Sipariş Durumu
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  fontSize: "0.9rem",
                  backgroundColor: "#ffffff",
                }}
              >
                {ORDER_STATUSES.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Status Selector */}
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                Ödeme Durumu ({order.paymentMethod === "bank_transfer" ? "Havale/EFT" : order.paymentMethod || "Standart"})
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  fontSize: "0.9rem",
                  backgroundColor: "#ffffff",
                }}
              >
                {PAYMENT_STATUSES.map((pst) => (
                  <option key={pst.value} value={pst.value}>
                    {pst.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Cargo Provider Selector */}
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                Kargo Şirketi
              </label>
              <select
                value={cargoCompany}
                onChange={(e) => setCargoCompany(e.target.value as CargoCompany)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  fontSize: "0.9rem",
                  backgroundColor: "#ffffff",
                }}
              >
                {CARGO_PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tracking Number Input */}
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                Kargo Takip Numarası
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Örn: 12345678901"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  fontSize: "0.9rem",
                  boxSizing: "border-box",
                }}
              />
              {liveTrackingUrl && (
                <div style={{ marginTop: 6 }}>
                  <a
                    href={liveTrackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: "#0284c7",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      textDecoration: "underline",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    ↗ {cargoLabel(cargoCompany)} Canlı Takip Sayfasını Aç
                  </a>
                </div>
              )}
            </div>

            {/* Internal Notes */}
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                Yönetici & Operasyon Notu
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="İmalat durumu, müşteriyle görüşme veya özel teslimat notları..."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  fontSize: "0.85rem",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: "#0f172a",
                color: "#ffffff",
                padding: "12px 20px",
                borderRadius: 8,
                border: "none",
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: 8,
                transition: "opacity 0.2s",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Kaydediliyor..." : "Sipariş & Kargo Bilgilerini Güncelle"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
