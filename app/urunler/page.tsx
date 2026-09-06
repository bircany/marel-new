import Link from "next/link";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { CatalogBrowser } from "../components/catalog-browser";
import { stListProducts } from "@/app/lib/softtrade";
import { absoluteUrl } from "@/app/lib/site";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Marel Ürünleri | Plise Perde, Jaluzi, Zip Perde ve Sineklik Sistemleri",
  description:
    "Ölçüye özel plise perde, jaluzi, zip perde, sineklik ve sürme kapı sistemleri. Kumaş, renk ve ölçü filtreleriyle en uygun sistemi hemen bulun.",
  alternates: { canonical: absoluteUrl("/urunler") },
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{ kategori?: string; q?: string }>;
}) {
  const params = await searchParams;
  const products = await stListProducts(false, "Marel");

  return (
    <>
      <SiteHeader />
      <main className="catalog-page-main">
        {/* Compact breadcrumb header */}
        <div className="catalog-page-header shop-container">
          <div className="breadcrumbs">
            <Link href="/">Ana sayfa</Link>
            <span>/</span>
            {params?.kategori ? (
              <>
                <Link href="/urunler">Ürünler</Link>
                <span>/</span>
                <span>{params.kategori}</span>
              </>
            ) : params?.q ? (
              <>
                <Link href="/urunler">Ürünler</Link>
                <span>/</span>
                <span>Arama: &ldquo;{params.q}&rdquo;</span>
              </>
            ) : (
              <span>Ürünler</span>
            )}
          </div>
          <h1 className="catalog-page-title">
            {params?.kategori || (params?.q ? `"${params.q}" için sonuçlar` : "Tüm Ürünler")}
          </h1>
        </div>

        <section className="catalog-browser-section shop-container">
          <CatalogBrowser
            products={products}
            initialCategory={params?.kategori}
            initialSearch={params?.q}
          />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
