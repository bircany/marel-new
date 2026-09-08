"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import type { CatalogProduct } from "@/db";
import { formatMoney } from "@/app/lib/commerce";

const POPULAR_CATEGORIES = [
  { name: "Plise Perdeler", href: "/plise-perdeler", badge: "Çok Satan" },
  { name: "Sineklikler", href: "/sineklikler", badge: "Popüler" },
  { name: "Seperatör Kapı", href: "/separator-kapi", badge: "Yeni" },
  { name: "Menteşeli Sineklikler", href: "/sineklikler?alt=menteseli" },
  { name: "Akordiyon Sineklikler", href: "/sineklikler?alt=akordiyon" },
  { name: "Bambu Plise Perdeler", href: "/plise-perdeler" },
  { name: "Otomatik Panjurlar", href: "/otomatik-panjurlar" },
  { name: "Aksesuarlar", href: "/aksesuarlar" },
];

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CatalogProduct[]>([]);
  const [matchingCategories, setMatchingCategories] = useState<string[]>([]);
  const [bestsellers, setBestsellers] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus on open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Load initial bestsellers on first open
  useEffect(() => {
    if (open && bestsellers.length === 0) {
      fetch("/api/search?featured=true&limit=4")
        .then((res) => res.json() as Promise<{ results?: CatalogProduct[] }>)
        .then((data) => {
          if (data?.results?.length) {
            setBestsellers(data.results);
          }
        })
        .catch(() => {});
    }
  }, [open, bestsellers.length]);

  // Real-time search query
  const performSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setMatchingCategories([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}&limit=12`);
      if (res.ok) {
        const data = (await res.json()) as { results: CatalogProduct[]; categories?: string[] };
        setResults(data.results || []);
        setMatchingCategories(data.categories || []);
      }
    } catch {
      setResults([]);
      setMatchingCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => performSearch(query), 250);
    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const categoryToSlug = (cat: string) => {
    const lower = cat.toLowerCase();
    if (lower.includes("sineklik")) return "/sineklikler";
    if (lower.includes("seperatör") || lower.includes("separator")) return "/separator-kapi";
    if (lower.includes("perde")) return "/plise-perdeler";
    if (lower.includes("panjur")) return "/otomatik-panjurlar";
    if (lower.includes("tutamak")) return "/tutamaklar";
    if (lower.includes("aksesuar")) return "/aksesuarlar";
    return "/urunler";
  };

  return (
    <>
      {/* MAGNIFYING GLASS SEARCH BUTTON IN HEADER */}
      <button
        type="button"
        className="header-search-btn"
        onClick={() => setOpen(true)}
        aria-label="Ürün veya kategori arayın"
        title="Arama Yap"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          width="20"
          height="20"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>

      {/* FULL-SCREEN OVERLAY POPUP MODAL */}
      {open && (
        <div className="global-search-overlay" role="dialog" aria-modal="true">
          <div className="global-search-backdrop" onClick={() => setOpen(false)} />
          <div className="global-search-panel">
            {/* Top Search Bar */}
            <div className="global-search-header">
              <div className="shop-container">
                <div className="global-search-input-wrapper">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    width="22"
                    height="22"
                    className="search-icon"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Marel'de ürün, model veya kategori arayın..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  {query && (
                    <button
                      type="button"
                      className="search-clear-btn"
                      onClick={() => setQuery("")}
                      title="Temizle"
                    >
                      ✕
                    </button>
                  )}
                  <button
                    type="button"
                    className="search-close-btn"
                    onClick={() => setOpen(false)}
                  >
                    Kapat ✕
                  </button>
                </div>
              </div>
            </div>

            {/* Content Container */}
            <div className="global-search-body shop-container">
              {query.trim().length >= 2 ? (
                /* LIVE SEARCH RESULTS VIEW */
                <div className="global-search-results">
                  {loading && <div className="search-loading-text">Sonuçlar aranıyor...</div>}

                  {/* Matching Categories Pills */}
                  {matchingCategories.length > 0 && (
                    <div className="search-cat-matches">
                      <span className="search-subheading">İlgili Kategoriler:</span>
                      <div className="search-cat-pills">
                        {matchingCategories.map((cat) => (
                          <Link
                            key={cat}
                            href={categoryToSlug(cat)}
                            className="search-cat-pill"
                            onClick={() => setOpen(false)}
                          >
                            🏷️ {cat}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Product Results */}
                  {!loading && results.length === 0 ? (
                    <div className="search-empty-state">
                      <p>&quot;{query}&quot; ile eşleşen bir ürün veya kategori bulunamadı.</p>
                      <small>Farklı bir anahtar kelime deneyebilir veya aşağıdaki popüler kategorileri inceleyebilirsiniz.</small>
                    </div>
                  ) : (
                    <div className="search-results-grid">
                      {results.map((product) => (
                        <Link
                          href={`/urunler/${product.slug}`}
                          key={product.id}
                          className="search-result-card"
                          onClick={() => setOpen(false)}
                        >
                          <div className="search-card-thumb">
                            <Image
                              unoptimized
                              src={product.image || "/images/catalog/diamond.webp"}
                              alt={product.name}
                              width={70}
                              height={70}
                              style={{ objectFit: "cover", width: "100%", height: "100%" }}
                            />
                          </div>
                          <div className="search-card-meta">
                            <h4 className="search-card-name">{product.name}</h4>
                            <span className="search-card-cat">{product.category}</span>
                            <span className="search-card-price">
                              {formatMoney(product.salePrice ?? product.price, product.currency)}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {!loading && results.length > 0 && (
                    <div className="search-view-all-wrap">
                      <Link
                        href={`/urunler?q=${encodeURIComponent(query)}`}
                        className="search-all-link"
                        onClick={() => setOpen(false)}
                      >
                        Tüm {results.length} sonucu incele →
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                /* DEFAULT STATE: POPULAR CATEGORIES & BESTSELLERS */
                <div className="global-search-suggestions">
                  {/* Category Pills */}
                  <div className="suggestions-block">
                    <h3 className="suggestions-title">Popüler Kategoriler</h3>
                    <div className="suggestion-pills-list">
                      {POPULAR_CATEGORIES.map((cat) => (
                        <Link
                          href={cat.href}
                          key={cat.name}
                          onClick={() => setOpen(false)}
                          className="suggestion-pill"
                        >
                          {cat.name}
                          {cat.badge && <span className="pill-badge">{cat.badge}</span>}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Bestsellers Row */}
                  <div className="suggestions-block">
                    <h3 className="suggestions-title">En Çok Tercih Edilenler</h3>
                    <div className="bestsellers-row">
                      {bestsellers.length > 0 ? (
                        bestsellers.map((prod) => (
                          <Link
                            href={`/urunler/${prod.slug}`}
                            key={prod.id}
                            className="bestseller-mini-card"
                            onClick={() => setOpen(false)}
                          >
                            <div className="bs-mini-img">
                              <Image
                                unoptimized
                                src={prod.image || "/images/catalog/diamond.webp"}
                                alt={prod.name}
                                width={60}
                                height={60}
                                style={{ objectFit: "cover", borderRadius: "6px" }}
                              />
                            </div>
                            <div className="bs-mini-info">
                              <span className="bs-mini-name">{prod.name}</span>
                              <span className="bs-mini-cat">{prod.category}</span>
                              <strong className="bs-mini-price">
                                {formatMoney(prod.salePrice ?? prod.price, prod.currency)}
                              </strong>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="bestsellers-grid">
                          <Link
                            href="/plise-perdeler"
                            onClick={() => setOpen(false)}
                            className="bestseller-fallback-card"
                          >
                            <span>✨</span>
                            <div>
                              <strong>Ölçüye Özel Plise Perde</strong>
                              <small>Cam balkon ve evler için</small>
                            </div>
                          </Link>
                          <Link
                            href="/sineklikler"
                            onClick={() => setOpen(false)}
                            className="bestseller-fallback-card"
                          >
                            <span>🪟</span>
                            <div>
                              <strong>Menteşeli Sineklik</strong>
                              <small>Pencereler için dayanıklı sistem</small>
                            </div>
                          </Link>
                          <Link
                            href="/separator-kapi"
                            onClick={() => setOpen(false)}
                            className="bestseller-fallback-card"
                          >
                            <span>🚪</span>
                            <div>
                              <strong>Seperatör Kapı Sistemleri</strong>
                              <small>Işık ve ses yalıtımlı</small>
                            </div>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
