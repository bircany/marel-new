"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { CatalogProduct } from "@/db";
import { formatMoney } from "@/app/lib/commerce";

function SearchAutocomplete() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CatalogProduct[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=6`);
      if (res.ok) {
        const data = (await res.json()) as { results: CatalogProduct[] };
        setResults(data.results);
        setOpen(data.results.length > 0);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    setSelectedIdx(-1);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(value.trim()), 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    if (query.trim()) {
      router.push(`/urunler?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter" && selectedIdx >= 0) {
      e.preventDefault();
      const product = results[selectedIdx];
      if (product) {
        setOpen(false);
        router.push(`/urunler/${product.slug}`);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="header-search-wrapper" ref={wrapperRef}>
      <form className="header-search" onSubmit={handleSubmit}>
        <input
          name="q"
          type="search"
          placeholder="Ürün, seri veya kategori ara…"
          aria-label="Ürün ara"
          autoComplete="off"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
        />
        <button type="submit" aria-label="Ara">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </form>

      {open && results.length > 0 && (
        <div className="search-dropdown" role="listbox">
          {results.map((product, idx) => {
            const effectivePrice = product.salePrice ?? product.price;
            return (
              <Link
                key={product.id}
                href={`/urunler/${product.slug}`}
                className={`search-dropdown-item${idx === selectedIdx ? " selected" : ""}`}
                role="option"
                aria-selected={idx === selectedIdx}
                onClick={() => setOpen(false)}
              >
                <div className="search-item-img">
                  <Image
                    unoptimized
                    src={product.image || "/images/marel-logo.png"}
                    alt={product.name}
                    width={44}
                    height={44}
                    style={{ objectFit: "cover", borderRadius: "6px" }}
                  />
                </div>
                <div className="search-item-info">
                  <span className="search-item-name">{product.name}</span>
                  <span className="search-item-cat">{product.category}</span>
                </div>
                <strong className="search-item-price">{formatMoney(effectivePrice, product.currency)}</strong>
              </Link>
            );
          })}
          <Link
            href={`/urunler?q=${encodeURIComponent(query.trim())}`}
            className="search-dropdown-all"
            onClick={() => setOpen(false)}
          >
            Tüm sonuçları gör →
          </Link>
        </div>
      )}
      {loading && query.length >= 2 && (
        <div className="search-dropdown">
          <div className="search-dropdown-loading">Aranıyor…</div>
        </div>
      )}
    </div>
  );
}

export function SiteHeader() {
  const [cartCount, setCartCount] = useState(0);
  const [cartPulse, setCartPulse] = useState(false);

  useEffect(() => {
    let pulseTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;
    const refreshCount = async () => {
      try {
        const response = await fetch("/api/cart", { cache: "no-store" });
        if (!response.ok) {
          if (!cancelled) setCartCount(0);
          return;
        }
        const cart = (await response.json()) as {
          summary?: { total_quantity?: number };
          items?: Array<{ quantity?: number }>;
        };
        if (!cancelled) {
          setCartCount(
            cart.summary?.total_quantity ??
              cart.items?.reduce((sum, item) => sum + (item.quantity ?? 0), 0) ??
              0,
          );
        }
      } catch {
        if (!cancelled) setCartCount(0);
      }
    };
    const pulse = () => {
      setCartPulse(false);
      requestAnimationFrame(() => setCartPulse(true));
      if (pulseTimer) clearTimeout(pulseTimer);
      pulseTimer = setTimeout(() => setCartPulse(false), 700);
    };
    refreshCount();
    const onCartUpdated = () => {
      refreshCount();
      pulse();
    };
    window.addEventListener("marel:cart-updated", onCartUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener("marel:cart-updated", onCartUpdated);
      if (pulseTimer) clearTimeout(pulseTimer);
    };
  }, []);

  return (
    <>
      <div className="benefit-bar" aria-label="Alışveriş avantajları">
        <span>PEŞİN FİYATINA 3 TAKSİT</span>
        <span>1.000₺ ÜZERİ ÜCRETSİZ KARGO</span>
        <span>HAVALEDE EK %10 İNDİRİM</span>
      </div>
      <header className="shop-header">
        <div className="shop-header-main shop-container">
          {/* Prominent Luxury Logo */}
          <Link className="shop-logo" href="/" aria-label="Marel ana sayfa">
            <Image
              unoptimized
              src="/images/marel-logo.png"
              alt="Marel Perde ve Sineklik Sistemleri"
              width={220}
              height={44}
              priority
              style={{ objectFit: "contain", width: "auto", height: "42px" }}
            />
          </Link>

          {/* Search with Autocomplete */}
          <SearchAutocomplete />

          {/* Actions: Direct WhatsApp Icon Button, Account, Cart */}
          <div className="shop-actions">
            <a
              href="https://wa.me/905467356602"
              target="_blank"
              rel="noreferrer"
              className="header-whatsapp-btn"
              aria-label="WhatsApp Danışma Hattı"
              title="WhatsApp İle Danışın"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.13 8.13 0 0 1-1.25-4.38c0-4.5 3.66-8.16 8.16-8.16 2.18 0 4.23.85 5.77 2.39a8.11 8.11 0 0 1 2.39 5.77c0 4.5-3.66 8.16-8.16 8.16zm4.47-6.1c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.53.07-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.71-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.2 3.7.59.25 1.05.4 1.41.51.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.23-.17-.47-.29z" />
              </svg>
              <span className="wa-label">WhatsApp</span>
            </a>

            <Link href="/hesabim" aria-label="Hesabım" className="header-account-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <small>Hesabım</small>
            </Link>

            <Link
              className={`cart-action${cartPulse ? " cart-pulse" : ""}`}
              href="/sepet"
              aria-label={`Sepet, ${cartCount} ürün`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <small>Sepetim</small>
              <b>{cartCount}</b>
            </Link>
          </div>

          {/* Mobile Menu */}
          <details className="shop-mobile-menu">
            <summary aria-label="Menüyü aç">☰</summary>
            <nav>
              <Link href="/urunler?kategori=Plise Perde">Plise Perde</Link>
              <Link href="/urunler?kategori=Jaluzi Perde">Jaluzi Perde</Link>
              <Link href="/urunler?kategori=Zip Perde">Zip Perde</Link>
              <Link href="/urunler?kategori=Sineklik">Sineklik</Link>
              <Link href="/urunler?kategori=Sürgülü Kapılar">Sürgülü Kapılar</Link>
              <Link href="/urunler">Tüm Ürünler</Link>
              <Link href="/siparis-takip">Sipariş Takip</Link>
              <Link href="/iletisim">İletişim</Link>
            </nav>
          </details>
        </div>

        {/* Category Navigation Bar - All Categories */}
        <nav className="category-nav shop-container" aria-label="Ürün kategorileri">
          <Link href="/urunler?kategori=Plise Perde">Plise Perde</Link>
          <Link href="/urunler?kategori=Jaluzi Perde">Jaluzi Perde</Link>
          <Link href="/urunler?kategori=Zip Perde">Zip Perde</Link>
          <Link href="/urunler?kategori=Sineklik">Sineklik</Link>
          <Link href="/urunler?kategori=Sürgülü Kapılar">Sürgülü Kapılar</Link>
          <Link href="/urunler">Tüm Koleksiyon</Link>
          <Link href="/siparis-takip">Sipariş Takip</Link>
          <Link href="/iletisim">İletişim</Link>
        </nav>
      </header>

      <div className="red-ticker">
        <div>
          HAVALEDE İNDİRİMLERE EK %10 İNDİRİM • PEŞİN FİYATINA 3 TAKSİT İMKANI • ÖLÇÜYE ÖZEL MİLLİMETRİK ÜRETİM • CANLI
          WHATSAPP DANIŞMA
        </div>
      </div>
    </>
  );
}
