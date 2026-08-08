export type CartLine = {
  productId: string;
  slug: string;
  sku: string;
  name: string;
  image: string;
  price: number;
  currency: string;
  quantity: number;
};

export const CART_STORAGE_KEY = "marel-cart-v1";

export function formatMoney(amountInKurus: number, currency = "TRY"): string {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency }).format(amountInKurus / 100);
}

export function readCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? "[]") as CartLine[];
    return Array.isArray(parsed) ? parsed.filter((line) => line.productId && line.quantity > 0) : [];
  } catch {
    return [];
  }
}

export function writeCart(lines: CartLine[]): void {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
  window.dispatchEvent(new CustomEvent("marel:cart-updated", { detail: lines }));
}

export function addCartLine(line: Omit<CartLine, "quantity">): void {
  const lines = readCart();
  const existing = lines.find((item) => item.productId === line.productId);
  if (existing) existing.quantity += 1;
  else lines.push({ ...line, quantity: 1 });
  writeCart(lines);
}
