'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '@/lib/axios';
import type { ApiResponse, Review } from '@/types';

type ReviewUpdatePayload = {
    rating: number;
    title: string;
    comment: string;
};

const statusLabel: Record<string, string> = {
    pending: 'Onay bekliyor',
    approved: 'Onaylandi',
    rejected: 'Reddedildi',
};

export default function AccountReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Review | null>(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<ReviewUpdatePayload>({ rating: 5, title: '', comment: '' });

    const hasReviews = useMemo(() => reviews.length > 0, [reviews]);

    const loadMyReviews = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get<ApiResponse<Review[]>>('/reviews/mine');
            const rows = res.data?.data ?? [];
            setReviews(rows);
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Yorumlariniz yuklenemedi.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadMyReviews();
    }, []);

    const openEdit = (review: Review) => {
        setEditing(review);
        setForm({
            rating: review.rating,
            title: review.title ?? '',
            comment: review.comment ?? '',
        });
    };

    const saveEdit = async () => {
        if (!editing) return;
        setSaving(true);
        try {
            const res = await apiClient.put<ApiResponse<Review>>(`/reviews/${editing.id}`, {
                rating: form.rating,
                title: form.title || null,
                comment: form.comment || null,
            });

            const updated = res.data?.data;
            if (updated) {
                setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
            }

            toast.success('Yorumunuz guncellendi.');
            setEditing(null);
        } catch (err: unknown) {
            const data = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data;
            const firstValidationError = data?.errors
                ? Object.values(data.errors).flat()[0]
                : null;
            toast.error(firstValidationError ?? data?.message ?? 'Yorum guncellenemedi.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Yorumlarim</h1>
                <p className="text-slate-400 text-sm">Yaptiginiz yorumlari goruntuleyebilir ve duzenleyebilirsiniz.</p>
            </header>

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 shadow-xl">
                {loading ? (
                    <p className="text-slate-400">Yorumlar yukleniyor...</p>
                ) : !hasReviews ? (
                    <p className="text-slate-400">Henuz yorum yapmadiniz.</p>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <article key={review.id} className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-white font-semibold">{review.product?.name ?? 'Urun'}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">Durum: {statusLabel[review.status] ?? review.status}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => openEdit(review)}
                                        className="px-3 py-1.5 text-xs rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30"
                                    >
                                        Duzenle
                                    </button>
                                </div>

                                <p className="text-amber-400 text-sm mt-3">Puan: {review.rating}/5</p>
                                {review.title && <p className="text-white text-sm mt-2 font-medium">{review.title}</p>}
                                {review.comment && <p className="text-slate-300 text-sm mt-1 whitespace-pre-wrap">{review.comment}</p>}
                                <p className="text-xs text-slate-500 mt-3">{new Date(review.created_at).toLocaleString('tr-TR')}</p>
                            </article>
                        ))}
                    </div>
                )}
            </div>

            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4">
                    <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
                        <h2 className="text-lg font-bold text-white">Yorumu Duzenle</h2>
                        <p className="text-sm text-slate-400 mt-1">Kaydetme sonrasi yorumunuz kontrol icin beklemeye alinabilir.</p>

                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="block text-sm text-slate-300 mb-1.5">Puan</label>
                                <select
                                    value={form.rating}
                                    onChange={(e) => setForm((prev) => ({ ...prev, rating: Number(e.target.value) }))}
                                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-white"
                                >
                                    {[5, 4, 3, 2, 1].map((n) => (
                                        <option key={n} value={n}>{n}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-slate-300 mb-1.5">Baslik</label>
                                <input
                                    value={form.title}
                                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-white"
                                    maxLength={150}
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-slate-300 mb-1.5">Yorum</label>
                                <textarea
                                    value={form.comment}
                                    onChange={(e) => setForm((prev) => ({ ...prev, comment: e.target.value }))}
                                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-white min-h-28"
                                    maxLength={2000}
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setEditing(null)}
                                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800"
                                disabled={saving}
                            >
                                Vazgec
                            </button>
                            <button
                                type="button"
                                onClick={saveEdit}
                                className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50"
                                disabled={saving}
                            >
                                {saving ? 'Kaydediliyor...' : 'Kaydet'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
