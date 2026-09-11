import Link from "next/link";
import Image from "next/image";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import { absoluteUrl } from "@/app/lib/site";
import { ensureDatabase, getDb } from "@/db";

export const metadata = {
  title: "Marel Plise Perde | Özel Ölçü Plise Perde Sistemleri",
  description:
    "Marel Plise Perde - Diamond, Blackout, Honeycomb, Touch ve 17 farklı seride özel ölçüye göre kaliteli plise perde üretimi.",
};

const POPULAR_DIAMOND = [
  { code: "DIAMOND - 100", name: "Diamond Beyaz Plise Perde", price: "550.00₺", image: "/images/yaren/diamond100.png", slug: "diamond-series-plise-perde" },
  { code: "DIAMOND - 108", name: "Diamond Krem Plise Perde", price: "550.00₺", image: "/images/yaren/diamond108.png", slug: "diamond-series-plise-perde" },
  { code: "DIAMOND - 102", name: "Diamond Gri Plise Perde", price: "550.00₺", image: "/images/yaren/diamond102.png", slug: "diamond-series-plise-perde" },
  { code: "DIAMOND - 103", name: "Diamond Ara-Gri Plise Perde", price: "550.00₺", image: "/images/yaren/diamond103.png", slug: "diamond-series-plise-perde" },
  { code: "DIAMOND - 109", name: "Diamond Açık-Gri Plise Perde", price: "550.00₺", image: "/images/yaren/diamond109.png", slug: "diamond-series-plise-perde" },
  { code: "DIAMOND - 110", name: "Diamond Antrasit Plise Perde", price: "550.00₺", image: "/images/yaren/diamond110.png", slug: "diamond-series-plise-perde" },
  { code: "DIAMOND - 113", name: "Diamond Kahve Plise Perde", price: "550.00₺", image: "/images/yaren/diamond113.png", slug: "diamond-series-plise-perde" },
  { code: "DIAMOND - 111", name: "Diamond Siyah Plise Perde", price: "550.00₺", image: "/images/yaren/diamond111.png", slug: "diamond-series-plise-perde" },
];

const POPULAR_BLACKOUT = [
  { code: "BLACKOUT - 01 KREM", name: "Blackout Krem Plise Perde", price: "1,166.00₺", image: "/images/yaren/BLACOUT-KREM.png", slug: "blackout-series-plise-perde" },
  { code: "BLACKOUT - 03 ANTRASİT", name: "Blackout Antrasit Plise Perde", price: "1,166.00₺", image: "/images/yaren/BLACOUT-ANTRASIT.png", slug: "blackout-series-plise-perde" },
  { code: "BLACKOUT - SİYAH", name: "Blackout Siyah Plise Perde", price: "1,166.00₺", image: "/images/yaren/BLACOUT-SIYAH.png", slug: "blackout-series-plise-perde" },
  { code: "BLACKOUT - 02 GRİ", name: "Blackout Gri Plise Perde", price: "1,166.00₺", image: "/images/yaren/BLACOUT-GRI.png", slug: "blackout-series-plise-perde" },
];

const POPULAR_HONEYCOMB = [
  { code: "HONEYCOMB SERIES - 001", name: "Honeycomb Beyaz Plise Perde", price: "1,166.00₺", image: "/images/yaren/HONEY-001.png", slug: "honeycomb-series-plise-perde" },
  { code: "HONEYCOMB SERIES - 002", name: "Honeycomb Krem Plise Perde", price: "1,166.00₺", image: "/images/yaren/HONEY-002.png", slug: "honeycomb-series-plise-perde" },
  { code: "HONEYCOMB SERIES - 003", name: "Honeycomb Gri Plise Perde", price: "1,166.00₺", image: "/images/yaren/HONEY-003.png", slug: "honeycomb-series-plise-perde" },
  { code: "HONEYCOMB SERIES - 006", name: "Honeycomb Siyah Plise Perde", price: "1,166.00₺", image: "/images/yaren/HONEY-005.png", slug: "honeycomb-series-plise-perde" },
];

const FALLBACK_BLOGS = [
  {
    id: "ann-1",
    slug: "olcuye-ozel-uretim-rehberi",
    title: "Ölçüye özel üretim nasıl ilerliyor?",
    summary: "Ölçü teyidinden üretim ve teslimata kadar Marel sipariş sürecini adım adım keşfedin.",
    image_url: "/images/real/diamond-beyaz-siyah-ip.jpeg",
  },
  {
    id: "ann-2",
    slug: "honeycomb-isi-yalitimi",
    title: "Honeycomb ile dört mevsim konfor",
    summary: "Hücresel kumaş yapısının ışık ve ısı kontrolüne katkısını yakından inceleyin.",
    image_url: "/images/hero/marel-honeycomb-hero-v3.png",
  },
  {
    id: "ann-3",
    slug: "whatsapp-olcu-destegi",
    title: "Fotoğrafınızı gönderin, sistemi birlikte seçelim",
    summary: "Perde, sineklik veya kapı sistemi seçiminde Marel danışmanından hızlı destek alın.",
    image_url: "/images/catalog/diamond.webp",
  },
];

export default async function Home() {
  await ensureDatabase();
  const db = getDb();
  let blogPosts: any[] = [];
  try {
    const raw = await db.prepare("SELECT * FROM announcements WHERE published = 1 ORDER BY created_at DESC LIMIT 3").all();
    blogPosts = raw.results || [];
  } catch (err) {
    console.error("Home blog fetch error:", err);
  }

  if (!blogPosts || blogPosts.length === 0) {
    blogPosts = FALLBACK_BLOGS;
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "HomeAndConstructionBusiness",
                "@id": `${absoluteUrl("/")}#organization`,
                name: "Marel Plise Perde",
                url: absoluteUrl("/"),
                logo: absoluteUrl("/icon.png"),
                image: absoluteUrl("/og.png"),
                email: "info@marelpliseperde.com",
                telephone: "+905467356602",
              },
            ],
          }).replace(/</g, "\\u003c"),
        }}
      />
      <SiteHeader />
      <main style={{ backgroundColor: "#faf9f5" }}>
        
        {/* Hero Section */}
        <section className="relative w-full h-[55vh] md:h-[75vh] bg-neutral-900 flex items-center overflow-hidden">
          <Image
            src="/images/catalog/diamond.webp"
            alt="Plise Perde Hero"
            fill
            priority
            style={{ objectFit: "cover", opacity: 0.6 }}
          />
          <div className="relative z-10 shop-container w-full">
            <div className="max-w-2xl text-white">
              <h1 className="text-4xl md:text-6xl font-light mb-4 tracking-tight" style={{ fontFamily: "serif" }}>
                Özel Ölçü Plise Perde
              </h1>
              <p className="text-sm md:text-base text-neutral-200 mb-8 max-w-lg leading-relaxed">
                İmalattan doğrudan satış avantajı ve yüksek kumaş kalitesiyle mekanlarınıza değer katan plise perde sistemleri.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/urun-cesitleri"
                  className="inline-block bg-[#b8904f] hover:bg-[#9f7838] text-white px-8 py-3 text-sm font-medium tracking-wider transition-colors rounded-sm shadow-md"
                >
                  ÜRÜN ÇEŞİTLERİMİZ
                </Link>
                <Link
                  href="/urunler"
                  className="inline-block bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-8 py-3 text-sm font-medium tracking-wider transition-colors rounded-sm border border-white/40"
                >
                  TÜM ÜRÜNLER
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Showcase (Matching Screenshots 1 & 2) */}
        <section style={{ padding: "70px 20px 40px", maxWidth: "1280px", margin: "0 auto" }}>
          
          {/* Main Title */}
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2
              style={{
                fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                fontWeight: 400,
                letterSpacing: "0.15em",
                color: "#1e293b",
                textTransform: "uppercase",
                fontFamily: "serif",
              }}
            >
              EN POPÜLER ÜRÜNLER
            </h2>
          </div>

          {/* 1. DIAMOND SERIES */}
          <div style={{ marginBottom: "60px" }}>
            <div style={{ textAlign: "center", marginBottom: "25px" }}>
              <h3
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  color: "#475569",
                  textTransform: "uppercase",
                }}
              >
                DİAMOND - SERIES
              </h3>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "20px",
              }}
            >
              {POPULAR_DIAMOND.map((item) => (
                <Link
                  key={item.code}
                  href={`/urunler/${item.slug}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "#ffffff",
                    borderRadius: "14px",
                    overflow: "hidden",
                    textDecoration: "none",
                    border: "1px solid #edebe4",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  className="group hover:-translate-y-1 hover:shadow-lg"
                >
                  <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 11", backgroundColor: "#f5f5f2", overflow: "hidden" }}>
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      style={{ objectFit: "cover" }}
                      className="transition-transform duration-300 group-hover:scale-105"
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.85)",
                        color: "#ffffff",
                        padding: "3px 10px",
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      {item.code}
                    </div>
                  </div>
                  <div style={{ padding: "14px 12px", textAlign: "left" }}>
                    <h4 style={{ fontSize: "0.88rem", fontWeight: 600, color: "#1e293b", marginBottom: "4px", lineHeight: 1.3 }}>
                      {item.name}
                    </h4>
                    <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "#b8904f", margin: 0 }}>
                      {item.price}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* 2. BLACKOUT SERIES */}
          <div style={{ marginBottom: "60px" }}>
            <div style={{ textAlign: "center", marginBottom: "25px" }}>
              <h3
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  color: "#475569",
                  textTransform: "uppercase",
                }}
              >
                BLACKOUT - SERIES
              </h3>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "20px",
              }}
            >
              {POPULAR_BLACKOUT.map((item) => (
                <Link
                  key={item.code}
                  href={`/urunler/${item.slug}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "#ffffff",
                    borderRadius: "14px",
                    overflow: "hidden",
                    textDecoration: "none",
                    border: "1px solid #edebe4",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  className="group hover:-translate-y-1 hover:shadow-lg"
                >
                  <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 11", backgroundColor: "#f5f5f2", overflow: "hidden" }}>
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      style={{ objectFit: "cover" }}
                      className="transition-transform duration-300 group-hover:scale-105"
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.85)",
                        color: "#ffffff",
                        padding: "3px 10px",
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      {item.code}
                    </div>
                  </div>
                  <div style={{ padding: "14px 12px", textAlign: "left" }}>
                    <h4 style={{ fontSize: "0.88rem", fontWeight: 600, color: "#1e293b", marginBottom: "4px", lineHeight: 1.3 }}>
                      {item.name}
                    </h4>
                    <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "#b8904f", margin: 0 }}>
                      {item.price}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* 3. HONEYCOMB SERIES */}
          <div style={{ marginBottom: "60px" }}>
            <div style={{ textAlign: "center", marginBottom: "25px" }}>
              <h3
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  color: "#475569",
                  textTransform: "uppercase",
                }}
              >
                HONEYCOMB - SERIES
              </h3>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "20px",
              }}
            >
              {POPULAR_HONEYCOMB.map((item) => (
                <Link
                  key={item.code}
                  href={`/urunler/${item.slug}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "#ffffff",
                    borderRadius: "14px",
                    overflow: "hidden",
                    textDecoration: "none",
                    border: "1px solid #edebe4",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  className="group hover:-translate-y-1 hover:shadow-lg"
                >
                  <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 11", backgroundColor: "#f5f5f2", overflow: "hidden" }}>
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      style={{ objectFit: "cover" }}
                      className="transition-transform duration-300 group-hover:scale-105"
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.85)",
                        color: "#ffffff",
                        padding: "3px 10px",
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      {item.code}
                    </div>
                  </div>
                  <div style={{ padding: "14px 12px", textAlign: "left" }}>
                    <h4 style={{ fontSize: "0.88rem", fontWeight: 600, color: "#1e293b", marginBottom: "4px", lineHeight: 1.3 }}>
                      {item.name}
                    </h4>
                    <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "#b8904f", margin: 0 }}>
                      {item.price}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* View All Button */}
          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <Link
              href="/urun-cesitleri"
              style={{
                display: "inline-block",
                backgroundColor: "#b8904f",
                color: "#ffffff",
                padding: "14px 36px",
                fontSize: "0.9rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                borderRadius: "6px",
                textDecoration: "none",
                transition: "background-color 0.2s, transform 0.15s",
                boxShadow: "0 4px 15px rgba(184, 144, 79, 0.25)",
              }}
              className="hover:bg-[#9f7838] hover:-translate-y-0.5"
            >
              TÜM ÜRÜN ÇEŞİTLERİNİ GÖR &rarr;
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20" style={{ backgroundColor: "#ffffff" }}>
          <div className="shop-container">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
              <div className="lg:col-span-1">
                <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase mb-2 block">MAREL PLİSE PERDE</span>
                <h2 className="text-3xl md:text-4xl font-light text-neutral-900 mb-6" style={{ fontFamily: "serif" }}>
                  Plise Perdede Uzman Üretim
                </h2>
              </div>
              <div className="lg:col-span-2">
                <p className="text-neutral-600 mb-6 leading-relaxed">
                  Plise perdede uzman ekibimizle, ölçüye özel üretim ve modern tasarımları bir araya getiriyoruz. Kaliteli mekanizmalar, dayanıklı kumaşlar ve delmeden montaj seçenekleriyle hem şık hem de fonksiyonel çözümler sunuyoruz.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                  <div className="p-6 bg-[#faf9f5] rounded-xl border border-[#edebe4]">
                    <h3 className="text-base font-bold text-neutral-900 mb-2">Ölçüye Özel Üretim</h3>
                    <p className="text-sm text-neutral-500 leading-relaxed">Pencerenize tam uyum sağlayan kişiye özel plise perde tasarımları. Hızlı üretim, sorunsuz montaj.</p>
                  </div>
                  <div className="p-6 bg-[#faf9f5] rounded-xl border border-[#edebe4]">
                    <h3 className="text-base font-bold text-neutral-900 mb-2">Delmeden Kolay Montaj</h3>
                    <p className="text-sm text-neutral-500 leading-relaxed">Delme gerektirmeyen pratik montaj seçenekleri. Kolay temizlenebilir kumaş yapısı.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Blog Section */}
        {blogPosts.length > 0 && (
          <section className="py-20" style={{ backgroundColor: "#faf9f5" }}>
            <div className="container" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
              <div style={{ textAlign: "center", marginBottom: 40 }}>
                <span style={{ color: "#b8904f", fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: 2 }}>
                  Marel Blog
                </span>
                <h2 className="text-3xl md:text-4xl font-light text-neutral-900 mt-2 mb-4" style={{ fontFamily: "serif" }}>
                  Güncel İçeriklerimiz
                </h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 30 }}>
                {blogPosts.map((post) => (
                  <Link
                    href={`/blog/${post.slug}`}
                    key={post.id}
                    style={{
                      display: "block",
                      background: "#fff",
                      borderRadius: 12,
                      overflow: "hidden",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
                      textDecoration: "none",
                      border: "1px solid #edebe4",
                      transition: "transform 0.2s",
                    }}
                    className="hover:-translate-y-1"
                  >
                    <div style={{ position: "relative", height: 200, background: "#e2e8f0" }}>
                      <Image
                        src={post.image_url || "/images/real/diamond-beyaz-siyah-ip.jpeg"}
                        alt={post.title}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div style={{ padding: 20 }}>
                      <h3 style={{ fontSize: "1.1rem", color: "#0f172a", fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>
                        {post.title}
                      </h3>
                      <p style={{ color: "#64748b", fontSize: "0.9rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {post.summary}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <div style={{ textAlign: "center", marginTop: 40 }}>
                <Link
                  href="/blog"
                  className="inline-block border-2 border-[#1e293b] text-[#1e293b] hover:bg-[#1e293b] hover:text-white px-8 py-3 text-sm font-medium tracking-wider transition-colors rounded-full"
                >
                  Tüm Yazıları İncele
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
