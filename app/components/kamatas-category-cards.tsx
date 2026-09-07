"use client";

import Image from "next/image";
import Link from "next/link";

const categoryCards = [
  {
    title: "AKORDİYON SİNEKLİKLER",
    subtitle: "Özel ölçüye göre pileli pencere ve kapı sineklikleri",
    href: "/sineklikler?alt=akordiyon",
    image: "/images/products/kamatas/akordeon-kap-sineklik-altnmee-019fd3de.webp",
  },
  {
    title: "EVCİL HAYVAN SİNEKLİKLERİ",
    subtitle: "Kedi ve köpekler için yırtılmaz çelik tüllü koruma",
    href: "/sineklikler?alt=kedi",
    image: "/images/products/kamatas/kedi-tll-menteeli-kapi-sineklik-beyaz-0e43fb12.webp",
  },
  {
    title: "SABİT SÖK-TAK SİNEKLİKLER",
    subtitle: "Kolayca takılıp çıkarılabilen pratik pencere sinekliği",
    href: "/sineklikler?alt=sabit-sok-tak",
    image: "/images/products/kamatas/1725-sineklik-aksesuar-takimi--48e5bd.webp",
  },
  {
    title: "SÜRME SİNEKLİKLER",
    subtitle: "Geniş sürme cam ve balkon kapıları için ergonomik ray sistemi",
    href: "/sineklikler?alt=surme",
    image: "/images/products/kamatas/100-isik-yalitimli-surme-plise-perd-e6c81d54.webp",
  },
  {
    title: "PLİSE PERDELER",
    subtitle: "Cam balkon ve evler için dekoratif, güneşi kıran plise perdeler",
    href: "/plise-perdeler",
    image: "/images/products/plise-perde-cam-balkon.jpg",
  },
  {
    title: "MERDİVEN VE KAPI TUTAMAKLARI",
    subtitle: "Alüminyum sağlam profil ve tutamak aksesuarları",
    href: "/tutamaklar",
    image: "/images/products/kamatas/1725-sineklik-tutamak-beyaz-4-adet-07087690.webp",
  },
];

export function KamatasCategoryCards() {
  return (
    <section className="shop-section kamatas-categories" id="kategoriler">
      <div className="shop-container">
        <div className="shop-section-title">
          <div>
            <span>KATEGORİLER</span>
            <h2>Ürün Kategorilerimiz</h2>
          </div>
          <Link href="/kategoriler" className="kamatas-view-all">Tüm Kategoriler →</Link>
        </div>
        <div className="kamatas-category-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {categoryCards.map((card) => (
            <Link href={card.href} key={card.title} className="kamatas-category-card" style={{ height: 260, position: "relative", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
              <Image
                unoptimized
                src={card.image}
                alt={card.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: "cover" }}
              />
              <div className="kamatas-category-overlay" style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.05) 100%)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                padding: "20px 18px",
                transition: "background 0.3s ease"
              }}>
                <h3 style={{ color: "#ffffff", fontSize: "1.05rem", fontWeight: 800, margin: 0, letterSpacing: "0.02em" }}>{card.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.82)", fontSize: "0.74rem", margin: "5px 0 0", lineHeight: 1.35 }}>{card.subtitle}</p>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "#e6b325", fontSize: "0.75rem", fontWeight: 700, marginTop: 8 }}>
                  Modelleri İncele →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
