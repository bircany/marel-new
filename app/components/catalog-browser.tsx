"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { addToServerCart, formatMoney } from "@/app/lib/commerce";
import { trackCommerceEvent } from "@/app/lib/google-ads";
import type { CatalogProduct } from "@/db";

export type FilterState = {
  search: string;
  category: string;
  color: string;
  minPrice: string;
  maxPrice: string;
  inStockOnly: boolean;
  sortBy: "recommended" | "price_asc" | "price_desc" | "discount_asc" | "discount_desc" | "oldest" | "newest";
};

const COLOR_FILTERS = [
  { id: "all", name: "Tümü" },
  { id: "beyaz", name: "Beyaz" },
  { id: "krem", name: "Krem" },
  { id: "gri", name: "Gri" },
  { id: "antrasit", name: "Antrasit" },
  { id: "siyah", name: "Siyah" },
  { id: "bronz", name: "Bronz" },
];

export function CatalogBrowser({
  products,
  initialCategory,
  initialSearch,
}: {
  products: CatalogProduct[];
  initialCategory?: string;
  initialSearch?: string;
}) {
  const [filters, setFilters] = useState<FilterState>({
    search: initialSearch || "",
    category: initialCategory || "all",
    color: "all",
    minPrice: "",
    maxPrice: "",
    inStockOnly: false,
    sortBy: "recommended",
  });

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  // Helper for color count
  const getProductColorText = (product: CatalogProduct) => {
    if (product.slug?.includes("diamond") || product.name?.toLowerCase().includes("diamond")) {
      return "18 Renk Seçeneği";
    }
    if (product.colors) {
      try {
        const parsed = typeof product.colors === "string" ? JSON.parse(product.colors) : product.colors;
        if (Array.isArray(parsed) && parsed.length > 0) {
          return `${parsed.length} Renk Seçeneği`;
        }
      } catch {}
    }
    return "Çoklu Renk Seçeneği";
  };

  // Extract unique categories with counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      let cat = p.category || "Plise Perde";
      if ((cat === "Plise Perdeler" || cat === "Perdeler") && p.name) {
        const m = p.name.match(/^([A-Za-zÇÖŞÜĞIİöçşüğ]+(?:\s+Series)?)/i);
        if (m) cat = m[1];
      }
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [products]);

  const categoriesList = useMemo(() => Object.keys(categoryCounts), [categoryCounts]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Search
        if (filters.search) {
          const q = filters.search.toLowerCase();
          const match =
            product.name.toLowerCase().includes(q) ||
            product.sku.toLowerCase().includes(q) ||
            product.category.toLowerCase().includes(q) ||
            product.description.toLowerCase().includes(q);
          if (!match) return false;
        }

        // Category
        if (filters.category !== "all") {
          const target = filters.category.toLowerCase();
          const pCat = (product.category || "").toLowerCase();
          const pName = (product.name || "").toLowerCase();
          if (pCat !== target && !pName.includes(target)) {
            return false;
          }
        }

        // Color (checking product name/slug/description)
        if (filters.color !== "all") {
          const matchColor =
            product.name.toLowerCase().includes(filters.color) ||
            product.slug.toLowerCase().includes(filters.color) ||
            product.description.toLowerCase().includes(filters.color);
          if (!matchColor) return false;
        }

        // Price Min / Max
        const price = (product.salePrice ?? product.price) / 100;
        if (filters.minPrice && price < Number(filters.minPrice)) return false;
        if (filters.maxPrice && price > Number(filters.maxPrice)) return false;

        // Stock
        if (filters.inStockOnly && product.stock <= 0) return false;

        return true;
      })
      .sort((a, b) => {
        const priceA = (a.salePrice ?? a.price) / 100;
        const priceB = (b.salePrice ?? b.price) / 100;
        const discountA = a.price && a.salePrice ? ((a.price - a.salePrice) / a.price) * 100 : 0;
        const discountB = b.price && b.salePrice ? ((b.price - b.salePrice) / b.price) * 100 : 0;

        if (filters.sortBy === "price_asc") return priceA - priceB;
        if (filters.sortBy === "price_desc") return priceB - priceA;
        if (filters.sortBy === "discount_asc") return discountA - discountB;
        if (filters.sortBy === "discount_desc") return discountB - discountA;
        if (filters.sortBy === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (filters.sortBy === "oldest") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        // Recommended (Featured first)
        return (b.featured ?? 0) - (a.featured ?? 0);
      });
  }, [products, filters]);

  const resetFilters = () => {
    setFilters({
      search: "",
      category: "all",
      color: "all",
      minPrice: "",
      maxPrice: "",
      inStockOnly: false,
      sortBy: "recommended",
    });
  };

  const handleQuickAdd = async (product: CatalogProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (addingId === product.id) return;

    setAddingId(product.id);
    try {
      await addToServerCart(product.id, 1);
      const priceKurus = product.salePrice ?? product.price;
      trackCommerceEvent("add_to_cart", priceKurus / 100, [
        {
          item_id: product.sku,
          item_name: product.name,
          item_brand: product.brand,
          item_category: product.category,
          price: priceKurus / 100,
          quantity: 1,
          google_business_vertical: "retail",
        },
      ]);
      setAddedToast(product.name);
      setTimeout(() => setAddedToast(null), 3000);
    } catch {
      alert("Ürün sepete eklenemedi.");
    } finally {
      setAddingId(null);
    }
  };

  const hasActiveFilters =
    filters.category !== "all" ||
    filters.color !== "all" ||
    Boolean(filters.minPrice) ||
    Boolean(filters.maxPrice) ||
    filters.inStockOnly ||
    Boolean(filters.search);

  return (
    <div className="kamatas-catalog-layout">
      {/* Mobile Filter Toggle */}
      <div className="catalog-mobile-bar">
        <button
          type="button"
          className="catalog-mobile-filter-btn"
          onClick={() => setMobileFilterOpen(true)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
          </svg>
          Filtrele ({filteredProducts.length})
        </button>

        <select
          value={filters.sortBy}
          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as FilterState["sortBy"] })}
          className="catalog-sort-select mobile"
        >
          <option value="recommended">Önerilen Sıralama</option>
          <option value="price_asc">Fiyat: Düşükten Yükseğe</option>
          <option value="price_desc">Fiyat: Yüksekten Düşüğe</option>
          <option value="newest">En Yeniler</option>
        </select>
      </div>

      {/* Left Sidebar Filter Panel */}
      <aside className={`kamatas-catalog-sidebar ${mobileFilterOpen ? "mobile-open" : ""}`}>
        <div className="filter-sidebar-header mobile-only">
          <h3>Filtreler</h3>
          <button type="button" onClick={() => setMobileFilterOpen(false)}>✕</button>
        </div>

        <div className="kamatas-sidebar-widget kamatas-search-widget">
          <input
            type="text"
            placeholder="Ne aramıştınız?"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="kamatas-sidebar-search-input"
          />
        </div>

        <div className="kamatas-sidebar-widget">
          <h4 className="widget-title">Alt Kategoriler</h4>
          <ul className="widget-list">
            <li>
              <label>
                <input
                  type="radio"
                  name="subcat"
                  checked={filters.category === "all"}
                  onChange={() => setFilters({ ...filters, category: "all" })}
                />
                <span>Tümü</span> <em>({products.length})</em>
              </label>
            </li>
            {categoriesList.map((cat) => (
              <li key={cat}>
                <label>
                  <input
                    type="radio"
                    name="subcat"
                    checked={filters.category === cat}
                    onChange={() => setFilters({ ...filters, category: cat })}
                  />
                  <span>{cat}</span> <em>({categoryCounts[cat]})</em>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Right Main Catalog Content */}
      <div className="kamatas-catalog-main">
        {/* Kamatas Top Sorting Tabs */}
        <div className="kamatas-sorting-tabs">
          <button className={filters.sortBy === 'recommended' ? 'active' : ''} onClick={() => setFilters({ ...filters, sortBy: 'recommended' })}>Öne Çıkanlar</button>
          <button className={filters.sortBy === 'price_asc' ? 'active' : ''} onClick={() => setFilters({ ...filters, sortBy: 'price_asc' })}>Artan Fiyat</button>
          <button className={filters.sortBy === 'price_desc' ? 'active' : ''} onClick={() => setFilters({ ...filters, sortBy: 'price_desc' })}>Azalan Fiyat</button>
          <button className={filters.sortBy === 'discount_asc' ? 'active' : ''} onClick={() => setFilters({ ...filters, sortBy: 'discount_asc' })}>Artan İndirim</button>
          <button className={filters.sortBy === 'discount_desc' ? 'active' : ''} onClick={() => setFilters({ ...filters, sortBy: 'discount_desc' })}>Azalan İndirim</button>
          <button className={filters.sortBy === 'oldest' ? 'active' : ''} onClick={() => setFilters({ ...filters, sortBy: 'oldest' })}>İlk Eklenen</button>
          <button className={filters.sortBy === 'newest' ? 'active' : ''} onClick={() => setFilters({ ...filters, sortBy: 'newest' })}>Son Eklenen</button>

          <div className="kamatas-view-switcher">
            <button type="button" className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            </button>
            <button type="button" className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            </button>
          </div>
        </div>

        {/* Product Cards Grid — Kamatas Match */}
        <div className={`kamatas-product-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
          {filteredProducts.length ? (
            filteredProducts.map((product, index) => {
              const effectivePrice = product.salePrice ?? product.price;
              return (
                <Link href={`/urunler/${product.slug}`} className="kamatas-product-card" key={product.id}>
                  <div className="k-card-image">
                    <Image
                      unoptimized
                      src={product.image || "/images/catalog/diamond.webp"}
                      alt={product.name}
                      fill
                      priority={index < 8}
                      loading="eager"
                      sizes="(max-width: 600px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                  <div className="k-card-body">
                    <div className="k-card-brand">Marel</div>
                    <h3 className="k-card-title">{product.name}</h3>
                    <div className="k-card-stars">
                      <span className="stars">★★★★★</span>
                      <span className="reviews">{Math.floor(Math.random() * 100) + 1} Yorum</span>
                    </div>
                    <div className="k-card-price">
                      {product.salePrice && product.salePrice < product.price ? (
                        <>
                          <span className="price-old">{formatMoney(product.price, product.currency)}</span>
                          <span className="price-new">{formatMoney(product.salePrice, product.currency)}</span>
                        </>
                      ) : (
                        <span className="price-new">{formatMoney(product.price, product.currency)}</span>
                      )}
                    </div>
                    <div className="k-card-colors">{getProductColorText(product)}</div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="catalog-empty-state">
              <p>Aradığınız kriterlere uygun ürün bulunamadı.</p>
              <button type="button" onClick={resetFilters}>Filtreleri Sıfırla</button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Cart Toast */}
      {addedToast ? (
        <div className="catalog-cart-toast" role="status">
          <span>✓</span>
          <div>
            <strong>Sepete eklendi</strong>
            <small>{addedToast}</small>
          </div>
          <Link href="/sepet">Sepete Git →</Link>
        </div>
      ) : null}
    </div>
  );
}
