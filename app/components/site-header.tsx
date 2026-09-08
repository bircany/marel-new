"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { GlobalSearch } from "./global-search";
import type { CatalogProduct } from "@/db";
import { formatMoney } from "@/app/lib/commerce";

const menuGroups = [
  {
    label: "Sineklikler",
    href: "/sineklikler",
    items: [
      ["Menteşeli Sineklikler", "/sineklikler?alt=menteseli"],
      ["Menteşeli Pencere Sinekliği", "/sineklikler?alt=menteseli-pencere"],
      ["Menteşeli Pencere Kedi Sinekliği", "/sineklikler?alt=menteseli-pencere-kedi"],
      ["Menteşeli Kapı Kedi Sinekliği", "/sineklikler?alt=menteseli-kapi-kedi"],
      ["Sabit Sök-Tak Sineklikler", "/sineklikler?alt=sabit-sok-tak"],
      ["Akordiyon Sineklikler", "/sineklikler?alt=akordiyon"],
      ["Cam Balkon Sineklikleri", "/sineklikler?alt=cam-balkon"],
      ["Kedi Sineklikleri", "/sineklikler?alt=kedi"],
      ["Sürme Sineklikler", "/sineklikler?alt=surme"],
      ["Sineklik Kasaları", "/sineklikler?alt=kasalar"],
    ],
  },
  {
    label: "Seperatör Kapı",
    href: "/separator-kapi",
    items: [
      ["Orjin Separatör Kapılar", "/separator-kapi?alt=orjin"],
      ["%100 Işık Yalıtımlı Kapılar", "/separator-kapi?alt=isik-yalitimli"],
      ["Termal ve Işık Yalıtımlı Kapılar", "/separator-kapi?alt=termal"],
    ],
  },
  {
    label: "Perdeler",
    href: "/perdeler",
    items: [
      ["Plise Perdeler", "/plise-perdeler"],
      ["Orjin Plise Perdeler", "/plise-perdeler?seri=orjin"],
      ["Bambu Plise Perdeler", "/plise-perdeler?seri=bambu"],
      ["Dimout Plise Perdeler", "/plise-perdeler?seri=dimout"],
    ],
  },
  {
    label: "Otomatik Panjurlar",
    href: "/otomatik-panjurlar",
    items: [
      ["Motorlu Panjur Sistemleri", "/otomatik-panjurlar?alt=motorlu"],
      ["Kumandalı Panjur", "/otomatik-panjurlar?alt=kumandali"],
      ["Yedek Parça", "/otomatik-panjurlar?alt=yedek-parca"],
    ],
  },
  {
    label: "Tutamaklar",
    href: "/tutamaklar",
    items: [],
  },
  {
    label: "Aksesuarlar",
    href: "/aksesuarlar",
    items: [
      ["Sineklik Aksesuarları", "/aksesuarlar?alt=sineklik"],
      ["Sineklik Tülleri", "/aksesuarlar?alt=tul"],
      ["Yırtılmaz Kedi Tülleri", "/aksesuarlar?alt=kedi-tulu"],
      ["Pencere ve Kapı Aksesuarları", "/aksesuarlar?alt=pencere-kapi"],
    ],
  },
] as const;

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
          const count =
            !cart.items || cart.items.length === 0
              ? 0
              : cart.summary?.total_quantity ??
                cart.items?.reduce((sum, item) => sum + (item.quantity ?? 0), 0) ??
                0;
          setCartCount(count);
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
        <div className="benefit-marquee">
          <span>HAVALEDE EK %10 İNDİRİM</span>
          <span>1000₺ ÜZERİ ÜCRETSİZ KARGO</span>
          <span>PEŞİN FİYATINA 3 TAKSİT İMKANI</span>
          <span aria-hidden="true">HAVALEDE EK %10 İNDİRİM</span>
          <span aria-hidden="true">1000₺ ÜZERİ ÜCRETSİZ KARGO</span>
          <span aria-hidden="true">PEŞİN FİYATINA 3 TAKSİT İMKANI</span>
        </div>
      </div>
      <header className="shop-header">
        <div className="shop-header-main shop-container">
          <Link className="shop-logo" href="/" aria-label="Marel ana sayfa">
            <Image
              unoptimized
              src="/images/marel-logo.png"
              alt="Marel Plise Perde"
              width={260}
              height={34}
              priority
              style={{ objectFit: "contain", width: "auto", height: "32px" }}
            />
          </Link>

          <nav className="header-primary-nav" aria-label="Ürün kategorileri">
            {menuGroups.map((group) =>
              group.items.length > 0 ? (
                <details className="nav-dropdown" key={group.label}>
                  <summary>
                    <Link href={group.href}>{group.label}</Link>
                    <span aria-hidden="true">⌄</span>
                  </summary>
                  <div className="nav-dropdown-panel">
                    {group.items.map(([label, href]) => (
                      <Link href={href} key={href}>
                        {label}
                      </Link>
                    ))}
                  </div>
                </details>
              ) : (
                <Link href={group.href} key={group.label}>
                  {group.label}
                </Link>
              ),
            )}
            <Link href="/siparis-takip">Sipariş Takip</Link>
          </nav>

          <div className="shop-actions">
            <GlobalSearch />
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
            </a>

            <Link href="/account/login" aria-label="Hesabım" className="header-account-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
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
              <b>{cartCount}</b>
            </Link>
          </div>

          {/* Mobile Menu */}
          <details className="shop-mobile-menu">
            <summary aria-label="Menüyü aç">☰</summary>
            <nav>
              <Link href="/sineklikler">Sineklikler</Link>
              <Link href="/separator-kapi">Seperatör Kapı</Link>
              <Link href="/perdeler">Perdeler</Link>
              <Link href="/otomatik-panjurlar">Otomatik Panjurlar</Link>
              <Link href="/tutamaklar">Tutamaklar</Link>
              <Link href="/aksesuarlar">Aksesuarlar</Link>
              <Link href="/siparis-takip">Sipariş Takip</Link>
              <Link href="/urunler">Tüm Ürünler</Link>
              <Link href="/iletisim">İletişim</Link>
            </nav>
          </details>
        </div>
      </header>

      <div className="red-ticker">
        <div>
          HAVALEDE İNDİRİMLERE EK %10 İNDİRİM • PEŞİN FİYATINA 3 TAKSİT İMKANI • 1000₺ ÜZERİ ÜCRETSİZ KARGO • CANLI WHATSAPP DANIŞMA
        </div>
      </div>
    </>
  );
}
