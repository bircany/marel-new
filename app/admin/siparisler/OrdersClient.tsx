"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/app/lib/commerce";
import { CARGO_PROVIDERS, cargoLabel, cargoTrackingUrl } from "@/app/lib/cargo";
import type { OrderRecord } from "@/db";

const ORDER_STATUS_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  pending: { label: "Sipariş Alındı", bg: "#fef3c7", color: "#92400e" },
  awaiting_measurement: { label: "Ölçü Onayı Bekliyor", bg: "#fef9c3", color: "#854d0e" },
  measure_ok: { label: "Ölçü Onaylandı", bg: "#dbeafe", color: "#1e40af" },
  processing: { label: "Üretimde", bg: "#e0e7ff", color: "#3730a3" },
  shipped: { label: "Kargoya Verildi", bg: "#cffafe", color: "#155e75" },
  delivered: { label: "Teslim Edildi", bg: "#dcfce7", color: "#166534" },
  cancelled: { label: "İptal Edildi", bg: "#fee2e2", color: "#991b1b" },
  refunded: { label: "İade Edildi", bg: "#f3e8ff", color: "#6b21a8" },
};

interface OrdersClientProps {
  initialOrders: OrderRecord[];
}

export function OrdersClient({ initialOrders }: OrdersClientProps) {
  const [orders, setOrders] = useState<OrderRecord[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  // Summary counts
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "pending" || o.status === "awaiting_measurement").length;
    const processing = orders.filter((o) => o.status === "processing" || o.status === "measure_ok").length;
    const shipped = orders.filter((o) => o.status === "shipped").length;
    const delivered = orders.filter((o) => o.status === "delivered").length;
    const revenue = orders
      .filter((o) => o.status !== "cancelled" && o.status !== "refunded")
      .reduce((sum, o) => sum + (o.total || 0), 0);

    return { total, pending, processing, shipped, delivered, revenue };
  }, [orders]);

  // Filtered orders
  const filtered = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) return false;
      if (paymentFilter !== "all" && (order.paymentStatus || "pending") !== paymentFilter) return false;

      if (!search.trim()) return true;
      const q = search.toLowerCase().trim();
      const matchNo = (order.orderNumber || "").toLowerCase().includes(q);
      const matchName = (order.customerName || "").toLowerCase().includes(q);
      const matchPhone = (order.phone || "").includes(q);
      const matchEmail = (order.email || "").toLowerCase().includes(q);
      const matchCity = (order.city || "").toLowerCase().includes(q) || (order.district || "").toLowerCase().includes(q);
      const matchTracking = (order.trackingNumber || "").toLowerCase().includes(q);

      return matchNo || matchName || matchPhone || matchEmail || matchCity || matchTracking;
    });
  }, [orders, statusFilter, paymentFilter, search]);

  const sendWhatsAppCustomer = (order: OrderRecord) => {
    const rawPhone = (order.phone || "").replace(/[^0-9]/g, "");
    if (!rawPhone) return alert("Müşteri telefon numarası bulunamadı.");
    const cleanPhone = rawPhone.startsWith("0") ? `9${rawPhone}` : rawPhone.startsWith("90") ? rawPhone : `90${rawPhone}`;

    let msg = `Merhaba Sn. ${order.customerName},\n` +
      `Marel Plise Perde'den verdiğiniz #${order.orderNumber} numaralı siparişiniz hakkında bilgilendirme:\n`;

    if (order.status === "shipped" && order.trackingNumber) {
      const company = cargoLabel(order.cargoCompany);
      const link = order.trackingUrl || cargoTrackingUrl(order.cargoCompany, order.trackingNumber);
      msg += `Siparişiniz ${company} ile kargoya verilmiştir.\n` +
        `Takip No: ${order.trackingNumber}\n` +
        (link ? `Kargo Takip Linki: ${link}\n` : "");
    } else if (order.status === "awaiting_measurement") {
      msg += `Ölçü teyidiniz için sizi aramak istiyoruz. Uygun olduğunuzda bize yazabilir veya arayabilirsiniz.\n`;
    } else if (order.status === "processing") {
      msg += `Perdeleriniz imalat atölyemizde özenle üretilmektedir.\n`;
    } else {
      msg += `Siparişiniz alınmış olup işlemleriniz devam etmektedir.\n`;
    }

    msg += `\nBizi tercih ettiğiniz için teşekkür ederiz.\nMarel Plise Perde Destek`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const sendWhatsAppWorkshop = (order: OrderRecord) => {
    const itemsLines = (order.items || []).map((it, idx) => {
      let cfgText = "";
      try {
        const cfg = typeof it.configuration === "string" ? JSON.parse(it.configuration) : it.configuration || {};
        const w = cfg.width || cfg.en;
        const h = cfg.height || cfg.boy;
        const fabric = cfg.fabricColor || cfg.fabric || cfg.kumas || "Standart";
        const profile = cfg.profileColor || cfg.profil || "Standart";
        const mech = cfg.mechanism || cfg.mekanizma || "Standart";
        if (w && h) {
          cfgText = `\n   📏 Ölçü: ${w} x ${h} cm\n   🎨 Kumaş: ${fabric}\n   🔩 Profil: ${profile}\n   ⚙️ Sistem: ${mech}`;
        }
      } catch {}
      return `📌 *Kalem ${idx + 1}:* ${it.name} (${it.quantity} Adet)${cfgText}`;
    }).join("\n\n");

    const text = `*🧵 MAREL PLİSE PERDE - İMALAT KESİM EMRİ*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `*Sipariş No:* ${order.orderNumber}\n` +
      `*Müşteri:* ${order.customerName}\n` +
      `*Teslim Bölgesi:* ${order.district ? `${order.district} / ` : ""}${order.city || "Belirtilmedi"}\n` +
      `*Sipariş Notu:* ${order.notes || "Yok"}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `*ÜRETİLECEK PERDE KALEMLERİ:*\n\n` +
      `${itemsLines || "Özel ölçü belirtilmedi"}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Lütfen ölçü ve kumaş kodlarını teyit ediniz.`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div style={{ padding: "10px 0" }}>
      {/* Page Header */}
      <header className="admin-page-header">
        <div className="admin-page-header-left">
          <span>OPERASYON & LOJİSTİK</span>
          <h1>Sipariş Yönetimi</h1>
          <p>
            Tüm plise perde siparişlerini, özel en-boy ölçülerini, imalat durumlarını ve kargo gönderilerini buradan takip edip yönetin.
          </p>
        </div>
        <div className="admin-header-actions">
          <Link href="/admin?tab=cargo" className="admin-btn-secondary">
            🚚 Kargo Modülü
          </Link>
          <a
            href="https://web.whatsapp.com"
            target="_blank"
            rel="noreferrer"
            className="admin-btn-gold"
            style={{ textDecoration: "none" }}
          >
            💬 WhatsApp Web
          </a>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="admin-stats-grid" style={{ marginBottom: 24 }}>
        <div className="admin-stat-card">
          <small>Toplam Sipariş</small>
          <strong>{stats.total}</strong>
          <small style={{ color: "#38bdf8" }}>Tüm kayıtlar</small>
        </div>
        <div className="admin-stat-card">
          <small>Ölçü / Onay Bekleyen</small>
          <strong style={{ color: stats.pending > 0 ? "#f59e0b" : "#94a3b8" }}>{stats.pending}</strong>
          <small>Müşteri teyidi bekliyor</small>
        </div>
        <div className="admin-stat-card">
          <small>İmalat / Üretimde</small>
          <strong style={{ color: "#6366f1" }}>{stats.processing}</strong>
          <small>Atölyede hazırlananlar</small>
        </div>
        <div className="admin-stat-card">
          <small>Kargodaki Siparişler</small>
          <strong style={{ color: "#06b6d4" }}>{stats.shipped}</strong>
          <small>Yolda olan teslimatlar</small>
        </div>
        <div className="admin-stat-card">
          <small>Toplam Ciro</small>
          <strong style={{ color: "#22c55e", fontSize: "1.35rem" }}>{formatMoney(stats.revenue)}</strong>
          <small>Aktif sipariş toplamı</small>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="admin-toolbar" style={{ flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div className="admin-search-input" style={{ flex: "1 1 280px" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Sipariş no (#MRL-...), müşteri adı, telefon, e-posta veya kargo takip no ara..."
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="admin-select"
          style={{ minWidth: 180 }}
        >
          <option value="all">Tüm Durumlar ({orders.length})</option>
          <option value="pending">Sipariş Alındı</option>
          <option value="awaiting_measurement">Ölçü Onayı Bekliyor</option>
          <option value="measure_ok">Ölçü Onaylandı</option>
          <option value="processing">Üretimde / Hazırlanıyor</option>
          <option value="shipped">Kargoya Verildi</option>
          <option value="delivered">Teslim Edildi</option>
          <option value="cancelled">İptal Edildi</option>
          <option value="refunded">İade Edildi</option>
        </select>

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="admin-select"
          style={{ minWidth: 160 }}
        >
          <option value="all">Tüm Ödemeler</option>
          <option value="pending">Ödeme Bekliyor</option>
          <option value="paid">Ödendi</option>
          <option value="refunded">İade</option>
        </select>
      </div>

      {/* Orders List / Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filtered.length > 0 ? (
          filtered.map((order) => {
            const statusMeta = ORDER_STATUS_LABELS[order.status] || {
              label: order.status,
              bg: "#e2e8f0",
              color: "#334155",
            };

            const itemsCount = (order.items || []).reduce((acc, it) => acc + (it.quantity || 1), 0);
            const trackingUrl = order.trackingNumber
              ? order.trackingUrl || cargoTrackingUrl(order.cargoCompany, order.trackingNumber)
              : null;

            return (
              <div
                key={order.id}
                style={{
                  background: "#ffffff",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  padding: "18px 20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {/* Order Top Bar */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 10,
                    borderBottom: "1px solid #f1f5f9",
                    paddingBottom: 10,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontWeight: 700,
                        fontSize: "1rem",
                        color: "#0f172a",
                      }}
                    >
                      #{order.orderNumber}
                    </span>
                    <span
                      style={{
                        backgroundColor: statusMeta.bg,
                        color: statusMeta.color,
                        padding: "3px 10px",
                        borderRadius: 999,
                        fontSize: "0.78rem",
                        fontWeight: 600,
                      }}
                    >
                      {statusMeta.label}
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                      {new Date(order.createdAt).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>
                      {formatMoney(order.total, order.currency)}
                    </span>
                    <Link
                      href={`/admin/siparisler/${order.id}`}
                      style={{
                        backgroundColor: "#0f172a",
                        color: "#ffffff",
                        padding: "6px 14px",
                        borderRadius: 8,
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      Detay / Yönet →
                    </Link>
                  </div>
                </div>

                {/* Order Body Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: 16,
                    fontSize: "0.85rem",
                  }}
                >
                  {/* Customer Info */}
                  <div>
                    <div style={{ color: "#64748b", fontSize: "0.75rem", marginBottom: 2 }}>MÜŞTERİ BİLGİLERİ</div>
                    <div style={{ fontWeight: 600, color: "#0f172a" }}>{order.customerName}</div>
                    <div style={{ color: "#334155" }}>📞 {order.phone}</div>
                    <div style={{ color: "#64748b", fontSize: "0.78rem" }}>
                      📍 {order.district ? `${order.district} / ` : ""}{order.city || "Adres bilgisi yok"}
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div>
                    <div style={{ color: "#64748b", fontSize: "0.75rem", marginBottom: 2 }}>
                      SİPARİŞ KALEMLERİ ({itemsCount} Adet)
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {(order.items || []).slice(0, 2).map((it) => {
                        let dims = "";
                        try {
                          const cfg = typeof it.configuration === "string" ? JSON.parse(it.configuration) : it.configuration || {};
                          if (cfg.width && cfg.height) dims = ` (${cfg.width}x${cfg.height} cm)`;
                        } catch {}
                        return (
                          <div key={it.id} style={{ color: "#1e293b" }}>
                            • <strong>{it.name}</strong> {dims} <span style={{ color: "#64748b" }}>x{it.quantity}</span>
                          </div>
                        );
                      })}
                      {(order.items || []).length > 2 && (
                        <span style={{ color: "#64748b", fontSize: "0.75rem" }}>
                          +{(order.items || []).length - 2} kalem daha
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Cargo & Tracking */}
                  <div>
                    <div style={{ color: "#64748b", fontSize: "0.75rem", marginBottom: 2 }}>KARGO & TESLİMAT</div>
                    {order.trackingNumber ? (
                      <div>
                        <div style={{ fontWeight: 600, color: "#0284c7" }}>
                          {cargoLabel(order.cargoCompany)}
                        </div>
                        <div style={{ fontFamily: "monospace", fontSize: "0.82rem", color: "#334155" }}>
                          No: {order.trackingNumber}
                        </div>
                        {trackingUrl && (
                          <a
                            href={trackingUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              color: "#0284c7",
                              textDecoration: "underline",
                              fontSize: "0.75rem",
                              display: "inline-block",
                              marginTop: 2,
                            }}
                          >
                            Canlı Takip Bağlantısı ↗
                          </a>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Takip no girilmedi</span>
                    )}
                  </div>

                  {/* Quick WhatsApp Actions */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, justifyContent: "center" }}>
                    <button
                      type="button"
                      onClick={() => sendWhatsAppCustomer(order)}
                      style={{
                        backgroundColor: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        color: "#166534",
                        padding: "6px 12px",
                        borderRadius: 6,
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      💬 Müşteriye WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => sendWhatsAppWorkshop(order)}
                      style={{
                        backgroundColor: "#f8fafc",
                        border: "1px solid #cbd5e1",
                        color: "#334155",
                        padding: "6px 12px",
                        borderRadius: 6,
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      🏢 İmalat / Atölye Kesim Listesi
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              background: "#ffffff",
              borderRadius: 12,
              border: "1px dashed #cbd5e1",
              color: "#64748b",
            }}
          >
            <h3 style={{ margin: "0 0 6px 0", color: "#334155" }}>Sipariş bulunamadı.</h3>
            <p style={{ margin: 0, fontSize: "0.85rem" }}>
              Arama kriterlerinizi veya filtrelerinizi değiştirerek tekrar deneyebilirsiniz.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
