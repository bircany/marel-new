import Image from "next/image";
import Link from "next/link";
import { ProductShelf, type StoreProduct } from "./components/product-shelf";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import { StorefrontHero } from "./components/storefront-hero";

export const metadata = {
  title: "Marel | Online Perde ve Sineklik Mağazası",
  description: "Plise perde, jaluzi, zip perde, sineklik ve sürgülü kapı sistemlerini inceleyin; ölçünüze özel hızlı teklif alın.",
};

const bestSellers: StoreProduct[] = [
  { name: "Diamond 100 Beyaz Plise Perde", category: "Marel / Plise Perde", image: "/images/catalog/diamond.webp", badge: "Çok Satan", feature: "%50 ışık filtrasyonu", colors: 10, href: "/urunler/plise-perde/diamond-serisi" },
  { name: "Diamond 110 Antrasit Plise Perde", category: "Marel / Plise Perde", image: "/images/catalog/pages/page-02.webp", badge: "Yeni", feature: "UV dayanımlı kumaş", colors: 10, href: "/urunler/plise-perde/diamond-serisi" },
  { name: "Blackout Tam Karartma Perde", category: "Marel / Blackout", image: "/images/catalog/blackout.webp", badge: "Tam Karartma", feature: "%100 ışık kontrolü", colors: 5, href: "/urunler/plise-perde/diamond-serisi" },
  { name: "Silver Isı Kontrollü Plise Perde", category: "Marel / Silver", image: "/images/catalog/silver.webp", feature: "Isı ve güneş kontrolü", colors: 6, href: "/urunler/plise-perde/diamond-serisi" },
];

const newProducts: StoreProduct[] = [
  { name: "Reina Krem Plise Perde", category: "Marel / Reina", image: "/images/catalog/reina.webp", badge: "Yeni Sezon", feature: "Yumuşak ışık geçişi", colors: 8, href: "/urunler/plise-perde/diamond-serisi" },
  { name: "Diamond Krem Cam Balkon Perdesi", category: "Marel / Diamond", image: "/images/catalog/pages/page-03.webp", feature: "Cam balkona özel", colors: 10, href: "/urunler/plise-perde/diamond-serisi" },
  { name: "Antrasit Pencere Sinekliği", category: "Marel / Sineklik", image: "/images/configurator/diamond-100-beyaz-antrasit-1.webp", badge: "Pratik Montaj", feature: "Ölçüye özel üretim", colors: 5, href: "/urunler#sineklik" },
  { name: "Bronz Profil Plise Sistem", category: "Marel / Özel Seri", image: "/images/configurator/diamond-110-antrasit-bronz-3.webp", feature: "Kumaş ve profil seçimi", colors: 12, href: "/urunler/plise-perde/diamond-serisi" },
];

const categoryTiles = [
  { title: "Plise Perdeler", image: "/images/catalog/diamond.webp", href: "/urunler#plise-perde", text: "Tüm serileri keşfet" },
  { title: "Sineklik Sistemleri", image: "/images/configurator/diamond-100-beyaz-antrasit-1.webp", href: "/urunler#sineklik", text: "Pencere ve kapı çözümleri" },
  { title: "Zip Perdeler", image: "/images/catalog/blackout.webp", href: "/urunler#zip-perde", text: "Dış mekân güneş kontrolü" },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <StorefrontHero />

        <section className="shop-section" id="cok-satanlar">
          <div className="shop-container">
            <div className="shop-section-title"><div><span>MAREL SEÇKİSİ</span><h2>En Çok Satanlar</h2></div><Link href="/urunler">Tümünü Gör →</Link></div>
            <ProductShelf products={bestSellers} />
          </div>
        </section>

        <section className="shop-container promo-tile-grid" id="indirimdekiler">
          <Link className="promo-tile promo-tile-wide" href="/urunler/plise-perde/diamond-serisi#teklif">
            <Image unoptimized src="/images/catalog/pages/page-02.webp" alt="Diamond plise perde kampanyası" fill sizes="66vw" />
            <div><span>SEZON FIRSATI</span><h2>Diamond Serisi</h2><p>Adetli alımlarda proje avantajlarını öğren.</p><b>Teklif al →</b></div>
          </Link>
          <Link className="promo-tile" href="/urunler#sineklik">
            <Image unoptimized src="/images/configurator/diamond-100-beyaz-antrasit-1.webp" alt="Sineklik sistemleri" fill sizes="34vw" />
            <div><span>ÖZEL ÖLÇÜ</span><h2>Sineklik</h2><b>İncele →</b></div>
          </Link>
        </section>

        <section className="shop-feature-row">
          <div className="shop-container">
            <article><b>01</b><div><strong>Sipariş bilgilendirmesi</strong><p>Tekliften üretime tüm süreçte bilgi alın.</p></div></article>
            <article><b>02</b><div><strong>WhatsApp desteği</strong><p>Ölçü ve ürün seçimi için bize ulaşın.</p></div></article>
            <article><b>03</b><div><strong>Doğru ürün garantisi</strong><p>İhtiyacınıza uygun sistemi birlikte seçin.</p></div></article>
          </div>
        </section>

        <section className="shop-section shop-section-soft">
          <div className="shop-container">
            <div className="shop-section-title"><div><span>YENİ KOLEKSİYON</span><h2>Plise Perde Modelleri</h2></div><Link href="/urunler#plise-perde">Tüm plise perdeler →</Link></div>
            <ProductShelf products={newProducts} />
          </div>
        </section>

        <section className="shop-section" id="galeri">
          <div className="shop-container">
            <div className="shop-section-title center-title"><div><span>KATEGORİLER</span><h2>İhtiyacına Göre Seç</h2></div></div>
            <div className="shop-category-grid">
              {categoryTiles.map((tile) => <Link href={tile.href} key={tile.title}><Image unoptimized src={tile.image} alt={tile.title} fill sizes="33vw" /><div><h3>{tile.title}</h3><p>{tile.text}</p><b>Alışverişe başla →</b></div></Link>)}
            </div>
          </div>
        </section>

        <section className="store-reviews" id="duyurular">
          <div className="shop-container">
            <div className="shop-section-title center-title"><div><span>MAREL FARKI</span><h2>Alışverişi Kolaylaştıran Detaylar</h2></div></div>
            <div className="review-grid">
              <article><div>★★★★★</div><p>Ölçü bilgisini düzenli bir teklif mesajına dönüştüren kolay sipariş akışı.</p><strong>Doğru ölçü desteği</strong></article>
              <article><div>★★★★★</div><p>Kumaş ve kasa rengini aynı ekranda seçerek kararı hızlandıran ürün deneyimi.</p><strong>Renk danışmanlığı</strong></article>
              <article><div>★★★★★</div><p>Plise perde, sineklik ve zip sistemlerini tek mağazada karşılaştırma kolaylığı.</p><strong>Geniş ürün ailesi</strong></article>
            </div>
          </div>
        </section>

        <section className="shop-trust-row">
          <div className="shop-container">
            <article><span>▣</span><h3>1.000 TL üzeri kargo bedava</h3></article>
            <article><span>♢</span><h3>Ölçüye özel güvenli üretim</h3></article>
            <article><span>↻</span><h3>15 gün içinde iade desteği</h3></article>
          </div>
        </section>

        <section className="order-track" id="takip">
          <div className="shop-container">
            <h2>Sipariş Takip</h2><p>Siparişinizin güncel durumunu kontrol edin.</p>
            <form><label><span>E-posta</span><input type="email" placeholder="ornek@email.com" /></label><label><span>Sipariş No</span><input type="text" placeholder="Örn. MRL-1024" /></label><button type="button">Kontrol Et</button></form>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
