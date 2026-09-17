"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function PageTransitionLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const finish = () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setLoading(false), 260);
    };

    finish();
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target.closest("a") : null;
      if (!target || target.target === "_blank" || target.hasAttribute("download")) return;
      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      try {
        const next = new URL(href, window.location.href);
        if (next.origin !== window.location.origin || next.href === window.location.href) return;
        setLoading(true);
      } catch {
        // Ignore malformed or non-navigation links.
      }
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return (
    <div className={`page-transition-loader ${loading ? "is-visible" : ""}`} aria-hidden={!loading}>
      <div className="page-transition-loader-mark" aria-label="Marel yükleniyor">
        <span className="page-transition-loader-emblem">M</span>
        <span className="page-transition-loader-name">MAREL</span>
      </div>
      <div className="page-transition-loader-track"><span /></div>
    </div>
  );
}
