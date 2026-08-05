"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

export function ParallaxHero() {
  const imageRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const y = Math.min(window.scrollY, window.innerHeight * 1.2);
      if (imageRef.current) imageRef.current.style.transform = `translate3d(0, ${y * 0.13}px, 0) scale(${1 + y * 0.000035})`;
      if (detailRef.current) detailRef.current.style.transform = `translate3d(0, ${y * -0.07}px, 0)`;
      frame = 0;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (frame) cancelAnimationFrame(frame); };
  }, []);

  return (
    <section className="hero">
      <div className="hero-media" ref={imageRef} aria-hidden="true">
        <Image src="/images/catalog/pages/page-02.webp" alt="" fill priority sizes="100vw" />
      </div>
      <div className="hero-shade" />
      <div className="container hero-inner">
        <div className="hero-copy">
          <p className="eyebrow light">Işığı kontrol edin. Mekânı özgür bırakın.</p>
          <h1>Ölçünüze özel<br />yaşam sistemleri.</h1>
          <p className="hero-lead">Plise perde, jaluzi, zip perde, sineklik ve sürgülü kapılarda kumaştan kasaya kadar her seçimi size göre hazırlıyoruz.</p>
          <div className="hero-actions">
            <Link className="button button-gold" href="/urunler">Ürünleri keşfet</Link>
            <Link className="button button-ghost" href="/urunler/plise-perde/diamond-serisi#teklif">Hızlı teklif al</Link>
          </div>
        </div>
        <div className="hero-detail" ref={detailRef}>
          <Image src="/images/catalog/swatches/page-02-03.webp" alt="Diamond kumaş dokusu" width={220} height={220} />
          <div><span>Seçili doku</span><strong>Diamond 108 / Krem</strong><small>%50 ışık filtrasyonu</small></div>
        </div>
        <div className="hero-scroll"><span>Keşfet</span><i /></div>
      </div>
    </section>
  );
}
