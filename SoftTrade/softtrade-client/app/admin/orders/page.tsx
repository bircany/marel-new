'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/axios';
import type { Order } from '@/types';

const STATUS_CLS: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    shipped: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    delivered: 'bg-green-500/10 text-green-400 border-green-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};
const STATUS_LBL: Record<string, string> = {
    pending: 'Bekliyor', confirmed: 'Onaylandı', shipped: 'Kargoda', delivered: 'Teslim', cancelled: 'İptal',
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('');

    const fetchOrders = useCallback(() => {
        setLoading(true);
        const params: Record<string, string> = { per_page: '50' };
        if (status) params.status = status;
        apiClient.get('/admin/orders', { params })
            .then(r => setOrders(r.data?.data ?? []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [status]);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    return (
        <div className="space-y-5">
            <h1 className="text-xl font-bold text-white">Siparişler</h1>

            {/* Filtre */}
            <div className="flex gap-2 flex-wrap">
                {['', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => (
                    <button key={s} onClick={() => setStatus(s)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all
              ${status === s
                                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                                : 'text-slate-500 border-slate-700 hover:text-white hover:border-slate-600'}`}>
                        {s === '' ? 'Tümü' : STATUS_LBL[s] ?? s}
                    </button>
                ))}
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="text-xs text-slate-500 border-b border-slate-800">
                            <th className="p-4 font-medium">Sipariş</th>
                            <th className="p-4 font-medium hidden sm:table-cell">Tarih</th>
                            <th className="p-4 font-medium">Tutar</th>
                            <th className="p-4 font-medium">Durum</th>
                            <th className="p-4 font-medium w-16" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}><td colSpan={5} className="p-4"><div className="h-6 bg-slate-800/50 rounded animate-pulse" /></td></tr>
                            ))
                        ) : orders.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">Sipariş yok.</td></tr>
                        ) : orders.map(o => (
                            <tr key={o.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="p-4 text-white font-mono text-xs">#{o.order_number}</td>
                                <td className="p-4 text-slate-400 text-xs hidden sm:table-cell">
                                    {new Date(o.created_at).toLocaleDateString('tr-TR')}
                                </td>
                                <td className="p-4 text-white font-medium">{o.formatted_total}</td>
                                <td className="p-4">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_CLS[o.status] ?? ''}`}>
                                        {STATUS_LBL[o.status] ?? o.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <Link href={`/admin/orders/${o.id}`} className="text-xs text-indigo-400 hover:text-indigo-300">Detay</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
