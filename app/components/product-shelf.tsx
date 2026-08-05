"use client";

import Image from "next/image";
import Link from "next/link";

export type StoreProduct = {
  name: string;
  code: string;
  category: string;
  image: string;
  badge?: string;
  feature: string;
  colors: string[];
  href: string;
  price?: string;
  imagePosition?: string;
};

const phone = "905467356602";

export function ProductShelf({ products }: { products: StoreProduct[] }) {
  const askOnWhatsApp = (product: StoreProduct) => {
    const message = `Merhaba, ${product.name} (${product.code}) hakkında bilgi ve ölçüye göre fiyat almak istiyorum.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
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
            <span className="product-code">{product.code}</span>
          </Link>
          <div className="shop-product-copy">
            <small>{product.category}</small>
            <h3><Link href={product.href}>{product.name}</Link></h3>
            <div className="stars" aria-label="Öne çıkan ürün">★★★★★ <i>5.0</i></div>
            <p>{product.feature}</p>
            <div className="product-swatches" aria-label={`${product.colors.length} renk seçeneği`}>
              {product.colors.slice(0, 6).map((color) => <i key={color} title={color} style={{ backgroundColor: color }} />)}
              <span>{product.colors.length} renk</span>
            </div>
            <div className="shop-product-price">
              <strong>{product.price ?? "Ölçüye göre fiyat"}</strong>
              <em>Kişiye özel üretim</em>
            </div>
            <div className="shop-card-actions">
              <Link href={`${product.href}#teklif`}>Ürünü incele</Link>
              <button type="button" onClick={() => askOnWhatsApp(product)}>WhatsApp&apos;tan sor</button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
