import { SiteHeader } from "@/app/components/site-header";
import { SiteFooter } from "@/app/components/site-footer";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { absoluteUrl } from "@/app/lib/site";

export const metadata: Metadata = {
  title: "Hakkımızda | Marel Plise Perde",
  description:
    "2015 yılından bu yana Elbistan / Kahramanmaraş atölyemizde kişiye özel ölçülü plise perde ve cam balkon sistemleri imalatı yapıyoruz. Kalite standartlarımız ve hikayemiz.",
  alternates: { canonical: absoluteUrl("/hakkimizda") },
  other: {
    "geo.region": "TR-46",
    "geo.placename": "Elbistan, Kahramanmaraş",
  },
};

export default function HakkimizdaPage() {
  return (
    <>
      <SiteHeader />
      <main className="static-page-main" style={{ background: "#f8fafc" }}>
        
        {/* Hero Banner */}
        <section
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            color: "#ffffff",
            padding: "80px 20px 70px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div className="shop-container" style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 2 }}>
            <span
              style={{
                display: "inline-block",
                background: "#eab308",
                color: "#0f172a",
                fontWeight: 900,
                fontSize: "0.82rem",
                padding: "6px 16px",
                borderRadius: 999,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              2015'ten Günümüze Kesintisiz Kalite
            </span>
            <h1
              style={{
                fontSize: "clamp(2.4rem, 5vw, 3.6rem)",
                fontWeight: 900,
                color: "#ffffff",
                lineHeight: 1.2,
                marginBottom: 18,
              }}
            >
              Yaşam Alanlarınıza Değer Katan Plise Perde Sistemleri
            </h1>
            <p
              style={{
                color: "#cbd5e1",
                maxWidth: 720,
                margin: "0 auto",
                fontSize: "1.15rem",
                lineHeight: 1.7,
              }}
            >
              Kahramanmaraş Elbistan'daki modern imalat atölyemizde, her pencereye özel milimetrik hassasiyetle plise perde, honeycomb ısı yalıtımlı perdeler ve pileli sineklik sistemleri üretiyoruz.
            </p>
          </div>
        </section>

        {/* Key Statistics Grid */}
        <section style={{ maxWidth: 1140, margin: "-36px auto 0", padding: "0 20px", position: "relative", zIndex: 5 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 20,
              background: "#ffffff",
              borderRadius: 16,
              padding: "32px 24px",
              boxShadow: "0 10px 30px -5px rgba(0,0,0,0.06)",
              border: "1px solid #e2e8f0",
              textAlign: "center",
            }}
          >
            <div>
              <strong style={{ fontSize: "2.5rem", fontWeight: 900, color: "#d97706", display: "block" }}>10+ Yıl</strong>
              <span style={{ fontSize: "0.95rem", color: "#64748b", fontWeight: 600 }}>Sektörel İmalat Tecrübesi</span>
            </div>
            <div>
              <strong style={{ fontSize: "2.5rem", fontWeight: 900, color: "#0f172a", display: "block" }}>50.000+</strong>
              <span style={{ fontSize: "0.95rem", color: "#64748b", fontWeight: 600 }}>Ölçüye Özel Üretim</span>
            </div>
            <div>
              <strong style={{ fontSize: "2.5rem", fontWeight: 900, color: "#16a34a", display: "block" }}>%99.4</strong>
              <span style={{ fontSize: "0.95rem", color: "#64748b", fontWeight: 600 }}>Müşteri Memnuniyeti</span>
            </div>
            <div>
              <strong style={{ fontSize: "2.5rem", fontWeight: 900, color: "#0284c7", display: "block" }}>81 İl</strong>
              <span style={{ fontSize: "0.95rem", color: "#64748b", fontWeight: 600 }}>Hızlı & Sigortalı Teslimat</span>
            </div>
          </div>
        </section>

        {/* Production Excellence Story */}
        <section className="shop-container" style={{ maxWidth: 1140, margin: "0 auto", padding: "80px 20px 60px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 50, alignItems: "center" }}>
            
            <div>
              <span style={{ color: "#d97706", fontWeight: 800, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Biz Kimiz?
              </span>
              <h2 style={{ fontSize: "2.2rem", color: "#0f172a", margin: "10px 0 20px", fontWeight: 900, lineHeight: 1.3 }}>
                Ölçüye Özel İmalatta Kusursuz Mühendislik
              </h2>
              <p style={{ color: "#475569", fontSize: "1.05rem", lineHeight: 1.8, marginBottom: 16 }}>
                2015 yılında cam balkon ve perde sistemleri üretimiyle faaliyete başladığımız ilk günden itibaren <strong>“kusursuz kalite”</strong> ve <strong>“birebir ölçü garantisi”</strong> ilkelerini merkezimize aldık. Hazır standart perdelerin pencerelere oturmadığı gerçeğini görerek, her yaşam alanına özel milimetrik üretim modelini benimsedik.
              </p>
              <p style={{ color: "#475569", fontSize: "1.05rem", lineHeight: 1.8, marginBottom: 16 }}>
                Bugün Marel, plise perde sektöründe modern lazer kesim tezgâhları, elektrostatik fırın boyalı alüminyum profil hatları ve yüksek mukavemetli ip dizilim sehpaları ile donatılmış öncü bir kuruluştur.
              </p>
              <p style={{ color: "#475569", fontSize: "1.05rem", lineHeight: 1.8 }}>
                Siparişinizi vermeden önce WhatsApp hattımız üzerinden pencere fotoğrafınızı inceliyor, fitil ve çıta paylarını hesaplayarak hata payını sıfıra indiriyoruz.
              </p>
            </div>

            <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", boxShadow: "0 15px 35px rgba(0,0,0,0.08)", minHeight: 400 }}>
              <Image
                src="/images/real/diamond-beyaz-siyah-ip.jpeg"
                alt="Marel Plise Perde İmalatı"
                fill
                sizes="(max-width: 768px) 100vw, 550px"
                style={{ objectFit: "cover" }}
              />
            </div>

          </div>
        </section>

        {/* 4 Pillars / Quality Standards */}
        <section style={{ display: "none" }} aria-hidden="true">
          <div className="shop-container" style={{ maxWidth: 1140, margin: "0 auto" }}>
            
            <div style={{ textAlign: "center", marginBottom: 50 }}>
              <span style={{ color: "#d97706", fontWeight: 800, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Üretim Standartlarımız
              </span>
              <h2 style={{ fontSize: "2.2rem", color: "#0f172a", margin: "10px 0 14px", fontWeight: 900 }}>
                Neden Marel Plise Perde?
              </h2>
              <p style={{ color: "#64748b", fontSize: "1.05rem", maxWidth: 620, margin: "0 auto" }}>
                Sıradan perdeler ile profesyonel Marel sistemleri arasındaki farkı belirleyen temel imalat kriterlerimiz:
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 24 }}>
              
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 16, padding: "28px 22px" }}>
                <div style={{ fontSize: "2rem", marginBottom: 12 }}>📐</div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", marginBottom: 10 }}>
                  Milimetrik Lazer Kesim
                </h3>
                <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem", lineHeight: 1.6 }}>
                  Kumaşlarımız ve alüminyum profillerimiz ±0.5 mm hassasiyetle kesilir; kenarlarda atma, yırtılma veya iplik sarkması olmaz.
                </p>
              </div>

              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 16, padding: "28px 22px" }}>
                <div style={{ fontSize: "2rem", marginBottom: 12 }}>🛡️</div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", marginBottom: 10 }}>
                  Kalın Eloksallı Profil
                </h3>
                <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem", lineHeight: 1.6 }}>
                  Plastik değil, orijinal elektrostatik boyalı alüminyum kasa kullanılır. Güneşte sararmaz, eğilmez veya çatlamaz.
                </p>
              </div>

              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 16, padding: "28px 22px" }}>
                <div style={{ fontSize: "2rem", marginBottom: 12 }}>🧵</div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", marginBottom: 10 }}>
                  Kopmaz Paraşüt İpi
                </h3>
                <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem", lineHeight: 1.6 }}>
                  Yüksek sürtünme dayanımlı çift örgülü paraşüt ipleri ve iç gergi yayları perdenin yıllarca pürüzsüz kaymasını sağlar.
                </p>
              </div>

              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 16, padding: "28px 22px" }}>
                <div style={{ fontSize: "2rem", marginBottom: 12 }}>✨</div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", marginBottom: 10 }}>
                  Leke Tutmaz Antistatik Kumaş
                </h3>
                <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem", lineHeight: 1.6 }}>
                  Özel apreli kumaş yüzeyi toz barındırmaz. Nemli mikrofiber bezle saniyeler içinde silinir veya yıkanabilir.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* WhatsApp & Product Navigation CTA Box */}
        <section className="shop-container" style={{ maxWidth: 1140, margin: "0 auto", padding: "70px 20px 90px" }}>
          <div
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
              borderRadius: 20,
              padding: "50px clamp(24px, 5vw, 60px)",
              color: "#ffffff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 32,
              boxShadow: "0 15px 35px -5px rgba(15, 23, 42, 0.2)",
            }}
          >
            <div style={{ maxWidth: 620 }}>
              <span style={{ color: "#eab308", fontWeight: 800, fontSize: "0.85rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Birebir Ölçü ve Fiyat Desteği
              </span>
              <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.3rem)", fontWeight: 900, color: "#ffffff", margin: "10px 0 12px", lineHeight: 1.3 }}>
                Evinize En Uygun Plise Perdeyi Birlikte Seçelim
              </h2>
              <p style={{ color: "#cbd5e1", fontSize: "1.05rem", lineHeight: 1.7, margin: 0 }}>
                Pencerenizin veya cam balkonunuzun fotoğrafını bize iletin; uzman teknik ekibimiz çıta derinliğini ve en uygun kumaşı sizinle birlikte belirlesin.
              </p>
            </div>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <a
                href="https://wa.me/905467356602?text=Merhaba,%20plise%20perde%20modelleri%20ve%20olcu%20destegi%20almak%20istiyorum."
                target="_blank"
                rel="noreferrer"
                style={{
                  background: "#22c55e",
                  color: "#ffffff",
                  fontWeight: 800,
                  fontSize: "1rem",
                  padding: "16px 28px",
                  borderRadius: 999,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 4px 16px rgba(34, 197, 94, 0.4)",
                }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.13 8.13 0 0 1-1.25-4.38c0-4.5 3.66-8.16 8.16-8.16 2.18 0 4.23.85 5.77 2.39a8.11 8.11 0 0 1 2.39 5.77c0 4.5-3.66 8.16-8.16 8.16zm4.47-6.1c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.53.07-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.71-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.2 3.7.59.25 1.05.4 1.41.51.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.23-.17-.47-.29z" />
                </svg>
                <span>WhatsApp Danışma</span>
              </a>

              <Link
                href="/urun-cesitleri"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "1rem",
                  padding: "16px 26px",
                  borderRadius: 999,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <span>Ürün Çeşitlerini Gör →</span>
              </Link>
            </div>
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  );
}
