"use client";

import { useEffect } from "react";
import { trackCommerceEvent } from "@/app/lib/google-ads";

export function ProductViewTracker({ sku, name, category, price }: { sku: string; name: string; category: string; price: number }) {
  useEffect(() => {
    trackCommerceEvent("view_item", price / 100, [{ item_id: sku, item_name: name, item_brand: "Marel", item_category: category, price: price / 100, quantity: 1, google_business_vertical: "retail" }]);
  }, [sku, name, category, price]);
  return null;
}
