"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatMoney } from "@/app/lib/commerce";

export function KamatasFeatures() {
  return (
    <section className="kamatas-features-section" style={{ background: "#ffffff", borderTop: "1px solid #f1f3f5", padding: "40px 0" }}>
      <div className="shop-container">
        <div className="kamatas-features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
          <div className="kamatas-feature-item" style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", background: "#f9fafb", borderRadius: 12 }}>
            <div className="kamatas-feature-icon" style={{ color: "#d97706", flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" width="32" height="32">
                <path d="M20 12V22H4V12" />
                <path d="M22 7H2V12H22V7Z" />
                <path d="M12 22V7" />
                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
              </svg>
            </div>
            <h3 style={{ fontSize: "0.86rem", fontWeight: 800, color: "#111827", margin: 0, lineHeight: 1.4 }}>
              1000 TL VE ÜZERİ SİPARİŞLERDE ÜCRETSİZ KARGO
            </h3>
          </div>
          <div className="kamatas-feature-item" style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", background: "#f9fafb", borderRadius: 12 }}>
            <div className="kamatas-feature-icon" style={{ color: "#2563eb", flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" width="32" height="32">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <h3 style={{ fontSize: "0.86rem", fontWeight: 800, color: "#111827", margin: 0, lineHeight: 1.4 }}>
              10-15 GÜN ÖZEL ATÖLYE TERMİN SÜRESİ
            </h3>
          </div>
          <div className="kamatas-feature-item" style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", background: "#f9fafb", borderRadius: 12 }}>
            <div className="kamatas-feature-icon" style={{ color: "#10b981", flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" width="32" height="32">
                <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9m-9 9a9 9 0 0 1 9-9" />
              </svg>
            </div>
            <h3 style={{ fontSize: "0.86rem", fontWeight: 800, color: "#111827", margin: 0, lineHeight: 1.4 }}>
              15 GÜN İÇİNDE İADE & MÜŞTERİ MEMNUNİYETİ
            </h3>
          </div>
        </div>
      </div>
    </section>
  );
}

const statusLabels: Record<string, { label: string; bg: string; color: string }> = {
  pending: { label: "Sipariş Alındı", bg: "#fef3c7", color: "#b45309" },
  awaiting_measurement: { label: "Ölçü Onayı Bekleniyor", bg: "#e0e7ff", color: "#3730a3" },
  measure_ok: { label: "Ölçü Onaylandı", bg: "#dbeafe", color: "#1e40af" },
  processing: { label: "Üretimde", bg: "#dcfce7", color: "#166534" },
  shipped: { label: "Kargoya Verildi (Yurtiçi Kargo)", bg: "#ecfdf5", color: "#065f46" },
  delivered: { label: "Teslim Edildi", bg: "#d1fae5", color: "#047857" },
  cancelled: { label: "İptal Edildi", bg: "#fee2e2", color: "#b91c1c" },
};

export function KamatasOrderTracking() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewResult, setPreviewResult] = useState<any | null>(null);

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    let cleanOrder = orderNumber.trim();
    if (cleanOrder.startsWith("#")) cleanOrder = cleanOrder.slice(1);

    if (!cleanEmail || !cleanOrder) {
      // If user clicked button without filling fields, redirect to tracking page directly
      router.push("/siparis-takip");
      return;
    }

    setLoading(true);
    setError("");
    setPreviewResult(null);

    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, orderNumber: cleanOrder }),
      });

      const data = (await res.json()) as { error?: string; [key: string]: unknown };
      if (!res.ok || data.error) {
        setError(data.error || "Girdiğiniz bilgilere ait sipariş bulunamadı. Lütfen e-posta ve sipariş numaranızı kontrol ediniz.");
      } else {
        setPreviewResult(data as any);
      }
    } catch {
      setError("Bağlantı hatası oluştu. Lütfen tekrar deneyiniz.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="order-track kamatas-order-track" id="takip" style={{ background: "#0f172a", color: "#ffffff", padding: "70px 0" }}>
      <div className="shop-container">
        <div style={{ maxWidth: 840, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 35 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.3)", borderRadius: 30, padding: "6px 16px", marginBottom: 12 }}>
              {/* Yurtiçi Kargo Mini Logo Icon */}
              <svg viewBox="0 0 120 30" width="90" height="24" fill="none">
                <rect width="120" height="30" rx="4" fill="#003580"/>
                <path d="M12 5 L22 15 L12 25 L8 21 L14 15 L8 9 Z" fill="#FFCC00"/>
                <path d="M18 5 L28 15 L18 25 L14 21 L20 15 L14 9 Z" fill="#ED1C24"/>
                <text x="32" y="20" fill="#ffffff" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="11" letterSpacing="0.5">YURTİÇİ KARGO</text>
              </svg>
              <span style={{ color: "#38bdf8", fontSize: "0.78rem", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                CANLI ENTEGRASYON
              </span>
            </div>
            <h2 style={{ fontSize: "2rem", fontWeight: 900, color: "#ffffff", margin: "6px 0 10px" }}>
              Sipariş & Kargo Takibi
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "0.94rem", maxWidth: 580, margin: "0 auto" }}>
              Siparişinizin atölye üretim aşamasını ve Yurtiçi Kargo gönderinizi tek tıkla canlı sorgulayın.
            </p>
          </div>

          <div
            style={{
              background: "#1e293b",
              borderRadius: 18,
              padding: "36px 32px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
              border: "1px solid #334155",
            }}
          >
            <form onSubmit={handleTrackSubmit}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: 20,
                  marginBottom: 24,
                }}
              >
                <div>
                  <label htmlFor="track-email" style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 8 }}>
                    E-posta Adresiniz
                  </label>
                  <input
                    id="track-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@mail.com"
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      borderRadius: 10,
                      background: "#0f172a",
                      border: "1px solid #475569",
                      color: "#ffffff",
                      fontSize: "0.92rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label htmlFor="track-order" style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 8 }}>
                    Sipariş No (xxxx veya ORD-...)
                  </label>
                  <input
                    id="track-order"
                    name="order"
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="Örn: ORD-20260906-00001"
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      borderRadius: 10,
                      background: "#0f172a",
                      border: "1px solid #475569",
                      color: "#ffffff",
                      fontSize: "0.92rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {error && (
                <div style={{ padding: "12px 16px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", color: "#fca5a5", borderRadius: 8, fontSize: "0.84rem", marginBottom: 20 }}>
                  {error}
                </div>
              )}

              {/* Action Buttons - Clean 2-column flex row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, width: "100%" }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "15px 24px",
                    borderRadius: 10,
                    background: "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)",
                    transition: "background 0.2s ease, transform 0.1s ease",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "#1d4ed8")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "#2563eb")}
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  {loading ? "Sorgulanıyor..." : "Siparişinizi Takip Edin"}
                </button>

                <Link
                  href="/siparis-takip"
                  style={{
                    padding: "15px 24px",
                    borderRadius: 10,
                    background: "rgba(255, 255, 255, 0.05)",
                    color: "#e2e8f0",
                    border: "1.5px solid #475569",
                    fontWeight: 700,
                    fontSize: "0.92rem",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "all 0.2s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = "#38bdf8";
                    e.currentTarget.style.color = "#38bdf8";
                    e.currentTarget.style.background = "rgba(56, 189, 248, 0.08)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "#475569";
                    e.currentTarget.style.color = "#e2e8f0";
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                  }}
                >
                  Detaylı Takip Sayfasına Git ↗
                </Link>
              </div>
            </form>

            {/* Instant Live Preview Box */}
            {previewResult && (
              <div
                style={{
                  marginTop: 26,
                  padding: "22px 24px",
                  background: "#0f172a",
                  borderRadius: 12,
                  border: "1.5px solid #38bdf8",
                  animation: "fadeIn 0.3s ease",
                }}
              >
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid #1e293b", paddingBottom: 14 }}>
                  <div>
                    <span style={{ color: "#94a3b8", fontSize: "0.76rem" }}>Sipariş Numarası</span>
                    <h3 style={{ margin: "2px 0 0", fontSize: "1.2rem", fontWeight: 900, color: "#ffffff" }}>
                      {previewResult.order.order_number}
                    </h3>
                  </div>
                  {(() => {
                    const st = statusLabels[previewResult.order.status] || {
                      label: previewResult.order.status,
                      bg: "#334155",
                      color: "#f8fafc",
                    };
                    return (
                      <span style={{ padding: "6px 14px", borderRadius: 20, background: st.bg, color: st.color, fontSize: "0.82rem", fontWeight: 800 }}>
                        {st.label}
                      </span>
                    );
                  })()}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 18 }}>
                  <div>
                    <small style={{ color: "#94a3b8", display: "block", fontSize: "0.72rem" }}>Müşteri</small>
                    <strong style={{ color: "#e2e8f0", fontSize: "0.88rem" }}>{previewResult.order.customer_name || email}</strong>
                  </div>
                  <div>
                    <small style={{ color: "#94a3b8", display: "block", fontSize: "0.72rem" }}>Toplam Tutar</small>
                    <strong style={{ color: "#e2e8f0", fontSize: "0.88rem" }}>
                      {previewResult.order.formatted_total ||
                        formatMoney(
                          previewResult.order.total > 10000
                            ? previewResult.order.total
                            : Math.round(previewResult.order.total * 100)
                        )}
                    </strong>
                  </div>
                  <div>
                    <small style={{ color: "#94a3b8", display: "block", fontSize: "0.72rem" }}>Kargo Şirketi</small>
                    <strong style={{ color: "#38bdf8", fontSize: "0.88rem" }}>Yurtiçi Kargo</strong>
                  </div>
                  <div>
                    <small style={{ color: "#94a3b8", display: "block", fontSize: "0.72rem" }}>Takip Numarası</small>
                    <strong style={{ color: "#f59e0b", fontSize: "0.88rem" }}>
                      {previewResult.cargo?.tracking_number || "Hazırlanıyor"}
                    </strong>
                  </div>
                </div>

                {/* Direct Yurtiçi Action or Redirect Button */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", paddingTop: 12, borderTop: "1px solid #1e293b" }}>
                  {previewResult.cargo?.tracking_url ? (
                    <a
                      href={previewResult.cargo.tracking_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: "9px 18px",
                        borderRadius: 8,
                        background: "#0284c7",
                        color: "#ffffff",
                        fontSize: "0.82rem",
                        fontWeight: 800,
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      📦 Yurtiçi Kargo Canlı Takip ↗
                    </a>
                  ) : null}

                  <Link
                    href={`/siparis-takip?order=${encodeURIComponent(previewResult.order.order_number)}&email=${encodeURIComponent(email)}`}
                    style={{
                      padding: "9px 18px",
                      borderRadius: 8,
                      background: "#334155",
                      color: "#ffffff",
                      fontSize: "0.82rem",
                      fontWeight: 750,
                      textDecoration: "none",
                    }}
                  >
                    Tüm Detayları Gör →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
