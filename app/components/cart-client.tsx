"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatMoney, readCart, writeCart, type CartLine } from "@/app/lib/commerce";
import { trackAdsConversion, trackCommerceEvent } from "@/app/lib/google-ads";

export function CartClient({ defaultName = "", defaultEmail = "" }: { defaultName?: string; defaultEmail?: string }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [order, setOrder] = useState<{ orderNumber: string; total: number } | null>(null);
  useEffect(() => setLines(readCart()), []);
  const subtotal = useMemo(() => lines.reduce((sum, line) => sum + line.price * line.quantity, 0), [lines]);
  const shipping = subtotal >= 100000 || subtotal === 0 ? 0 : 9900;

  const updateQuantity = (productId: string, quantity: number) => {
    const next = lines.map((line) => line.productId === productId ? { ...line, quantity: Math.max(0, quantity) } : line).filter((line) => line.quantity > 0);
    setLines(next); writeCart(next);
  };

  const submitOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!lines.length) return;
    setPending(true); setMessage("");
    const form = new FormData(event.currentTarget);
    trackCommerceEvent("begin_checkout", subtotal / 100, lines.map((line) => ({ item_id: line.sku, item_name: line.name, item_brand: "Marel", price: line.price / 100, quantity: line.quantity, google_business_vertical: "retail" })));
    const response = await fetch("/api/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ customerName: form.get("customerName"), email: form.get("email"), phone: form.get("phone"), shippingAddress: form.get("shippingAddress"), notes: form.get("notes"), items: lines.map((line) => ({ productId: line.productId, quantity: line.quantity })) }) });
    const result = await response.json() as { error?: string; orderNumber?: string; total?: number };
    setPending(false);
    if (!response.ok || !result.orderNumber || result.total === undefined) return setMessage(result.error ?? "Sipariş oluşturulamadı.");
    const completed = { orderNumber: result.orderNumber, total: result.total };
    setOrder(completed); setLines([]); writeCart([]);
    trackCommerceEvent("purchase", result.total / 100, lines.map((line) => ({ item_id: line.sku, item_name: line.name, item_brand: "Marel", price: line.price / 100, quantity: line.quantity, google_business_vertical: "retail" })), { transaction_id: result.orderNumber, shipping: shipping / 100 });
    trackAdsConversion(result.total / 100, result.orderNumber);
  };

  if (order) return <section className="commerce-success"><span>✓</span><h1>Siparişiniz alındı</h1><p>Sipariş numaranız <strong>{order.orderNumber}</strong>. Durum değişikliklerini Hesabım veya Sipariş Takip sayfasından izleyebilirsiniz.</p><p className="commerce-price">{formatMoney(order.total)}</p><Link className="button button-gold" href={`/siparis-takip?orderNumber=${order.orderNumber}`}>Siparişi takip et</Link></section>;

  return (
    <div className="cart-layout">
      <section className="cart-lines">
        <h1>Sepetim</h1>
        {!lines.length ? <div className="empty-state"><p>Sepetiniz henüz boş.</p><Link className="button button-gold" href="/urunler">Ürünleri incele</Link></div> : lines.map((line) => (
          <article className="cart-line" key={line.productId}>
            <div className="cart-line-image"><Image unoptimized src={line.image} alt={line.name} fill sizes="120px" /></div>
            <div><small>{line.sku}</small><h2>{line.name}</h2><strong>{formatMoney(line.price, line.currency)}</strong></div>
            <label>Adet<input aria-label={`${line.name} adedi`} type="number" min="0" max="20" value={line.quantity} onChange={(event) => updateQuantity(line.productId, Number(event.target.value))} /></label>
          </article>
        ))}
      </section>
      <aside className="checkout-card">
        <h2>Sipariş özeti</h2>
        <p><span>Ara toplam</span><strong>{formatMoney(subtotal)}</strong></p><p><span>Kargo</span><strong>{shipping ? formatMoney(shipping) : "Ücretsiz"}</strong></p><p className="checkout-total"><span>Toplam</span><strong>{formatMoney(subtotal + shipping)}</strong></p>
        <form onSubmit={submitOrder} className="commerce-form">
          <label>Ad soyad<input name="customerName" defaultValue={defaultName} required /></label>
          <label>E-posta<input name="email" type="email" defaultValue={defaultEmail} required /></label>
          <label>Telefon<input name="phone" type="tel" required /></label>
          <label>Teslimat adresi<textarea name="shippingAddress" rows={3} required /></label>
          <label>Sipariş notu<textarea name="notes" rows={2} /></label>
          {message ? <p className="form-error" role="alert">{message}</p> : null}
          <button type="submit" disabled={pending || !lines.length}>{pending ? "Sipariş oluşturuluyor…" : "Siparişi oluştur"}</button>
          <small>Ödeme bağlantısı ve ölçü teyidi sipariş sonrası Marel danışmanı tarafından iletilir.</small>
        </form>
      </aside>
    </div>
  );
}
