'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import apiClient from '@/lib/axios';
import type { OrderDetail } from '@/types';

const STATUSES = [
    { val: 'pending', lbl: 'Bekliyor' },
    { val: 'processing', lbl: 'Isleniyor' },
    { val: 'shipped', lbl: 'Kargoya Ver' },
    { val: 'delivered', lbl: 'Teslim Edildi' },
    { val: 'cancelled', lbl: 'Iptal Et' },
    { val: 'refunded', lbl: 'Iade' },
];

export default function AdminOrderDetailPage() {
    const { id } = useParams() as { id: string };
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const load = useCallback(() => {
        setLoading(true);
        apiClient.get(`/admin/orders/${id}`)
            .then((r) => setOrder(r.data?.data ?? null))
            .catch(() => setOrder(null))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        const timer = setTimeout(() => {
            void load();
        }, 0);
        return () => clearTimeout(timer);
    }, [load]);

    const updateStatus = async (newStatus: string) => {
        setUpdating(true);
        try {
            await apiClient.put(`/admin/orders/${id}/status`, { status: newStatus });
            toast.success('Durum guncellendi.');
            load();
        } catch (err: unknown) {
            toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Hata');
        }
        setUpdating(false);
    };

    if (loading) return <div className="h-64 rounded-2xl bg-slate-800/50 animate-pulse" />;
    if (!order) return <p className="text-slate-500">Siparis bulunamadi.</p>;

    return (
        <div className="space-y-6 max-w-3xl">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/admin/orders" className="text-xs text-slate-500 hover:text-indigo-400">Geri Don</Link>
                    <h1 className="text-xl font-bold text-white mt-1">Siparis #{order.order_number}</h1>
                </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-white mb-3">Durum Guncelle</h2>
                <div className="flex flex-wrap gap-2">
                    {STATUSES.map((s) => (
                        <button
                            key={s.val}
                            onClick={() => updateStatus(s.val)}
                            disabled={updating || order.status === s.val}
                            className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                                order.status === s.val
                                    ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 cursor-default'
                                    : 'text-slate-400 border-slate-700 hover:text-white hover:border-indigo-500/50 disabled:opacity-50'
                            }`}
                        >
                            {s.lbl}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-white mb-3">Urunler</h2>
                <div className="space-y-3">
                    {order.items?.map((item) => (
                        <div key={item.id} className="flex items-center gap-4">
                            <div className="relative w-12 h-12 rounded-lg bg-slate-800 overflow-hidden shrink-0">
                                {item.product_image && (
                                    <Image src={item.product_image} alt={item.product_name} fill sizes="48px" className="object-cover" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-white truncate">{item.product_name}</p>
                                <p className="text-xs text-slate-500">{item.quantity} x {item.formatted_unit_price}</p>
                            </div>
                            <span className="text-sm font-medium text-white">{item.formatted_line_total}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
                    <h3 className="text-sm font-semibold text-white mb-2">Adres</h3>
                    <p className="text-sm text-slate-300">{order.shipping_address?.name}</p>
                    <p className="text-xs text-slate-500">{order.shipping_address?.full_address}, {order.shipping_address?.district}/{order.shipping_address?.city}</p>
                    <p className="text-xs text-slate-500">{order.shipping_address?.phone}</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-2">
                    <h3 className="text-sm font-semibold text-white mb-2">Tutar</h3>
                    <div className="flex justify-between text-sm"><span className="text-slate-400">Ara Toplam</span><span className="text-white">{order.formatted_subtotal}</span></div>
                    {order.discount_amount > 0 && (
                        <div className="flex justify-between text-sm text-green-400"><span>Indirim</span><span>-{order.formatted_discount}</span></div>
                    )}
                    <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-700/50">
                        <span>Toplam</span><span>{order.formatted_total}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
