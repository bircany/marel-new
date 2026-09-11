import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductConfigurator } from "@/app/components/product-configurator";

import { ProductViewTracker } from "@/app/components/product-view-tracker";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { CategoryLanding } from "@/app/components/category-landing";
import { getCategoryPage } from "@/app/data";
import { stGetProductBySlug } from "@/app/lib/softtrade";
import { absoluteUrl } from "@/app/lib/site";

export const dynamic = "force-static";
export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCategoryPage(slug);
  if (category) {
    return {
      title: `${category.title} Modelleri ve Fiyatları`,
      description: category.description,
      alternates: { canonical: absoluteUrl(`/urunler/${category.slug}`) },
      openGraph: {
        title: `${category.title} Modelleri ve Fiyatları`,
        description: category.description,
        type: "website" as const,
        url: absoluteUrl(`/urunler/${category.slug}`),
        images: category.image ? [absoluteUrl(category.image)] : undefined,
      },
    };
  }
  const product = await stGetProductBySlug(slug);
  return product
    ? {
        title: `${product.name} | Ölçüye Özel Plise Perde`,
        description: product.description,
        alternates: { canonical: absoluteUrl(`/urunler/${product.slug}`) },
        openGraph: {
          title: product.name,
          description: product.description,
          type: "website" as const,
          url: absoluteUrl(`/urunler/${product.slug}`),
          images: [absoluteUrl(product.image)],
        },
      }
    : { title: "Ürün bulunamadı", robots: { index: false, follow: false } };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCategoryPage(slug);
  if (category) return <CategoryLanding config={category} />;

  const product = await stGetProductBySlug(slug);
  if (!product) notFound();

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
            <Link href="/perdeler">Perdeler</Link>
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
