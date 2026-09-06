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
  sortBy: "recommended" | "price_asc" | "price_desc" | "newest";
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

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  // Extract unique categories with counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      const cat = p.category || "Diğer";
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
        if (filters.category !== "all" && product.category.toLowerCase() !== filters.category.toLowerCase()) {
          return false;
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
        if (filters.sortBy === "price_asc") return priceA - priceB;
        if (filters.sortBy === "price_desc") return priceB - priceA;
        if (filters.sortBy === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
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
    <div className="catalog-browser-layout">
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
      <aside className={`catalog-filters-sidebar ${mobileFilterOpen ? "mobile-open" : ""}`}>
        <div className="filter-sidebar-header">
          <h3>Filtreler</h3>
          {hasActiveFilters ? (
            <button type="button" className="filter-reset-btn" onClick={resetFilters}>
              Temizle
            </button>
          ) : null}
          {mobileFilterOpen ? (
            <button
              type="button"
              className="filter-close-btn"
              onClick={() => setMobileFilterOpen(false)}
            >
              ✕
            </button>
          ) : null}
        </div>

        {/* Search within catalog */}
        <div className="filter-group">
          <div className="filter-search-input">
            <input
              type="text"
              placeholder="Ürün ara…"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            {filters.search ? (
              <button type="button" onClick={() => setFilters({ ...filters, search: "" })}>✕</button>
            ) : null}
          </div>
        </div>

        {/* 1. Kategori Filtresi */}
        <div className="filter-group">
          <h4>Kategoriler</h4>
          <ul className="filter-list">
            <li>
              <label className="filter-checkbox-label">
                <input
                  type="radio"
                  name="filter-cat"
                  checked={filters.category === "all"}
                  onChange={() => setFilters({ ...filters, category: "all" })}
                />
                <span>Tüm Kategoriler</span>
                <em>({products.length})</em>
              </label>
            </li>
            {categoriesList.map((cat) => (
              <li key={cat}>
                <label className="filter-checkbox-label">
                  <input
                    type="radio"
                    name="filter-cat"
                    checked={filters.category.toLowerCase() === cat.toLowerCase()}
                    onChange={() => setFilters({ ...filters, category: cat })}
                  />
                  <span>{cat}</span>
                  <em>({categoryCounts[cat]})</em>
                </label>
              </li>
            ))}
          </ul>
        </div>

        {/* 2. Renk Filtresi */}
        <div className="filter-group">
          <h4>Renk</h4>
          <ul className="filter-list">
            {COLOR_FILTERS.map((c) => (
              <li key={c.id}>
                <label className="filter-checkbox-label">
                  <input
                    type="radio"
                    name="filter-color"
                    checked={filters.color === c.id}
                    onChange={() => setFilters({ ...filters, color: c.id })}
                  />
                  <span>{c.name}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. Fiyat Aralığı */}
        <div className="filter-group">
          <h4>Fiyat (₺)</h4>
          <div className="filter-price-inputs">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            />
          </div>
        </div>

        {/* 4. Stok Durumu */}
        <div className="filter-group">
          <label className="filter-checkbox-label">
            <input
              type="checkbox"
              checked={filters.inStockOnly}
              onChange={(e) => setFilters({ ...filters, inStockOnly: e.target.checked })}
            />
            <span>Sadece Stokta Olanlar</span>
          </label>
        </div>

        {mobileFilterOpen ? (
          <button
            type="button"
            className="filter-apply-mobile-btn"
            onClick={() => setMobileFilterOpen(false)}
          >
            Filtreleri Uygula ({filteredProducts.length} Ürün)
          </button>
        ) : null}
      </aside>

      {/* Right Main Catalog Content */}
      <div className="catalog-main-content">
        {/* Top Control Bar */}
        <div className="catalog-top-bar">
          <span className="catalog-product-count">
            <strong>{filteredProducts.length}</strong> ürün listeleniyor
          </span>

          <div className="catalog-sort-wrapper">
            <label>Sırala:</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as FilterState["sortBy"] })}
              className="catalog-sort-select desktop"
            >
              <option value="recommended">Önerilen Sıralama</option>
              <option value="price_asc">Fiyat: Düşükten Yükseğe</option>
              <option value="price_desc">Fiyat: Yüksekten Düşüğe</option>
              <option value="newest">En Yeniler</option>
            </select>
          </div>
        </div>

        {/* Active Filter Badges */}
        {hasActiveFilters ? (
          <div className="active-filters-strip">
            {filters.search ? (
              <span className="active-filter-tag">
                &ldquo;{filters.search}&rdquo;
                <button type="button" onClick={() => setFilters({ ...filters, search: "" })}>×</button>
              </span>
            ) : null}
            {filters.category !== "all" ? (
              <span className="active-filter-tag">
                {filters.category}
                <button type="button" onClick={() => setFilters({ ...filters, category: "all" })}>×</button>
              </span>
            ) : null}
            {filters.color !== "all" ? (
              <span className="active-filter-tag">
                {filters.color}
                <button type="button" onClick={() => setFilters({ ...filters, color: "all" })}>×</button>
              </span>
            ) : null}
            {filters.minPrice || filters.maxPrice ? (
              <span className="active-filter-tag">
                {filters.minPrice || "0"}₺ - {filters.maxPrice || "∞"}₺
                <button type="button" onClick={() => setFilters({ ...filters, minPrice: "", maxPrice: "" })}>×</button>
              </span>
            ) : null}
            <button type="button" className="clear-all-text-btn" onClick={resetFilters}>
              Temizle
            </button>
          </div>
        ) : null}

        {/* Product Cards Grid — Clean Simple Cards */}
        <div className="catalog-grid">
          {filteredProducts.length ? (
            filteredProducts.map((product) => {
              const effectivePrice = product.salePrice ?? product.price;
              return (
                <article className="catalog-card" key={product.id}>
                  <Link href={`/urunler/${product.slug}`} className="catalog-card-image-wrap">
                    <Image
                      unoptimized
                      src={product.image || "/images/catalog/diamond.webp"}
                      alt={product.name}
                      fill
                      sizes="(max-width: 600px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      className="catalog-card-image"
                    />
                    {product.salePrice && product.salePrice < product.price ? (
                      <span className="card-badge red">İndirim</span>
                    ) : null}
                  </Link>

                  <div className="catalog-card-body">
                    <span className="card-category-tag">{product.category}</span>
                    <h3 className="card-title">
                      <Link href={`/urunler/${product.slug}`}>{product.name}</Link>
                    </h3>

                    <div className="card-price-row">
                      <div className="price-block">
                        <strong>{formatMoney(effectivePrice, product.currency)}</strong>
                        {product.salePrice && product.salePrice < product.price ? (
                          <del>{formatMoney(product.price, product.currency)}</del>
                        ) : null}
                      </div>
                    </div>

                    <div className="card-actions-row">
                      <button
                        type="button"
                        className={`card-add-cart-btn ${addingId === product.id ? "loading" : ""}`}
                        disabled={addingId === product.id || product.stock <= 0}
                        onClick={(e) => handleQuickAdd(product, e)}
                      >
                        {addingId === product.id ? (
                          "Ekleniyor…"
                        ) : product.stock <= 0 ? (
                          "Tükendi"
                        ) : (
                          <>+ Sepete Ekle</>
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="catalog-empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <h3>Aradığınız kriterlere uygun ürün bulunamadı.</h3>
              <p>Filtreleri sıfırlayarak tüm ürünleri görüntüleyebilirsiniz.</p>
              <button type="button" className="btn-gold" onClick={resetFilters}>
                Filtreleri Sıfırla
              </button>
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
