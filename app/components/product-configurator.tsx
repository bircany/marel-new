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
  { id: "beyaz", name: "Beyaz", hex: "#FFFFFF", image: "/images/catalog/diamond.webp" },
  { id: "krem", name: "Krem", hex: "#F5F0E6" },
  { id: "antrasit", name: "Antrasit", hex: "#2B303A" },
  { id: "gri", name: "Gri", hex: "#8A909A" },
  { id: "kahve", name: "Kahverengi", hex: "#5D4037" },
  { id: "kirmizi", name: "Kırmızı", hex: "#C62828" },
  { id: "pembe", name: "Pudra Pembe", hex: "#E8B4B8" },
  { id: "yesil", name: "Açık Yeşil", hex: "#9CCC65" },
];

export const PROFILE_COLORS = [
  { id: "BEYAZ", name: "BEYAZ", color: "#FFFFFF", border: "#D1D5DB" },
  { id: "ANTRASIT", name: "ANTRASİT", color: "#2B303A", border: "#2B303A" },
  { id: "GRI", name: "GRİ", color: "#9CA3AF", border: "#9CA3AF" },
  { id: "KAHVE", name: "KAHVE", color: "#5C3A21", border: "#5C3A21" },
];

export function ProductConfigurator({ product }: { product: CatalogProduct }) {
  // Gallery images
  const galleryImages = useMemo(() => {
    const list: string[] = [];
    if (product.image) list.push(product.image);
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((img) => {
        if (!list.includes(img)) list.push(img);
      });
    }
    if (list.length === 1) {
      // Add standard detail angles
      list.push("/images/real/diamond-beyaz-siyah-ip.jpeg");
      list.push("/images/real/honeycomb-gri-detay.png");
    }
    return list;
  }, [product.image, product.images]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedFabric, setSelectedFabric] = useState(DEFAULT_FABRIC_COLORS[0]);
  const [selectedProfile, setSelectedProfile] = useState(PROFILE_COLORS[0]);
  const [width, setWidth] = useState<number>(80);
  const [height, setHeight] = useState<number>(150);
  const [quantity, setQuantity] = useState<number>(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Upsell switches
  const [upsell1, setUpsell1] = useState(false);
  const [upsell2, setUpsell2] = useState(false);

  // Accordion open states
  const [openAccordion, setOpenAccordion] = useState<string | null>("info");

  const [pending, setPending] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Price calculations
  const basePriceKurus = product.salePrice ?? product.price ?? 59900;
  const areaM2 = Math.max(1.0, (width * height) / 10000);
  let singleItemPriceKurus = Math.round(basePriceKurus * areaM2);

  if (upsell1) singleItemPriceKurus += 9405; // 94.05 TL
  if (upsell2) singleItemPriceKurus += 15942; // 159.42 TL

  const totalPriceKurus = singleItemPriceKurus * quantity;
  const oldPriceKurus = Math.round(singleItemPriceKurus * 2.16); // ~54% discount simulation

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleAddToCart = async () => {
    if (pending) return;
    setPending(true);
    setAddedSuccess(false);

    try {
      await addToServerCart(product.id, quantity);
      trackCommerceEvent("add_to_cart", totalPriceKurus / 100, [
        {
          item_id: product.sku,
          item_name: `${product.name} (${selectedFabric.name} / ${selectedProfile.name} - ${width}x${height}cm)`,
          item_brand: "Marel",
          item_category: product.category,
          price: singleItemPriceKurus / 100,
          quantity,
          google_business_vertical: "retail",
        },
      ]);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 3500);
    } catch {
      alert("Ürün sepete eklenirken bir hata oluştu.");
    } finally {
      setPending(false);
    }
  };

  const activeImage = galleryImages[activeImageIndex] || product.image;

  return (
    <div className="kamatas-pdp-layout">
      {/* LEFT GALLERY WITH VERTICAL THUMBNAIL STRIP */}
      <div className="kamatas-gallery-col">
        {/* Vertical Thumbnails */}
        <div className="kamatas-vertical-thumbs">
          {galleryImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              className={`kamatas-v-thumb ${idx === activeImageIndex ? "active" : ""}`}
              onClick={() => setActiveImageIndex(idx)}
            >
              <Image
                unoptimized
                src={img}
                alt={`${product.name} thumbnail ${idx + 1}`}
                width={70}
                height={90}
                style={{ objectFit: "cover" }}
              />
            </button>
          ))}
        </div>

        {/* Main Stage Image */}
        <div className="kamatas-main-stage">
          <button type="button" className="gallery-nav-btn prev" onClick={prevImage}>
            ‹
          </button>
          <div className="stage-image-wrapper">
            <Image
              unoptimized
              src={activeImage}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 550px"
              style={{ objectFit: "contain" }}
            />
          </div>
          <button type="button" className="gallery-nav-btn next" onClick={nextImage}>
            ›
          </button>
        </div>
      </div>

      {/* RIGHT PRODUCT DETAILS & CONFIGURATOR PANEL */}
      <div className="kamatas-details-col">
        <div className="pdp-header-row">
          <div className="pdp-title-box">
            <span className="pdp-brand-tag">MAREL</span>
            <h1 className="pdp-title">
              {product.name} {selectedFabric.name}, Katlanır Cam/Ev/Ofis Perdesi, İstediğin Ölçüde
            </h1>
            <div className="pdp-rating-row">
              <span className="pdp-stars">★★★★★</span>
              <a href="#yorumlar" className="pdp-review-count">
                87 Yorum
              </a>
            </div>
          </div>
          <button
            type="button"
            className={`pdp-wishlist-btn ${isWishlisted ? "active" : ""}`}
            onClick={() => setIsWishlisted(!isWishlisted)}
            title="Favorilere Ekle"
          >
            {isWishlisted ? "♥" : "♡"}
          </button>
        </div>

        {/* Price Row */}
        <div className="pdp-pricing-box">
          <span className="pdp-discount-badge">%54</span>
          <div className="pdp-prices">
            <span className="pdp-old-price">
              {formatMoney(oldPriceKurus, product.currency)}
            </span>
            <span className="pdp-new-price">
              {formatMoney(singleItemPriceKurus, product.currency)}
            </span>
          </div>
        </div>

        {/* Perde Rengi (Fabric Color) */}
        <div className="pdp-option-section">
          <label className="pdp-option-label">Perde Rengi</label>
          <div className="pdp-swatches-grid">
            {DEFAULT_FABRIC_COLORS.map((fabric) => (
              <button
                key={fabric.id}
                type="button"
                className={`pdp-swatch-box ${selectedFabric.id === fabric.id ? "active" : ""}`}
                onClick={() => setSelectedFabric(fabric)}
                title={fabric.name}
              >
                <span
                  className="pdp-swatch-color"
                  style={{
                    backgroundColor: fabric.hex,
                    border: fabric.hex === "#FFFFFF" ? "1px solid #E5E7EB" : "none",
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Profil Rengi (Profile Color) */}
        <div className="pdp-option-section">
          <label className="pdp-option-label">Profil Rengi *</label>
          <div className="pdp-profiles-row">
            {PROFILE_COLORS.map((prof) => (
              <button
                key={prof.id}
                type="button"
                className={`pdp-profile-card ${selectedProfile.id === prof.id ? "active" : ""}`}
                onClick={() => setSelectedProfile(prof)}
              >
                <div
                  className="pdp-profile-sample"
                  style={{ backgroundColor: prof.color, border: `1px solid ${prof.border}` }}
                />
                <span className="pdp-profile-name">{prof.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Dimensions (En & Boy) */}
        <div className="pdp-dimensions-row">
          <div className="pdp-input-field">
            <label>En (cm)*</label>
            <input
              type="number"
              min="20"
              max="300"
              value={width}
              onChange={(e) => setWidth(Math.max(1, Number(e.target.value)))}
              placeholder="Örn: 80"
            />
          </div>
          <div className="pdp-input-field">
            <label>Boy (cm)*</label>
            <input
              type="number"
              min="20"
              max="300"
              value={height}
              onChange={(e) => setHeight(Math.max(1, Number(e.target.value)))}
              placeholder="Örn: 150"
            />
          </div>
        </div>

        {/* Upsell Accessories (Gider Süzgeci / Tamir Bandı) */}
        <div className="pdp-upsell-container">
          <div className="pdp-upsell-header">Gider Süzgeci ve Ek Aksesuarlar</div>

          <div className="pdp-upsell-row">
            <label className="pdp-switch">
              <input
                type="checkbox"
                checked={upsell1}
                onChange={(e) => setUpsell1(e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
            <div className="pdp-upsell-thumb">
              <Image
                unoptimized
                src="/images/catalog/diamond.webp"
                alt="Gider Koruyucu"
                width={48}
                height={48}
                style={{ objectFit: "cover", borderRadius: 4 }}
              />
            </div>
            <div className="pdp-upsell-text">
              <strong>10 Adet Yapışkanlı Banyo Gider Koruyucu Saç Toplayıcı</strong>
              <div className="pdp-upsell-prices">
                <span className="upsell-old">₺ 99.00</span>
                <span className="upsell-new">₺ 94.05</span>
              </div>
            </div>
          </div>

          <div className="pdp-upsell-row">
            <label className="pdp-switch">
              <input
                type="checkbox"
                checked={upsell2}
                onChange={(e) => setUpsell2(e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
            <div className="pdp-upsell-thumb">
              <Image
                unoptimized
                src="/images/catalog/blackout.webp"
                alt="Sineklik Bandı"
                width={48}
                height={48}
                style={{ objectFit: "cover", borderRadius: 4 }}
              />
            </div>
            <div className="pdp-upsell-text">
              <strong>Yapışkanlı Sineklik Yaması Tülü Tamir Bandı 50mm x 2m</strong>
              <div className="pdp-upsell-prices">
                <span className="upsell-old">₺ 208.43</span>
                <span className="upsell-new">₺ 159.42</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quantity and Sepete Ekle Button */}
        <div className="pdp-cart-actions">
          <div className="pdp-qty-stepper">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              −
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            />
            <button type="button" onClick={() => setQuantity((q) => q + 1)}>
              +
            </button>
          </div>
          <button
            type="button"
            className="kamatas-primary-btn"
            onClick={handleAddToCart}
            disabled={pending}
          >
            {pending ? "Ekleniyor..." : addedSuccess ? "Sepete Eklendi ✓" : "Sepete Ekle"}
          </button>
        </div>

        {/* Collapsible Accordions */}
        <div className="pdp-accordion-group">
          <div className="pdp-accordion-panel">
            <button
              type="button"
              className="pdp-accordion-trigger"
              onClick={() => setOpenAccordion(openAccordion === "info" ? null : "info")}
            >
              <span>Ürün Bilgileri</span>
              <span>{openAccordion === "info" ? "˄" : "˅"}</span>
            </button>
            {openAccordion === "info" && (
              <div className="pdp-accordion-content">
                <p>
                  Marel Plise Perde sistemleri, yüksek kaliteli polyester kumaş ve elektrostatik toz
                  boyalı alüminyum profiller kullanılarak üretilmektedir. Özel katlanır petek dokusu
                  sayesinde ısı ve ışık kontrolü sağlar, toz ve leke tutmaz.
                </p>
                <ul>
                  <li>%100 Yerli ve birinci sınıf malzeme kalitesi</li>
                  <li>Milimetrik özel üretim imkanı</li>
                  <li>Kolay silinebilir, suya ve neme dayanıklı kumaş</li>
                </ul>
              </div>
            )}
          </div>

          <div className="pdp-accordion-panel">
            <button
              type="button"
              className="pdp-accordion-trigger"
              onClick={() => setOpenAccordion(openAccordion === "balkon" ? null : "balkon")}
            >
              <span>Cam Balkonlarda Ölçü Nasıl Alınır?</span>
              <span>{openAccordion === "balkon" ? "˄" : "˅"}</span>
            </button>
            {openAccordion === "balkon" && (
              <div className="pdp-accordion-content">
                <p>
                  Cam balkon kanatlarının her biri için fitilden fitile cam genişliğini (En) ve üst
                  alüminyum profilden alt alüminyum profile kadar olan yüksekliği (Boy) ölçün.
                  Herhangi bir pay düşmenize gerek yoktur.
                </p>
              </div>
            )}
          </div>

          <div className="pdp-accordion-panel">
            <button
              type="button"
              className="pdp-accordion-trigger"
              onClick={() => setOpenAccordion(openAccordion === "pvc" ? null : "pvc")}
            >
              <span>Alüminyum ve PVC Doğramalarda Ölçü Nasıl Alınır?</span>
              <span>{openAccordion === "pvc" ? "˄" : "˅"}</span>
            </button>
            {openAccordion === "pvc" && (
              <div className="pdp-accordion-content">
                <p>
                  Pencere veya kapı kanadını açtığınızda contalar arasındaki cam boşluğunu ölçün.
                  Vidalı montaj tercih ediyorsanız çıta ölçülerini baz alabilirsiniz.
                </p>
              </div>
            )}
          </div>

          <div className="pdp-accordion-panel">
            <button
              type="button"
              className="pdp-accordion-trigger"
              onClick={() => setOpenAccordion(openAccordion === "montaj" ? null : "montaj")}
            >
              <span>Kolay Montaj & Teslimat</span>
              <span>{openAccordion === "montaj" ? "˄" : "˅"}</span>
            </button>
            {openAccordion === "montaj" && (
              <div className="pdp-accordion-content">
                <p>
                  Ürünlerimiz montaja hazır, ipleri gergin ve ayarlı olarak gönderilir. Paket
                  içerisinden çıkan montaj klipslerini pencerenin köşelerine vidalayarak veya
                  yapıştırarak perdeyi 5 dakikada kolayca takabilirsiniz.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
