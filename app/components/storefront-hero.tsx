"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  { eyebrow: "Honeycomb Series · 003 Gri", title: "Isıyı içeride, konforu evinde tut.", text: "%100 ışık filtrasyonu, hücresel ısı yalıtımı ve ölçüye özel üretim.", image: "/images/hero/marel-honeycomb-hero-v3.png", href: "/urunler/plise-perde/diamond-serisi#teklif", button: "Honeycomb teklifini hazırla", position: "center" },
  { eyebrow: "Diamond Series", title: "Kumaşın gerçek dokusunu gör.", text: "%50 ışık filtrasyonu, UV dayanımı ve katalogdaki gerçek renk seçenekleri.", image: "/images/real/diamond-gri.jpeg", href: "/urunler/plise-perde/diamond-serisi", button: "Diamond renklerini incele", position: "center 43%" },
  { eyebrow: "WhatsApp Destek", title: "Ölçünü gönder, doğru ürünü birlikte seçelim.", text: "Kumaş, kasa rengi, genişlik, yükseklik ve adet bilgilerini doğrudan danışmanımıza iletin.", image: "/images/catalog/diamond.webp", href: "https://wa.me/905467356602?text=Merhaba%2C%20%C3%B6l%C3%A7%C3%BCye%20%C3%B6zel%20perde%20teklifi%20almak%20istiyorum.", button: "WhatsApp'ta görüş", position: "center 22%" },
];

export function StorefrontHero() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setActive((value) => (value + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, []);
  const slide = slides[active];

  return (
    <section className="store-hero" aria-roledescription="carousel" aria-label="Kampanyalar">
      <Image unoptimized key={slide.image} src={slide.image} alt="" fill priority sizes="100vw" style={{ objectPosition: slide.position }} />
      <div className="store-hero-shade" />
      <div className="shop-container store-hero-content"><p>{slide.eyebrow}</p><h1>{slide.title}</h1><span>{slide.text}</span><Link href={slide.href}>{slide.button} →</Link></div>
      <button className="hero-arrow hero-prev" type="button" onClick={() => setActive((active + slides.length - 1) % slides.length)} aria-label="Önceki kampanya">‹</button>
      <button className="hero-arrow hero-next" type="button" onClick={() => setActive((active + 1) % slides.length)} aria-label="Sonraki kampanya">›</button>
      <div className="hero-dots">{slides.map((item, index) => <button type="button" key={item.title} className={index === active ? "active" : ""} onClick={() => setActive(index)} aria-label={`${index + 1}. kampanyayı göster`} />)}</div>
    </section>
  );
}
