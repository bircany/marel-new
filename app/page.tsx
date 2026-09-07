import Link from "next/link";
import { ProductShelf, type StoreProduct } from "./components/product-shelf";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import { StorefrontHero } from "./components/storefront-hero";
import { KamatasCategoryCards } from "./components/kamatas-category-cards";
import { KamatasReviews } from "./components/kamatas-reviews";
import { KamatasFeatures, KamatasOrderTracking } from "./components/kamatas-features";
import { listProducts, listApprovedReviews, type CatalogProduct } from "@/db";
import { absoluteUrl } from "@/app/lib/site";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Marel Plise Perde | Sineklik, Perde ve Aksesuar Çözümleri",
  description:
    "Marel Plise Perde - Akordiyon sineklik, plise perde, kedi tülü sineklik ve kapı sistemlerinde özel ölçüye göre kaliteli üretim.",
};

function parseColors(colors?: string): string[] {
  if (!colors) return ["#ffffff", "#d4d4d4", "#1a1a1a"];
  try {
    const parsed = JSON.parse(colors);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => (typeof item === "string" ? item : item?.hex || item?.color || "#d4d4d4"))
        .filter(Boolean);
    }
  } catch {}
  return ["#ffffff", "#d4d4d4", "#1a1a1a"];
}

function toStoreProduct(p: CatalogProduct): StoreProduct {
  return {
    id: p.id,
    name: p.name,
    code: p.sku || p.id.slice(0, 8).toUpperCase(),
    category: p.category || "Marel Plise Perde",
    image: p.image || (p.images && p.images[0]) || "/images/catalog/diamond.webp",
    badge: p.salePrice && p.salePrice < p.price ? "İndirimli" : p.featured ? "Öne Çıkan" : "Yeni",
    feature: p.dimensions || "Ölçüye özel üretim · 1. Kalite Profil",
    colors: parseColors(p.colors),
    priceKurus: p.salePrice ?? p.price,
    currency: p.currency || "TRY",
    href: `/urunler/${p.slug}`,
  };
}

export default async function Home() {
  const [allProducts, approvedReviews] = await Promise.all([
    listProducts(false).catch(() => [] as CatalogProduct[]),
    listApprovedReviews(12).catch(() => []),
  ]);

  // Featured products managed directly from admin panel (featured: 1)
  const featured = allProducts.filter((p) => p.featured === 1);
  const bestSellersShelf = (featured.length >= 4 ? featured.slice(0, 4) : allProducts.slice(0, 4)).map(toStoreProduct);

  // Sineklik & Akordeon products shelf
  const sineklikProducts = allProducts.filter(
    (p) =>
      p.category.toLowerCase().includes("sineklik") ||
      p.category.toLowerCase().includes("akordeon") ||
      p.category.toLowerCase().includes("akordiyon") ||
      (p.rootCategory && p.rootCategory.toLowerCase().includes("sineklik"))
  );
  const sineklikShelf = (sineklikProducts.length >= 4 ? sineklikProducts.slice(0, 4) : allProducts.slice(4, 8)).map(toStoreProduct);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": `${absoluteUrl("/")}#organization`,
                name: "Marel Plise Perde",
                url: absoluteUrl("/"),
                logo: absoluteUrl("/icon.png"),
                email: "info@marelpliseperde.com",
                telephone: "+905467356602",
                sameAs: ["https://wa.me/905467356602"],
              },
              {
                "@type": "WebSite",
                "@id": `${absoluteUrl("/")}#website`,
                name: "Marel Plise Perde",
                url: absoluteUrl("/"),
                inLanguage: "tr-TR",
                publisher: { "@id": `${absoluteUrl("/")}#organization` },
              },
              {
                "@type": "WebPage",
                name: "Marel Plise Perde | Sineklik, Perde ve Aksesuar",
                url: absoluteUrl("/"),
                isPartOf: { "@id": `${absoluteUrl("/")}#website` },
                about: { "@id": `${absoluteUrl("/")}#organization` },
              },
            ],
          }).replace(/</g, "\\u003c"),
        }}
      />
      <SiteHeader />
      <main>
        <StorefrontHero />

        {/* En Çok Satan Ürünler - Live DB connected (Admin Managed) */}
        <section className="shop-section" id="cok-satanlar">
          <div className="shop-container">
            <div className="shop-section-title">
              <div>
                <span>MAREL PLİSE PERDE</span>
                <h2>En Çok Satan Ürünler</h2>
              </div>
              <Link href="/urunler">Tümünü Gör →</Link>
            </div>
            <ProductShelf products={bestSellersShelf} />
          </div>
        </section>

        {/* Ürün Kategorilerimiz - 6 Cards with Real Photos */}
        <KamatasCategoryCards />

        {/* Akordeon Sineklik Modelleri - Live DB connected */}
        <section className="shop-section" id="akordiyon-urunleri">
          <div className="shop-container">
            <div className="shop-section-title">
              <div>
                <span>AKORDİYON SİNEKLİKLER</span>
                <h2>Akordeon Sineklik Modelleri</h2>
              </div>
              <Link href="/sineklikler?alt=akordiyon">Tümünü Gör →</Link>
            </div>
            <ProductShelf products={sineklikShelf} />
          </div>
        </section>

        {/* Müşteri Yorumları (Admin Onaylı & Canlı Değişen) */}
        <KamatasReviews initialReviews={approvedReviews} />

        {/* Mağaza Avantajları */}
        <KamatasFeatures />

        {/* Sipariş Takip & Canlı Yurtiçi Kargo Sorgulama */}
        <KamatasOrderTracking />
      </main>
      <SiteFooter />
    </>
  );
}
