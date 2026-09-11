import Link from "next/link";
import Image from "next/image";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { listProducts } from "@/db";
import { absoluteUrl } from "@/app/lib/site";
import { ProductFilterSync } from "@/app/components/product-filter-sync";

export const dynamic = "force-static";

export const metadata = {
  title: "Marel Ürünleri | Plise Perde Sistemleri",
  description:
    "Özel ölçüye göre üretilen Diamond, Touch, New, Tulle, Efe, Ece, Blackout, Honeycomb, Dark, Bambu, Silver ve Gold serisi plise perdeler.",
  alternates: { canonical: absoluteUrl("/urunler") },
};

const CATEGORY_LIST = [
  { name: "Popüler Ürünler", query: "" },
  { name: "Diamond", query: "Diamond" },
  { name: "Touch", query: "Touch" },
  { name: "New", query: "New" },
  { name: "Tulle", query: "Tulle" },
  { name: "Efe", query: "Efe" },
  { name: "Ece", query: "Ece" },
  { name: "Blackout", query: "Blackout" },
  { name: "Honeycomb", query: "Honeycomb" },
  { name: "Dark", query: "Dark" },
  { name: "Bambu", query: "Bambu" },
  { name: "Silver", query: "Silver" },
  { name: "Gold", query: "Gold" },
  { name: "Arda", query: "Arda" },
  { name: "Asel", query: "Asel" },
  { name: "Pars", query: "Pars" },
  { name: "Reina", query: "Reina" },
  { name: "Venus", query: "Venus" },
];

const normalizeFilter = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{ kategori?: string; q?: string; filter?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const rawProducts = await listProducts(false);

  const query = params?.filter || params?.q;
  const normalizedQuery = query ? normalizeFilter(query) : "";
  let filtered = query
    ? rawProducts.filter(
        (p) =>
          normalizeFilter(p.name).includes(normalizedQuery) ||
          normalizeFilter(p.category).includes(normalizedQuery)
      )
    : rawProducts;

  if (params?.sort === "price-asc") {
    filtered = [...filtered].sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
  } else if (params?.sort === "price-desc") {
    filtered = [...filtered].sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
  }

  return (
    <>
      <SiteHeader />
      <ProductFilterSync />
      <main style={{ backgroundColor: "#fcfbf7", minHeight: "100vh", padding: "40px 20px 80px" }}>
        <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
          
          {/* Top Bar: Results Count & Sort */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "30px",
              paddingBottom: "16px",
              borderBottom: "1px solid #edebe4",
            }}
          >
            <div style={{ fontSize: "0.95rem", color: "#64748b" }}>
              {filtered.length} sonucun tümü gösteriliyor
            </div>
            <div>
              <span style={{ fontSize: "0.9rem", color: "#475569", fontWeight: 500 }}>
                Varsayılan Sıralama
              </span>
            </div>
          </div>

          {/* Main Layout: Products Grid (Left) + Sidebar (Right) */}
          <div className="products-layout" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 260px", gap: "40px", alignItems: "start" }}>
            
            {/* Product Grid (Left) */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: "28px",
                }}
              >
                {filtered.map((product) => {
                  const displayPrice = (product.salePrice ?? product.price) / 100;
                  const tagText = product.name
                    .toUpperCase()
                    .replace(" SERIES PLISE PERDE", "")
                    .replace(" SERİSİ PLİSE PERDE", "");

                  return (
                    <Link
                      data-product-card={`${product.name} ${product.category}`}
                      key={product.id || product.slug}
                      href={`/urunler/${product.slug}`}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        textDecoration: "none",
                        backgroundColor: "#ffffff",
                        borderRadius: "14px",
                        overflow: "hidden",
                        border: "1px solid #edebe4",
                        transition: "transform 0.2s, box-shadow 0.2s",
                      }}
                      className="group hover:-translate-y-1 hover:shadow-md"
                    >
                      {/* Image with Tag Banner */}
                      <div
                        style={{
                          position: "relative",
                          width: "100%",
                          aspectRatio: "4 / 3",
                          backgroundColor: "#f5f5f2",
                          overflow: "hidden",
                        }}
                      >
                        <Image
                          src={product.image || "/images/catalog/diamond.webp"}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          style={{ objectFit: "cover" }}
                          className="transition-transform duration-300 group-hover:scale-105"
                        />
                        {/* Dark series tag on bottom-left */}
                        <div
                          style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            backgroundColor: "rgba(0, 0, 0, 0.85)",
                            color: "#ffffff",
                            padding: "4px 12px",
                            fontSize: "0.72rem",
                            fontWeight: 800,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                          }}
                        >
                          {tagText}
                        </div>
                      </div>

                      {/* Title & Price Below */}
                      <div style={{ padding: "16px 14px", textAlign: "left" }}>
                        <h3
                          style={{
                            fontSize: "0.95rem",
                            fontWeight: 600,
                            color: "#1e293b",
                            marginBottom: "6px",
                            lineHeight: 1.3,
                          }}
                        >
                          {product.name}
                        </h3>
                        <p style={{ fontSize: "1rem", fontWeight: 700, color: "#b8904f", margin: 0 }}>
                          {displayPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}₺
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {filtered.length === 0 && (
                <div style={{ textAlign: "center", padding: "80px 20px", color: "#64748b" }}>
                  <p style={{ fontSize: "1.2rem", marginBottom: "16px" }}>Bu kategoriye ait ürün bulunamadı.</p>
                  <Link
                    href="/urunler"
                    style={{
                      display: "inline-block",
                      backgroundColor: "#b8904f",
                      color: "#fff",
                      padding: "10px 24px",
                      borderRadius: "6px",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Tüm Ürünleri Gör
                  </Link>
                </div>
              )}
            </div>

            {/* Sidebar (Right) matching Screenshot 3 */}
            <aside style={{ width: "260px", flexShrink: 0 }} className="w-full lg:w-[260px]">
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "14px",
                  padding: "24px 20px",
                  border: "1px solid #edebe4",
                  position: "sticky",
                  top: "100px",
                }}
              >
                {/* Categories */}
                <h2
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "#1e293b",
                    marginBottom: "16px",
                    borderBottom: "2px solid #f1f0ea",
                    paddingBottom: "10px",
                  }}
                >
                  Kategori
                </h2>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {CATEGORY_LIST.map((cat) => {
                    const isSelected =
                      (!query && cat.query === "") ||
                      (query && query.toLowerCase() === cat.query.toLowerCase());

                    return (
                      <li key={cat.name}>
                        <Link
                          href={cat.query ? `/urunler?filter=${encodeURIComponent(normalizeFilter(cat.query))}` : "/urunler"}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontSize: "0.9rem",
                            color: isSelected ? "#b8904f" : "#475569",
                            fontWeight: isSelected ? 700 : 500,
                            textDecoration: "none",
                            transition: "color 0.15s",
                          }}
                          className="hover:text-[#b8904f]"
                        >
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              backgroundColor: isSelected ? "#b8904f" : "#cbd5e1",
                            }}
                          />
                          {cat.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                {/* Filtrele / Price section */}
                <div style={{ marginTop: "32px", paddingTop: "20px", borderTop: "1px solid #f1f0ea" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1e293b", marginBottom: "12px" }}>
                    Filtrele
                  </h3>
                  <div
                    style={{
                      height: "4px",
                      backgroundColor: "#8c2e2e",
                      borderRadius: "2px",
                      marginBottom: "16px",
                    }}
                  />
                  <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "16px" }}>
                    Fiyat: 550₺ — 1,170₺
                  </div>
                  <Link
                    href="/urunler"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      backgroundColor: "#b8904f",
                      color: "#ffffff",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      padding: "8px 18px",
                      borderRadius: "6px",
                      textDecoration: "none",
                    }}
                    className="hover:bg-[#9f7838]"
                  >
                    Filtrele &rarr;
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
