import Image from "next/image";
import Link from "next/link";
import { ParallaxHero } from "./components/parallax-hero";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import { categories, collections, galleryItems } from "./data";

export const metadata = {
  title: "Marel | Ölçünüze Özel Perde ve Sineklik Sistemleri",
  description:
    "Plise perde, jaluzi, zip perde, sineklik ve sürgülü kapı sistemlerini keşfedin; ölçülerinizi girerek WhatsApp üzerinden hızlı teklif alın.",
};

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <ParallaxHero />

        <section className="trust-strip" aria-label="Marel hizmet avantajları">
          <div className="container trust-grid">
            {[
              ["01", "Ölçü desteği", "Doğru ürünü doğru ölçüyle seçin."],
              ["02", "Kumaş danışmanlığı", "Işık ve mahremiyet ihtiyacınıza göre."],
              ["03", "Özel üretim", "Mekânınıza ve renk seçiminize özel."],
              ["04", "Hızlı teklif", "Seçimleriniz doğrudan WhatsApp'a gelsin."],
            ].map(([index, title, text]) => (
              <article key={index} className="trust-item">
                <span>{index}</span>
                <div>
                  <strong>{title}</strong>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section category-section" id="urunler">
          <div className="container">
            <div className="section-heading split-heading">
              <div>
                <p className="eyebrow">Ürünler</p>
                <h2>Mekânınız için doğru sistemi seçin.</h2>
              </div>
              <p>
                Işık kontrolünden dış cephe gölgelendirmesine kadar her ihtiyaç için ölçüye özel,
                karşılaştırması kolay çözümler.
              </p>
            </div>
            <div className="category-grid">
              {categories.map((category, index) => (
                <Link
                  className={`category-card category-card-${index + 1}`}
                  href={category.href}
                  key={category.name}
                >
                  <div className="category-visual" aria-hidden="true">
                    <Image src={category.image} alt="" fill sizes="(max-width: 760px) 100vw, 33vw" />
                  </div>
                  <div className="category-overlay" />
                  <div className="category-content">
                    <span>0{index + 1}</span>
                    <div>
                      <h3>{category.name}</h3>
                      <p>{category.description}</p>
                      <b>İncele <i aria-hidden="true">↗</i></b>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="parallax-promo" aria-label="Diamond serisi tanıtımı">
          <div className="parallax-promo-bg" />
          <div className="container parallax-promo-inner">
            <div className="promo-card">
              <p className="eyebrow light">Yeni sezon / Diamond</p>
              <h2>Işığı yumuşatır. Mekânın karakterini değiştirmez.</h2>
              <p>
                %50 ışık filtrasyonu, UV dayanımlı yapı ve zengin renk paletiyle günlük yaşamın
                en dengeli plise perde serisi.
              </p>
              <div className="promo-actions">
                <Link className="button button-gold" href="/urunler/plise-perde/diamond-serisi">
                  Diamond serisini incele
                </Link>
                <Link className="text-link text-link-light" href="/urunler">
                  Tüm koleksiyonlar →
                </Link>
              </div>
            </div>
            <div className="promo-specs" aria-label="Diamond seri özellikleri">
              <div><strong>%50</strong><span>Işık filtrasyonu</span></div>
              <div><strong>110 gr</strong><span>Kumaş ağırlığı</span></div>
              <div><strong>10+</strong><span>Renk seçeneği</span></div>
            </div>
          </div>
        </section>

        <section className="section" id="koleksiyonlar">
          <div className="container">
            <div className="section-heading split-heading">
              <div>
                <p className="eyebrow">En çok satanlar</p>
                <h2>En çok tercih edilen koleksiyonlar.</h2>
              </div>
              <Link className="text-link" href="/urunler">Tüm ürünleri görüntüle →</Link>
            </div>
            <div className="collection-grid">
              {collections.map((collection) => (
                <article className="collection-card" key={collection.name}>
                  <Link className="collection-image" href={collection.href}>
                    <Image src={collection.image} alt={`${collection.name} uygulama görünümü`} fill sizes="(max-width: 760px) 100vw, 33vw" />
                    {collection.badge ? <span className="product-badge">{collection.badge}</span> : null}
                  </Link>
                  <div className="collection-info">
                    <p>{collection.group}</p>
                    <h3><Link href={collection.href}>{collection.name}</Link></h3>
                    <ul>
                      <li>{collection.filtration}</li>
                      <li>{collection.colors}</li>
                    </ul>
                    <div className="collection-actions">
                      <Link href={collection.href}>Ürünü incele</Link>
                      <Link href={`${collection.href}#teklif`}>Teklif al ↗</Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <aside className="discount-panel" id="indirimdekiler">
              <div>
                <p className="eyebrow light">İndirimdekiler</p>
                <h3>Projen büyüdükçe teklifin avantajı da büyür.</h3>
              </div>
              <p>
                Dönemsel kampanyalar ile adet ve proje bazlı avantajlar, seçtiğin ölçü ve malzemeye göre
                teklif aşamasında netleştirilir. Böylece yalnız gerçek ihtiyacına uygun fiyat görürsün.
              </p>
              <Link className="button button-gold" href="/urunler/plise-perde/diamond-serisi#teklif">
                Kampanyalı teklif al
              </Link>
            </aside>
          </div>
        </section>

        <section className="announcement-section" id="duyurular">
          <div className="container announcement-grid">
            <div className="announcement-heading">
              <p className="eyebrow light">Duyurular</p>
              <h2>Marel&apos;den kısa notlar.</h2>
              <p>Yeni seriler, ölçü rehberleri ve proje haberleri.</p>
            </div>
            <article className="announcement-feature">
              <span>01.08.2026</span>
              <h3>Diamond renk paleti yenilendi.</h3>
              <p>Yeni sezonun krem, ara gri, bronz ve antrasit tonlarını koleksiyonda inceleyin.</p>
              <Link href="/urunler/plise-perde/diamond-serisi">Duyuruyu incele →</Link>
            </article>
            <div className="announcement-list">
              <article><span>26.07.2026</span><h3>Ölçü alma rehberi yayında</h3></article>
              <article><span>18.07.2026</span><h3>Zip perde proje talepleri açıldı</h3></article>
              <article><span>08.07.2026</span><h3>Yeni katalog koleksiyonu</h3></article>
            </div>
          </div>
        </section>

        <section className="section gallery-section" id="galeri">
          <div className="container">
            <div className="section-heading split-heading">
              <div><p className="eyebrow">Fotoğraf galerisi</p><h2>Malzeme, renk ve ışık bir arada.</h2></div>
              <p>Ürünü yalnız numunede değil, mekânın bütününde değerlendirin.</p>
            </div>
            <div className="gallery-grid">
              {galleryItems.map((item, index) => (
                <figure className={`gallery-item gallery-item-${index + 1}`} key={item.title}>
                  <Image src={item.image} alt={item.title} fill sizes="(max-width: 760px) 100vw, 50vw" />
                  <figcaption><span>0{index + 1}</span>{item.title}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="final-cta">
          <div className="container final-cta-inner">
            <div>
              <p className="eyebrow light">Birlikte netleştirelim</p>
              <h2>Ölçünüz hazır değilse de yazabilirsiniz.</h2>
              <p>Ürünü, kumaşı ve profil rengini birlikte seçelim; teklifinizi hızlıca hazırlayalım.</p>
            </div>
            <Link className="button button-gold" href="/urunler/plise-perde/diamond-serisi#teklif">Teklif oluşturmaya başla</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
