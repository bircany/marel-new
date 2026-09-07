"use client";

import React, { useState } from "react";
import { formatMoney } from "@/app/lib/commerce";

interface TrackingResult {
  order: {
    id: string | number;
    order_number: string;
    status: string;
    total: number;
    customer_name?: string;
    created_at?: string;
    shipping_address?: any;
    items?: Array<{ product_name?: string; quantity: number; unit_price: number }>;
  };
  cargo: {
    company: string;
    tracking_number: string | null;
    tracking_url: string | null;
    live_status?: string | null;
  };
}

const statusLabels: Record<string, string> = {
  pending: "Sipariş Alındı",
  awaiting_measurement: "Ölçü Onayı Bekleniyor",
  measure_ok: "Ölçü Onaylandı",
  confirmed: "Onaylandı",
  processing: "Üretimde",
  production: "Üretimde",
  shipped: "Kargoya Verildi (Yurtiçi Kargo)",
  delivered: "Teslim Edildi",
  cancelled: "İptal Edildi",
  refunded: "İade Edildi",
};

export function KamatasOrderTracker() {
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TrackingResult | null>(null);

  // Quick Yurtiçi Kargo Tracking state
  const [yurticiCode, setYurticiCode] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);

    const cleanEmail = email.trim();
    let cleanOrderNo = orderNumber.trim();
    if (cleanOrderNo.startsWith("#")) {
      cleanOrderNo = cleanOrderNo.substring(1);
    }

    if (!cleanEmail || !cleanOrderNo) {
      setError("Lütfen e-posta adresinizi ve sipariş numaranızı eksiksiz giriniz.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          orderNumber: cleanOrderNo,
        }),
      });

      const data = (await res.json()) as { error?: string; [key: string]: any };

      if (!res.ok || data.error) {
        setError(data.error || "Girdiğiniz bilgilere ait bir sipariş bulunamadı. Lütfen e-posta ve sipariş numaranızı kontrol ediniz.");
      } else {
        setResult(data as any);
      }
    } catch {
      setError("Bağlantı hatası oluştu. Lütfen tekrar deneyiniz.");
    } finally {
      setLoading(false);
    }
  };

  const handleYurticiDirect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!yurticiCode.trim()) return;
    const url = `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${encodeURIComponent(yurticiCode.trim())}`;
    window.open(url, "_blank");
  };

  return (
    <div className="kamatas-tracking-container shop-container">
      <h1 className="kamatas-tracking-title">Takip</h1>

      {/* Main Kamataş Style Form */}
      <form onSubmit={handleTrack} className="kamatas-tracking-form">
        <div className="tracking-inputs-row">
          <div className="tracking-input-col">
            <label>E-posta</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@mail.com"
            />
          </div>
          <div className="tracking-input-col">
            <label>Sipariş No (xxxx)</label>
            <input
              type="text"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="Örn: ORD-20260905-00001 veya 1001"
            />
          </div>
        </div>

        {error && <div className="tracking-error-box">{error}</div>}

        <button type="submit" disabled={loading} className="kamatas-track-submit-btn">
          {loading ? "Kontrol Ediliyor..." : "Kontrol Et"}
        </button>
      </form>

      {/* Order Lookup Result Box */}
      {result && (
        <div className="tracking-result-box">
          <div className="result-header">
            <div>
              <span className="result-order-label">Sipariş No:</span>
              <strong className="result-order-num">{result.order.order_number}</strong>
            </div>
            <span className={`result-status-badge status-${result.order.status}`}>
              {statusLabels[result.order.status] || result.order.status}
            </span>
          </div>

          <div className="result-body">
            <div className="result-info-grid">
              <div>
                <small>Müşteri</small>
                <strong>{result.order.customer_name || email}</strong>
              </div>
              <div>
                <small>Toplam Tutar</small>
                <strong>
                  {(result.order as any).formatted_total ||
                    formatMoney(
                      result.order.total > 10000
                        ? result.order.total
                        : Math.round((result.order.total + Number.EPSILON) * 100)
                    )}
                </strong>
              </div>
              <div>
                <small>Kargo Firması</small>
                <strong>Yurtiçi Kargo</strong>
              </div>
              <div>
                <small>Kargo Takip No</small>
                <strong>{result.cargo.tracking_number || "Hazırlanıyor"}</strong>
              </div>
            </div>

            {/* Direct Yurtiçi Kargo Live Tracking Button */}
            {result.cargo.tracking_number ? (
              <div className="yurtici-live-track-banner">
                <div className="yurtici-logo-text">
                  <span className="yurtici-brand">YURTİÇİ KARGO</span>
                  <span>Takip No: <b>{result.cargo.tracking_number}</b></span>
                </div>
                <a
                  href={`https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${encodeURIComponent(result.cargo.tracking_number)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="yurtici-direct-btn"
                >
                  Yurtiçi Kargo Canlı Takip ↗
                </a>
              </div>
            ) : (
              <div className="yurtici-pending-notice">
                📦 Siparişiniz üretim aşamasında. Kargoya verildiğinde Yurtiçi Kargo takip kodunuz SMS ve e-posta ile iletilecektir.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Yurtiçi Kargo Hızlı Takip Kutusu */}
      <div className="yurtici-quick-box">
        <div className="yurtici-quick-header">
          <h3>Yurtiçi Kargo Takip Kodu ile Doğrudan Sorgulama</h3>
          <p>SMS veya e-posta ile tarafınıza ulaşan 12 haneli Yurtiçi Kargo gönderi kodunuzu buradan doğrudan sorgulayabilirsiniz.</p>
        </div>
        <form onSubmit={handleYurticiDirect} className="yurtici-quick-form">
          <input
            type="text"
            placeholder="Yurtiçi Kargo Takip Kodu (Örn: 123456789012)"
            value={yurticiCode}
            onChange={(e) => setYurticiCode(e.target.value)}
          />
          <button type="submit" className="yurtici-quick-btn">
            Kargo Sorgula ↗
          </button>
        </form>
      </div>

      {/* Information Blocks from Screenshot */}
      <div className="kamatas-tracking-info-sections">
        <section className="info-block">
          <h3>Sipariş Takibi İçin:</h3>
          <p>
            Sipariş oluştururken kullandığınız e-postanızı yazınız. Takip no kutucuğunda yazan #0000
            Sipariş Numaranızı yazınız ve kontrol et tuşuna basınız.
          </p>
        </section>

        <section className="info-block">
          <h3>Ürününüzü Teslim Alırken</h3>
          <p>
            Kargo tutanağını imzalamadan önce ürününüzün kutusunda herhangi bir hasar ya da sorun olup
            olmadığını kontrol ediniz. Herhangi bir nedenle hasar veya eksiklik, kolinin bandında
            açılma var ise teslimatla ilgili hiçbir belgeyi imzalamadan kargo görevlisine tutanak
            tutulması talebiyle birlikte kutunuzu iade ediniz. Bu yükümlülüğünüzü yerine getirdiğiniz
            taktirde, yeni ürünleriniz derhal tarafınıza gönderilecektir. Kutusu hasarlı olan, içeriği
            eksik olduğu iddia edilen ürünlerin teslim alınması durumunda içindeki ürünlerin hasarından
            veya eksikliğinden sorumluluğumuz bulunmamaktadır. Bu durumu en kısa zamanda çağrı
            merkezimize bildiriniz.
          </p>
        </section>

        <section className="info-block">
          <h3>Müşteri Hizmetlerimiz</h3>
          <p>
            Siparişlerinizle ilgili tüm sorularınız ve ürünlerle ilgili bilgi almak için Türkiye'nin
            her yerinden <strong>+90 (546) 735 66 02</strong> numaralı telefonumuzdan çağrı
            merkezimize ulaşabilirsiniz.
          </p>
        </section>
      </div>
    </div>
  );
}
