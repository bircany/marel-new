import Link from "next/link";
import Image from "next/image";
import type { CategoryPageConfig } from "@/app/data";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { CatalogBrowser } from "./catalog-browser";
import { absoluteUrl } from "@/app/lib/site";
import { stListProducts } from "@/app/lib/softtrade";

export async function CategoryLanding({ config }: { config: CategoryPageConfig }) {
  const allProducts = await stListProducts(false, "Marel");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Marel ${config.title}`,
    description: config.description,
    provider: { "@type": "Organization", name: "Marel" },
    url: absoluteUrl(`/urunler/${config.slug}`),
  };

  return (
    <>
      <SiteHeader />
      <main className="catalog-page-main">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

        {/* Compact breadcrumb header */}
        <div className="catalog-page-header shop-container">
          <div className="breadcrumbs">
            <Link href="/">Ana sayfa</Link>
            <span>/</span>
            <Link href="/urunler">Ürünler</Link>
            <span>/</span>
            <span>{config.title}</span>
          </div>
          <h1 className="catalog-page-title">{config.title}</h1>
          <p className="catalog-page-desc">{config.description}</p>
        </div>

        {/* Product listing with filters */}
        <section className="catalog-browser-section shop-container">
          <CatalogBrowser products={allProducts} initialCategory={config.title} />
        </section>

        {/* Compact SEO text at bottom */}
        <section className="category-seo-text shop-container">
          <h2>{config.title} Hakkında</h2>
          <p>{config.description}</p>
          {config.specs.length > 0 && (
            <dl className="category-seo-specs">
              {config.specs.map((spec) => (
                <div key={spec.label}>
                  <dt>{spec.label}</dt>
                  <dd>{spec.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
