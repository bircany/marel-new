import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/app/components/site-header";
import { SiteFooter } from "@/app/components/site-footer";
import { absoluteUrl } from "@/app/lib/site";
import { ensureDatabase, getDb } from "@/db";

export const revalidate = 60;

const FALLBACK_POSTS: Record<string, any> = {
  "olcuye-ozel-uretim-rehberi": {
    id: "ann-1",
    slug: "olcuye-ozel-uretim-rehberi",
    title: "Ölçüye özel üretim nasıl ilerliyor?",
    summary: "Ölçü teyidinden üretim ve teslimata kadar Marel sipariş sürecini adım adım keşfedin.",
    body: "Siparişiniz sonrasında Marel danışmanı ölçülerinizi ve seçtiğiniz kumaş ile profil rengini teyit eder. Onaylanan bilgiler üretim planına alınır; güncel durumunu Hesabım alanından takip edebilirsiniz.",
    image_url: "/images/real/diamond-beyaz-siyah-ip.jpeg",
    published: 1,
    featured: 1,
    published_at: "2026-03-01T00:00:00.000Z",
    created_at: "2026-03-01T00:00:00.000Z",
  },
  "honeycomb-isi-yalitimi": {
    id: "ann-2",
    slug: "honeycomb-isi-yalitimi",
    title: "Honeycomb ile dört mevsim konfor",
    summary: "Hücresel kumaş yapısının ışık ve ısı kontrolüne katkısını yakından inceleyin.",
    body: "Honeycomb kumaşın hücresel yapısı, cam yüzeyi ile yaşam alanı arasında ek bir hava katmanı oluşturur. Doğru renk ve ölçü seçimi için fotoğrafınızı WhatsApp danışmanımıza iletebilirsiniz.",
    image_url: "/images/hero/marel-honeycomb-hero-v3.png",
    published: 1,
    featured: 1,
    published_at: "2026-03-01T00:00:00.000Z",
    created_at: "2026-03-01T00:00:00.000Z",
  },
  "whatsapp-olcu-destegi": {
    id: "ann-3",
    slug: "whatsapp-olcu-destegi",
    title: "Fotoğrafınızı gönderin, sistemi birlikte seçelim",
    summary: "Perde, sineklik veya kapı sistemi seçiminde Marel danışmanından hızlı destek alın.",
    body: "Mekânın genel görünümünü ve yaklaşık ölçüleri paylaşmanız yeterli. Kullanım alanınıza göre uygun sistem, kumaş ve profil seçeneklerini birlikte belirleyelim.",
    image_url: "/images/catalog/diamond.webp",
    published: 1,
    featured: 0,
    published_at: "2026-03-01T00:00:00.000Z",
    created_at: "2026-03-01T00:00:00.000Z",
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await ensureDatabase();
  const db = getDb();
  let post: any = null;
  try {
    post = await db.prepare("SELECT * FROM announcements WHERE slug = ? LIMIT 1").bind(slug).first();
  } catch (err) {
    console.error(err);
  }

  if (!post) {
    post = FALLBACK_POSTS[slug];
  }

  if (!post) {
    return { title: "Blog Yazısı Bulunamadı - Marel Plise Perde" };
  }

  return {
    title: `${post.title} | Marel Blog`,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      url: absoluteUrl(`/blog/${post.slug}`),
      images: [{ url: absoluteUrl(post.image_url || "/og.png"), width: 1200, height: 630 }],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await ensureDatabase();
  const db = getDb();
  let post: any = null;
  try {
    post = await db.prepare("SELECT * FROM announcements WHERE slug = ? LIMIT 1").bind(slug).first();
  } catch (err) {
    console.error(err);
  }

  if (!post) {
    post = FALLBACK_POSTS[slug];
  }

  if (!post) {
    notFound();
  }

  const dateStr = post.published_at || post.created_at;
  const formattedDate = dateStr ? new Date(dateStr).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }) : "";

  // Basit satır başı dönüşümlerini paragraf taglerine çevirme
  const formattedBody = post.body.split('\n').filter((p: string) => p.trim() !== '').map((p: string, i: number) => (
    <p key={i} style={{ marginBottom: "1.5rem", lineHeight: "1.8", color: "#334155", fontSize: "1.1rem" }}>
      {p}
    </p>
  ));

  return (
    <>
      <SiteHeader />
      
      <main className="blog-post-main" style={{ minHeight: "80vh", background: "#fff", paddingBottom: 80 }}>
        
        {/* Hero Banner */}
        <div style={{ position: "relative", width: "100%", height: "40vh", minHeight: 300, background: "#0f172a" }}>
          <Image 
            src={post.image_url || "/images/real/diamond-beyaz-siyah-ip.jpeg"} 
            alt={post.title} 
            fill 
            sizes="100vw"
            style={{ objectFit: "cover", opacity: 0.5 }} 
            priority
          />
          <div className="container" style={{ 
            position: "absolute", 
            inset: 0, 
            display: "flex", 
            flexDirection: "column",
            justifyContent: "center", 
            alignItems: "center",
            textAlign: "center",
            padding: "0 20px"
          }}>
            <div style={{ maxWidth: 800 }}>
              <span style={{ 
                color: "#eab308", 
                fontWeight: 800, 
                letterSpacing: "0.1em",
                fontSize: "0.9rem",
                textTransform: "uppercase",
                marginBottom: 16,
                display: "block"
              }}>
                Marel Blog
              </span>
              <h1 style={{ 
                color: "#fff", 
                fontSize: "clamp(2rem, 5vw, 3.5rem)", 
                fontWeight: 900, 
                lineHeight: 1.2,
                textShadow: "0 4px 12px rgba(0,0,0,0.5)"
              }}>
                {post.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Post Content Wrapper */}
        <div className="container" style={{ maxWidth: 800, margin: "0 auto", padding: "0 20px", marginTop: "-40px", position: "relative", zIndex: 10 }}>
          <article style={{ 
            background: "#fff", 
            borderRadius: 16, 
            padding: "40px 10%", 
            boxShadow: "0 20px 40px rgba(0,0,0,0.08)"
          }}>
            <header style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: 24, marginBottom: 32, textAlign: "center" }}>
              <time style={{ color: "#64748b", fontWeight: 600, fontSize: "0.95rem" }}>
                {formattedDate}
              </time>
              <p style={{ color: "#475569", fontSize: "1.1rem", marginTop: 16, fontStyle: "italic" }}>
                "{post.summary}"
              </p>
            </header>

            <div className="blog-content">
              {formattedBody}
            </div>

            <div style={{ marginTop: 60, paddingTop: 30, borderTop: "1px solid #e2e8f0", textAlign: "center" }}>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-slate-900 font-bold no-underline bg-slate-100 hover:bg-slate-200 px-6 py-3 rounded-full transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Bloglara Dön
              </Link>
            </div>
          </article>
        </div>

      </main>

      <SiteFooter />
    </>
  );
}
