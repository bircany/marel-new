"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteSettingsRecord } from "@/db";

interface MaintenanceClientProps {
  initialSettings: SiteSettingsRecord;
}

export function MaintenanceClient({ initialSettings }: MaintenanceClientProps) {
  const router = useRouter();
  const [settings, setSettings] = useState<SiteSettingsRecord>(initialSettings);
  const [enabled, setEnabled] = useState(settings.maintenance_mode === "true");
  const [title, setTitle] = useState(settings.maintenance_title || "Planlı Bakım Çalışması");
  const [message, setMessage] = useState(
    settings.maintenance_message || "Sistemlerimizde planlı bakım çalışması yapılmaktadır. En kısa sürede hizmetinizdeyiz."
  );
  const [contactWa, setContactWa] = useState(settings.site_whatsapp || "+90 546 735 66 02");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            ...settings,
            maintenance_mode: enabled ? "true" : "false",
            maintenance_title: title,
            maintenance_message: message,
            site_whatsapp: contactWa,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bakım modu güncellenemedi.");

      setToast({
        type: "success",
        text: enabled
          ? "⚠️ Bakım modu aktif edildi. Yalnızca yöneticiler mağazayı görebilir."
          : "✅ Bakım modu kapatıldı. Mağaza tüm ziyaretçilere açık.",
      });
      router.refresh();
    } catch (err) {
      setToast({ type: "error", text: err instanceof Error ? err.message : "Hata oluştu." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 60 }}>
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

      {/* Header */}
      <header className="admin-page-header">
        <div className="admin-page-header-left">
          <span>OPERASYONEL KONTROL</span>
          <h1>Bakım Modu Yönetimi</h1>
          <p>
            Altyapı güncellemesi, fiyat matrisi revizyonu veya acil durumlarda mağazayı tek tıkla ziyaretçilere kapatıp özel duyuru yayınlayın.
          </p>
        </div>
      </header>

      {/* Active State Warning Card */}
      <div
        style={{
          backgroundColor: enabled ? "#fef2f2" : "#f0fdf4",
          border: `1px solid ${enabled ? "#fca5a5" : "#bbf7d0"}`,
          borderRadius: 12,
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: "2rem" }}>{enabled ? "🚧" : "🟢"}</div>
          <div>
            <strong style={{ fontSize: "1.05rem", color: enabled ? "#991b1b" : "#166534" }}>
              {enabled ? "MAĞAZA ŞU ANDA BAKIM MODUNDA" : "MAĞAZA CANLI VE ZİYARETÇİLERE AÇIK"}
            </strong>
            <p style={{ margin: "2px 0 0 0", fontSize: "0.85rem", color: enabled ? "#7f1d1d" : "#14532d" }}>
              {enabled
                ? "Normal ziyaretçiler bakım ekranı görür; admin yetkisine sahip kullanıcılar siteyi normal kullanabilir."
                : "Tüm müşteriler siteye erişebilir, sepete ürün ekleyebilir ve sipariş verebilir."}
            </p>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setEnabled(!enabled)}
            style={{
              backgroundColor: enabled ? "#dc2626" : "#16a34a",
              color: "#ffffff",
              border: "none",
              padding: "10px 20px",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            {enabled ? "Bakım Modunu Kapat (Yayına Al)" : "Bakım Modunu Aç"}
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* Form Column */}
        <form
          onSubmit={handleSave}
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.1rem", color: "#0f172a" }}>
            Bakım Ekranı Mesajı
          </h2>

          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
              Bakım Ekranı Başlığı
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Sistemlerimizde Planlı Bakım Çalışması"
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                fontSize: "0.9rem",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
              Ziyaretçiye Gösterilecek Açıklama Mesajı
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Bakım çalışmasının nedeni ve tahmini süresi..."
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                fontSize: "0.88rem",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
              Acil WhatsApp İletişim Numarası
            </label>
            <input
              type="text"
              value={contactWa}
              onChange={(e) => setContactWa(e.target.value)}
              placeholder="+90 546 735 66 02"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                fontSize: "0.9rem",
                boxSizing: "border-box",
              }}
            />
            <small style={{ color: "#64748b", fontSize: "0.75rem", marginTop: 4, display: "block" }}>
              Bakım esnasında müşterilerin acil sipariş ve teklif alabilmesi için ekranda görünür.
            </small>
          </div>

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
              marginTop: 6,
              transition: "opacity 0.2s",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Kaydediliyor..." : "Ayarları Kaydet"}
          </button>
        </form>

        {/* Live Preview Column */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: "1.1rem", color: "#0f172a" }}>
              Müşteri Önizlemesi
            </h2>
            <span
              style={{
                fontSize: "0.75rem",
                backgroundColor: "#f1f5f9",
                color: "#475569",
                padding: "3px 8px",
                borderRadius: 4,
              }}
            >
              Canlı Simülasyon
            </span>
          </div>

          <div
            style={{
              border: "2px dashed #cbd5e1",
              borderRadius: 10,
              padding: "32px 20px",
              textAlign: "center",
              backgroundColor: "#f8fafc",
            }}
          >
            <div style={{ fontSize: "2.8rem", marginBottom: 12 }}>🛠️</div>
            <div
              style={{
                display: "inline-block",
                backgroundColor: "#e2e8f0",
                color: "#475569",
                padding: "3px 10px",
                borderRadius: 999,
                fontSize: "0.75rem",
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              MAREL PLİSE PERDE
            </div>
            <h3 style={{ margin: "0 0 10px 0", color: "#0f172a", fontSize: "1.2rem" }}>
              {title || "Planlı Bakım Çalışması"}
            </h3>
            <p style={{ margin: "0 0 20px 0", color: "#64748b", fontSize: "0.9rem", lineHeight: 1.5 }}>
              {message || "Sistemlerimizde planlı bakım çalışması yapılmaktadır."}
            </p>

            <a
              href={`https://wa.me/${contactWa.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                backgroundColor: "#16a34a",
                color: "#ffffff",
                padding: "10px 18px",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: "0.85rem",
                textDecoration: "none",
              }}
            >
              💬 WhatsApp'tan Bize Ulaşın ({contactWa})
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
