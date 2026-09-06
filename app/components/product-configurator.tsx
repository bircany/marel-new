"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import { addToServerCart, formatMoney } from "@/app/lib/commerce";
import { trackCommerceEvent } from "@/app/lib/google-ads";
import type { CatalogProduct } from "@/db";

export type ColorOption = {
  id: string;
  name: string;
  hex: string;
  image?: string;
};

export const DEFAULT_FABRIC_COLORS: ColorOption[] = [
  { id: "beyaz", name: "Kar Beyaz (001)", hex: "#F9FAFB", image: "/images/real/diamond-beyaz.jpeg" },
  { id: "krem", name: "Fildişi Krem (108)", hex: "#F3EFE6", image: "/images/real/diamond-krem.jpeg" },
  { id: "acik-gri", name: "Açık Gri (109)", hex: "#D1D5DB", image: "/images/real/diamond-acik-gri.jpeg" },
  { id: "gri", name: "Duman Gri (102)", hex: "#6B7280", image: "/images/real/diamond-gri.jpeg" },
  { id: "antrasit", name: "Antrasit (110)", hex: "#374151", image: "/images/real/honeycomb-gri-detay.png" },
  { id: "siyah", name: "Gece Siyahı (05)", hex: "#111827", image: "/images/catalog/blackout.webp" },
  { id: "bej", name: "Doğal Bej (112)", hex: "#E4D5B7", image: "/images/catalog/diamond.webp" },
  { id: "bronz", name: "Metalik Bronz (702)", hex: "#7C5835", image: "/images/catalog/silver.webp" },
];

export const PROFILE_COLORS = [
  { id: "beyaz", name: "Mat Beyaz", hex: "#FFFFFF" },
  { id: "eloksal", name: "Eloksal Gri (Alüminyum)", hex: "#9CA3AF" },
  { id: "antrasit", name: "Antrasit Gri (RAL 7016)", hex: "#374151" },
  { id: "siyah", name: "Mat Siyah (RAL 9005)", hex: "#111827" },
  { id: "kahve", name: "Koyu Kahve (RAL 8019)", hex: "#451A03" },
];

export function ProductConfigurator({ product }: { product: CatalogProduct }) {
  const productColors: ColorOption[] = useMemo(() => {
    try {
      if (product.colors) {
        const parsed = JSON.parse(product.colors);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_FABRIC_COLORS;
  }, [product.colors]);

  const [selectedColor, setSelectedColor] = useState<ColorOption>(productColors[0]);
  const [selectedProfile, setSelectedProfile] = useState(PROFILE_COLORS[0]);
  const [mountType, setMountType] = useState<"screw" | "adhesive">("screw");
  const [width, setWidth] = useState<number>(80);
  const [height, setHeight] = useState<number>(150);
  const [quantity, setQuantity] = useState<number>(1);
  const [pending, setPending] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Price Calculation: Base price per m² (minimum 1.0 m² per unit)
  const areaM2 = Math.max(1.0, (width * height) / 10000);
  const baseUnitPriceKurus = product.salePrice ?? product.price;
  const calculatedUnitPriceKurus = Math.round(baseUnitPriceKurus * areaM2);
  const totalPriceKurus = calculatedUnitPriceKurus * quantity;

  // Active Display Image
  const activeImage = selectedColor.image || product.image || "/images/catalog/diamond.webp";

  const handleAddToCart = async () => {
    if (pending) return;
    setPending(true);
    setAddedSuccess(false);

    try {
      await addToServerCart(product.id, quantity);
      trackCommerceEvent("add_to_cart", totalPriceKurus / 100, [
        {
          item_id: product.sku,
          item_name: `${product.name} (${selectedColor.name} - ${width}x${height}cm)`,
          item_brand: product.brand,
          item_category: product.category,
          price: calculatedUnitPriceKurus / 100,
          quantity,
          google_business_vertical: "retail",
        },
      ]);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 3500);
    } catch {
      alert("Ürün sepete eklenirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="product-configurator-container">
      {/* Left: Gallery & Zoom Preview */}
      <div className="product-config-gallery">
        <div className="config-main-image-wrap">
          <Image
            unoptimized
            src={activeImage}
            alt={`${product.name} - ${selectedColor.name}`}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 50vw"
            className="config-main-image"
          />
          {product.featured ? <span className="config-featured-badge">Öne Çıkan Seri</span> : null}
          <span className="config-zoom-hint">🔍 Ölçüye Özel İmalat</span>
        </div>

        {/* Thumbnail Color Switcher */}
        <div className="config-thumbs-strip">
          {productColors.slice(0, 5).map((color) => (
            <button
              key={color.id}
              type="button"
              className={`config-thumb-btn ${selectedColor.id === color.id ? "active" : ""}`}
              onClick={() => setSelectedColor(color)}
              title={color.name}
            >
              <Image
                unoptimized
                src={color.image || product.image}
                alt={color.name}
                fill
                sizes="64px"
              />
            </button>
          ))}
        </div>

        <div className="config-guarantees-grid">
          <div className="guarantee-item">
            <span className="g-icon">🛡️</span>
            <div>
              <strong>2 Yıl Garanti</strong>
              <small>Mekanizma & kumaş garantisi</small>
            </div>
          </div>
          <div className="guarantee-item">
            <span className="g-icon">✂️</span>
            <div>
              <strong>Milimetrik Kesim</strong>
              <small>Ölçünüze özel sıfır hata</small>
            </div>
          </div>
          <div className="guarantee-item">
            <span className="g-icon">🚚</span>
            <div>
              <strong>Ücretsiz Kargo</strong>
              <small>1.000₺ üzeri siparişlerde</small>
            </div>
          </div>
          <div className="guarantee-item">
            <span className="g-icon">💳</span>
            <div>
              <strong>3 Taksit İmkanı</strong>
              <small>Peşin fiyatına vade farksız</small>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Customization Form & Buy Box */}
      <div className="product-config-form-wrap">
        <div className="config-header-meta">
          <div className="config-breadcrumbs">
            <Link href="/">Ana Sayfa</Link>
            <span>/</span>
            <Link href="/urunler">Ürünler</Link>
            <span>/</span>
            <span>{product.category}</span>
          </div>

          <div className="config-brand-sku-row">
            <span className="config-brand-tag">{product.brand}</span>
            <span className="config-sku-tag">SKU: {product.sku}</span>
            <span className={`config-stock-badge ${product.stock > 0 ? "in-stock" : "out-of-stock"}`}>
              {product.stock > 0 ? `✓ Stokta (${product.stock} Adet)` : "✕ Tükendi"}
            </span>
          </div>

          <h1 className="config-product-title">{product.name}</h1>

          <div className="config-ratings-row">
            <div className="stars-gold">★★★★★</div>
            <strong>5.0</strong>
            <span className="review-count">· Marel Onaylı Kalite</span>
          </div>

          <p className="config-description">{product.description}</p>
        </div>

        {/* 1. KUMAŞ RENK SEÇİMİ (COLOR SWATCHES) */}
        <div className="config-option-section">
          <div className="config-option-title">
            <span>1. Kumaş Rengi Seçin:</span>
            <strong>{selectedColor.name}</strong>
          </div>
          <div className="config-color-swatches">
            {productColors.map((color) => (
              <button
                key={color.id}
                type="button"
                className={`config-swatch-circle ${selectedColor.id === color.id ? "active" : ""}`}
                onClick={() => setSelectedColor(color)}
                title={color.name}
                style={{ backgroundColor: color.hex }}
              >
                {selectedColor.id === color.id ? <span className="swatch-check">✓</span> : null}
              </button>
            ))}
          </div>
        </div>

        {/* 2. PROFİL / KASA RENGİ SEÇİMİ */}
        <div className="config-option-section">
          <div className="config-option-title">
            <span>2. Kasa / Profil Rengi:</span>
            <strong>{selectedProfile.name}</strong>
          </div>
          <div className="config-profile-options">
            {PROFILE_COLORS.map((profile) => (
              <button
                key={profile.id}
                type="button"
                className={`config-profile-pill ${selectedProfile.id === profile.id ? "active" : ""}`}
                onClick={() => setSelectedProfile(profile)}
              >
                <span className="profile-color-dot" style={{ backgroundColor: profile.hex }} />
                <span>{profile.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. ÖLÇÜ GİRİŞİ (EN VE BOY CM) */}
        <div className="config-option-section">
          <div className="config-option-title">
            <span>3. Ölçü Bilgilerinizi Girin (cm):</span>
            <small className="config-area-note">Hesaplanan Alan: {areaM2.toFixed(2)} m²</small>
          </div>

          <div className="config-dimensions-grid">
            <div className="dimension-input-group">
              <label htmlFor="dim-width">En (Genişlik / cm)</label>
              <div className="dim-input-wrapper">
                <input
                  id="dim-width"
                  type="number"
                  min="30"
                  max="280"
                  value={width}
                  onChange={(e) => setWidth(Math.max(30, Number(e.target.value) || 30))}
                />
                <span className="dim-unit">cm</span>
              </div>
              <small>Min: 30cm - Max: 280cm</small>
            </div>

            <div className="dimension-input-group">
              <label htmlFor="dim-height">Boy (Yükseklik / cm)</label>
              <div className="dim-input-wrapper">
                <input
                  id="dim-height"
                  type="number"
                  min="40"
                  max="300"
                  value={height}
                  onChange={(e) => setHeight(Math.max(40, Number(e.target.value) || 40))}
                />
                <span className="dim-unit">cm</span>
              </div>
              <small>Min: 40cm - Max: 300cm</small>
            </div>
          </div>
        </div>

        {/* 4. MONTAJ TİPİ SEÇİMİ */}
        <div className="config-option-section">
          <div className="config-option-title">
            <span>4. Montaj Tercihi:</span>
          </div>
          <div className="config-mount-grid">
            <button
              type="button"
              className={`config-mount-card ${mountType === "screw" ? "active" : ""}`}
              onClick={() => setMountType("screw")}
            >
              <div className="mount-card-title">
                <strong>🔩 Vidalı Montaj</strong>
                <span className="mount-pill">Standart</span>
              </div>
              <p>Cam balkon kanadına veya pencere kasasına vidalanarak en sağlam tutuşu sağlar.</p>
            </button>

            <button
              type="button"
              className={`config-mount-card ${mountType === "adhesive" ? "active" : ""}`}
              onClick={() => setMountType("adhesive")}
            >
              <div className="mount-card-title">
                <strong>🧲 Yapıştırmalı (Vidasız)</strong>
                <span className="mount-pill green">Delmesiz</span>
              </div>
              <p>Çift taraflı yüksek mukavemetli özel bant ile delmeden kolay montaj yapılır.</p>
            </button>
          </div>
        </div>

        {/* 5. FİYAT VE SEPETE EKLEME ALANI */}
        <div className="config-purchase-box">
          <div className="config-price-display">
            <div>
              <span className="price-label">Toplam Tutar:</span>
              <div className="price-values">
                <strong className="current-price">{formatMoney(totalPriceKurus, product.currency)}</strong>
                {product.salePrice && product.salePrice < product.price ? (
                  <span className="original-price">
                    {formatMoney(Math.round(product.price * areaM2 * quantity), product.currency)}
                  </span>
                ) : null}
              </div>
              <small className="price-tax-note">KDV Dahil · Havalede Ek %10 İndirim</small>
            </div>

            <div className="config-quantity-picker">
              <label>Adet</label>
              <div className="quantity-controls">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span>{quantity}</span>
                <button type="button" onClick={() => setQuantity((q) => Math.min(50, q + 1))}>
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="config-action-buttons">
            <button
              type="button"
              className={`config-btn-cart ${addedSuccess ? "is-success" : ""}`}
              disabled={pending || product.stock <= 0}
              onClick={handleAddToCart}
            >
              {pending ? (
                <span>Sepete Ekleniyor…</span>
              ) : addedSuccess ? (
                <span>✓ Sepete Eklendi</span>
              ) : (
                <span>+ Sepete Ekle</span>
              )}
            </button>

            <Link href="/sepet" className="config-btn-checkout">
              Sepete Git & Sipariş Ver →
            </Link>
          </div>

          {addedSuccess ? (
            <div className="config-added-toast" role="alert">
              <span>✓ Ürün ölçü ve renk tercihlerinizle sepete eklendi!</span>
              <Link href="/sepet">Sepeti İncele →</Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
