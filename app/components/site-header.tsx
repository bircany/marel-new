"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export function SiteHeader() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const add = () => setCartCount((count) => count + 1);
    window.addEventListener("marel:add-to-cart", add);
    return () => window.removeEventListener("marel:add-to-cart", add);
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
            <Link href="/urunler" aria-label="Hesabım"><span>♙</span><small>Hesabım</small></Link>
            <Link className="cart-action" href="#sepet" aria-label={`Sepet, ${cartCount} ürün`}><span>▱</span><small>Sepetim</small><b>{cartCount}</b></Link>
          </div>
          <details className="shop-mobile-menu">
            <summary aria-label="Menüyü aç">☰</summary>
            <nav>
              <Link href="/urunler#plise-perde">Plise Perde</Link>
              <Link href="/urunler#jaluzi-perde">Jaluzi Perde</Link>
              <Link href="/urunler#zip-perde">Zip Perde</Link>
              <Link href="/urunler#sineklik">Sineklik</Link>
              <Link href="/urunler#surgulu-kapilar">Sürgülü Kapılar</Link>
            </nav>
          </details>
        </div>
        <nav className="category-nav shop-container" aria-label="Ürün kategorileri">
          <Link href="/urunler#plise-perde">Plise Perde <i>⌄</i></Link>
          <Link href="/urunler#jaluzi-perde">Jaluzi Perde <i>⌄</i></Link>
          <Link href="/urunler#zip-perde">Zip Perde <i>⌄</i></Link>
          <Link href="/urunler#sineklik">Sineklik <i>⌄</i></Link>
          <Link href="/urunler#surgulu-kapilar">Sürgülü Kapılar</Link>
          <Link href="/#indirimdekiler">İndirimdekiler</Link>
          <Link href="#takip">Sipariş Takip</Link>
        </nav>
      </header>
      <div className="red-ticker"><div>HAVALEDE İNDİRİMLERE EK %10 İNDİRİM • PEŞİN FİYATINA 3 TAKSİT İMKANI • ÖLÇÜYE ÖZEL ÜRETİM • HIZLI WHATSAPP DESTEĞİ</div></div>
    </>
  );
}
