'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '@/lib/axios';
import type { Coupon } from '@/types';

export default function AccountCouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            apiClient
                .get('/coupons/my')
                .then((res) => {
                    const raw = res.data?.data;
                    const normalized = Array.isArray(raw)
                        ? raw
                        : Array.isArray(raw?.data)
                            ? raw.data
                            : [];
                    setCoupons(normalized);
                })
                .catch((err: unknown) => {
                    const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Kuponlar yuklenemedi.';
                    toast.error(msg);
                })
                .finally(() => setLoading(false));
        }, 0);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="max-w-3xl">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Kuponlarim</h1>
                <p className="text-slate-400 text-sm">Hesabiniza tanimli ve herkese acik kuponlar burada listelenir.</p>
            </header>

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 shadow-xl">
                {loading ? (
                    <p className="text-slate-400">Kuponlar yukleniyor...</p>
                ) : coupons.length === 0 ? (
                    <p className="text-slate-400">Henuz kullanabileceginiz kupon bulunmuyor.</p>
                ) : (
                    <div className="space-y-3">
                        {coupons.map((coupon) => (
                            <article key={coupon.id} className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-white font-bold tracking-wide">{coupon.code}</p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {coupon.type === 'percent' ? `%${Number(coupon.amount ?? 0)}` : `${Number(coupon.amount ?? 0)} TL`} indirim
                                            {coupon.audience === 'personal' ? ' - Size ozel' : ' - Herkese acik'}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!navigator?.clipboard?.writeText) {
                                                toast.error('Kopyalama bu tarayicida desteklenmiyor.');
                                                return;
                                            }
                                            navigator.clipboard.writeText(coupon.code);
                                            toast.success('Kupon kodu kopyalandi.');
                                        }}
                                        className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30"
                                    >
                                        Kopyala
                                    </button>
                                </div>
                                <div className="mt-3 text-xs text-slate-500">
                                    Min siparis: {Number(coupon.min_order ?? 0).toLocaleString('tr-TR')} TL
                                    {coupon.expires_at ? ` • Son tarih: ${new Date(coupon.expires_at).toLocaleDateString('tr-TR')}` : ''}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
