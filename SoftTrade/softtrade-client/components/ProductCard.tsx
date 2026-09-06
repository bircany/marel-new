'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import apiClient from '@/lib/axios';
import type { Product } from '@/types';
import { normalizeMediaUrl } from '@/lib/media';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const [adding, setAdding] = useState(false);
    const [added, setAdded] = useState(false);

    const quickAddDisabled =
        !product.in_stock
        || product.measurement_mode === 'custom'
        || product.stock_mode === 'variant';

    const fallbackCover = (product as Product & { cover_image_url?: string | null }).cover_image_url ?? null;
    const coverUrl = normalizeMediaUrl(product.cover_image?.url ?? fallbackCover);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (adding || quickAddDisabled) return;

        setAdding(true);
        try {
            await apiClient.post('/cart', {
                product_id: product.id,
                quantity: 1,
            });
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
        } catch {
            // optional toast
        } finally {
            setAdding(false);
        }
    };

    return (
        <Link
            href={`/products/${product.slug}`}
            className="group relative flex flex-col rounded-2xl bg-white border border-slate-200
                hover:border-indigo-500/50 transition-all duration-300 overflow-hidden
                hover:shadow-xl hover:shadow-indigo-500/10"
        >
            <div className="relative aspect-square bg-white overflow-hidden">
                {coverUrl ? (
                    <Image
                        src={coverUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                        <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                )}

                {product.is_on_sale && product.discount_percentage && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full z-10">
                        -%{product.discount_percentage}
                    </span>
                )}

                {!product.in_stock && (
                    <div className="absolute inset-0 bg-white flex items-center justify-center backdrop-blur-sm">
                        <span className="text-slate-500 text-sm font-medium">Stokta Yok</span>
                    </div>
                )}
            </div>

            <div className="flex flex-col flex-1 p-4 gap-2">
                {product.brand && (
                    <span className="text-xs text-indigo-500 font-medium truncate">{product.brand.name}</span>
                )}

                <h3 className="text-sm font-medium text-slate-900 line-clamp-2 leading-snug">{product.name}</h3>

                {product.reviews_avg && (
                    <div className="flex items-center gap-1">
                        <span className="text-yellow-500 text-xs">*</span>
                        <span className="text-xs text-slate-500">
                            {Number(product.reviews_avg).toFixed(1)}
                            {product.reviews_count ? ` (${product.reviews_count})` : ''}
                        </span>
                    </div>
                )}

                <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="flex flex-col">
                        <span className="text-base font-bold text-slate-900">{product.formatted_current_price}</span>
                        {product.is_on_sale && product.formatted_price && (
                            <span className="text-xs text-slate-500 line-through">{product.formatted_price}</span>
                        )}
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={adding || quickAddDisabled}
                        aria-label="Sepete ekle"
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0
                            ${added
                                ? 'bg-green-500 text-white'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-slate-300 disabled:text-slate-500'
                            }`}
                    >
                        {adding ? (
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                        ) : added ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </Link>
    );
}