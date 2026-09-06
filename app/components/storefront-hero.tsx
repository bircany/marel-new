"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  {
    eyebrow: "ÖZEL ÖLÇÜ ÜRETİM",
    useLogo: true,
    title: "MAREL PLİSE PERDE SİSTEMLERİ",
    text: "Mekânlarınıza Değer Katan Modern ve Estetik Çözümler",
    image: "/images/hero/hero_plise_1_1788724387489.jpg",
    href: "/plise-perdeler",
    button: "Koleksiyonu İncele",
    position: "center",
  },
  {
    eyebrow: "YENİ NESİL TASARIM",
    useLogo: false,
    title: "HONEYCOMB ISI YALITIMLI SERİ",
    text: "Hücresel yapısıyla %100 ışık filtrasyonu ve mükemmel ısı yalıtımı.",
    image: "/images/hero/hero_plise_2_1788724444336.jpg",
    href: "/plise-perdeler",
    button: "Isı Yalıtımlı Perdeleri İncele",
    position: "center",
  },
  {
    eyebrow: "YUMUŞAK GÜN IŞIĞI",
    useLogo: false,
    title: "DIAMOND SERİSİ PLİSE PERDELER",
    text: "Güneşin tadını çıkarırken mahremiyetinizi koruyan şık kumaş dokusu.",
    image: "/images/hero/hero_plise_3_1788724456954.jpg",
    href: "/plise-perdeler",
    button: "Diamond Serisini Keşfet",
    position: "center",
  },
  {
    eyebrow: "LÜKS DOKUNUŞLAR",
    useLogo: false,
    title: "ZENGİN RENK VE DOKULAR",
    text: "Evinizin atmosferini değiştirecek lüks renk seçenekleri.",
    image: "/images/hero/hero_plise_4_1788724467997.jpg",
    href: "/plise-perdeler",
    button: "Tüm Renkleri İncele",
    position: "center",
  },
  {
    eyebrow: "TAM KARARTMA",
    useLogo: false,
    title: "BLACKOUT SERİSİ",
    text: "Kaliteli uyku ve tam mahremiyet için %100 ışık geçirmeyen kumaşlar.",
    image: "/images/hero/hero_plise_5_1788724477560.jpg",
    href: "/plise-perdeler",
    button: "Blackout Serisini İncele",
    position: "center",
  },
];

export function StorefrontHero() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setActive((value) => (value + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, []);
  const slide = slides[active];

  return (
    <section className="store-hero kamatas-hero" aria-roledescription="carousel" aria-label="Kampanyalar">
      <Image unoptimized key={slide.image} src={slide.image} alt={slide.title} fill priority sizes="100vw" style={{ objectPosition: slide.position, objectFit: "cover" }} />
      <div className="store-hero-shade" />
      <div className="shop-container store-hero-content">
        <p>{slide.eyebrow}</p>
        
        {slide.useLogo ? (
           <div style={{ marginBottom: "24px", maxWidth: "460px" }}>
             <Image 
                unoptimized 
                src="/images/marel-logo.png" 
                alt="Marel Logo" 
                width={400} 
                height={80} 
                style={{ objectFit: "contain", width: "100%", height: "auto", filter: "brightness(0) invert(1)" }} 
             />
           </div>
        ) : (
           <h1>{slide.title}</h1>
        )}
        
        <span style={{ fontSize: slide.useLogo ? "1.2rem" : undefined }}>{slide.text}</span>
        <Link href={slide.href}>{slide.button} →</Link>
      </div>
      <button className="hero-arrow hero-prev" type="button" onClick={() => setActive((active + slides.length - 1) % slides.length)} aria-label="Önceki kampanya">‹</button>
      <button className="hero-arrow hero-next" type="button" onClick={() => setActive((active + 1) % slides.length)} aria-label="Sonraki kampanya">›</button>
      <div className="hero-dots">{slides.map((item, index) => <button type="button" key={index} className={index === active ? "active" : ""} onClick={() => setActive(index)} aria-label={`${index + 1}. kampanyayı göster`} />)}</div>
    </section>
  );
}
