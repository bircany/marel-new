import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { absoluteUrl } from "@/app/lib/site";
import { listAnnouncements } from "@/db";

export const metadata = {
  title: "Duyurular & Bilgilendirme | Marel Perde ve Sineklik Sistemleri",
  description: "Marel kampanya duyuruları, ürün yenilikleri ve teknik bilgilendirmeler.",
  alternates: { canonical: absoluteUrl("/duyurular") },
};

export default async function AnnouncementsPage() {
  const announcements = await listAnnouncements(true).catch(() => []);

  return (
    <>
      <SiteHeader />
      <main className="content-page">
        {/* Hero Section */}
        <section className="content-hero">
          <div className="content-hero-media">
            <Image
              unoptimized
              src="/images/hero/marel-honeycomb-hero-v3.png"
              alt="Marel Duyurular"
              fill
              priority
              sizes="100vw"
            />
          </div>
          <div className="shop-container">
            <span>MAREL BİLGİLENDİRME</span>
            <h1>Güncel Duyurular</h1>
            <p>Kampanyalarımız, ürün yenilikleri ve ölçü/montaj rehberlerimize buradan ulaşabilirsiniz.</p>
          </div>
        </section>

        {/* Announcements List */}
        <section className="shop-container" style={{ padding: "3rem 1.25rem 5rem" }}>
          {announcements.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
              <h2>Henüz duyuru bulunmuyor</h2>
              <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
                Yeni kampanya ve bilgilendirmelerimiz burada yayınlanacaktır.
              </p>
              <Link href="/urunler" className="contact-submit-btn" style={{ display: "inline-block", width: "auto", marginTop: "1.5rem", padding: "0.75rem 2rem", textDecoration: "none" }}>
                Ürünleri İnceleyin
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
              {announcements.map((item) => (
                <article
                  key={item.id}
                  id={item.slug}
                  style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                >
                  <div style={{ position: "relative", width: "100%", height: "220px", background: "#f8fafc" }}>
                    <Image
                      unoptimized
                      src={item.imageUrl || "/images/hero/marel-honeycomb-hero-v3.png"}
                      alt={item.title}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                    {item.featured === 1 && (
                      <span
                        style={{
                          position: "absolute",
                          top: "12px",
                          left: "12px",
                          background: "#d97706",
                          color: "#ffffff",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          padding: "4px 10px",
                          borderRadius: "20px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        ★ Öne Çıkan
                      </span>
                    )}
                  </div>
                  <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flex: 1 }}>
                    <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" }) : "Duyuru"}
                    </span>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", margin: "0.5rem 0", lineHeight: 1.3 }}>
                      {item.title}
                    </h2>
                    <p style={{ fontSize: "0.92rem", color: "#475569", lineHeight: 1.5, marginBottom: "1rem", fontWeight: 500 }}>
                      {item.summary}
                    </p>
                    <details style={{ marginTop: "auto", paddingTop: "0.5rem", borderTop: "1px solid #f1f5f9" }}>
                      <summary style={{ cursor: "pointer", fontWeight: 600, color: "#2563eb", fontSize: "0.88rem" }}>
                        Devamını Oku ↓
                      </summary>
                      <div style={{ fontSize: "0.9rem", color: "#334155", lineHeight: 1.6, marginTop: "0.75rem", whiteSpace: "pre-line" }}>
                        {item.body}
                      </div>
                    </details>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
