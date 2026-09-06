import Image from "next/image";
import Link from "next/link";
import { ProductShelf, type StoreProduct } from "./components/product-shelf";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import { StorefrontHero } from "./components/storefront-hero";
import { Reveal } from "./components/motion-media";
import { stListProducts, stListApprovedReviews } from "@/app/lib/softtrade";
import { absoluteUrl } from "@/app/lib/site";

export const metadata = {
  title: "Marel | Online Perde ve Sineklik Mağazası",
  description:
    "Plise perde, Honeycomb, jaluzi, zip perde ve sineklik sistemlerini gerçek seri ve renkleriyle inceleyin; ölçüye özel sipariş verin.",
};

const neutral = ["#f4f2ec", "#d8d3c8", "#adb0b1", "#53575a", "#232527"];

const bestSellers: StoreProduct[] = [
  {
    id: "HC-003",
    name: "Honeycomb 003 Gri Isı Yalıtımlı Plise Perde",
    code: "HC-003",
    category: "Marel / Honeycomb Series",
    image: "/images/real/honeycomb-gri-detay.png",
    badge: "Çok Satan",
    feature: "%100 ışık filtrasyonu · Isı yalıtımlı hücresel yapı",
    colors: neutral,
    priceKurus: 116600,
    currency: "TRY",
    href: "/urunler/honeycomb-003-gri",
    imagePosition: "center 38%",
  },
  {
    id: "DIA-100",
    name: "Diamond 100 Beyaz Plise Perde",
    code: "DIA-100",
    category: "Marel / Diamond Series",
    image: "/images/real/diamond-beyaz.jpeg",
    badge: "Gerçek Ürün",
    feature: "%50 ışık filtrasyonu · UV dayanımlı kumaş",
    colors: ["#f7f6f1", "#e6dfce", "#bec1c2", "#4d5052", "#1d1f21", "#7b6c58"],
    priceKurus: 116600,
    currency: "TRY",
    href: "/urunler/diamond-100-beyaz",
    imagePosition: "center 42%",
  },
  {
    id: "DIA-102",
    name: "Diamond 102 Gri Plise Perde",
    code: "DIA-102",
    category: "Marel / Diamond Series",
    image: "/images/real/diamond-gri.jpeg",
    badge: "Yeni",
    feature: "110 gr/m² polyester · Kolay yıkanabilir yapı",
    colors: ["#f7f6f1", "#ddd6c6", "#a4a7a8", "#55585b", "#252729", "#8a745a"],
    priceKurus: 116600,
    currency: "TRY",
    href: "/urunler/diamond-102-gri",
    imagePosition: "center 43%",
  },
  {
    id: "BLK-05",
    name: "Blackout 05 Siyah Tam Karartma",
    code: "BLK-05",
    category: "Marel / Blackout Series",
    image: "/images/catalog/blackout.webp",
    badge: "Tam Karartma",
    feature: "%100 ışık kontrolü · 250 gr/m² kumaş",
    colors: ["#eee8dc", "#9a9a98", "#2a2a2a", "#5d5148", "#484a4b"],
    priceKurus: 149900,
    currency: "TRY",
    href: "/urunler/blackout-05-siyah",
  },
];

const catalogProducts: StoreProduct[] = [
  {
    id: "HC-001",
    name: "Honeycomb 001 Beyaz Isı Yalıtımlı Perde",
    code: "HC-001",
    category: "Marel / Honeycomb Series",
    image: "/images/real/diamond-beyaz-siyah-ip.jpeg",
    badge: "Isı Yalıtımlı",
    feature: "Hücresel doku · %100 polyester · 2 yıl garanti",
    colors: neutral,
    price: "1.166,00 ₺'den",
    href: "/urunler/honeycomb-001-beyaz",
    imagePosition: "center 43%",
  },
  {
    id: "DIA-108",
    name: "Diamond 108 Krem Plise Perde",
    code: "DIA-108",
    category: "Marel / Diamond Series",
    image: "/images/real/diamond-krem.jpeg",
    feature: "%50 ışık filtrasyonu · Yumuşak gün ışığı",
    colors: ["#f7f6f1", "#e8dfca", "#d0c3aa", "#a8aaab", "#4d5052", "#222426"],
    href: "/urunler/diamond-108-krem",
    imagePosition: "center 40%",
  },
  {
    id: "DIA-109",
    name: "Diamond 109 Açık Gri Plise Perde",
    code: "DIA-109",
    category: "Marel / Diamond Series",
    image: "/images/real/diamond-acik-gri.jpeg",
    badge: "Gerçek Doku",
    feature: "UV dayanımlı · Kolay temizlenebilir polyester",
    colors: ["#f8f7f2", "#dfdcd3", "#b8bbbc", "#777a7b", "#47494a", "#202224"],
    href: "/urunler/diamond-109-acik-gri",
    imagePosition: "center 36%",
  },
  {
    id: "SLV-7002",
    name: "Silver 7002 Gri Plise Perde",
    code: "SLV-7002",
    category: "Marel / Silver Series",
    image: "/images/catalog/silver.webp",
    badge: "%70 Filtrasyon",
    feature: "150 gr/m² kumaş · UV dayanımlı yapı",
    colors: ["#f6f5f0", "#ddd6c8", "#aeb1b1", "#77797a", "#484a4b"],
    href: "/urunler/silver-7002-gri",
  },
];

const categoryTiles = [
  {
    index: "01",
    title: "Plise Perde Sistemleri",
    href: "/urunler?kategori=Plise Perde",
    text: "Cam balkon ve pencerelere özel ince profilli kumaş serileri",
    motif: "PLİSE",
  },
  {
    index: "02",
    title: "Jaluzi Perde Modelleri",
    href: "/urunler?kategori=Jaluzi Perde",
    text: "Hassas ışık ve gölge kontrolü sağlayan estetik lameller",
    motif: "JALUZİ",
  },
  {
    index: "03",
    title: "Zip Perde Çözümleri",
    href: "/urunler?kategori=Zip Perde",
    text: "Teras ve dış cepheler için rüzgâr ve güneş koruması",
    motif: "ZIP",
  },
  {
    index: "04",
    title: "Sineklik Sistemleri",
    href: "/urunler?kategori=Sineklik",
    text: "Pencere ve kapılar için plise ve sürme sineklikler",
    motif: "SİNEKLİK",
  },
  {
    index: "05",
    title: "Sürgülü Kapı Sistemleri",
    href: "/urunler?kategori=Sürgülü Kapılar",
    text: "Geniş mekân geçişleri için modern sürme çerçeveler",
    motif: "SÜRGÜ",
  },
];

export default async function Home() {
  const [liveProducts, reviews] = await Promise.all([
    stListProducts(false, "Marel").catch(() => [] as Awaited<ReturnType<typeof stListProducts>>),
    stListApprovedReviews(3).catch(() => [] as Awaited<ReturnType<typeof stListApprovedReviews>>),
  ]);
  const liveById = new Map(liveProducts.map((product) => [product.slug, product]));
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
                name: "Marel",
                url: absoluteUrl("/"),
                logo: absoluteUrl("/icon.svg"),
                email: "info@marelpliseperde.com",
                telephone: "+90 546 735 66 02",
                sameAs: ["https://wa.me/905467356602"],
              },
              {
                "@type": "WebSite",
                "@id": `${absoluteUrl("/")}#website`,
                name: "Marel",
                url: absoluteUrl("/"),
                inLanguage: "tr-TR",
                publisher: { "@id": `${absoluteUrl("/")}#organization` },
              },
              {
                "@type": "WebPage",
                name: "Marel | Online Perde ve Sineklik Mağazası",
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

        {/* Best Sellers */}
        <section className="shop-section" id="cok-satanlar">
          <div className="shop-container">
            <div className="shop-section-title">
              <div>
                <span>GERÇEK ÜRÜNLER · GERÇEK DOKULAR</span>
                <h2>En Çok Satanlar</h2>
              </div>
              <Link href="/urunler">Tümünü Gör →</Link>
            </div>
            <ProductShelf products={liveShelf(bestSellers)} />
          </div>
        </section>

        {/* Promo Grid */}
        <Reveal id="indirimdekiler" className="shop-container promo-tile-grid" direction="up">
          <Link className="promo-tile promo-tile-wide" href="/urunler?kategori=Plise Perde">
            <Image
              unoptimized
              src="/images/hero/marel-honeycomb-hero-v3.png"
              alt="Gri Honeycomb ısı yalıtımlı perde"
              fill
              sizes="66vw"
            />
            <div>
              <span>ISI YALITIMLI KOLEKSİYON</span>
              <h2>Honeycomb Series</h2>
              <p>Hücresel dokusu, %100 ışık filtrasyonu ve beş doğal rengiyle.</p>
              <b>Koleksiyonu Keşfet →</b>
            </div>
          </Link>
          <Link className="promo-tile" href="/urunler?kategori=Plise Perde">
            <Image
              unoptimized
              src="/images/real/diamond-gri.jpeg"
              alt="Diamond gri gerçek kumaş dokusu"
              fill
              sizes="34vw"
            />
            <div>
              <span>YENİ KOLEKSİYON</span>
              <h2>Diamond Serisi</h2>
              <b>Renkleri incele →</b>
            </div>
          </Link>
        </Reveal>

        {/* Feature Row */}
        <section className="shop-feature-row">
          <Reveal className="shop-container" direction="up">
            <article>
              <b>01</b>
              <div>
                <strong>Milimetrik Ölçüye Özel İmalat</strong>
                <p>Pencere ve cam balkonunuza sıfır hata ile üretilir.</p>
              </div>
            </article>
            <article>
              <b>02</b>
              <div>
                <strong>Canlı WhatsApp Danışmanı</strong>
                <p>Mekân fotoğrafınızı gönderin, en uygun modeli birlikte seçelim.</p>
              </div>
            </article>
            <article>
              <b>03</b>
              <div>
                <strong>2 Yıl Kumaş & Mekanizma Garantisi</strong>
                <p>Üst segment bileşenler ve kolay montaj aparatları.</p>
              </div>
            </article>
          </Reveal>
        </section>

        {/* Catalog Collection Shelf */}
        <section className="shop-section shop-section-soft">
          <div className="shop-container">
            <div className="shop-section-title">
              <div>
                <span>KATALOG KOLEKSİYONU</span>
                <h2>Plise Perde Modelleri</h2>
              </div>
              <Link href="/urunler?kategori=Plise Perde">Tüm plise perdeler →</Link>
            </div>
            <ProductShelf products={liveShelf(catalogProducts)} />
          </div>
        </section>

        {/* Categories Section - Clean Links */}
        <section className="shop-section">
          <div className="shop-container">
            <div className="shop-section-title center-title">
              <div>
                <span>TÜM KATEGORİLER</span>
                <h2>İhtiyacınıza Göre Seçin</h2>
              </div>
            </div>
            <Reveal className="shop-category-grid" direction="up">
              {categoryTiles.map((tile) => (
                <Link href={tile.href} key={tile.title}>
                  <span className="category-card-index">{tile.index}</span>
                  <span className="category-card-motif" aria-hidden="true">
                    {tile.motif}
                  </span>
                  <div>
                    <h3>{tile.title}</h3>
                    <p>{tile.text}</p>
                    <b>
                      Ürünleri İncele <i aria-hidden="true">→</i>
                    </b>
                  </div>
                </Link>
              ))}
            </Reveal>
          </div>
        </section>

        {/* Store Reviews */}
        <section className="store-reviews">
          <div className="shop-container">
            <div className="shop-section-title center-title">
              <div>
                <span>MÜŞTERİ DENEYİMİ</span>
                <h2>Marel Kullananlar Anlatıyor</h2>
              </div>
            </div>
            <Reveal className="review-grid" direction="up">
              {reviews.length ? (
                reviews.map((review) => (
                  <article key={review.id}>
                    <div>
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </div>
                    <h3>{review.title}</h3>
                    <p>{review.comment}</p>
                    <strong>
                      {review.user?.name}
                      {review.product?.name ? ` · ${review.product.name}` : ""}
                    </strong>
                  </article>
                ))
              ) : (
                <>
                  <article>
                    <div>★★★★★</div>
                    <h3>Kusursuz ölçü ve kolay montaj</h3>
                    <p>Cam balkon kanatlarına tam oturdu, yapıştırmalı montaj çok pratik oldu.</p>
                    <strong>Marel Müşteri Deneyimi</strong>
                  </article>
                  <article>
                    <div>★★★★★</div>
                    <h3>Renk ve kumaş kalitesi harika</h3>
                    <p>Antrasit rengi çok şık durdu, güneş ışığını tam istediğimiz gibi kırıyor.</p>
                    <strong>Marel Danışman Desteği</strong>
                  </article>
                  <article>
                    <div>★★★★★</div>
                    <h3>Hızlı kargo ve güvenli paketleme</h3>
                    <p>Ölçü teyidinden 3 gün sonra kargomuz sağlam şekilde teslim edildi.</p>
                    <Link href="/urunler">Koleksiyonu İncele →</Link>
                  </article>
                </>
              )}
            </Reveal>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="shop-trust-row">
          <div className="shop-container">
            <article>
              <span>▣</span>
              <h3>Katalogla Doğrulanmış Gerçek Kumaşlar</h3>
            </article>
            <article>
              <span>◇</span>
              <h3>Ölçüye Özel Milimetrik İmalat</h3>
            </article>
            <article>
              <span>◉</span>
              <h3>Doğrudan Canlı WhatsApp Desteği</h3>
            </article>
          </div>
        </section>

        {/* Order Tracking CTA */}
        <section className="order-track" id="takip">
          <div className="shop-container">
            <h2>Sipariş & Kargo Takibi</h2>
            <p>Sipariş numaranız ve e-postanız ile kargonuzun canlı durumunu anında sorgulayın.</p>
            <Link className="button button-gold" href="/siparis-takip">
              Siparişimi Takip Et →
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
