import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductShelf } from "@/app/components/product-shelf";
import { ProductViewTracker } from "@/app/components/product-view-tracker";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { CategoryLanding } from "@/app/components/category-landing";
import { getCategoryPage } from "@/app/data";
import { formatMoney } from "@/app/lib/commerce";
import { stGetProductBySlug } from "@/app/lib/softtrade";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCategoryPage(slug);
  if (category) return { title: category.title, description: category.description };
  const product = await stGetProductBySlug(slug);
  return product ? { title: product.name, description: product.description } : { title: "Ürün bulunamadı" };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCategoryPage(slug);
  if (category) return <CategoryLanding config={category} />;
  const product = await stGetProductBySlug(slug);
  if (!product) notFound();
  const effectivePrice = product.salePrice ?? product.price;
  const whatsappMessage = encodeURIComponent(`Merhaba Marel, ${product.name} (${product.sku}) için ölçüye göre fiyat ve teklif almak istiyorum.`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    brand: { "@type": "Brand", name: product.brand },
    image: [new URL(product.image, "https://marelpliseperde.com").toString()],
    description: product.description,
    offers: {
      "@type": "Offer",
      url: `https://marelpliseperde.com/urunler/${product.slug}`,
      priceCurrency: product.currency,
      price: (effectivePrice / 100).toFixed(2),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };
  return (
    <>
      <SiteHeader />
      <main className="commerce-main">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
        <ProductViewTracker sku={product.sku} name={product.name} category={product.category} price={effectivePrice} />
        <section className="commerce-product-detail shop-container">
          <div className="commerce-product-media"><Image unoptimized src={product.image} alt={product.name} fill priority sizes="(max-width: 850px) 100vw, 55vw" /></div>
          <div className="commerce-product-copy">
            <div className="breadcrumbs"><Link href="/">Ana sayfa</Link><span>/</span><Link href="/urunler">Ürünler</Link><span>/</span><span>{product.category}</span></div>
            <p className="eyebrow">{product.brand} · {product.sku}</p>
            <h1>{product.name}</h1>
            <p>{product.description}</p>
            <strong className="commerce-price">{formatMoney(effectivePrice, product.currency)}</strong>
            <p className={`stock-pill ${product.stock > 0 ? "in" : "out"}`}>{product.stock > 0 ? `Stokta · ${product.stock} adet` : "Stokta yok"}</p>
            <ProductShelf products={[{ id: product.id, name: product.name, code: product.sku, category: product.category, image: product.image, feature: product.description, colors: [], href: `/urunler/${product.slug}`, priceKurus: product.stock > 0 ? effectivePrice : undefined, currency: product.currency }]} />
          </div>
        </section>

        <section className="quote-section" id="teklif">
          <div className="container quote-layout">
            <div className="quote-intro"><p className="eyebrow">Hızlı teklif</p><h2>{product.name} için teklif alın.</h2><p>Kumaş ve kasa rengi ile ölçünüzü birlikte iletin; Marel danışmanı net teklifinizi hazırlasın. Sipariş oluşturulmaz.</p></div>
            <div className="quote-builder">
              <div className="selection-summary">
                <h3>Teklif özeti</h3>
                <dl>
                  <div><dt>Ürün</dt><dd>{product.name}</dd></div>
                  <div><dt>SKU</dt><dd>{product.sku}</dd></div>
                  <div><dt>Fiyat</dt><dd>Ölçüye göre</dd></div>
                </dl>
              </div>
              <a className="whatsapp-button" href={`https://wa.me/905467356602?text=${whatsappMessage}`} target="_blank" rel="noreferrer">WhatsApp&apos;tan teklif al ↗</a>
              <p className="quote-note">Butona bastığınızda ürün bilginiz hazır mesaj olarak WhatsApp&apos;a aktarılır.</p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
