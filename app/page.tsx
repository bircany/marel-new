import Image from "next/image";
import Link from "next/link";
import { ProductShelf, type StoreProduct } from "./components/product-shelf";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import { StorefrontHero } from "./components/storefront-hero";
import { Reveal } from "./components/motion-media";
import { listAnnouncements, listApprovedReviews } from "@/db";

export const metadata = {
  title: "Marel | Online Perde ve Sineklik Mağazası",
  description: "Plise perde, Honeycomb, jaluzi, zip perde ve sineklik sistemlerini gerçek seri ve renkleriyle inceleyin; WhatsApp'tan teklif alın.",
};

const neutral = ["#f4f2ec", "#d8d3c8", "#adb0b1", "#53575a", "#232527"];

const bestSellers: StoreProduct[] = [
  { id: "HC-003", name: "Honeycomb 003 Gri Isı Yalıtımlı Plise Perde", code: "HC-003", category: "Marel / Honeycomb Series", image: "/images/real/honeycomb-gri-detay.png", badge: "Çok Satan", feature: "%100 ışık filtrasyonu · Isı yalıtımlı hücresel yapı", colors: neutral, priceKurus: 116600, currency: "TRY", href: "/urunler/honeycomb-003-gri", imagePosition: "center 38%" },
  { id: "DIA-100", name: "Diamond 100 Beyaz Plise Perde", code: "DIA-100", category: "Marel / Diamond Series", image: "/images/real/diamond-beyaz.jpeg", badge: "Gerçek Ürün", feature: "%50 ışık filtrasyonu · UV dayanımlı kumaş", colors: ["#f7f6f1", "#e6dfce", "#bec1c2", "#4d5052", "#1d1f21", "#7b6c58"], priceKurus: 116600, currency: "TRY", href: "/urunler/diamond-100-beyaz", imagePosition: "center 42%" },
  { id: "DIA-102", name: "Diamond 102 Gri Plise Perde", code: "DIA-102", category: "Marel / Diamond Series", image: "/images/real/diamond-gri.jpeg", badge: "Yeni", feature: "110 gr/m² polyester · Kolay yıkanabilir yapı", colors: ["#f7f6f1", "#ddd6c6", "#a4a7a8", "#55585b", "#252729", "#8a745a"], priceKurus: 116600, currency: "TRY", href: "/urunler/diamond-102-gri", imagePosition: "center 43%" },
  { id: "BLK-05", name: "Blackout 05 Siyah Tam Karartma", code: "BLK-05", category: "Marel / Blackout Series", image: "/images/catalog/blackout.webp", badge: "Tam Karartma", feature: "%100 ışık kontrolü · 250 gr/m² kumaş", colors: ["#eee8dc", "#9a9a98", "#2a2a2a", "#5d5148", "#484a4b"], priceKurus: 149900, currency: "TRY", href: "/urunler/blackout-05-siyah" },
];

const catalogProducts: StoreProduct[] = [
  { name: "Honeycomb 001 Beyaz Isı Yalıtımlı Perde", code: "HC-001", category: "Marel / Honeycomb Series", image: "/images/real/diamond-beyaz-siyah-ip.jpeg", badge: "Isı Yalıtımlı", feature: "Hücresel doku · %100 polyester · 2 yıl garanti", colors: neutral, price: "1.166,00 ₺'den", href: "/urunler/plise-perde/diamond-serisi", imagePosition: "center 43%" },
  { name: "Diamond 108 Krem Plise Perde", code: "DIA-108", category: "Marel / Diamond Series", image: "/images/real/diamond-krem.jpeg", feature: "%50 ışık filtrasyonu · Yumuşak gün ışığı", colors: ["#f7f6f1", "#e8dfca", "#d0c3aa", "#a8aaab", "#4d5052", "#222426"], href: "/urunler/plise-perde/diamond-serisi", imagePosition: "center 40%" },
  { name: "Diamond 109 Açık Gri Plise Perde", code: "DIA-109", category: "Marel / Diamond Series", image: "/images/real/diamond-acik-gri.jpeg", badge: "Gerçek Doku", feature: "UV dayanımlı · Kolay temizlenebilir polyester", colors: ["#f8f7f2", "#dfdcd3", "#b8bbbc", "#777a7b", "#47494a", "#202224"], href: "/urunler/plise-perde/diamond-serisi", imagePosition: "center 36%" },
  { name: "Silver 7002 Gri Plise Perde", code: "SLV-7002", category: "Marel / Silver Series", image: "/images/catalog/silver.webp", badge: "%70 Filtrasyon", feature: "150 gr/m² kumaş · UV dayanımlı yapı", colors: ["#f6f5f0", "#ddd6c8", "#aeb1b1", "#77797a", "#484a4b"], href: "/urunler/plise-perde/diamond-serisi" },
];

const categoryTiles = [
  { title: "Plise Perdeler", image: "/images/catalog/diamond.webp", href: "/urunler#plise-perde", text: "Diamond, Silver, Gold ve tüm seriler" },
  { title: "Honeycomb Perdeler", image: "/images/hero/marel-honeycomb-hero-v3.png", href: "/urunler/plise-perde/diamond-serisi#teklif", text: "Isı yalıtımlı hücresel koleksiyon" },
  { title: "Sineklik Sistemleri", image: "/images/configurator/diamond-100-beyaz-antrasit-1.webp", href: "/urunler#sineklik", text: "Pencere ve kapıya özel üretim" },
];

export default async function Home() {
  const [reviews, announcements] = await Promise.all([listApprovedReviews(3), listAnnouncements(true)]);
  return (
    <>
      <SiteHeader />
      <main>
        <StorefrontHero />

        <section className="shop-section" id="cok-satanlar"><div className="shop-container">
          <div className="shop-section-title"><div><span>GERÇEK ÜRÜNLER · GERÇEK DOKULAR</span><h2>En Çok Satanlar</h2></div><Link href="/urunler">Tümünü Gör →</Link></div>
          <ProductShelf products={bestSellers} />
        </div></section>

        <Reveal id="indirimdekiler" className="shop-container promo-tile-grid" direction="up">
          <Link className="promo-tile promo-tile-wide" href="/urunler/plise-perde/diamond-serisi#teklif">
            <Image unoptimized src="/images/hero/marel-honeycomb-hero-v3.png" alt="Gri Honeycomb ısı yalıtımlı perde" fill sizes="66vw" />
            <div><span>ISI YALITIMLI KOLEKSİYON</span><h2>Honeycomb Series</h2><p>Hücresel dokusu, %100 ışık filtrasyonu ve beş doğal rengiyle.</p><b>WhatsApp&apos;tan teklif al →</b></div>
          </Link>
          <Link className="promo-tile" href="/urunler/plise-perde/diamond-serisi">
            <Image unoptimized src="/images/real/diamond-gri.jpeg" alt="Diamond gri gerçek kumaş dokusu" fill sizes="34vw" />
            <div><span>YENİ KOLEKSİYON</span><h2>Diamond</h2><b>Renkleri incele →</b></div>
          </Link>
        </Reveal>

        <section className="shop-feature-row"><Reveal className="shop-container" direction="up">
          <article><b>01</b><div><strong>Gerçek katalog kodları</strong><p>Seri ve renkleri katalogdaki ürün kodlarıyla inceleyin.</p></div></article>
          <article><b>02</b><div><strong>WhatsApp ürün danışmanı</strong><p>Ürünü seçin, mesajınız hazır şekilde doğrudan bize ulaşsın.</p></div></article>
          <article><b>03</b><div><strong>Ölçüye özel üretim</strong><p>Kumaş, profil, genişlik ve yüksekliği ihtiyacınıza göre belirleyin.</p></div></article>
        </Reveal></section>

        <section className="shop-section shop-section-soft"><div className="shop-container">
          <div className="shop-section-title"><div><span>KATALOG KOLEKSİYONU</span><h2>Plise Perde Modelleri</h2></div><Link href="/urunler#plise-perde">Tüm plise perdeler →</Link></div>
          <ProductShelf products={catalogProducts} />
        </div></section>

        <section className="shop-section" id="galeri"><div className="shop-container">
          <div className="shop-section-title center-title"><div><span>KATEGORİLER</span><h2>İhtiyacına Göre Seç</h2></div></div>
          <Reveal className="shop-category-grid" direction="up">{categoryTiles.map((tile) => <Link href={tile.href} key={tile.title}><Image unoptimized src={tile.image} alt={tile.title} fill sizes="33vw" /><div><h3>{tile.title}</h3><p>{tile.text}</p><b>Alışverişe başla →</b></div></Link>)}</Reveal>
        </div></section>

        {announcements.length ? <section className="home-announcements" id="duyurular"><div className="shop-container">
          <div className="shop-section-title"><div><span>MAREL&apos;DEN</span><h2>Duyurular ve rehberler</h2></div><Link href="/duyurular">Tüm duyurular →</Link></div>
          <div className="home-announcement-grid">{announcements.slice(0, 3).map((item, index) => <Reveal key={item.id} direction={index % 2 ? "right" : "left"}><article><div className="home-announcement-media"><Image unoptimized src={item.imageUrl} alt="" fill sizes="33vw" /></div><div><small>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("tr-TR") : "Marel"}</small><h3>{item.title}</h3><p>{item.summary}</p><Link href={`/duyurular#${item.slug}`}>Devamını oku →</Link></div></article></Reveal>)}</div>
        </div></section> : null}

        <section className="store-reviews"><div className="shop-container">
          <div className="shop-section-title center-title"><div><span>MÜŞTERİ DENEYİMİ</span><h2>Marel kullananlar anlatıyor</h2></div></div>
          <Reveal className="review-grid" direction="up">
            {reviews.length ? reviews.map((review) => <article key={review.id}><div>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div><h3>{review.title}</h3><p>{review.body}</p><strong>{review.authorName}{review.productName ? ` · ${review.productName}` : ""}</strong>{review.adminReply ? <small><b>Marel:</b> {review.adminReply}</small> : null}</article>) : <>
              <article><div>★★★★★</div><h3>Şeffaf ürün bilgisi</h3><p>Katalogdaki gerçek seri, renk ve teknik bilgilerle ne aldığınızı net biçimde görün.</p><strong>Marel ürün deneyimi</strong></article>
              <article><div>★★★★★</div><h3>Renk ve ölçü desteği</h3><p>Kumaş ve kasa rengini seçin; ölçünüzü WhatsApp üzerinden danışmana iletin.</p><strong>Marel danışman desteği</strong></article>
              <article><div>★★★★★</div><h3>Deneyiminizi paylaşın</h3><p>Hesabınıza giriş yapın, Marel ürün deneyiminizi yazın; onaylanan yorumunuz burada yayınlansın.</p><Link href="/hesabim#yorumlar">Yorum yaz →</Link></article>
            </>}
          </Reveal>
        </div></section>

        <section className="shop-trust-row"><div className="shop-container"><article><span>▣</span><h3>Katalogla doğrulanmış ürünler</h3></article><article><span>◇</span><h3>Ölçüye özel güvenli üretim</h3></article><article><span>◉</span><h3>Doğrudan WhatsApp desteği</h3></article></div></section>

        <section className="order-track" id="takip"><div className="shop-container"><h2>Sipariş Takip</h2><p>Siparişinizin güncel durumunu kontrol edin.</p><form action="/siparis-takip"><label><span>E-posta</span><input name="email" type="email" placeholder="ornek@email.com" required /></label><label><span>Sipariş No</span><input name="orderNumber" type="text" placeholder="Örn. MRL-260808-ABC123" required /></label><button type="submit">Kontrol Et</button></form></div></section>
      </main>
      <SiteFooter />
    </>
  );
}
