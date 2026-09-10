import Link from "next/link";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { CatalogBrowser } from "../components/catalog-browser";
import { listProducts, type CatalogProduct } from "@/db";
import { absoluteUrl } from "@/app/lib/site";

export const revalidate = 60;

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
  const products = await listProducts(false);
  
  const seriesNames = ["Arda", "Asel", "Bambu", "Blackout", "Dark", "Diamond", "Ece", "Efe", "Gold", "Honeycomb", "New", "Pars", "Reina", "Silver", "Touch", "Tülle", "Venus"];

  const filteredProducts = params?.q 
    ? products.filter(p => p.name.toLowerCase().includes(params.q!.toLowerCase()))
    : products;  return (
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

        <section className="shop-container" style={{ padding: "40px 20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "40px" }} className="md:flex-row">
            
            {/* Sidebar */}
            <aside style={{ width: "250px", flexShrink: 0 }} className="hidden md:block">
              <div style={{ position: "sticky", top: "120px" }}>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "20px", color: "#0f172a", borderBottom: "2px solid #e2e8f0", paddingBottom: "10px" }}>Kategoriler</h2>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                  <li>
                    <Link href="/urunler" style={{ display: "block", color: !params?.q ? "#2563eb" : "#475569", fontWeight: !params?.q ? 700 : 500, textDecoration: "none", transition: "color 0.2s" }} className="hover:text-blue-600">
                      Tümü ({products.length})
                    </Link>
                  </li>
                  {seriesNames.map(series => (
                    <li key={series}>
                      <Link href={`/urunler?q=${series}`} style={{ display: "block", color: params?.q?.toLowerCase() === series.toLowerCase() ? "#2563eb" : "#475569", fontWeight: params?.q?.toLowerCase() === series.toLowerCase() ? 700 : 500, textDecoration: "none", transition: "color 0.2s" }} className="hover:text-blue-600">
                        {series} Series Plise Perde
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Product Grid */}
            <div style={{ flex: 1 }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "30px",
              }}>
                {filteredProducts.length > 0 ? filteredProducts.map(p => (
                  <Link href={`/urunler/${p.slug}`} key={p.id} style={{
                    display: "block",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    overflow: "hidden",
                    textDecoration: "none",
                    background: "#fff",
                    transition: "transform 0.2s, box-shadow 0.2s"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.05)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}>
                    <div style={{ width: "100%", height: "250px", background: "#f8fafc" }}>
                      <img 
                        src={p.image || "/images/real/diamond-beyaz-siyah-ip.jpeg"} 
                        alt={p.name} 
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                    <div style={{ padding: "20px" }}>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>{p.name}</h3>
                      <p style={{ fontSize: "1.2rem", fontWeight: 800, color: "#2563eb" }}>
                        {(p.salePrice ?? p.price) / 100} ₺ / m²
                      </p>
                    </div>
                  </Link>
                )) : (
                  <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
                    <p style={{ fontSize: "1.2rem" }}>Bu kategoriye ait ürün bulunamadı.</p>
                    <Link href="/urunler" style={{ display: "inline-block", marginTop: "20px", color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>Tüm Ürünlere Dön</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
