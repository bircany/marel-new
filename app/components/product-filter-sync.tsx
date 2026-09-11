"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const normalize = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");

export function ProductFilterSync() {
  const params = useSearchParams();
  const pathname = usePathname();
  useEffect(() => {
    if (pathname !== "/urunler") return;
    const filter = normalize(params.get("filter") || params.get("q") || "");
    document.querySelectorAll<HTMLElement>("[data-product-card]").forEach((card) => {
      const haystack = normalize(card.dataset.productCard || "");
      card.style.display = !filter || haystack.includes(filter) ? "" : "none";
    });
  }, [params, pathname]);
  return null;
}
