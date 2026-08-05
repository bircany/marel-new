"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  { eyebrow: "Yeni sezon", title: "Ölçünü seç, rengini belirle.", text: "Plise perde, sineklik ve zip sistemlerinde ölçüye özel üretim.", image: "/images/catalog/pages/page-02.webp", href: "/urunler/plise-perde/diamond-serisi", button: "Hemen incele" },
  { eyebrow: "Diamond Serisi", title: "Evinin ışığını sen yönet.", text: "10+ kumaş rengi ve 5 profil seçeneğiyle yaşam alanına tam uyum.", image: "/images/catalog/pages/page-03.webp", href: "/urunler/plise-perde/diamond-serisi#teklif", button: "Renk seç & teklif al" },
  { eyebrow: "Marel Sineklik", title: "Temiz hava içeride kalsın.", text: "Pencere ve kapılar için pratik, dayanıklı ve ölçüye özel çözümler.", image: "/images/configurator/diamond-100-beyaz-antrasit-1.webp", href: "/urunler#sineklik", button: "Sinekliklere bak" },
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
      <Image unoptimized key={slide.image} src={slide.image} alt="" fill priority sizes="100vw" />
      <div className="store-hero-shade" />
      <div className="shop-container store-hero-content">
        <p>{slide.eyebrow}</p><h1>{slide.title}</h1><span>{slide.text}</span>
        <Link href={slide.href}>{slide.button} →</Link>
      </div>
      <button className="hero-arrow hero-prev" type="button" onClick={() => setActive((active + slides.length - 1) % slides.length)} aria-label="Önceki kampanya">‹</button>
      <button className="hero-arrow hero-next" type="button" onClick={() => setActive((active + 1) % slides.length)} aria-label="Sonraki kampanya">›</button>
      <div className="hero-dots">{slides.map((item, index) => <button type="button" key={item.title} className={index === active ? "active" : ""} onClick={() => setActive(index)} aria-label={`${index + 1}. kampanyayı göster`} />)}</div>
    </section>
  );
}
