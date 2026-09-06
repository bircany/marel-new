'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/auth';

export default function CartPage() {
    const { items, summary, coupon, loading, error, fetchCart,
        updateQuantity, removeItem, clearCart,
        applyCoupon, removeCoupon, clearError } = useCartStore();
    const user = useAuthStore((s) => s.user);

    const [couponCode, setCouponCode] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);

    useEffect(() => { fetchCart(); }, [fetchCart]);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        clearError();
        await applyCoupon(couponCode.trim().toUpperCase());
        setCouponLoading(false);
    };

    const finalTotal = coupon
        ? coupon.new_total
        : summary.subtotal;

    return (
        <main className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Başlık */}
                <h1 className="text-2xl font-bold text-slate-900 mb-8">
                    Sepetim
                    {summary.item_count > 0 && (
                        <span className="text-slate-500 text-lg font-normal ml-2">
                            ({summary.total_quantity} ürün)
                        </span>
                    )}
                </h1>

                {items.length === 0 && !loading ? (
                    /* Boş sepet */
                    <div className="flex flex-col items-center py-24 text-center">
                        <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
                            <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-slate-900 mb-2">Sepetiniz boş</h2>
                        <p className="text-slate-400 text-sm mb-6">Alışverişe başlamak için ürün ekleyin.</p>
                        <Link href="/products" className="btn-primary">Ürünlere Göz At</Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">

                        {/* ── Sol: Ürün Listesi ────────────────────────────────────── */}
                        <div className="flex-1 space-y-4">
                            {items.map((item) => (
                                <div key={item.id}
                                    className="flex gap-4 p-4 bg-white border border-slate-200
                             rounded-2xl animate-fade-in">
                                    {/* Görsel */}
                                    <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden
                                  bg-white shrink-0">
                                        {item.product.cover_image_url ? (
                                            <Image
                                                src={item.product.cover_image_url}
                                                alt={item.product.name}
                                                fill sizes="96px"
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-slate-700">
                                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* Bilgi */}
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/products/${item.product.slug}`}
                                            className="text-sm font-medium text-slate-900 hover:text-indigo-300 transition-colors line-clamp-2">
                                            {item.product.name}
                                        </Link>
                                        {item.variant && (
                                            <p className="text-xs text-slate-500 mt-0.5">{item.variant.label}</p>
                                        )}
                                        {item.measurement_label && (
                                            <p className="text-xs text-slate-500 mt-0.5">{item.measurement_label}</p>
                                        )}
                                        <p className="text-sm font-semibold text-slate-900 mt-1">
                                            {item.formatted_unit_price
                                                ?? `${item.unit_price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`}
                                        </p>
                                    </div>

                                    {/* Adet + Sil */}
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-slate-600 hover:text-red-400 transition-colors"
                                            aria-label="Sil"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>

                                        <div className="inline-flex items-center rounded-lg border border-slate-300 bg-white">
                                            <button
                                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                disabled={item.quantity <= 1}
                                                className="w-8 h-8 flex items-center justify-center text-slate-400
                                   hover:text-slate-900 disabled:text-slate-700 transition-colors text-sm"
                                            >−</button>
                                            <span className="w-8 text-center text-slate-900 text-xs font-medium">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center text-slate-400
                                   hover:text-slate-900 transition-colors text-sm"
                                            >+</button>
                                        </div>

                                        <span className="text-xs text-slate-500">
                                            {item.formatted_line_total}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {/* Sepeti temizle */}
                            {items.length > 0 && (
                                <button
                                    onClick={clearCart}
                                    className="text-sm text-slate-500 hover:text-red-400 transition-colors mt-2"
                                >
                                    Sepeti Temizle
                                </button>
                            )}
                        </div>

                        {/* ── Sağ: Fiyat Özeti ─────────────────────────────────────── */}
                        <div className="lg:w-80 xl:w-96 shrink-0">
                            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5
                              lg:sticky lg:top-6">

                                <h2 className="text-lg font-semibold text-slate-900">Sipariş Özeti</h2>

                                {/* Kupon */}
                                <div>
                                    {coupon ? (
                                        <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20
                                    rounded-xl px-4 py-3">
                                            <div>
                                                <span className="text-sm text-green-400 font-medium">{coupon.coupon.code}</span>
                                                <p className="text-xs text-green-400/70">
                                                    {coupon.formatted_discount} indirim uygulandı
                                                </p>
                                            </div>
                                            <button onClick={removeCoupon}
                                                className="text-green-400 hover:text-red-400 transition-colors">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                placeholder="Kupon Kodu"
                                                className="input flex-1 text-xs uppercase"
                                            />
                                            <button
                                                onClick={handleApplyCoupon}
                                                disabled={couponLoading || !couponCode.trim()}
                                                className="btn-primary text-xs px-4 shrink-0"
                                            >
                                                {couponLoading ? '…' : 'Uygula'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Hata */}
                                {error && (
                                    <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20
                               rounded-lg px-3 py-2">{error}</p>
                                )}

                                {/* Fiyat satırları */}
                                <div className="space-y-3 text-sm border-t border-slate-200 pt-4">
                                    <div className="flex justify-between text-slate-400">
                                        <span>Ara Toplam</span>
                                        <span>{summary.formatted_subtotal}</span>
                                    </div>
                                    {coupon && (
                                        <div className="flex justify-between text-green-400">
                                            <span>İndirim</span>
                                            <span>−{coupon.formatted_discount}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-slate-900 font-bold text-base pt-2
                                  border-t border-slate-200">
                                        <span>Toplam</span>
                                        <span>{finalTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                                    </div>
                                </div>

                                {/* Checkout */}
                                <Link
                                    href={user ? '/checkout' : `/auth/login?redirect=/checkout`}
                                    className="btn-primary w-full text-center"
                                >
                                    {user ? 'Ödemeye Geç' : 'Giriş Yap & Ödemeye Geç'}
                                </Link>

                                <Link href="/products" className="block text-center text-sm text-slate-500
                                                    hover:text-indigo-400 transition-colors">
                                    ← Alışverişe Devam Et
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
