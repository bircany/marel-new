"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatMoney } from "@/app/lib/commerce";
import { cargoLabel, cargoTrackingUrl } from "@/app/lib/cargo";
import type { LaravelUser } from "@/app/lib/laravel-auth";
import type { OrderPayload } from "@/app/api/orders/route";
import type { CargoTrackPayload, GuestTrackResponse } from "@/app/api/orders/track/route";

const statusNames: Record<string, string> = {
  pending: "Sipariş alındı",
  awaiting_measurement: "Ölçü onayı bekleniyor",
  measure_ok: "Ölçü onaylandı",
  confirmed: "Onaylandı",
  processing: "Üretimde",
  production: "Üretimde",
  shipped: "Kargoya verildi",
  delivered: "Teslim edildi",
  cancelled: "İptal edildi",
  refunded: "İade edildi",
};
const progressByStatus: Record<string, number> = {
  pending: 12,
  awaiting_measurement: 28,
  measure_ok: 45,
  confirmed: 34,
  processing: 58,
  production: 58,
  shipped: 82,
  delivered: 100,
  cancelled: 0,
  refunded: 0,
};

function CargoBlock({
  company,
  trackingNumber,
  trackingUrl,
  liveStatus,
  events,
}: {
  company?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  liveStatus?: string | null;
  events?: Array<{ date?: string | null; description: string }>;
}) {
  if (!trackingNumber && !company) return null;
  const url = trackingUrl || cargoTrackingUrl(company, trackingNumber);
  return (
    <div className="tracking-cargo">
      <p>
        <strong>Kargo:</strong> {cargoLabel(company)}
        {trackingNumber ? ` · ${trackingNumber}` : ""}
      </p>
      {liveStatus ? <p><strong>Kargo durumu:</strong> {liveStatus}</p> : null}
      {url ? (
        <a className="button button-gold" href={url} target="_blank" rel="noreferrer">
          Kargoyu takip et ↗
        </a>
      ) : null}
      {events?.length ? (
        <ul className="tracking-cargo-events">
          {events.slice(0, 5).map((event, index) => (
            <li key={`${event.date ?? ""}-${index}`}>
              <small>{event.date ? new Date(event.date).toLocaleString("tr-TR") : "—"}</small>
              <span>{event.description}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function OrderTracker({ user }: { user: LaravelUser }) {
  const [orders, setOrders] = useState<OrderPayload[] | null>(null);
  const [selected, setSelected] = useState<OrderPayload | null>(null);
  const [cargo, setCargo] = useState<CargoTrackPayload | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/orders", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: unknown) => {
        if (cancelled) return;
        if (!Array.isArray(data)) {
          setMessage("Siparişler yüklenemedi.");
          setOrders([]);
          return;
        }
        setOrders(data as OrderPayload[]);
      })
      .catch(() => {
        if (!cancelled) {
          setOrders([]);
          setMessage("Siparişler yüklenemedi.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const open = async (id: number | string) => {
    setMessage("");
    setCargo(null);
    const response = await fetch(`/api/orders/${id}`, { cache: "no-store" });
    const data = (await response.json()) as { error?: string } | OrderPayload;
    if (!response.ok || "error" in data) {
      setMessage("error" in data ? data.error ?? "Sipariş yüklenemedi." : "Sipariş yüklenemedi.");
      return;
    }
    const order = data as OrderPayload;
    setSelected(order);
    if (order.tracking_number) {
      const cargoRes = await fetch(`/api/orders/${id}/cargo`, { cache: "no-store" });
      if (cargoRes.ok) {
        const cargoData = (await cargoRes.json()) as CargoTrackPayload;
        setCargo(cargoData);
      }
    }
  };

  if (orders === null) {
    return (
      <section className="tracking-experience">
        <span className="account-eyebrow">MAREL SİPARİŞ TAKİBİ</span>
        <h1>Siparişleriniz yükleniyor…</h1>
      </section>
    );
  }

  return (
    <section className="tracking-experience">
      <div className="tracking-story">
        <span>MAREL SİPARİŞ TAKİBİ</span>
        <h1>Merhaba {user.first_name}, siparişleriniz burada.</h1>
        <p>Üretim, kargo ve teslimat durumunuzu hesabınızdaki siparişler üzerinden takip edin.</p>
        <div className="tracking-steps">
          <article>
            <b>01</b>
            <span>
              <strong>Sipariş onayı</strong>
              <small>Ölçü, kumaş ve profil teyidi</small>
            </span>
          </article>
          <article>
            <b>02</b>
            <span>
              <strong>Ölçüye özel üretim</strong>
              <small>Marel atölyesinde hazırlık</small>
            </span>
          </article>
          <article>
            <b>03</b>
            <span>
              <strong>Kargo ve teslimat</strong>
              <small>Takip numarası ile canlı durum</small>
            </span>
          </article>
        </div>
      </div>
      <div className="tracking-panel">
        <span>HESABINIZDAKİ SİPARİŞLER</span>
        <h2>Durumları inceleyin.</h2>
        {message ? <p className="form-error">{message}</p> : null}
        {orders.length ? (
          <div className="tracking-order-list">
            {orders.map((order) => {
              const progress = progressByStatus[order.status] ?? 0;
              const primaryItem = order.items?.[0];
              return (
                <article className="tracking-order-card" key={order.id}>
                  <div className="account-order-topline">
                    <div>
                      <small>SİPARİŞ NUMARASI</small>
                      <h3>{order.order_number}</h3>
                    </div>
                    <strong className={`order-status status-${order.status}`}>
                      {statusNames[order.status] ?? order.status}
                    </strong>
                  </div>
                  <div className="account-order-meta">
                    <span>
                      <small>Sipariş tarihi</small>
                      <b>
                        {new Date(order.created_at).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </b>
                    </span>
                    <span>
                      <small>Ürün</small>
                      <b>{primaryItem ? primaryItem.product_name ?? "Ürün" : "—"}</b>
                    </span>
                    <span>
                      <small>Toplam</small>
                      <b>{formatMoney(Math.round((order.total + Number.EPSILON) * 100))}</b>
                    </span>
                  </div>
                  {order.status !== "cancelled" ? (
                    <div className="account-order-progress" aria-label={`Sipariş ilerlemesi yüzde ${progress}`}>
                      <i style={{ width: `${progress}%` }} />
                    </div>
                  ) : null}
                  <div className="account-order-actions">
                    <span>
                      {order.tracking_number
                        ? `${cargoLabel(order.cargo_company)} · ${order.tracking_number}`
                        : order.status === "delivered"
                          ? "Siparişiniz teslim edildi."
                          : "Siparişiniz Marel ekibi tarafından takip ediliyor."}
                    </span>
                    <button type="button" onClick={() => open(order.id)}>
                      {selected?.id === order.id ? "Ayrıntılar açık" : "Ayrıntıları gör →"}
                    </button>
                  </div>
                  {selected?.id === order.id ? (
                    <div className="tracking-order-detail">
                      <p>
                        <strong>Adres:</strong>{" "}
                        {selected.shipping_address
                          ? `${selected.shipping_address.name} · ${selected.shipping_address.city} / ${selected.shipping_address.district} — ${selected.shipping_address.full_address}`
                          : "Adres bilgisi yok."}
                      </p>
                      {selected.items?.length ? (
                        <div className="tracking-order-items">
                          {selected.items.map((item) => (
                            <div key={item.id}>
                              <span>{item.product_name ?? "Ürün"}</span>
                              <b>
                                {item.quantity} adet × {formatMoney(Math.round((item.unit_price + Number.EPSILON) * 100))}
                              </b>
                            </div>
                          ))}
                        </div>
                      ) : null}
                      <p>
                        <strong>Toplam:</strong> {formatMoney(Math.round((selected.total + Number.EPSILON) * 100))}
                        {selected.notes ? ` · Not: ${selected.notes}` : ""}
                      </p>
                      <CargoBlock
                        company={cargo?.company ?? selected.cargo_company}
                        trackingNumber={cargo?.tracking_number ?? selected.tracking_number}
                        trackingUrl={cargo?.tracking_url ?? selected.tracking_url}
                        liveStatus={cargo?.live_status}
                        events={cargo?.events}
                      />
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="tracking-empty">
            <h3>Henüz bir siparişiniz yok.</h3>
            <p>Ölçünüze özel Marel ürünlerini keşfedin.</p>
            <Link className="button button-gold" href="/urunler">
              Ürünleri incele
            </Link>
          </div>
        )}
        <small className="tracking-secure">Bilgileriniz yalnız siparişlerinizi göstermek için kullanılır.</small>
      </div>
    </section>
  );
}

export function GuestOrderTracker() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GuestTrackResponse | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderNumber, email }),
      });
      const data = (await response.json()) as GuestTrackResponse & { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Sipariş bulunamadı.");
        return;
      }
      setResult(data);
    } catch {
      setError("Takip isteği gönderilemedi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tracking-guest-form-wrap">
      <form className="tracking-guest-form" onSubmit={submit}>
        <span>MISAFİR TAKİP</span>
        <h2>Sipariş no ile sorgula</h2>
        <p>Hesap oluşturmadan sipariş ve kargo durumunu görüntüleyin.</p>
        <label>
          Sipariş numarası
          <input
            value={orderNumber}
            onChange={(event) => setOrderNumber(event.target.value)}
            placeholder="ORD-20260905-00001"
            required
          />
        </label>
        <label>
          Sipariş e-postası
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ornek@mail.com"
            required
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button type="submit" disabled={loading}>
          {loading ? "Sorgulanıyor…" : "Siparişi getir →"}
        </button>
      </form>
      {result ? (
        <article className="tracking-order-card tracking-guest-result">
          <div className="account-order-topline">
            <div>
              <small>SİPARİŞ NUMARASI</small>
              <h3>{result.order.order_number}</h3>
            </div>
            <strong className={`order-status status-${result.order.status}`}>
              {statusNames[result.order.status] ?? result.order.status}
            </strong>
          </div>
          <p>
            <strong>Toplam:</strong> {formatMoney(Math.round((result.order.total + Number.EPSILON) * 100))}
          </p>
          <CargoBlock
            company={result.cargo.company}
            trackingNumber={result.cargo.tracking_number}
            trackingUrl={result.cargo.tracking_url}
            liveStatus={result.cargo.live_status}
            events={result.cargo.events}
          />
        </article>
      ) : null}
    </div>
  );
}
