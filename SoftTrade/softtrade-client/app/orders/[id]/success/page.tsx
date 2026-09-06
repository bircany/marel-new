'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/axios';
import type { OrderDetail } from '@/types';

export default function OrderSuccessPage() {
    const params = useParams();
    const orderId = params.id as string;

    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get(`/orders/${orderId}`)
            .then((res) => setOrder(res.data?.data ?? res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [orderId]);

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent" />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
            <div className="max-w-lg w-full text-center py-20 animate-fade-in">

                {/* Onay ikonu */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full
                        bg-green-500/10 border-2 border-green-500/30 mb-6">
                    <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h1 className="text-3xl font-bold text-slate-900 mb-2">Sipariş Alındı! 🎉</h1>
                <p className="text-slate-400 text-sm mb-6">
                    Siparişiniz başarıyla oluşturuldu. E-posta adresinize onay mesajı gönderildi.
                </p>

                {order && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 text-left space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Sipariş No</span>
                            <span className="text-slate-900 font-mono font-bold">{order.order_number}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Toplam</span>
                            <span className="text-slate-900 font-semibold">{order.formatted_total}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Ödeme</span>
                            <span className="text-slate-900">
                                {order.payment_method === 'credit_card' ? 'Kredi Kartı'
                                    : order.payment_method === 'bank_transfer' ? 'Havale / EFT'
                                        : 'Kapıda Ödeme'}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Durum</span>
                            <span className="bg-amber-500/10 text-amber-400 text-xs font-medium
                             px-2 py-0.5 rounded-full border border-amber-500/20">
                                {order.status === 'pending' ? 'Onay Bekliyor' : order.status}
                            </span>
                        </div>
                        {order.item_count && (
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Ürün Sayısı</span>
                                <span className="text-slate-900">{order.item_count}</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href={`/account/orders`} className="btn-primary">
                        Siparişlerim
                    </Link>
                    <Link href="/products" className="btn-ghost">
                        Alışverişe Devam Et
                    </Link>
                </div>
            </div>
        </main>
    );
}
