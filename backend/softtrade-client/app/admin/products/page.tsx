'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import apiClient from '@/lib/axios';
import type { Product } from '@/types';

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = { per_page: '50' };
            if (search) params.search = search;
            if (status) params.status = status;
            const res = await apiClient.get('/products', { params });
            setProducts(res.data?.data ?? []);
        } catch { /* ignore */ }
        setLoading(false);
    }, [search, status]);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <h1 className="text-xl font-bold text-white">Ürünler</h1>
                <Link href="/admin/products/new" className="btn-primary text-sm">+ Yeni Ürün</Link>
            </div>

            {/* Filtreler */}
            <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[200px]">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
                        placeholder="Ürün ara…"
                        className="input text-sm"
                    />
                </div>
                <select value={status} onChange={(e) => setStatus(e.target.value)}
                    className="input w-40 text-sm">
                    <option value="">Tüm Durum</option>
                    <option value="active">Aktif</option>
                    <option value="inactive">Pasif</option>
                    <option value="draft">Taslak</option>
                </select>
                <button onClick={fetchProducts} className="btn-ghost text-sm">Ara</button>
            </div>

            {/* Tablo */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="text-xs text-slate-500 border-b border-slate-800">
                            <th className="p-4 font-medium">Ürün</th>
                            <th className="p-4 font-medium hidden md:table-cell">Kategori</th>
                            <th className="p-4 font-medium">Fiyat</th>
                            <th className="p-4 font-medium">Stok</th>
                            <th className="p-4 font-medium hidden sm:table-cell">Durum</th>
                            <th className="p-4 font-medium w-20">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}><td colSpan={6} className="p-4"><div className="h-6 bg-slate-800/50 rounded animate-pulse" /></td></tr>
                            ))
                        ) : products.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-slate-500">Ürün bulunamadı.</td></tr>
                        ) : (
                            products.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden shrink-0">
                                                {p.cover_image?.url && (
                                                    <Image
                                                        src={p.cover_image.url}
                                                        alt={p.name}
                                                        width={40}
                                                        height={40}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-white font-medium text-sm truncate">{p.name}</p>
                                                <p className="text-xs text-slate-500 font-mono">{p.sku ?? '—'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-400 text-xs hidden md:table-cell">{p.category?.name ?? '—'}</td>
                                    <td className="p-4">
                                        <span className="text-white font-medium">{p.formatted_current_price}</span>
                                        {p.is_on_sale && (
                                            <span className="block text-xs text-slate-500 line-through">{p.formatted_price}</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-sm font-medium ${p.stock < 10 ? 'text-red-400' : 'text-white'}`}>
                                            {p.stock}
                                        </span>
                                    </td>
                                    <td className="p-4 hidden sm:table-cell">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border
                      ${p.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                : p.status === 'draft' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                    : 'bg-slate-700/50 text-slate-400 border-slate-600'}`}>
                                            {p.status === 'active' ? 'Aktif' : p.status === 'draft' ? 'Taslak' : 'Pasif'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <Link href={`/admin/products/${p.id}/edit`}
                                            className="text-xs text-indigo-400 hover:text-indigo-300">Düzenle</Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
