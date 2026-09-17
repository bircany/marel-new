import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ProductConfigurator } from "@/components/product-configurator";

import { ProductViewTracker } from "@/components/product-view-tracker";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { absoluteUrl } from "@/lib/site";
export default function ProductPage() {
  const router = useRouter();
  const slug = typeof router.query.slug === "string" ? router.query.slug : "";
  const [product, setProduct] = useState<any | null>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/products/${encodeURIComponent(slug)}`).then((r) => r.ok ? r.json() : null).then((data) => setProduct(data?.product || null)).finally(() => setLoaded(true));
  }, [slug]);
  if (!loaded) return <main className="commerce-main shop-container" style={{ padding: 80 }}>Ürün yükleniyor…</main>;
  if (!product) return <main className="commerce-main shop-container" style={{ padding: 80 }}>Ürün bulunamadı.</main>;

  const effectivePrice = product.salePrice ?? product.price ?? 59900;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    brand: { "@type": "Brand", name: "Marel" },
    image: [absoluteUrl(product.image)],
    description: product.description,
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/urunler/${product.slug}`),
      priceCurrency: product.currency,
      price: (effectivePrice / 100).toFixed(2),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <>
      <SiteHeader />
      <main className="commerce-main pdp-main-page">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        <ProductViewTracker
          sku={product.sku}
          name={product.name}
          category={product.category}
          price={effectivePrice}
        />

        {/* Breadcrumb Navigation */}
        <div className="shop-container pdp-breadcrumb-bar">
          <nav className="pdp-breadcrumbs">
            <Link href="/">Ana Sayfa</Link>
            <span className="separator">›</span>
            <Link href="/plise-perdeler">Perdeler</Link>
            <span className="separator">›</span>
            <Link href="/plise-perdeler">Plise Perdeler</Link>
            <span className="separator">›</span>
            <span className="current">{product.category || product.name}</span>
          </nav>
        </div>

        {/* Main Product Configurator & Gallery */}
        <section className="shop-container pdp-hero-section" style={{ padding: "40px 20px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 40, maxWidth: 1200, margin: "0 auto" }}>
            {/* Image Side */}
            <div style={{ flex: "1 1 400px" }}>
              <div style={{ position: "relative", width: "100%", height: 500, borderRadius: 16, overflow: "hidden", background: "#f1f5f9" }}>
                <img 
                  src={product.image || "/images/real/diamond-beyaz-siyah-ip.jpeg"} 
                  alt={product.name} 
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                />
              </div>
            </div>

            {/* Configurator Side */}
            <div style={{ flex: "1 1 500px" }}>
              <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#0f172a", marginBottom: 12, lineHeight: 1.2 }}>
                {product.name}
              </h1>
              <p style={{ fontSize: "1.1rem", color: "#475569", marginBottom: 30, lineHeight: 1.6 }}>
                {product.description}
              </p>

              <ProductConfigurator product={{
                name: product.name,
                price: effectivePrice,
                colors: product.colors,
                options: product.options
              }} />
            </div>
          </div>
        </section>

        {/* Bank Installment Options Table */}


      </main>
      <SiteFooter />
    </>
  );
}
