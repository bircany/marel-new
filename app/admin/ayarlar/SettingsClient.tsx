"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteSettingsRecord } from "@/db";

interface SettingsClientProps {
  initialSettings: SiteSettingsRecord;
}

export function SettingsClient({ initialSettings }: SettingsClientProps) {
  const router = useRouter();
  const [settings, setSettings] = useState<SiteSettingsRecord>(initialSettings);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ayarlar kaydedilemedi.");

      setToast({ type: "success", text: "Site ve operasyon ayarları başarıyla güncellendi!" });
      router.refresh();
    } catch (err) {
      setToast({ type: "error", text: err instanceof Error ? err.message : "Kayıt sırasında hata oluştu." });
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
          <span>SİSTEM & YAPILANDIRMA</span>
          <h1>Site & Operasyon Ayarları</h1>
          <p>
            WhatsApp danışma hattı, ücretsiz kargo limiti, banka havale/EFT IBAN bilgileri ve kurumsal iletişim detaylarını buradan yönetin.
          </p>
        </div>
      </header>

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Section 1: İletişim & WhatsApp */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <h2 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
            💬 İletişim & WhatsApp Hattı
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                WhatsApp Sipariş & Danışma Hattı
              </label>
              <input
                type="text"
                value={settings.site_whatsapp || ""}
                onChange={(e) => handleChange("site_whatsapp", e.target.value)}
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
                Sitedeki WhatsApp butonları ve otomatik bildirimler bu numarayı kullanır.
              </small>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                Ofis & Müşteri Hizmetleri Telefonu
              </label>
              <input
                type="text"
                value={settings.site_phone || ""}
                onChange={(e) => handleChange("site_phone", e.target.value)}
                placeholder="0344 413 00 00"
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
                Kurumsal E-posta
              </label>
              <input
                type="email"
                value={settings.site_email || ""}
                onChange={(e) => handleChange("site_email", e.target.value)}
                placeholder="info@marel.com.tr"
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
                İmalat & Mağaza Adresi
              </label>
              <input
                type="text"
                value={settings.site_address || ""}
                onChange={(e) => handleChange("site_address", e.target.value)}
                placeholder="Güneşli Mah. Elbistan / Kahramanmaraş"
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
          </div>
        </div>

        {/* Section 2: Kargo & Teslimat Kuralları */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <h2 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
            🚚 Kargo & Ücretlendirme
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                Standart Kargo Ücreti (₺)
              </label>
              <input
                type="number"
                value={settings.shipping_flat_rate || ""}
                onChange={(e) => handleChange("shipping_flat_rate", e.target.value)}
                placeholder="Örn: 99"
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
                Sepet tutarı ücretsiz kargo barajının altındayken uygulanacak ücret.
              </small>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                Ücretsiz Kargo Sepet Barajı (₺)
              </label>
              <input
                type="number"
                value={settings.shipping_free_threshold || ""}
                onChange={(e) => handleChange("shipping_free_threshold", e.target.value)}
                placeholder="Örn: 1500"
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
                Bu tutar ve üzerindeki sepetlerde kargo müşteriye ücretsiz sunulur.
              </small>
            </div>
          </div>
        </div>

        {/* Section 3: Banka Havale / EFT Bilgileri */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <h2 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
            🏦 Banka Havale & EFT Bilgileri
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                Banka Adı
              </label>
              <input
                type="text"
                value={settings.bank_name || ""}
                onChange={(e) => handleChange("bank_name", e.target.value)}
                placeholder="Ziraat Bankası / Garanti BBVA"
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
                Hesap Sahibi / Alıcı Unvanı
              </label>
              <input
                type="text"
                value={settings.bank_account_holder || ""}
                onChange={(e) => handleChange("bank_account_holder", e.target.value)}
                placeholder="Marel Perde Sistemleri San. Tic. Ltd. Şti."
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

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                IBAN Numarası
              </label>
              <input
                type="text"
                value={settings.bank_iban || ""}
                onChange={(e) => handleChange("bank_iban", e.target.value)}
                placeholder="TR00 0000 0000 0000 0000 0000 00"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  fontFamily: "monospace",
                  fontSize: "1rem",
                  fontWeight: 600,
                  boxSizing: "border-box",
                  letterSpacing: 1,
                }}
              />
            </div>
          </div>
        </div>

        {/* Save Button Bar */}
        <div>
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: "#0f172a",
              color: "#ffffff",
              padding: "14px 28px",
              borderRadius: 8,
              border: "none",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "opacity 0.2s",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Kaydediliyor..." : "Tüm Ayarları Kaydet & Uygula"}
          </button>
        </div>
      </form>
    </div>
  );
}
