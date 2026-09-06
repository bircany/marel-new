"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchServerCart, formatMoney, type ServerCart, type ServerCartItem } from "@/app/lib/commerce";
import { trackAdsConversion, trackCommerceEvent } from "@/app/lib/google-ads";
import type { LaravelUser } from "@/app/lib/laravel-auth";
import type { AddressPayload } from "@/app/api/addresses/route";
import type { OrderPayload } from "@/app/api/orders/route";
import { getPaymentSettingsSync, whatsappPaymentUrl, type PaymentSettings } from "@/app/lib/payment";

function kurus(tl: number): number {
  return Math.round((tl + Number.EPSILON) * 100);
}

type GuestShipping = {
  name: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  full_address: string;
};

export function CartClient({ user }: { user: LaravelUser | null }) {
  const [cart, setCart] = useState<ServerCart | null>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [order, setOrder] = useState<OrderPayload | null>(null);
  const [addresses, setAddresses] = useState<AddressPayload[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddressPending, setNewAddressPending] = useState(false);
  const [payment, setPayment] = useState<PaymentSettings>(getPaymentSettingsSync());

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const [cartData, payRes] = await Promise.all([
        fetchServerCart(),
        fetch("/api/payment-settings", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
      ]);
      if (cancelled) return;
      setCart(cartData);
      if (payRes && typeof payRes === "object") setPayment(payRes as PaymentSettings);
      window.dispatchEvent(new CustomEvent("marel:cart-updated", { detail: cartData.summary?.total_quantity ?? 0 }));
      if (user) {
        const addressResponse = await fetch("/api/addresses", { cache: "no-store" });
        if (addressResponse.ok) {
          const list = (await addressResponse.json()) as AddressPayload[];
          if (!cancelled) {
            setAddresses(list);
            setSelectedAddressId(list.find((address) => address.is_default)?.id ?? list[0]?.id ?? null);
          }
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const subtotalKurus = cart ? Math.round((cart.summary?.subtotal ?? 0) * 100) : 0;
  const shipping = subtotalKurus >= payment.freeShippingMin * 100 || subtotalKurus === 0 ? 0 : 9900;
  const totalKurus = subtotalKurus + shipping;

  const updateQuantity = async (item: ServerCartItem, quantity: number) => {
    if (quantity <= 0) return removeItem(item);
    setMessage("");
    const response = await fetch(`/api/cart/${item.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) return setMessage(data?.error ?? "Miktar güncellenemedi.");
    setCart(await fetchServerCart());
    window.dispatchEvent(new CustomEvent("marel:cart-updated"));
  };

  const removeItem = async (item: ServerCartItem) => {
    setMessage("");
    const response = await fetch(`/api/cart/${item.id}`, { method: "DELETE" });
    if (!response.ok) return;
    setCart(await fetchServerCart());
    window.dispatchEvent(new CustomEvent("marel:cart-updated"));
  };

  const saveNewAddress = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNewAddressPending(true);
    const form = new FormData(event.currentTarget);
    const payload = {
      title: form.get("title"),
      name: form.get("name"),
      phone: form.get("phone"),
      city: form.get("city"),
      district: form.get("district"),
      full_address: form.get("fullAddress"),
    };
    const response = await fetch("/api/addresses", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json().catch(() => null)) as { error?: string; id?: number } | null;
    setNewAddressPending(false);
    if (!response.ok) return setMessage(data?.error ?? "Adres kaydedilemedi.");
    setShowNewAddress(false);
    const updated = (await (await fetch("/api/addresses", { cache: "no-store" })).json()) as AddressPayload[];
    setAddresses(updated);
    setSelectedAddressId(data?.id ?? updated[0]?.id ?? null);
    event.currentTarget.reset();
  };

  const submitOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cart?.items.length) return;
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);

    const body: Record<string, unknown> = {
      paymentMethod,
      notes: form.get("notes"),
    };

    if (user && selectedAddressId) {
      body.addressId = selectedAddressId;
    } else {
      const shipping: GuestShipping = {
        name: String(form.get("guestName") ?? "").trim(),
        phone: String(form.get("guestPhone") ?? "").trim(),
        email: String(form.get("guestEmail") ?? user?.email ?? "").trim(),
        city: String(form.get("guestCity") ?? "").trim(),
        district: String(form.get("guestDistrict") ?? "").trim(),
        full_address: String(form.get("guestAddress") ?? "").trim(),
      };
      if (!shipping.name || !shipping.phone || !shipping.email || !shipping.city || !shipping.district || !shipping.full_address) {
        setPending(false);
        return setMessage("Teslimat bilgilerini eksiksiz doldurun.");
      }
      body.shipping = shipping;
    }

    trackCommerceEvent(
      "begin_checkout",
      subtotalKurus / 100,
      cart.items.map((item) => ({
        item_id: item.product?.sku ?? "",
        item_name: item.product?.name ?? "",
        item_brand: "Marel",
        price: item.unit_price,
        quantity: item.quantity,
        google_business_vertical: "retail",
      })),
    );

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = (await response.json().catch(() => null)) as
      | { error?: string; id?: number; order_number?: string; total?: number; status?: string }
      | null;
    setPending(false);
    if (!response.ok || !result?.order_number || result.total === undefined) {
      return setMessage(result?.error ?? "Sipariş oluşturulamadı.");
    }

    const completed = {
      id: result.id ?? 0,
      order_number: result.order_number,
      status: result.status ?? "pending",
      payment_status: "pending",
      payment_method: paymentMethod,
      subtotal: subtotalKurus / 100,
      discount_amount: 0,
      shipping_cost: shipping / 100,
      total: result.total,
      formatted_total: "",
      shipping_address: null,
      notes: null,
      created_at: new Date().toISOString(),
    } as OrderPayload;
    setOrder(completed);
    setCart({ items: [], summary: { item_count: 0, total_quantity: 0, subtotal: 0 } });
    window.dispatchEvent(new CustomEvent("marel:cart-updated", { detail: 0 }));
    trackCommerceEvent(
      "purchase",
      result.total,
      cart.items.map((item) => ({
        item_id: item.product?.sku ?? "",
        item_name: item.product?.name ?? "",
        item_brand: "Marel",
        price: item.unit_price,
        quantity: item.quantity,
        google_business_vertical: "retail",
      })),
      { transaction_id: result.order_number, shipping: shipping / 100 },
    );
    trackAdsConversion(result.total, result.order_number);
  };

  if (order) {
    const totalLabel = formatMoney(kurus(order.total));
    const waUrl = whatsappPaymentUrl(order.order_number, totalLabel, payment);
    return (
      <section className="commerce-success">
        <span>✓</span>
        <h1>Siparişiniz alındı</h1>
        <p>
          Sipariş numaranız <strong>{order.order_number}</strong>. Takip için e-postanız yeterli —{" "}
          <Link href="/siparis-takip">Sipariş Takip</Link>.
        </p>
        <p className="commerce-price">{totalLabel}</p>
        {paymentMethod === "bank_transfer" ? (
          <div className="commerce-iban-box">
            <h2>Havale / EFT</h2>
            <p>
              {payment.bankName} — {payment.accountHolder}
            </p>
            <p>
              <strong>IBAN:</strong> {payment.iban}
            </p>
            <p>{payment.paymentNote}</p>
            <a className="button button-gold" href={waUrl} target="_blank" rel="noreferrer">
              WhatsApp’tan dekont gönder ↗
            </a>
          </div>
        ) : (
          <p>Kapıda ödeme seçildi. Teslimatta nakit/kart ile ödeyebilirsiniz.</p>
        )}
        <Link className="button" href="/siparis-takip">
          Siparişi takip et
        </Link>
      </section>
    );
  }

  return (
    <div className="cart-layout">
      <section className="cart-lines">
        <h1>Sepetim</h1>
        {!cart ? (
          <div className="empty-state">
            <p>Sepet yükleniyor…</p>
          </div>
        ) : !cart.items.length ? (
          <div className="empty-state">
            <p>Sepetiniz henüz boş.</p>
            <Link className="button button-gold" href="/urunler">
              Ürünleri incele
            </Link>
          </div>
        ) : (
          cart.items.map((item) => (
            <article className="cart-line" key={item.id}>
              <div className="cart-line-image">
                <Image
                  unoptimized
                  src={item.product?.cover_image ?? "/images/catalog/diamond.webp"}
                  alt={item.product?.name ?? "Ürün"}
                  fill
                  sizes="120px"
                />
              </div>
              <div>
                <small>{item.product?.sku}</small>
                <h2>{item.product?.name ?? "Ürün"}</h2>
                <strong>{formatMoney(kurus(item.unit_price))}</strong>
                {item.product && !item.product.in_stock ? <em className="cart-out-of-stock">Stok kalmadı</em> : null}
              </div>
              <label>
                Adet
                <input
                  aria-label={`${item.product?.name ?? "Ürün"} adedi`}
                  type="number"
                  min="1"
                  max="20"
                  value={item.quantity}
                  onChange={(event) => updateQuantity(item, Number(event.target.value))}
                />
              </label>
              <button className="cart-line-remove" type="button" aria-label="Sepetten çıkar" onClick={() => removeItem(item)}>
                ✕
              </button>
            </article>
          ))
        )}
      </section>
      <aside className="checkout-card">
        <h2>Sipariş özeti</h2>
        <p>
          <span>Ara toplam</span>
          <strong>{formatMoney(subtotalKurus)}</strong>
        </p>
        <p>
          <span>Kargo</span>
          <strong>{shipping ? formatMoney(shipping) : "Ücretsiz"}</strong>
        </p>
        <p className="checkout-total">
          <span>Toplam</span>
          <strong>{formatMoney(totalKurus)}</strong>
        </p>
        {!cart?.items.length ? (
          <Link className="button button-gold" href="/urunler">
            Ürünleri incele
          </Link>
        ) : (
          <form onSubmit={submitOrder} className="commerce-form">
            {user ? (
              <>
                {addresses.length ? (
                  <fieldset className="checkout-addresses">
                    <legend>Teslimat adresi</legend>
                    {addresses.map((address) => (
                      <label className="checkout-address" key={address.id}>
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === address.id}
                          onChange={() => setSelectedAddressId(address.id)}
                        />
                        <span>
                          <b>{address.title}</b>
                          <small>
                            {address.name} · {address.city} / {address.district}
                          </small>
                          <em>{address.full_address}</em>
                        </span>
                      </label>
                    ))}
                  </fieldset>
                ) : (
                  <p className="checkout-hint">Teslimat için bir adres ekleyin.</p>
                )}
                <button className="checkout-link-button" type="button" onClick={() => setShowNewAddress((value) => !value)}>
                  {showNewAddress ? "Yeni adresi gizle" : "+ Yeni adres ekle"}
                </button>
                {showNewAddress ? (
                  <div className="checkout-new-address">
                    <label>
                      Adres başlığı
                      <input name="title" placeholder="Ev / İş" maxLength={80} />
                    </label>
                    <label>
                      Ad soyad
                      <input name="name" maxLength={150} />
                    </label>
                    <label>
                      Telefon
                      <input name="phone" type="tel" maxLength={20} />
                    </label>
                    <div>
                      <label>
                        İl
                        <input name="city" maxLength={80} />
                      </label>
                      <label>
                        İlçe
                        <input name="district" maxLength={80} />
                      </label>
                    </div>
                    <label>
                      Açık adres
                      <textarea name="fullAddress" rows={3} />
                    </label>
                    <button
                      className="checkout-save-address"
                      type="button"
                      disabled={newAddressPending}
                      onClick={async (event) => {
                        const root = (event.currentTarget as HTMLButtonElement).closest(".checkout-new-address");
                        if (!root) return;
                        const get = (n: string) => (root.querySelector(`[name="${n}"]`) as HTMLInputElement | HTMLTextAreaElement | null)?.value ?? "";
                        setNewAddressPending(true);
                        const response = await fetch("/api/addresses", {
                          method: "POST",
                          headers: { "content-type": "application/json" },
                          body: JSON.stringify({
                            title: get("title"),
                            name: get("name"),
                            phone: get("phone"),
                            city: get("city"),
                            district: get("district"),
                            full_address: get("fullAddress"),
                          }),
                        });
                        const data = (await response.json().catch(() => null)) as { error?: string; id?: number } | null;
                        setNewAddressPending(false);
                        if (!response.ok) return setMessage(data?.error ?? "Adres kaydedilemedi.");
                        setShowNewAddress(false);
                        const updated = (await (await fetch("/api/addresses", { cache: "no-store" })).json()) as AddressPayload[];
                        setAddresses(updated);
                        setSelectedAddressId(data?.id ?? updated[0]?.id ?? null);
                      }}
                    >
                      {newAddressPending ? "Kaydediliyor…" : "Adresi kaydet"}
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <fieldset className="checkout-guest">
                <legend>Misafir teslimat bilgileri</legend>
                <p className="checkout-hint">Hesap oluşturmadan sipariş verebilirsiniz. Takip için e-postanız yeterli.</p>
                <label>
                  Ad soyad
                  <input name="guestName" maxLength={150} required />
                </label>
                <label>
                  E-posta
                  <input name="guestEmail" type="email" maxLength={150} required />
                </label>
                <label>
                  Telefon
                  <input name="guestPhone" type="tel" maxLength={20} required />
                </label>
                <div>
                  <label>
                    İl
                    <input name="guestCity" maxLength={80} required />
                  </label>
                  <label>
                    İlçe
                    <input name="guestDistrict" maxLength={80} required />
                  </label>
                </div>
                <label>
                  Açık adres
                  <textarea name="guestAddress" rows={3} required />
                </label>
              </fieldset>
            )}
            <label>
              Ödeme yöntemi
              <select name="paymentMethod" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                <option value="bank_transfer">Havale / EFT + WhatsApp dekont</option>
                <option value="cash_on_delivery">Kapıda ödeme</option>
              </select>
            </label>
            {paymentMethod === "bank_transfer" ? (
              <div className="checkout-iban-preview">
                <small>
                  {payment.bankName} · IBAN {payment.iban}
                </small>
              </div>
            ) : null}
            <label>
              Sipariş notu
              <textarea name="notes" rows={2} maxLength={500} />
            </label>
            {message ? (
              <p className="form-error" role="alert">
                {message}
              </p>
            ) : null}
            <button type="submit" disabled={pending || (Boolean(user) && !selectedAddressId)}>
              {pending ? "Sipariş oluşturuluyor…" : "Siparişi oluştur"}
            </button>
            <small>
              Ölçülü ürünlerde ölçü onayı sonrası üretim başlar. Ödeme IBAN’a havale ile alınır; dekont WhatsApp’a iletilir. Kart
              (iyzico) kullanılmaz.
            </small>
          </form>
        )}
      </aside>
    </div>
  );
}
