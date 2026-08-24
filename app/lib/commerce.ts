export function formatMoney(amountInKurus: number, currency = "TRY"): string {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency }).format(amountInKurus / 100);
}

export type ServerCartItem = {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    slug: string;
    sku: string;
    cover_image: string | null;
    stock: number;
    in_stock: boolean;
  } | null;
  unit_price: number;
  line_total: number;
};

export type ServerCart = {
  items: ServerCartItem[];
  summary: { item_count: number; total_quantity: number; subtotal: number };
};

export async function fetchServerCart(): Promise<ServerCart> {
  const response = await fetch("/api/cart", { cache: "no-store" });
  if (!response.ok) return { items: [], summary: { item_count: 0, total_quantity: 0, subtotal: 0 } };
  return (await response.json()) as ServerCart;
}

export async function addToServerCart(productId: string | number, quantity = 1): Promise<ServerCart> {
  const response = await fetch("/api/cart", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ productId, quantity }),
  });
  const data = (await response.json()) as ServerCart & { error?: string };
  if (!response.ok) throw new Error(data.error ?? "Ürün sepete eklenemedi.");
  window.dispatchEvent(new CustomEvent("marel:cart-updated", { detail: data.summary?.total_quantity ?? 0 }));
  return data;
}

export function cartCountFromServer(cart: ServerCart): number {
  return cart.summary?.total_quantity ?? cart.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
}

export function cartSubtotalToKurus(cart: ServerCart): number {
  return Math.round((cart.summary?.subtotal ?? 0) * 100);
}
