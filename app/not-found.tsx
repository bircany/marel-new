import Link from "next/link";
import { SiteHeader } from "@/app/components/site-header";
import { SiteFooter } from "@/app/components/site-footer";

export const metadata = {
  title: "Sayfa Bulunamadı (404) | Marel Plise Perde",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main
        style={{
          minHeight: "65vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
        }}
      >
        <div
          style={{
            maxWidth: 540,
            width: "100%",
            textAlign: "center",
            padding: "40px 30px",
            borderRadius: 16,
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div
            style={{
              fontSize: "4rem",
              fontWeight: 900,
              color: "#0f172a",
              lineHeight: 1,
              marginBottom: 12,
            }}
          >
            404
          </div>
          <h1 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#0f172a", margin: "0 0 10px 0" }}>
            Aradığınız Sayfa Bulunamadı
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.95rem", lineHeight: 1.6, margin: "0 0 24px 0" }}>
            Ulaşmaya çalıştığınız sayfa taşınmış, silinmiş veya geçici olarak erişilemiyor olabilir.
            Aşağıdaki bağlantılardan alışverişe veya bilgi edinmeye devam edebilirsiniz.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 320, margin: "0 auto" }}>
            <Link
              href="/"
              style={{
                backgroundColor: "#0f172a",
                color: "#ffffff",
                padding: "12px 20px",
                borderRadius: 8,
                fontWeight: 600,
                textDecoration: "none",
                fontSize: "0.9rem",
              }}
            >
              🏠 Ana Sayfaya Dön
            </Link>
            <Link
              href="/urunler"
              style={{
                backgroundColor: "#f1f5f9",
                color: "#1e293b",
                padding: "12px 20px",
                borderRadius: 8,
                fontWeight: 600,
                textDecoration: "none",
                fontSize: "0.9rem",
              }}
            >
              🧵 Plise Perde Modelleri
            </Link>
            <Link
              href="/siparis-takip"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #cbd5e1",
                color: "#475569",
                padding: "10px 20px",
                borderRadius: 8,
                fontWeight: 600,
                textDecoration: "none",
                fontSize: "0.85rem",
              }}
            >
              📦 Sipariş Takibi
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
