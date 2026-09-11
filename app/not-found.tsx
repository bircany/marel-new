import Link from "next/link";
import { SiteHeader } from "@/app/components/site-header";
import { SiteFooter } from "@/app/components/site-footer";

export const metadata = {
  title: "Sayfa Bulunamadı (404) | Marel Plise Perde & Sistemleri",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main
        style={{
          minHeight: "75vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 20px",
          background: "radial-gradient(circle at 50% 20%, #f1f5f9 0%, #f8fafc 40%, #ffffff 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            maxWidth: 680,
            width: "100%",
            textAlign: "center",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Subtle architectural badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(15, 23, 42, 0.05)",
              border: "1px solid rgba(15, 23, 42, 0.12)",
              borderRadius: 30,
              padding: "6px 18px",
              marginBottom: 20,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#0284c7",
                display: "inline-block",
              }}
            />
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 800,
                color: "#0f172a",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              HATA KODU 404
            </span>
          </div>

          {/* Bold modern numeral */}
          <div
            style={{
              fontSize: "clamp(5rem, 14vw, 8rem)",
              fontWeight: 900,
              letterSpacing: "-0.05em",
              lineHeight: 0.95,
              color: "#0f172a",
              marginBottom: 16,
              fontFamily: "var(--font-heading, inherit)",
            }}
          >
            404
          </div>

          <h1
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2.1rem)",
              fontWeight: 850,
              color: "#0f172a",
              margin: "0 0 14px",
              letterSpacing: "-0.02em",
            }}
          >
            Aradığınız Sayfa Taşınmış veya Mevcut Değil
          </h1>

          <p
            style={{
              color: "#64748b",
              fontSize: "1.05rem",
              lineHeight: 1.65,
              maxWidth: 520,
              margin: "0 auto 36px",
            }}
          >
            Ziyaret etmek istediğiniz adres değiştirilmiş, silinmiş ya da geçici olarak yayından kaldırılmış olabilir.
            Aşağıdaki bağlantılardan koleksiyonlarımıza göz atabilirsiniz.
          </p>

          {/* Action CTAs */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 40,
            }}
          >
            <Link
              href="/"
              style={{
                background: "#0f172a",
                color: "#ffffff",
                padding: "14px 28px",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: "0.95rem",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 10px 20px -5px rgba(15, 23, 42, 0.25)",
                transition: "all 0.2s ease",
              }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Ana Sayfaya Dön
            </Link>

            <Link
              href="/urunler"
              style={{
                background: "#ffffff",
                color: "#0f172a",
                border: "1.5px solid #cbd5e1",
                padding: "14px 26px",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: "0.95rem",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.2s ease",
              }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              Tüm Ürünleri Keşfet
            </Link>

            <Link
              href="/iletisim"
              style={{
                background: "rgba(2, 132, 199, 0.08)",
                color: "#0284c7",
                border: "1.5px solid rgba(2, 132, 199, 0.25)",
                padding: "14px 24px",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: "0.95rem",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.2s ease",
              }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              İletişim & Danışma
            </Link>
          </div>

          {/* Fast Navigation Pills */}
          <div
            style={{
              paddingTop: 30,
              borderTop: "1px solid #e2e8f0",
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#94a3b8", marginRight: 4 }}>
              Hızlı Erişim:
            </span>
            <Link
              href="/plise-perdeler"
              style={{
                fontSize: "0.84rem",
                fontWeight: 650,
                color: "#334155",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                padding: "6px 14px",
                borderRadius: 20,
                textDecoration: "none",
              }}
            >
              Plise Perdeler
            </Link>
            <Link
              href="/sineklikler"
              style={{
                fontSize: "0.84rem",
                fontWeight: 650,
                color: "#334155",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                padding: "6px 14px",
                borderRadius: 20,
                textDecoration: "none",
              }}
            >
              Sineklikler
            </Link>
            <Link
              href="/separator-kapi"
              style={{
                fontSize: "0.84rem",
                fontWeight: 650,
                color: "#334155",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                padding: "6px 14px",
                borderRadius: 20,
                textDecoration: "none",
              }}
            >
              Seperatör Kapı
            </Link>
            <Link
              href="/iletisim"
              style={{
                fontSize: "0.84rem",
                fontWeight: 650,
                color: "#334155",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                padding: "6px 14px",
                borderRadius: 20,
                textDecoration: "none",
              }}
            >
              İletişim & Destek
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
