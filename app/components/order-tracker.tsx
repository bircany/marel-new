"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatMoney } from "@/app/lib/commerce";
import type { LaravelUser } from "@/app/lib/laravel-auth";
import type { OrderPayload } from "@/app/api/orders/route";

const statusNames: Record<string, string> = { pending: "Sipariş alındı", confirmed: "Onaylandı", production: "Üretimde", shipped: "Kargoya verildi", delivered: "Teslim edildi", cancelled: "İptal edildi" };
const progressByStatus: Record<string, number> = { pending: 12, confirmed: 34, production: 58, shipped: 82, delivered: 100, cancelled: 0 };

export function OrderTracker({ user }: { user: LaravelUser }) {
  const [orders, setOrders] = useState<OrderPayload[] | null>(null);
  const [selected, setSelected] = useState<OrderPayload | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/orders", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: unknown) => {
        if (cancelled) return;
        if (!Array.isArray(data)) { setMessage("Siparişler yüklenemedi."); setOrders([]); return; }
        setOrders(data as OrderPayload[]);
      })
      .catch(() => { if (!cancelled) { setOrders([]); setMessage("Siparişler yüklenemedi."); } });
    return () => { cancelled = true; };
  }, []);

  const open = async (id: number) => {
    setMessage("");
    const response = await fetch(`/api/orders/${id}`, { cache: "no-store" });
    const data = (await response.json()) as { error?: string } | OrderPayload;
    if (!response.ok || "error" in data) { setMessage("error" in data ? data.error ?? "Sipariş yüklenemedi." : "Sipariş yüklenemedi."); return; }
    setSelected(data as OrderPayload);
  };

  if (orders === null) return <section className="tracking-experience"><span className="account-eyebrow">MAREL SİPARİŞ TAKİBİ</span><h1>Siparişleriniz yükleniyor…</h1></section>;

  return (
    <section className="tracking-experience">
      <div className="tracking-story"><span>MAREL SİPARİŞ TAKİBİ</span><h1>Merhaba {user.first_name}, siparişleriniz burada.</h1><p>Üretim, kargo ve teslimat durumunuzu hesabınızdaki siparişler üzerinden takip edin.</p><div className="tracking-steps"><article><b>01</b><span><strong>Sipariş onayı</strong><small>Ölçü, kumaş ve profil teyidi</small></span></article><article><b>02</b><span><strong>Ölçüye özel üretim</strong><small>Marel atölyesinde hazırlık</small></span></article><article><b>03</b><span><strong>Kargo ve teslimat</strong><small>Güncel durum bilgilendirmesi</small></span></article></div></div>
      <div className="tracking-panel"><span>HESABINIZDAKİ SİPARİŞLER</span><h2>Durumları inceleyin.</h2>
        {message ? <p className="form-error">{message}</p> : null}
        {orders.length ? <div className="tracking-order-list">{orders.map((order) => {
          const progress = progressByStatus[order.status] ?? 0;
          const primaryItem = order.items?.[0];
          return (
            <article className="tracking-order-card" key={order.id}>
              <div className="account-order-topline"><div><small>SİPARİŞ NUMARASI</small><h3>{order.order_number}</h3></div><strong className={`order-status status-${order.status}`}>{statusNames[order.status] ?? order.status}</strong></div>
              <div className="account-order-meta"><span><small>Sipariş tarihi</small><b>{new Date(order.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</b></span><span><small>Ürün</small><b>{primaryItem ? primaryItem.product_name ?? "Ürün" : "—"}</b></span><span><small>Toplam</small><b>{formatMoney(Math.round((order.total + Number.EPSILON) * 100))}</b></span></div>
              {order.status !== "cancelled" ? <div className="account-order-progress" aria-label={`Sipariş ilerlemesi yüzde ${progress}`}><i style={{ width: `${progress}%` }} /></div> : null}
              <div className="account-order-actions"><span>{order.status === "delivered" ? "Siparişiniz teslim edildi." : "Siparişiniz Marel ekibi tarafından takip ediliyor."}</span><button type="button" onClick={() => open(order.id)}>{selected?.id === order.id ? "Ayrıntılar açık" : "Ayrıntıları gör →"}</button></div>
              {selected?.id === order.id ? <div className="tracking-order-detail">
                <p><strong>Adres:</strong> {selected.shipping_address ? `${selected.shipping_address.name} · ${selected.shipping_address.city} / ${selected.shipping_address.district} — ${selected.shipping_address.full_address}` : "Adres bilgisi yok."}</p>
                {selected.items?.length ? <div className="tracking-order-items">{selected.items.map((item) => <div key={item.id}><span>{item.product_name ?? "Ürün"}</span><b>{item.quantity} adet × {formatMoney(Math.round((item.unit_price + Number.EPSILON) * 100))}</b></div>)}</div> : null}
                <p><strong>Toplam:</strong> {formatMoney(Math.round((selected.total + Number.EPSILON) * 100))}{selected.notes ? ` · Not: ${selected.notes}` : ""}</p>
              </div> : null}
            </article>
          );
        })}</div> : <div className="tracking-empty"><h3>Henüz bir siparişiniz yok.</h3><p>Ölçünüze özel Marel ürünlerini keşfedin.</p><Link className="button button-gold" href="/urunler">Ürünleri incele</Link></div>}
        <small className="tracking-secure">Bilgileriniz yalnız siparişlerinizi göstermek için kullanılır.</small>
      </div>
    </section>
  );
}
