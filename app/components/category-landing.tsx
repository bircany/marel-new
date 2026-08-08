import Image from "next/image";
import Link from "next/link";
import type { CategoryPageConfig } from "@/app/data";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

const phone = "905467356602";

export function CategoryLanding({ config }: { config: CategoryPageConfig }) {
  const whatsappMessage = encodeURIComponent(`Merhaba Marel, ${config.title} için ölçü ve fiyat bilgisi almak istiyorum.`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Marel ${config.title}`,
    description: config.description,
    provider: { "@type": "Organization", name: "Marel" },
    areaServed: "Türkiye",
    serviceType: config.title,
    url: `https://marelpliseperde.com/urunler/${config.slug}`,
  };

  return (
    <>
      <SiteHeader />
      <main className="category-landing-page">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
        <section className="category-detail-hero">
          <div className="category-detail-copy shop-container">
            <div className="category-detail-breadcrumb"><Link href="/">Ana sayfa</Link><span>/</span><Link href="/urunler">Ürünler</Link><span>/</span><span>{config.title}</span></div>
            <span className="category-detail-eyebrow">MAREL · ÖLÇÜYE ÖZEL SİSTEM</span>
            <h1>{config.headline}</h1>
            <p>{config.description}</p>
            <div className="category-detail-actions">
              <a className="category-primary-button" href={`https://wa.me/${phone}?text=${whatsappMessage}`} target="_blank" rel="noreferrer">Fiyat ve ölçü desteği al <span>↗</span></a>
              <a className="category-secondary-button" href="#cozumler">Sistemi incele <span>↓</span></a>
            </div>
          </div>
          <div className="category-detail-media"><Image unoptimized src={config.image} alt={`${config.title} Marel uygulama örneği`} fill priority sizes="(max-width: 900px) 100vw, 52vw" /></div>
        </section>

        <section className="category-metrics" aria-label={`${config.title} öne çıkan özellikleri`}>
          <div className="shop-container">{config.metrics.map((metric) => <article key={metric.label}><strong>{metric.value}</strong><span>{metric.label}</span></article>)}</div>
        </section>

        <section className="category-solutions shop-container" id="cozumler">
          <div className="category-section-heading"><span>DOĞRU SİSTEMİ SEÇİN</span><h2>{config.title} çözümleri</h2><p>Kullanım alanınızı ve beklentinizi belirleyin; ölçünüze uygun sistemi birlikte netleştirelim.</p></div>
          <div className="category-solution-grid">{config.solutions.map((solution, index) => <article key={solution.title}><span>0{index + 1}</span><h3>{solution.title}</h3><p>{solution.description}</p></article>)}</div>
        </section>

        <section className="category-spec-section">
          <div className="shop-container category-spec-grid">
            <div><span className="category-detail-eyebrow">TEKNİK DETAYLAR</span><h2>Mekânınıza göre yapılandırılır.</h2><p>Ölçü, renk ve kullanım biçimi tek bir standartla sınırlandırılmaz. Marel danışmanı bütün seçimleri sipariş öncesinde sizinle teyit eder.</p></div>
            <dl>{config.specs.map((spec) => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl>
          </div>
        </section>

        <section className="category-process shop-container">
          <div className="category-section-heading"><span>NASIL İLERLİYOR?</span><h2>Dört adımda ölçüye özel üretim</h2></div>
          <ol>{["Mekân fotoğrafını ve yaklaşık ölçüyü paylaşın", "Sistem, renk ve kullanım seçeneklerini belirleyin", "Net ölçü ve fiyat onayını tamamlayın", "Üretim ve teslimat durumunu hesabınızdan izleyin"].map((step, index) => <li key={step}><b>{index + 1}</b><span>{step}</span></li>)}</ol>
        </section>

        {config.featuredHref ? <section className="category-featured-link shop-container"><div><span>ÖNE ÇIKAN KOLEKSİYON</span><h2>{config.featuredTitle}</h2><p>{config.featuredText}</p></div><Link href={config.featuredHref}>Koleksiyonu incele →</Link></section> : null}

        <section className="category-final-cta"><div className="shop-container"><span>MAREL DANIŞMANI</span><h2>Ölçünüzü gönderin,<br />net teklifinizi hazırlayalım.</h2><a href={`https://wa.me/${phone}?text=${whatsappMessage}`} target="_blank" rel="noreferrer">WhatsApp’tan görüşmeyi başlat →</a></div></section>
      </main>
      <SiteFooter />
    </>
  );
}
