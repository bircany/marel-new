import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";
import { absoluteUrl } from "@/app/lib/site";

export const metadata = {
  title: "Marel Plise Perde | Ürün Çeşitlerimiz",
  description: "Cam balkon, kış bahçesi, PVC pencere ve kapılarınız için özel ölçü plise perde çeşitlerimizi inceleyin.",
  openGraph: {
    title: "Ürün Çeşitlerimiz - Marel Plise",
    description: "Özel ölçü plise perde modelleri",
    url: absoluteUrl("/urun-cesitleri"),
    siteName: "Marel Plise Perde",
  },
};

const CATEGORIES = [
  {
    title: "Cam Balkon Plise Perde",
    description: "Katlanabilir ve sürme cam balkon sistemleri için özel olarak tasarlanmış, tam uyumlu ve estetik plise perde çözümleri.",
    image: "/images/real/diamond-beyaz-siyah-ip.jpeg",
    slug: "cam-balkon-plise-perde"
  },
  {
    title: "Kış Bahçesi ve Tavan Perdesi",
    description: "Eğimli ve yatay tavan camları için özel mekanizmalı, güneş ışığını mükemmel şekilde kontrol eden sistemler.",
    image: "/images/hero/marel-honeycomb-hero-v3.png",
    slug: "kis-bahcesi-plise-perde"
  },
  {
    title: "Karartma (Blackout) Plise Perde",
    description: "Yatak odaları ve ışık istenmeyen alanlar için %100 ışık geçirmez, tam karartma sağlayan özel kumaş seçenekleri.",
    image: "/images/real/diamond-beyaz-siyah-ip.jpeg",
    slug: "karartma-plise-perde"
  },
  {
    title: "Tül Plise Perde",
    description: "İçeriyi ferah gösterirken dışarıdan görünmeyi engelleyen, zarif dokusuyla mekanlarınıza şıklık katan tül sistemler.",
    image: "/images/hero/marel-honeycomb-hero-v3.png",
    slug: "tul-plise-perde"
  },
  {
    title: "PVC Pencere ve Kapı Plise Perde",
    description: "Her marka PVC pencere ve kapı sistemine kolayca monte edilebilen, pratik ve şık kullanım sunan perde modelleri.",
    image: "/images/real/diamond-beyaz-siyah-ip.jpeg",
    slug: "pvc-pencere-kapi-perde"
  },
  {
    title: "Gece Gündüz (İkili) Plise Perde",
    description: "Tek mekanizmada hem tül hem de karartma kumaşını bir arada sunan, çift yönlü ve fonksiyonel perde sistemi.",
    image: "/images/hero/marel-honeycomb-hero-v3.png",
    slug: "gece-gunduz-plise-perde"
  }
];

export default function UrunCesitleriPage() {
  return (
    <>
      <SiteHeader />
      
      <main style={{ minHeight: "80vh", background: "#f8fafc" }}>
        
        {/* Premium Header */}
        <section style={{ 
          position: "relative", 
          padding: "80px 20px 60px", 
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#fff",
          textAlign: "center",
          overflow: "hidden"
        }}>
          {/* Decorative blur elements */}
          <div style={{ position: "absolute", top: "-50%", left: "-10%", width: "40%", height: "200%", background: "radial-gradient(ellipse at center, rgba(234, 179, 8, 0.15) 0%, rgba(0,0,0,0) 70%)", transform: "rotate(25deg)" }} />
          <div style={{ position: "absolute", bottom: "-50%", right: "-10%", width: "40%", height: "200%", background: "radial-gradient(ellipse at center, rgba(56, 189, 248, 0.1) 0%, rgba(0,0,0,0) 70%)", transform: "rotate(-25deg)" }} />
          
          <div className="container" style={{ position: "relative", zIndex: 10, maxWidth: 800, margin: "0 auto" }}>
            <span style={{ 
              display: "inline-block",
              background: "rgba(234, 179, 8, 0.2)",
              color: "#fde047",
              padding: "6px 16px",
              borderRadius: 30,
              fontSize: "0.85rem",
              fontWeight: 800,
              letterSpacing: "0.1em",
              marginBottom: 20
            }}>
              KOLLEKSİYONUMUZ
            </span>
            <h1 style={{ 
              fontSize: "clamp(2.5rem, 5vw, 4rem)", 
              fontWeight: 900, 
              marginBottom: 20,
              lineHeight: 1.1,
              background: "linear-gradient(to right, #fff, #cbd5e1)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              Ürün Çeşitlerimiz
            </h1>
            <p style={{ color: "#94a3b8", fontSize: "1.15rem", lineHeight: 1.6 }}>
              Her ihtiyaca, pencere tipine ve mekana özel olarak tasarlanmış, fonksiyonel ve estetik plise perde çözümlerimiz.
            </p>
          </div>
        </section>

        {/* Premium Grid */}
        <section className="container" style={{ padding: "60px 20px 80px", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", 
            gap: "40px" 
          }}>
            {CATEGORIES.map((cat, idx) => (
              <div 
                key={idx} 
                className="category-card"
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  overflow: "hidden",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                <div style={{ position: "relative", width: "100%", height: 260, background: "#f1f5f9" }}>
                  <Image 
                    src={cat.image} 
                    alt={cat.title} 
                    fill 
                    sizes="(max-width: 768px) 100vw, 400px"
                    style={{ objectFit: "cover", transition: "transform 0.5s" }} 
                    className="category-img"
                  />
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 50%)",
                    pointerEvents: "none"
                  }} />
                </div>
                
                <div style={{ padding: "30px 24px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                  <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", marginBottom: 12 }}>
                    {cat.title}
                  </h2>
                  <p style={{ color: "#475569", lineHeight: 1.6, flexGrow: 1, marginBottom: 24 }}>
                    {cat.description}
                  </p>
                  
                  <Link href="/urunler" style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#eab308",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    textDecoration: "none",
                    padding: "10px 0",
                    borderTop: "1px solid #f1f5f9",
                    marginTop: "auto"
                  }}>
                    Koleksiyonu İncele 
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      <SiteFooter />

      <style dangerouslySetInnerHTML={{__html: `
        .category-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08) !important;
          border-color: #cbd5e1 !important;
        }
        .category-card:hover .category-img {
          transform: scale(1.05);
        }
      `}} />
    </>
  );
}
