"use client";

import Image from "next/image";
import Link from "next/link";

export type StoreProduct = { name: string; category: string; image: string; badge?: string; feature: string; colors: number; href: string };

export function ProductShelf({ products }: { products: StoreProduct[] }) {
  const addToCart = (name: string) => {
    window.dispatchEvent(new CustomEvent("marel:add-to-cart", { detail: { name } }));
  };

  return (
    <div className="product-shelf">
      {products.map((product) => (
        <article className="shop-product-card" key={product.name}>
          <Link className="shop-product-image" href={product.href}>
            <Image unoptimized src={product.image} alt={product.name} fill sizes="(max-width: 700px) 50vw, 25vw" />
            {product.badge ? <b>{product.badge}</b> : null}<span>♡</span>
          </Link>
          <div className="shop-product-copy">
            <small>{product.category}</small>
            <h3><Link href={product.href}>{product.name}</Link></h3>
            <div className="stars" aria-label="Öne çıkan ürün">★★★★★</div>
            <p>{product.feature}</p>
            <div className="shop-product-price"><strong>Ölçüye göre fiyat</strong><em>{product.colors} renk</em></div>
            <div className="shop-card-actions"><Link href={`${product.href}#teklif`}>Teklif al</Link><button type="button" onClick={() => addToCart(product.name)}>Sepete Ekle</button></div>
          </div>
        </article>
      ))}
    </div>
  );
}
