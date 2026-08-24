"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export function SiteHeader() {
  const [cartCount, setCartCount] = useState(0);
  const [cartPulse, setCartPulse] = useState(false);

  useEffect(() => {
    let pulseTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;
    const refreshCount = async () => {
      try {
        const response = await fetch("/api/cart", { cache: "no-store" });
        if (!response.ok) { if (!cancelled) setCartCount(0); return; }
        const cart = (await response.json()) as { summary?: { total_quantity?: number }; items?: Array<{ quantity?: number }> };
        if (!cancelled) setCartCount(cart.summary?.total_quantity ?? cart.items?.reduce((sum, item) => sum + (item.quantity ?? 0), 0) ?? 0);
      } catch { if (!cancelled) setCartCount(0); }
    };
    const pulse = () => {
      setCartPulse(false);
      requestAnimationFrame(() => setCartPulse(true));
      if (pulseTimer) clearTimeout(pulseTimer);
      pulseTimer = setTimeout(() => setCartPulse(false), 700);
    };
    refreshCount();
    const onCartUpdated = () => { refreshCount(); pulse(); };
    window.addEventListener("marel:cart-updated", onCartUpdated);
    return () => { cancelled = true; window.removeEventListener("marel:cart-updated", onCartUpdated); if (pulseTimer) clearTimeout(pulseTimer); };
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
          <Link className="shop-logo" href="/" aria-label="Marel ana sayfa">
            <Image unoptimized src="/images/marel-logo.png" alt="Marel" width={410} height={62} priority />
          </Link>
          <form className="header-search" action="/urunler">
            <input name="q" type="search" placeholder="Ürün, seri veya kategori ara" aria-label="Ürün ara" />
            <button type="submit" aria-label="Ara">⌕</button>
          </form>
          <div className="shop-actions">
            <a href="https://wa.me/905467356602" target="_blank" rel="noreferrer" aria-label="WhatsApp destek"><span>◉</span><small>Destek</small></a>
            <Link href="/hesabim" aria-label="Hesabım"><span>♙</span><small>Hesabım</small></Link>
            <Link className={`cart-action${cartPulse ? " cart-pulse" : ""}`} href="/sepet" aria-label={`Sepet, ${cartCount} ürün`}><span>▱</span><small>Sepetim</small><b>{cartCount}</b></Link>
          </div>
          <details className="shop-mobile-menu">
            <summary aria-label="Menüyü aç">☰</summary>
            <nav>
              <Link href="/urunler/plise-perde">Plise Perde</Link>
              <Link href="/urunler/jaluzi-perde">Jaluzi Perde</Link>
              <Link href="/urunler/zip-perde">Zip Perde</Link>
              <Link href="/urunler/sineklik">Sineklik</Link>
              <Link href="/urunler/surgulu-kapilar">Sürgülü Kapılar</Link>
            </nav>
          </details>
        </div>
        <nav className="category-nav shop-container" aria-label="Ürün kategorileri">
          <Link href="/urunler/plise-perde">Plise Perde <i>⌄</i></Link>
          <Link href="/urunler/jaluzi-perde">Jaluzi Perde <i>⌄</i></Link>
          <Link href="/urunler/zip-perde">Zip Perde <i>⌄</i></Link>
          <Link href="/urunler/sineklik">Sineklik <i>⌄</i></Link>
          <Link href="/urunler/surgulu-kapilar">Sürgülü Kapılar</Link>
          <Link href="/#indirimdekiler">İndirimdekiler</Link>
          <Link href="/siparis-takip">Sipariş Takip</Link>
        </nav>
      </header>
      <div className="red-ticker"><div>HAVALEDE İNDİRİMLERE EK %10 İNDİRİM • PEŞİN FİYATINA 3 TAKSİT İMKANI • ÖLÇÜYE ÖZEL ÜRETİM • HIZLI WHATSAPP DESTEĞİ</div></div>
    </>
  );
}
