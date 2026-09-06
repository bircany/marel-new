import { notFound } from "next/navigation";
import { ProductConfigurator } from "@/app/components/product-configurator";
import { ProductViewTracker } from "@/app/components/product-view-tracker";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { CategoryLanding } from "@/app/components/category-landing";
import { getCategoryPage } from "@/app/data";
import { stGetProductBySlug } from "@/app/lib/softtrade";
import { absoluteUrl } from "@/app/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCategoryPage(slug);
  if (category) {
    return {
      title: `${category.title} Modelleri ve Fiyatları`,
      description: category.description,
      alternates: { canonical: absoluteUrl(`/urunler/${category.slug}`) },
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

  const effectivePrice = product.salePrice ?? product.price;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    brand: { "@type": "Brand", name: product.brand },
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
      <main className="commerce-main">
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

        <section className="shop-container" style={{ paddingTop: 20, paddingBottom: 60 }}>
          <ProductConfigurator product={product} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
