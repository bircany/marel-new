import Image from "next/image";
import Link from "next/link";
import { ProductShelf, type StoreProduct } from "./components/product-shelf";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import { StorefrontHero } from "./components/storefront-hero";
import { Reveal } from "./components/motion-media";
import { KamatasCategoryCards } from "./components/kamatas-category-cards";
import { KamatasReviews } from "./components/kamatas-reviews";
import { KamatasFeatures, KamatasOrderTracking } from "./components/kamatas-features";
import { stListProducts, stListApprovedReviews } from "@/app/lib/softtrade";
import { absoluteUrl } from "@/app/lib/site";

export const metadata = {
  title: "Kamataş Alüminyum | Sineklik, Perde ve Aksesuar",
  description:
    "Kamataş Alüminyum - Sineklik, perde, otomatik panjur ve aksesuar ürünlerinde Türkiye'nin en çok satış yapan firması. 73.500+ mutlu müşteri.",
};

const bestSellers: StoreProduct[] = [
  {
    id: "KS-001",
    name: "Menteşeli Pencere Sineklik Beyaz",
    code: "KS-001",
    category: "Kamataş / Menteşeli Sineklik",
    image: "/images/products/menteseli-beyaz.jpg",
    badge: "EN ÇOK SATAN",
    feature: "Menteşeli pencere sinekliği · Beyaz renk",
    colors: ["#ffffff", "#d4d4d4", "#1a1a1a"],
    priceKurus: 68900,
    oldPriceKurus: 826800,
    currency: "TRY",
    href: "/urunler/menteseli-pencere-sineklik-beyaz",
  },
  {
    id: "KS-002",
    name: "Menteşeli Pencere Sineklik Antrasit",
    code: "KS-002",
    category: "Kamataş / Menteşeli Sineklik",
    image: "/images/products/menteseli-antrasit.jpg",
    badge: "EN ÇOK SATAN",
    feature: "Menteşeli pencere sinekliği · Antrasit renk",
    colors: ["#2d2d2d", "#ffffff", "#8b7355"],
    priceKurus: 68900,
    oldPriceKurus: 826800,
    currency: "TRY",
    href: "/urunler/menteseli-pencere-sineklik-antrasit",
  },
  {
    id: "KS-003",
    name: "Menteşeli Pencere Sineklik Altınmeşe",
    code: "KS-003",
    category: "Kamataş / Menteşeli Sineklik",
    image: "/images/products/menteseli-altinmese.jpg",
    badge: "EN ÇOK SATAN",
    feature: "Menteşeli pencere sinekliği · Altınmeşe renk",
    colors: ["#8b7355", "#ffffff", "#2d2d2d"],
    priceKurus: 90000,
    oldPriceKurus: 120000,
    currency: "TRY",
    href: "/urunler/menteseli-pencere-sineklik-altinmese",
  },
  {
    id: "KS-004",
    name: "Menteşeli Kapı Sineklik Beyaz",
    code: "KS-004",
    category: "Kamataş / Menteşeli Sineklik",
    image: "/images/products/kapi-sineklik-beyaz.jpg",
    badge: "EN ÇOK SATAN",
    feature: "Menteşeli kapı sinekliği · Beyaz renk",
    colors: ["#ffffff", "#2d2d2d", "#8b7355"],
    priceKurus: 117000,
    oldPriceKurus: 170000,
    currency: "TRY",
    href: "/urunler/menteseli-kapi-sineklik-beyaz",
  },
];

const catalogProducts: StoreProduct[] = [
  {
    id: "KS-005",
    name: "Akordeon Pencere Sineklik Beyaz",
    code: "KS-005",
    category: "Kamataş / Akordeon Sineklik",
    image: "/images/products/akordiyon-beyaz.jpg",
    badge: "PEŞİN FİYATINA 3 TAKSİT",
    feature: "Akordiyon pencere sinekliği · Beyaz renk",
    colors: ["#ffffff", "#2d2d2d", "#8b7355"],
    priceKurus: 150640,
    oldPriceKurus: 215200,
    currency: "TRY",
    href: "/urunler/akordiyon-pencere-sineklik-beyaz",
  },
  {
    id: "KS-006",
    name: "Akordeon Pencere Sineklik Antrasit",
    code: "KS-006",
    category: "Kamataş / Akordeon Sineklik",
    image: "/images/products/akordiyon-antrasit.jpg",
    badge: "PEŞİN FİYATINA 3 TAKSİT",
    feature: "Akordiyon pencere sinekliği · Antrasit renk",
    colors: ["#2d2d2d", "#ffffff", "#8b7355"],
    priceKurus: 150640,
    oldPriceKurus: 215200,
    currency: "TRY",
    href: "/urunler/akordiyon-pencere-sineklik-antrasit",
  },
  {
    id: "KS-007",
    name: "Akordeon Pencere Sineklik Altınmeşe",
    code: "KS-007",
    category: "Kamataş / Akordeon Sineklik",
    image: "/images/products/akordiyon-altinmese.jpg",
    badge: "PEŞİN FİYATINA 3 TAKSİT",
    feature: "Akordiyon pencere sinekliği · Altınmeşe renk",
    colors: ["#8b7355", "#ffffff", "#2d2d2d"],
    priceKurus: 185863,
    oldPriceKurus: 265500,
    currency: "TRY",
    href: "/urunler/akordiyon-pencere-sineklik-altinmese",
  },
  {
    id: "KS-008",
    name: "Akordeon Kapı Sineklik Beyaz",
    code: "KS-008",
    category: "Kamataş / Akordeon Sineklik",
    image: "/images/products/akordiyon-kapi-beyaz.jpg",
    badge: "PEŞİN FİYATINA 3 TAKSİT",
    feature: "Akordiyon kapı sinekliği · Beyaz renk",
    colors: ["#ffffff", "#2d2d2d", "#8b7355"],
    priceKurus: 250000,
    oldPriceKurus: 367500,
    currency: "TRY",
    href: "/urunler/akordiyon-kapi-sineklik-beyaz",
  },
];

function parseSwatches(colors?: string): string[] {
  const neutral = ["#ffffff", "#d4d4d4", "#1a1a1a"];
  try {
    const parsed = JSON.parse(colors ?? "[]") as Array<{ hex?: string }>;
    return parsed.map((item) => item.hex).filter(Boolean) as string[];
  } catch {
    return neutral;
  }
}

function toShelfProduct(product: Awaited<ReturnType<typeof stListProducts>>[number]): StoreProduct {
  return {
    id: product.id,
    name: product.name,
    code: product.sku,
    category: `Kamataş / ${product.category}`,
    image: product.image,
    badge: product.salePrice ? "İndirimli" : "Yeni",
    feature: "Ölçüye özel sineklik · Her görsel ayrı ürün",
    colors: parseSwatches(product.colors),
    priceKurus: product.salePrice ?? product.price,
    currency: product.currency,
    href: `/urunler/${product.slug}`,
  };
}

export default async function Home() {
  const [liveProducts, reviews] = await Promise.all([
    stListProducts(false, "Kamataş").catch(() => [] as Awaited<ReturnType<typeof stListProducts>>),
    stListApprovedReviews(3).catch(() => [] as Awaited<ReturnType<typeof stListApprovedReviews>>),
  ]);
  const liveById = new Map(liveProducts.map((product) => [product.slug, product]));
  const liveCatalogShelf = liveProducts.slice(0, 8).map(toShelfProduct);
  const liveShelf = (shelf: StoreProduct[]): StoreProduct[] =>
    shelf.map((item) => {
      const slug = item.href.split("/").filter(Boolean).at(-1) ?? "";
      const live = liveById.get(slug);
      if (!live || live.stock <= 0) return { ...item, id: undefined, priceKurus: undefined, price: "Ölçüye göre fiyat" };
      return { ...item, id: live.id, priceKurus: live.salePrice ?? live.price, price: undefined, currency: live.currency };
    });

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
                name: "Kamataş Alüminyum",
                url: absoluteUrl("/"),
                logo: absoluteUrl("/icon.svg"),
                email: "info@kamatas.com",
                telephone: "+905303842837",
                sameAs: ["https://wa.me/905303842837"],
              },
              {
                "@type": "WebSite",
                "@id": `${absoluteUrl("/")}#website`,
                name: "Kamataş Alüminyum",
                url: absoluteUrl("/"),
                inLanguage: "tr-TR",
                publisher: { "@id": `${absoluteUrl("/")}#organization` },
              },
              {
                "@type": "WebPage",
                name: "Kamataş Alüminyum | Sineklik, Perde ve Aksesuar",
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

        {/* En Çok Satanlar */}
        <section className="shop-section" id="cok-satanlar">
          <div className="shop-container">
            <div className="shop-section-title">
              <div>
                <span>KAMATAŞ ALÜMİNYUM</span>
                <h2>En Çok Satan Ürünler</h2>
              </div>
              <Link href="/urunler">Tümünü Gör →</Link>
            </div>
            <ProductShelf products={liveCatalogShelf.length ? liveCatalogShelf.slice(0, 4) : liveShelf(bestSellers)} />
          </div>
        </section>

        {/* Kategori Kartları - Üst Satır */}
        <KamatasCategoryCards />

        {/* Akordeon Ürünleri */}
        <section className="shop-section" id="akordiyon-urunleri">
          <div className="shop-container">
            <div className="shop-section-title">
              <div>
                <span>AKORDİYON SİNEKLİKLER</span>
                <h2>Akordeon Sineklik Modelleri</h2>
              </div>
              <Link href="/sineklikler?alt=akordiyon">Tümünü Gör →</Link>
            </div>
            <ProductShelf products={liveCatalogShelf.length ? liveCatalogShelf.slice(4, 8) : liveShelf(catalogProducts)} />
          </div>
        </section>

        {/* Müşteri Yorumları */}
        <KamatasReviews />

        {/* Özellikler */}
        <KamatasFeatures />

        {/* Sipariş Takip */}
        <KamatasOrderTracking />
      </main>
      <SiteFooter />
    </>
  );
}
