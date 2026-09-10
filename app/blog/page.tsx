import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";
import { absoluteUrl } from "@/app/lib/site";
import { ensureDatabase, getDb } from "@/db";

export const revalidate = 60; // 1 dakika cache

export const metadata = {
  title: "Marel Plise Perde | Blog ve Haberler",
  description: "Marel Plise Perde hakkında en güncel haberler, perde bakım ipuçları ve dekorasyon fikirleri.",
  openGraph: {
    title: "Blog & Haberler - Marel Plise",
    description: "Perde dekorasyon fikirleri ve sektör haberleri.",
    url: absoluteUrl("/blog"),
    siteName: "Marel Plise Perde",
    images: [{ url: absoluteUrl("/og.png"), width: 1200, height: 630 }],
    locale: "tr_TR",
    type: "website",
  },
};

export default async function BlogPage() {
  await ensureDatabase();
  
  // Sadece yayınlanmış blog yazılarını getir
  const db = getDb();
  let blogPosts: any[] = [];
  try {
    const raw = await db.prepare("SELECT * FROM announcements WHERE published = 1 ORDER BY created_at DESC").all();
    blogPosts = raw.results || [];
  } catch (err) {
    console.error("Blog fetch error:", err);
  }

  return (
    <>
      <SiteHeader />
      
      <main className="blog-page-main" style={{ minHeight: "80vh", padding: "40px 20px", background: "#f8fafc" }}>
        <div className="container" style={{ maxWidth: 1100, margin: "0 auto" }}>
          
          <div className="blog-page-header" style={{ textAlign: "center", marginBottom: 40 }}>
            <h1 style={{ fontSize: "2.8rem", color: "#0f172a", marginBottom: 12, fontWeight: 900 }}>Marel Blog</h1>
            <p style={{ color: "#475569", fontSize: "1.1rem", maxWidth: 600, margin: "0 auto" }}>
              Plise perdeler hakkında ipuçları, bakım tavsiyeleri ve güncel dekorasyon trendlerini keşfedin.
            </p>
          </div>

          {blogPosts.length > 0 ? (
            <div className="blog-grid" style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", 
              gap: 32 
            }}>
              {blogPosts.map((post) => {
                const dateStr = post.published_at || post.created_at;
                const formattedDate = dateStr ? new Date(dateStr).toLocaleDateString("tr-TR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                }) : "";

                return (
                  <Link 
                    href={`/blog/${post.slug}`} 
                    key={post.id} 
                    className="blog-card"
                    style={{
                      background: "#fff",
                      borderRadius: 16,
                      overflow: "hidden",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.03)",
                      border: "1px solid #e2e8f0",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      textDecoration: "none",
                      display: "flex",
                      flexDirection: "column"
                    }}
                  >
                    <div style={{ position: "relative", width: "100%", height: 220, background: "#f1f5f9" }}>
                      <Image 
                        src={post.image_url || "/images/real/diamond-beyaz-siyah-ip.jpeg"} 
                        alt={post.title} 
                        fill 
                        sizes="(max-width: 768px) 100vw, 400px"
                        style={{ objectFit: "cover" }} 
                      />
                      {post.featured ? (
                        <span style={{
                          position: "absolute",
                          top: 16,
                          left: 16,
                          background: "#eab308",
                          color: "#fff",
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          padding: "4px 10px",
                          borderRadius: 20,
                          letterSpacing: "0.05em"
                        }}>
                          ÖNE ÇIKAN
                        </span>
                      ) : null}
                    </div>
                    
                    <div style={{ padding: 24, display: "flex", flexDirection: "column", flexGrow: 1 }}>
                      <time style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: 8, fontWeight: 600 }}>
                        {formattedDate}
                      </time>
                      <h2 style={{ 
                        fontSize: "1.3rem", 
                        color: "#0f172a", 
                        fontWeight: 800, 
                        marginBottom: 12,
                        lineHeight: 1.3
                      }}>
                        {post.title}
                      </h2>
                      <p style={{ 
                        color: "#475569", 
                        fontSize: "0.95rem", 
                        lineHeight: 1.6, 
                        marginBottom: 20,
                        flexGrow: 1,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                      }}>
                        {post.summary}
                      </p>
                      
                      <div style={{ 
                        color: "#0284c7", 
                        fontWeight: 700, 
                        fontSize: "0.95rem",
                        display: "flex",
                        alignItems: "center",
                        gap: 4
                      }}>
                        Devamını Oku 
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 16, border: "1px dashed #cbd5e1" }}>
              <div style={{ fontSize: "3rem", marginBottom: 16 }}>📝</div>
              <h3 style={{ fontSize: "1.2rem", color: "#334155", marginBottom: 8 }}>Henüz Blog Yazısı Yok</h3>
              <p style={{ color: "#64748b" }}>İçeriklerimiz yakında burada listelenecektir.</p>
            </div>
          )}
          
        </div>
      </main>

      <SiteFooter />
      
      <style dangerouslySetInnerHTML={{__html: `
        .blog-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.06) !important;
          border-color: #cbd5e1 !important;
        }
      `}} />
    </>
  );
}
