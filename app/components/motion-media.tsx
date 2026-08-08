"use client";

import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";

export function Reveal({ children, direction = "left", className = "", id }: { children: ReactNode; direction?: "left" | "right" | "up"; className?: string; id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { node.dataset.visible = "true"; observer.disconnect(); }
    }, { threshold: 0.16, rootMargin: "0px 0px -8%" });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} id={id} className={`motion-reveal ${className}`} data-direction={direction}>{children}</div>;
}

export function ParallaxImage({ src, alt, sizes = "50vw", position = "center" }: { src: string; alt: string; sizes?: string; position?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      const progress = Math.max(-1, Math.min(1, (rect.top + rect.height / 2 - viewport / 2) / viewport));
      node.style.setProperty("--media-shift", `${progress * -26}px`);
    };
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (frame) window.cancelAnimationFrame(frame); };
  }, []);
  return <div ref={ref} className="parallax-media"><Image unoptimized src={src} alt={alt} fill sizes={sizes} style={{ objectPosition: position }} /></div>;
}
