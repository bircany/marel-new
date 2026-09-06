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
      <div className="product-config-gallery">
        <div className="config-main-image-wrap">
          <Image
            unoptimized
            src={activeImage}
            alt={`${product.name} - ${selectedColor.name}`}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 50vw"
            style={{ objectFit: "cover" }}
          />
        </div>
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
                style={{ objectFit: "cover" }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="kamatas-right-panel">
        <div>
          <span className="kamatas-brand">{product.brand}</span>
          <h1 className="kamatas-product-title">{product.name} {selectedColor.name}</h1>
          <div className="kamatas-stars">
            ★★★★★ <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>(78 Yorum)</span>
          </div>
        </div>

        <div className="kamatas-price-box">
          <span className="kamatas-badge">%32</span>
          {product.salePrice ? (
            <>
              <span className="kamatas-old-price">{formatMoney(product.price, product.currency)}</span>
              <span className="kamatas-new-price">{formatMoney(product.salePrice, product.currency)}</span>
            </>
          ) : (
            <span className="kamatas-new-price">{formatMoney(product.price, product.currency)}</span>
          )}
        </div>

        <div>
          <div style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "8px" }}>Renk</div>
          <div className="config-thumbs-strip" style={{ marginTop: 0 }}>
            {productColors.map((color) => (
              <button
                key={color.id}
                type="button"
                className={`config-thumb-btn ${selectedColor.id === color.id ? "active" : ""}`}
                onClick={() => setSelectedColor(color)}
                title={color.name}
                style={{ width: "40px", height: "40px" }}
              >
                <Image
                  unoptimized
                  src={color.image || product.image}
                  alt={color.name}
                  fill
                  sizes="40px"
                  style={{ objectFit: "cover" }}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="kamatas-input-group">
          <label>En (CM)*</label>
          <input type="number" min="20" max="250" value={width} onChange={(e) => setWidth(Number(e.target.value))} />
        </div>
        
        <div className="kamatas-input-group">
          <label>Boy (CM)*</label>
          <input type="number" min="20" max="300" value={height} onChange={(e) => setHeight(Number(e.target.value))} />
        </div>

        <div className="kamatas-input-group">
          <label>Ölçülerinizi Görseldeki gibi mi aldınız? *</label>
          <select>
            <option>Evet, görseldeki gibi aldım.</option>
            <option>Hayır, farklı aldım.</option>
          </select>
        </div>

        <div className="kamatas-upsell-box">
          <div className="kamatas-upsell-title">Montajınızı Kolaylaştırmak için</div>
          <div className="kamatas-upsell-item">
            <input type="checkbox" style={{ width: "18px", height: "18px" }} />
            <div className="kamatas-upsell-info">
              Sineklik Fitil Takma Aparatı<br/>
              <span style={{ textDecoration: "line-through", color: "var(--muted)", fontSize: "0.75rem" }}>₺267.39</span> <span className="kamatas-upsell-price">₺158.38</span>
            </div>
          </div>
          <div className="kamatas-upsell-item">
            <input type="checkbox" style={{ width: "18px", height: "18px" }} />
            <div className="kamatas-upsell-info">
              Yapışkanlı Sineklik Yaması Tülü Tamir Bandı 50mm x 2m<br/>
              <span style={{ textDecoration: "line-through", color: "var(--muted)", fontSize: "0.75rem" }}>₺268.43</span> <span className="kamatas-upsell-price">₺158.43</span>
            </div>
          </div>
        </div>

        <div className="kamatas-add-cart-row">
          <div className="kamatas-qty">
            <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
            <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
            <button type="button" onClick={() => setQuantity(quantity + 1)}>+</button>
          </div>
          <button type="button" className="kamatas-btn" onClick={handleAddToCart} disabled={pending}>
            {pending ? "Ekleniyor..." : addedSuccess ? "Eklendi!" : "Sepete Ekle"}
          </button>
        </div>

        <div className="kamatas-accordion">
          <div className="kamatas-accordion-item">
            <div className="kamatas-accordion-title"><span>Ürün Bilgileri</span> <span>⌄</span></div>
          </div>
          <div className="kamatas-accordion-item">
            <div className="kamatas-accordion-title"><span>Ölçü Nasıl Alınır?</span> <span>⌄</span></div>
          </div>
          <div className="kamatas-accordion-item">
            <div className="kamatas-accordion-title"><span>Kullanım Alanları ve Avantajları</span> <span>⌄</span></div>
          </div>
          <div className="kamatas-accordion-item">
            <div className="kamatas-accordion-title"><span>Montaj ve Kurulum</span> <span>⌄</span></div>
          </div>
          <div className="kamatas-accordion-item">
            <div className="kamatas-accordion-title"><span>Teslimat ve İade</span> <span>⌄</span></div>
          </div>
        </div>

        <div className="kamatas-features">
          <div>
            <div>🚚</div>
            <div>1000₺ ÜZERİ<br/>ÜCRETSİZ KARGO</div>
          </div>
          <div>
            <div>🛡️</div>
            <div>Kolay Montaj</div>
          </div>
          <div>
            <div>↩️</div>
            <div>15 gün içerisinde<br/>iade hakkı</div>
          </div>
        </div>
      </div>
    </div>
  );
}
