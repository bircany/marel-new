'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/axios';
import type { Order } from '@/types';

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
    pending: { label: 'Onay Bekliyor', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    confirmed: { label: 'Onaylandı', cls: 'bg-blue-500/10  text-blue-400  border-blue-500/20' },
    shipped: { label: 'Kargoda', cls: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    delivered: { label: 'Teslim Edildi', cls: 'bg-green-500/10 text-green-400 border-green-500/20' },
    cancelled: { label: 'İptal Edildi', cls: 'bg-red-500/10   text-red-400   border-red-500/20' },
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/orders')
            .then((res) => setOrders(res.data?.data ?? []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="space-y-4">
                <h1 className="text-xl font-bold text-white mb-6">Siparişlerim</h1>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 rounded-2xl bg-slate-800/50 animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-xl font-bold text-white mb-6">Siparişlerim</h1>

            {orders.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">📦</span>
                    </div>
                    <p className="text-slate-400 text-sm mb-4">Henüz siparişiniz yok.</p>
                    <Link href="/products" className="btn-primary">Alışverişe Başla</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const st = STATUS_MAP[order.status] ?? STATUS_MAP.pending;
                        return (
                            <Link
                                key={order.id}
                                href={`/account/orders/${order.id}`}
                                className="block bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5
                           hover:border-indigo-500/40 transition-all group"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-mono font-bold text-white">#{order.order_number}</span>
                                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${st.cls}`}>
                                                {st.label}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500">
                                            {new Date(order.created_at).toLocaleDateString('tr-TR', {
                                                year: 'numeric', month: 'long', day: 'numeric',
                                            })}
                                            {order.item_count && ` · ${order.item_count} ürün`}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-base font-bold text-white">{order.formatted_total}</span>
                                        <svg className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors"
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
