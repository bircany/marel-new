import Image from "next/image";
import Link from "next/link";
import { QuoteBuilder } from "../../../components/quote-builder";
import { SiteFooter } from "../../../components/site-footer";
import { SiteHeader } from "../../../components/site-header";

export const metadata = {
  title: "Diamond Series Plise Perde",
  description: "Diamond Series plise perde kumaş renkleri, teknik özellikleri ve ölçüye göre WhatsApp teklif formu.",
};

export default function DiamondProductPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="product-detail-hero">
          <div className="container">
            <div className="breadcrumbs"><Link href="/">Ana sayfa</Link><span>/</span><Link href="/urunler">Ürünler</Link><span>/</span><span>Diamond Series</span></div>
            <div className="product-layout">
              <div className="product-gallery">
                <div className="product-main-image"><Image src="/images/catalog/pages/page-02.png" alt="Diamond Series krem plise perde uygulaması" fill priority sizes="(max-width: 1040px) 100vw, 55vw" /></div>
                <div className="product-thumbs">
                  {["page-02.png", "page-03.png", "page-04.png"].map((image, index) => <div className="product-thumb" key={image}><Image src={`/images/catalog/pages/${image}`} alt={`Diamond Series detay görünümü ${index + 1}`} fill sizes="150px" /></div>)}
                  <div className="product-thumb"><Image src="/images/configurator/diamond-100-beyaz-antrasit-1.png" alt="Diamond profil renk seçenekleri" fill sizes="150px" /></div>
                </div>
              </div>
              <div className="product-summary">
                <p className="eyebrow">Plise perde / Diamond</p>
                <h1>Diamond Series</h1>
                <p>Gün ışığını sertliğinden arındıran, geniş renk paletiyle yaşam alanına uyum sağlayan ölçüye özel plise perde serisi.</p>
                <div className="product-chips"><span>%50 ışık filtrasyonu</span><span>110 gr/m²</span><span>UV dayanımlı</span><span>Kolay temizlenir</span></div>
                <div className="product-price-note"><span>Fiyatlandırma</span><strong>Ölçüye göre teklif</strong></div>
                <div style={{ marginTop: 30 }}><Link className="button button-gold" href="#teklif">Renk seç ve teklif al</Link></div>
              </div>
            </div>
          </div>
        </section>

        <section className="product-story">
          <div className="container story-grid">
            <div className="story-sticky"><p className="eyebrow">Neden Diamond?</p><h2>Günlük yaşam için dengeli bir filtre.</h2><p>Ne mekânı karanlıklaştırır ne de mahremiyeti tamamen bırakır. Oturma alanları, cam balkonlar ve ofisler için güvenli başlangıç serisidir.</p></div>
            <div className="story-points">
              {[
                ["01", "Yumuşak ışık", "Gün ışığını dengeli biçimde süzer; odanın doğal aydınlığını korur."],
                ["02", "Geniş renk paleti", "Beyaz, krem, gri, bronz ve koyu tonlarla profil seçiminize uyum sağlar."],
                ["03", "Dayanıklı doku", "UV dayanımlı polyester iplik yapısı günlük kullanım için geliştirilmiştir."],
                ["04", "Kolay bakım", "Düzenli hafif temizlikle formunu ve görünümünü uzun süre korur."],
              ].map(([index, title, text]) => <article className="story-point" key={index}><span>{index}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}
            </div>
          </div>
        </section>

        <section className="fabric-showcase">
          <Image src="/images/catalog/pages/page-02.png" alt="Diamond Series kumaş ve renk koleksiyonu" fill sizes="100vw" />
          <div className="container fabric-showcase-content"><div className="fabric-showcase-card"><p className="eyebrow light">Kumaş koleksiyonu</p><h2>Beyazdan antrasite, aynı teknik performans.</h2><p>Renk seçerken yalnız fotoğrafa değil; cephe ışığına, duvar tonuna ve seçtiğiniz kasa rengine birlikte bakın. Teklif aşamasında seçimlerinizi netleştirmenize yardımcı oluyoruz.</p></div></div>
        </section>

        <section className="quote-section" id="teklif">
          <div className="container quote-layout">
            <div className="quote-intro"><p className="eyebrow">Hızlı teklif</p><h2>Seçin, ölçüyü girin, bize gönderin.</h2><p>Form fiyat hesaplamaz. Seçtiğiniz kumaş, kasa rengi, ölçü ve adet bilgilerini düzenli bir WhatsApp mesajına dönüştürür.</p><ol className="quote-steps"><li>Kumaş rengini seçin</li><li>Kasa rengini seçin</li><li>Genişlik, yükseklik ve adedi girin</li><li>WhatsApp&apos;tan teklif isteyin</li></ol></div>
            <QuoteBuilder />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
