'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/axios';

type DashboardData = {
    today: { orders: number; revenue: number; formatted_revenue: string };
    this_month: { orders: number; revenue: number; formatted_revenue: string };
    users: { total: number; this_month: number; admins: number };
    counts: {
        products: number;
        active: number;
        categories: number;
        brands: number;
        orders: number;
        pending_orders: number;
    };
    recent_orders: Array<{
        id: number;
        order_number: string;
        customer: string | null;
        total: number;
        formatted_total: string;
        status: string;
        payment_status: string;
        created_at: string;
    }>;
    low_stock: {
        threshold: number;
        count: number;
        products: Array<{ id: number; name: string; slug: string; stock: number; sku: string | null; cover_image: string | null }>;
    };
};

const STATUS_CLS: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    shipped: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    delivered: 'bg-green-500/10 text-green-400 border-green-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
    refunded: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
};

const STATUS_LABEL: Record<string, string> = {
    pending: 'Bekliyor',
    processing: 'Hazirlaniyor',
    shipped: 'Kargoda',
    delivered: 'Teslim',
    cancelled: 'Iptal',
    refunded: 'Iade',
};

export default function AdminDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient
            .get('/admin/dashboard')
            .then((res) => setData(res.data?.data ?? null))
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, []);

    const lowStockProducts = useMemo(() => data?.low_stock?.products ?? [], [data]);
    const recentOrders = useMemo(() => data?.recent_orders ?? [], [data]);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-28 rounded-2xl bg-slate-800/50 animate-pulse" />
                    ))}
                </div>
                <div className="h-64 rounded-2xl bg-slate-800/50 animate-pulse" />
            </div>
        );
    }

    if (!data) return <p className="text-slate-500">Dashboard verileri yuklenemedi.</p>;

    const criticalStockCount = lowStockProducts.filter((p) => p.stock === 0).length;
    const lowStockCount = lowStockProducts.filter((p) => p.stock > 0).length;

    const stats = [
        {
            label: 'Bugunku Gelir',
            value: data.today.formatted_revenue,
            color: 'from-green-500/20 to-green-600/10 border-green-500/30',
        },
        {
            label: 'Bugunku Siparis',
            value: data.today.orders,
            color: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30',
        },
        {
            label: 'Aylik Gelir',
            value: data.this_month.formatted_revenue,
            color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
        },
        {
            label: 'Toplam Kullanici',
            value: data.users.total,
            color: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30',
        },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s) => (
                    <div key={s.label} className={`bg-gradient-to-br ${s.color} border rounded-2xl p-5 flex flex-col gap-1`}>
                        <span className="text-2xl font-bold text-white">{s.value}</span>
                        <span className="text-xs text-slate-400">{s.label}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-white">Son Siparisler</h2>
                        <Link href="/admin/orders" className="text-xs text-indigo-400 hover:text-indigo-300">
                            Tumu
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="text-xs text-slate-500 border-b border-slate-800">
                                    <th className="pb-2 font-medium">Siparis</th>
                                    <th className="pb-2 font-medium hidden sm:table-cell">Musteri</th>
                                    <th className="pb-2 font-medium">Tutar</th>
                                    <th className="pb-2 font-medium">Durum</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {recentOrders.map((o) => (
                                    <tr key={o.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3">
                                            <Link href={`/admin/orders/${o.id}`} className="text-white font-mono text-xs hover:text-indigo-400">
                                                #{o.order_number}
                                            </Link>
                                        </td>
                                        <td className="py-3 text-slate-400 text-xs hidden sm:table-cell">{o.customer ?? '-'}</td>
                                        <td className="py-3 text-white font-medium">{o.formatted_total}</td>
                                        <td className="py-3">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_CLS[o.status] ?? ''}`}>
                                                {STATUS_LABEL[o.status] ?? o.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-white">Stok Uyarilari</h2>
                        <span className="text-[11px] px-2 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300">
                            {lowStockProducts.length} urun
                        </span>
                    </div>

                    {lowStockProducts.length === 0 ? (
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                            <p className="text-xs text-emerald-300">Tum stoklar yeterli seviyede.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2">
                                    <p className="text-[10px] text-red-300/80">Kritik (stok 0)</p>
                                    <p className="text-lg font-bold text-red-300">{criticalStockCount}</p>
                                </div>
                                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                                    <p className="text-[10px] text-amber-300/80">Dusuk stok</p>
                                    <p className="text-lg font-bold text-amber-300">{lowStockCount}</p>
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                {lowStockProducts.map((p) => {
                                    const outOfStock = p.stock === 0;

                                    return (
                                        <Link
                                            key={p.id}
                                            href={`/admin/products/${p.id}/edit`}
                                            className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${
                                                outOfStock
                                                    ? 'bg-red-500/10 border-red-500/30 hover:border-red-500/50'
                                                    : 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40'
                                            }`}
                                        >
                                            <div className="min-w-0 mr-2">
                                                <p className="text-xs text-slate-200 truncate">{p.name}</p>
                                                <p className={`text-[10px] ${outOfStock ? 'text-red-300' : 'text-amber-300'}`}>
                                                    {outOfStock ? 'Acil: stok tukendi' : 'Takip: stok azaliyor'}
                                                </p>
                                            </div>
                                            <span className={`text-[11px] font-bold shrink-0 ${outOfStock ? 'text-red-300' : 'text-amber-300'}`}>
                                                {p.stock} adet
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-3 gap-3">
                        <div className="text-center">
                            <div className="text-lg font-bold text-white">{data.counts.products}</div>
                            <div className="text-[10px] text-slate-500">Urun</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-white">{data.counts.categories}</div>
                            <div className="text-[10px] text-slate-500">Kategori</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-white">{data.counts.pending_orders}</div>
                            <div className="text-[10px] text-slate-500">Bekleyen</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
