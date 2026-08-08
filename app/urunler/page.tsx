import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { productGroups } from "../data";
import { ProductShelf, type StoreProduct } from "../components/product-shelf";
import { listProducts } from "@/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ürünler",
  description: "Marel plise perde, jaluzi, zip perde, sineklik ve sürgülü kapı sistemleri.",
};

export default async function ProductsPage() {
  const products = await listProducts(false);
  const storeProducts: StoreProduct[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    code: product.sku,
    category: `Marel / ${product.category}`,
    image: product.image,
    feature: product.description,
    colors: [],
    href: `/urunler/${product.slug}`,
    priceKurus: product.stock > 0 ? product.salePrice ?? product.price : undefined,
    currency: product.currency,
    badge: product.featured ? "Öne Çıkan" : undefined,
  }));
  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero">
          <div className="page-hero-bg"><Image src="/images/catalog/pages/page-01.webp" alt="" fill priority sizes="100vw" /></div>
          <div className="container page-hero-inner">
            <div className="breadcrumbs"><Link href="/">Ana sayfa</Link><span>/</span><span>Ürünler</span></div>
            <p className="eyebrow light">Marel ürün ailesi</p>
            <h1>Bir ürün değil,<br />doğru sistemi seçin.</h1>
            <p>İhtiyacınızı, kullanım alanınızı ve ölçünüzü birlikte değerlendirerek kumaştan kasaya kadar size özel bir çözüm hazırlıyoruz.</p>
          </div>
        </section>
        <section className="shop-section"><div className="shop-container"><div className="shop-section-title"><div><span>GÜNCEL FİYAT VE STOK</span><h2>Online Mağaza</h2></div></div><ProductShelf products={storeProducts} /></div></section>
        <section aria-label="Ürün grupları">
          {productGroups.map((group, index) => (
            <article className="product-group" id={group.id} key={group.id}>
              <div className="product-group-media"><Image src={group.image} alt={`${group.title} ürün görünümü`} fill sizes="(max-width: 760px) 100vw, 50vw" /></div>
              <div className="product-group-copy">
                <span className="product-group-index">0{index + 1} / 05</span>
                <h2>{group.title}</h2>
                <p>{group.description}</p>
                <ul className="tag-list">{group.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
                <div><Link className="button button-gold" href={group.href}>{index === 0 ? "Serileri incele" : "Bilgi ve teklif al"}</Link></div>
              </div>
            </article>
          ))}
        </section>
        <section className="info-cta" id="teklif-bilgi">
          <div className="container info-cta-inner">
            <h2>Hangi sistem olduğundan emin değil misiniz?</h2>
            <div><p>Mekânın fotoğrafını ve yaklaşık ölçüyü gönderin. Kullanım şeklinize uygun perde, sineklik veya kapı sistemini birlikte belirleyelim.</p><a className="button button-gold" href="https://wa.me/905467356602?text=Merhaba%2C%20mek%C3%A2n%C4%B1m%20i%C3%A7in%20uygun%20sistem%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum." target="_blank" rel="noreferrer">WhatsApp&apos;tan danışın</a></div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
