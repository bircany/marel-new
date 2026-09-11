"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { addToServerCart, formatMoney } from "@/app/lib/commerce";
import { trackCommerceEvent } from "@/app/lib/google-ads";

export type StoreProduct = {
  id?: string;
  name: string;
  code: string;
  category: string;
  image: string;
  badge?: string;
  feature: string;
  colors: string[];
  href: string;
  price?: string;
  priceKurus?: number;
  currency?: string;
  imagePosition?: string;
  discount?: number; // yüzde indirim
  rating?: number; // 0-5 puan
  tags?: string[]; // etiket listesi
};

const phone = "905467356602";

export function ProductShelf({ products }: { products: StoreProduct[] }) {
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const [addedProduct, setAddedProduct] = useState<StoreProduct | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const askOnWhatsApp = (product: StoreProduct) => {
    const message = `Merhaba, ${product.name} (${product.code}) hakkında bilgi ve ölçüye göre fiyat almak istiyorum.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  const addToCart = (product: StoreProduct) => {
    if (!product.priceKurus || product.priceKurus <= 0) return askOnWhatsApp(product);
    if (pendingCode) return;
    setPendingCode(product.code);
    setAddedProduct(null);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        await addToServerCart(product.id ?? product.code, 1);
        trackCommerceEvent("add_to_cart", product.priceKurus! / 100, [
          {
            item_id: product.code,
            item_name: product.name,
            item_brand: "Marel",
            item_category: product.category,
            price: product.priceKurus! / 100,
            quantity: 1,
            google_business_vertical: "retail",
          },
        ]);
        setAddedProduct(product);
      } finally {
        setPendingCode(null);
      }
      timerRef.current = setTimeout(() => setAddedProduct(null), 2800);
    }, 450);
  };

  return (
    <div className="product-shelf">
      {products.map((product) => (
        <article className="shop-product-card" key={product.code}>
          <Link className="shop-product-image" href={product.href}>
            <Image
              unoptimized
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 700px) 50vw, 25vw"
              style={{ objectPosition: product.imagePosition ?? "center" }}
            />
            {product.badge ? <b>{product.badge}</b> : null}
            <span className="product-code" style={{ top: "auto", bottom: 8, right: 8, height: "auto", width: "auto" }}>{product.code}</span>
          </Link>
          <div className="shop-product-copy">
            <small>{product.category}</small>
            <h3>
              <Link href={product.href}>{product.name}</Link>
            </h3>
            {product.rating !== undefined && (
              <div className="stars" aria-label={`Rating ${product.rating} out of 5`}>
                {"★".repeat(Math.round(product.rating))}{"☆".repeat(5 - Math.round(product.rating))} <i>{product.rating.toFixed(1)}</i>
              </div>
            )}
            <p>{product.feature}</p>
            {product.colors.length ? (
              <div className="product-swatches" aria-label={`${product.colors.length} renk seçeneği`}>
                {product.colors.slice(0, 6).map((color) => (
                  <i key={color} title={color} style={{ backgroundColor: color }} />
                ))}
                <span>{product.colors.length} renk</span>
              </div>
            ) : null}
            {product.tags && product.tags.length > 0 && (
              <div className="product-tags">
                {product.tags.map((tag) => (
                  <span key={tag} className="tag-badge">{tag}</span>
                ))}
              </div>
            )}
            <div className="shop-product-price">
              <strong>
                {product.priceKurus
                  ? formatMoney(product.priceKurus - (product.discount ? product.priceKurus * product.discount / 100 : 0), product.currency)
                  : product.price ?? "Ölçüye göre fiyat"}
              </strong>
              {product.discount && product.discount > 0 && (
                <span className="discount-badge">%{product.discount} indirim</span>
              )}
              <em>Kişiye özel üretim</em>
            </div>
            <div className="shop-card-actions">
              <button
                className={`card-shelf-btn ${pendingCode === product.code ? "is-loading" : addedProduct?.code === product.code ? "is-success" : ""}`}
                type="button"
                disabled={pendingCode === product.code}
                onClick={() => addToCart(product)}
              >
                {pendingCode === product.code ? (
                  <>
                    <i className="button-spinner" aria-hidden="true" /> Ekleniyor…
                  </>
                ) : addedProduct?.code === product.code ? (
                  <>✓ Sepete eklendi</>
                ) : (
                  <>+ Sepete Ekle</>
                )}
              </button>
            </div>
          </div>
        </article>
      ))}
      {addedProduct ? (
        <div className="cart-success-toast" role="status" aria-live="polite">
          <span aria-hidden="true">✓</span>
          <div>
            <b>Sepete eklendi</b>
            <small>{addedProduct.name}</small>
          </div>
          <Link href="/sepet">Sepete git →</Link>
        </div>
      ) : null}
    </div>
  );
}
