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

  const optionsObj = useMemo(() => {
    try {
      return typeof product.options === "string" ? JSON.parse(product.options) : product.options || {};
    } catch {
      return {};
    }
  }, [product.options]);

  const fabricColors = Array.isArray(optionsObj.fabricColors) && optionsObj.fabricColors.length ? optionsObj.fabricColors : DEFAULT_FABRIC_COLORS;
  const profileColors = Array.isArray(optionsObj.profileColors) && optionsObj.profileColors.length ? optionsObj.profileColors : PROFILE_COLORS;
  const accessories = Array.isArray(optionsObj.accessories) ? optionsObj.accessories : [];
  const tabs = Array.isArray(optionsObj.tabs) ? optionsObj.tabs : [];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedFabric, setSelectedFabric] = useState(fabricColors[0] || DEFAULT_FABRIC_COLORS[0]);
  const [selectedProfile, setSelectedProfile] = useState(profileColors[0] || PROFILE_COLORS[0]);
  const [width, setWidth] = useState<number>(80);
  const [height, setHeight] = useState<number>(150);
  const [quantity, setQuantity] = useState<number>(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Upsell switch tracking (using accessory IDs as keys)
  const [selectedAccessories, setSelectedAccessories] = useState<Record<string, boolean>>({});

  // Accordion open states
  const [openAccordion, setOpenAccordion] = useState<string | null>(tabs.length > 0 ? tabs[0].id : "info");

  const [pending, setPending] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Price calculations
  const basePriceKurus = product.salePrice ?? product.price ?? 59900;
  const areaM2 = Math.max(1.0, (width * height) / 10000);
  let singleItemPriceKurus = Math.round(basePriceKurus * areaM2);

  accessories.forEach((acc: any) => {
    if (selectedAccessories[acc.id]) {
      singleItemPriceKurus += acc.priceKurus || 0;
    }
  });

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

  const activeImage = selectedFabric?.image || galleryImages[activeImageIndex] || product.image;

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
            {fabricColors.map((fabric: any) => (
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
                    backgroundColor: fabric.hex || fabric.color || "#000",
                    border: (fabric.hex || fabric.color) === "#FFFFFF" ? "1px solid #E5E7EB" : "none",
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
            {profileColors.map((prof: any) => (
              <button
                key={prof.id}
                type="button"
                className={`pdp-profile-card ${selectedProfile.id === prof.id ? "active" : ""}`}
                onClick={() => setSelectedProfile(prof)}
              >
                <div
                  className="pdp-profile-sample"
                  style={{ backgroundColor: prof.color || prof.hex || "#000", border: `1px solid ${prof.border || "#E5E7EB"}` }}
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

        {accessories.length > 0 && (
          <div className="pdp-upsell-container">
            <div className="pdp-upsell-header">Gider Süzgeci ve Ek Aksesuarlar</div>
            
            {accessories.map((acc: any) => (
              <div key={acc.id} className="pdp-upsell-row">
                <label className="pdp-switch">
                  <input
                    type="checkbox"
                    checked={!!selectedAccessories[acc.id]}
                    onChange={(e) => setSelectedAccessories(prev => ({...prev, [acc.id]: e.target.checked}))}
                  />
                  <span className="slider round"></span>
                </label>
                <div className="pdp-upsell-thumb">
                  {acc.image && (
                    <Image
                      unoptimized
                      src={acc.image}
                      alt={acc.name}
                      width={48}
                      height={48}
                      style={{ objectFit: "cover", borderRadius: 4 }}
                    />
                  )}
                </div>
                <div className="pdp-upsell-text">
                  <strong>{acc.name}</strong>
                  <div className="pdp-upsell-prices">
                    {acc.oldPriceKurus > 0 && (
                      <span className="upsell-old">₺ {(acc.oldPriceKurus / 100).toFixed(2)}</span>
                    )}
                    <span className="upsell-new">₺ {(acc.priceKurus / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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

        {tabs.length > 0 && (
          <div className="pdp-accordion-group">
            {tabs.map((tab: any) => (
              <div key={tab.id} className="pdp-accordion-panel">
                <button
                  type="button"
                  className="pdp-accordion-trigger"
                  onClick={() => setOpenAccordion(openAccordion === tab.id ? null : tab.id)}
                >
                  <span>{tab.title}</span>
                  <span>{openAccordion === tab.id ? "˄" : "˅"}</span>
                </button>
                {openAccordion === tab.id && (
                  <div className="pdp-accordion-content" dangerouslySetInnerHTML={{ __html: tab.content }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
