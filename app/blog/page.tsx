import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";
import { absoluteUrl } from "@/app/lib/site";
import { listAnnouncements } from "@/db";

export const revalidate = 60; // 1 minute cache

export const metadata = {
  title: "Marel Plise Perde | Blog, Ölçü Rehberleri ve İpuçları",
  description:
    "Plise perde ölçüsü nasıl alınır, cam balkon perde montajı, honeycomb kumaş ısı yalıtımı ve dekorasyon tavsiyeleri Marel Blog'da.",
  alternates: {
    canonical: absoluteUrl("/blog"),
  },
  keywords: [
    "plise perde blog",
    "plise perde ölçü alma",
    "cam balkon perdesi",
    "elbistan plise perde",
    "kahramanmaraş plise perde",
    "honeycomb perde",
  ],
  openGraph: {
    title: "Marel Plise Perde Blog & Rehberler",
    description: "Plise perde ölçüsü, montaj teknikleri ve bakım tavsiyeleri.",
    url: absoluteUrl("/blog"),
    siteName: "Marel Plise Perde",
    images: [{ url: absoluteUrl("/images/catalog/diamond.webp"), width: 1200, height: 630 }],
    locale: "tr_TR",
    type: "website",
  },
  other: {
    "geo.region": "TR-46",
    "geo.placename": "Elbistan, Kahramanmaraş",
    "geo.position": "38.2056;37.1983",
    "ICBM": "38.2056, 37.1983",
  },
};

export default async function BlogPage() {
  const blogPosts = await listAnnouncements(true);

  return (
    <>
      <SiteHeader />

      <main className="blog-page-main" style={{ minHeight: "80vh", padding: "50px 20px 80px", background: "#f8fafc" }}>
        <div className="container" style={{ maxWidth: 1180, margin: "0 auto" }}>
          
          {/* Header Banner */}
          <div className="blog-page-header" style={{ textAlign: "left", marginBottom: 42, padding: "18px 6px 0" }}>
            <span
              style={{
                display: "inline-block",
                background: "#fef3c7",
                color: "#b45309",
                fontWeight: 800,
                fontSize: "0.82rem",
                padding: "6px 16px",
                borderRadius: 999,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              Bilgi Merkezi & Rehberler
            </span>
            <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)", color: "#0b1736", marginBottom: 14, fontWeight: 900, letterSpacing: "-0.04em", maxWidth: 760 }}>
              Pencereniz için doğru perdeyi seçmenin kısa yolu.
            </h1>
            <p style={{ color: "#52627a", fontSize: "1.08rem", maxWidth: 680, margin: 0, lineHeight: 1.7 }}>
              Plise perdeler hakkında milimetrik ölçü alma adımları, kumaş teknolojileri, cam balkon montaj püf noktaları ve bakım tavsiyeleri.
            </p>
          </div>

          {/* Quick Help WhatsApp Banner */}
          <div
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
              borderRadius: 16,
              padding: "24px 32px",
              color: "#ffffff",
              marginBottom: 44,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 20,
              boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.15)",
            }}
          >
            <div>
              <h3 style={{ margin: "0 0 6px", fontSize: "1.25rem", fontWeight: 800, color: "#ffffff" }}>
                Ölçü Almakta Zorlanıyor Musunuz?
              </h3>
              <p style={{ margin: 0, color: "#cbd5e1", fontSize: "0.95rem" }}>
                Pencerenizin fotoğrafını WhatsApp hattımıza iletin, uzmanımızla birlikte sıfır hatayla ölçünüzü çıkaralım.
              </p>
            </div>
            <a
              href="https://wa.me/905467356602?text=Merhaba,%20penceremin%20fotografini%20gonderip%20plise%20perde%20olcusu%20icin%20danismak%20istiyorum."
              target="_blank"
              rel="noreferrer"
              style={{
                background: "#22c55e",
                color: "#ffffff",
                padding: "12px 24px",
                borderRadius: 999,
                fontWeight: 800,
                fontSize: "0.95rem",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 4px 14px rgba(34, 197, 94, 0.4)",
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.13 8.13 0 0 1-1.25-4.38c0-4.5 3.66-8.16 8.16-8.16 2.18 0 4.23.85 5.77 2.39a8.11 8.11 0 0 1 2.39 5.77c0 4.5-3.66 8.16-8.16 8.16zm4.47-6.1c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.53.07-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.71-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.2 3.7.59.25 1.05.4 1.41.51.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.23-.17-.47-.29z" />
              </svg>
              WhatsApp Danışma (0546 735 66 02)
            </a>
          </div>

          {/* Blog Cards Grid */}
          <div
            className="blog-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: 22,
            }}
          >
            {blogPosts.map((post) => {
              const dateStr = post.publishedAt || post.createdAt;
              const formattedDate = dateStr
                ? new Date(dateStr).toLocaleDateString("tr-TR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "";

              return (
                <Link
                  href={`/blog/${post.slug}`}
                  key={post.id}
                  className="blog-card"
                  style={{
                    background: "#ffffff",
                    borderRadius: 10,
                    overflow: "hidden",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.03)",
                    border: "1px solid #e2e8f0",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    textDecoration: "none",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ position: "relative", width: "100%", height: 245, background: "#f1f5f9" }}>
                    <Image
                      unoptimized
                      src={post.imageUrl || "/images/catalog/diamond.webp"}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      style={{ objectFit: "cover" }}
                    />
                    {post.featured ? (
                      <span
                        style={{
                          position: "absolute",
                          top: 16,
                          left: 16,
                          background: "#eab308",
                          color: "#ffffff",
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          padding: "4px 10px",
                          borderRadius: 20,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                        }}
                      >
                        Öne Çıkan
                      </span>
                    ) : null}
                  </div>

                  <div style={{ padding: "22px 22px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div
                      style={{
                        fontSize: "0.82rem",
                        color: "#64748b",
                        fontWeight: 600,
                        marginBottom: 10,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <time dateTime={dateStr}>{formattedDate}</time>
                      <span>•</span>
                      <span>5 dk okuma</span>
                    </div>

                    <h2
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 800,
                        color: "#0f172a",
                        lineHeight: 1.4,
                        marginBottom: 12,
                      }}
                    >
                      {post.title}
                    </h2>

                    <p
                      style={{
                        fontSize: "0.95rem",
                        color: "#475569",
                        lineHeight: 1.6,
                        marginBottom: 20,
                        flex: 1,
                      }}
                    >
                      {post.summary}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        color: "#0284c7",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        marginTop: "auto",
                      }}
                    >
                      <span>Devamını Oku</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
