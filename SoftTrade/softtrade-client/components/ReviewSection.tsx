'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import StarRating from '@/components/StarRating';
import apiClient from '@/lib/axios';
import { useAuthStore } from '@/store/auth';
import type { Review, ReviewStats } from '@/types';

// ─── Zod Schema ───────────────────────────────────────────────────────────────
const reviewSchema = z.object({
    rating: z.number().min(1, 'Lütfen puan verin.').max(5),
    title: z.string().max(150).optional(),
    comment: z.string().max(1000).optional(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewSectionProps {
    productId: number;
    productSlug: string;
    initialReviews: Review[];
    initialStats: ReviewStats;
}

export default function ReviewSection({
    productId,
    productSlug,
    initialReviews,
    initialStats,
}: ReviewSectionProps) {
    const user = useAuthStore((s) => s.user);

    const [reviews, setReviews] = useState<Review[]>(initialReviews);
    const [stats, setStats] = useState<ReviewStats>(initialStats);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hoverRating, setHoverRating] = useState(0);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<ReviewFormValues>({
        resolver: zodResolver(reviewSchema),
        defaultValues: { rating: 0 },
    });

    const currentRating = watch('rating');

    const fetchReviews = useCallback(async () => {
        try {
            const res = await apiClient.get(`/products/${productSlug}/reviews`);
            setReviews(res.data.data ?? []);
            if (res.data.stats) setStats(res.data.stats);
        } catch { /* ignore */ }
    }, [productSlug]);

    const onSubmit = async (data: ReviewFormValues) => {
        setLoading(true);
        setError(null);
        try {
            await apiClient.post('/reviews', { product_id: productId, ...data });
            setSuccess(true);
            reset();
            await fetchReviews();
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message ?? 'Yorum gönderilemedi.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    // Dağılım çubuğu
    const maxCount = Math.max(...Object.values(stats.distribution), 1);

    return (
        <div className="space-y-8">

            {/* ── Özet İstatistik ─────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Sol: ortalama */}
                <div className="text-center md:text-left shrink-0">
                    <div className="text-5xl font-bold text-white">
                        {stats.average ? stats.average.toFixed(1) : '—'}
                    </div>
                    <StarRating rating={stats.average ?? 0} size="md" />
                    <p className="text-sm text-slate-400 mt-1">{stats.total} değerlendirme</p>
                </div>

                {/* Sağ: dağılım çubukları */}
                <div className="flex-1 space-y-1.5 w-full">
                    {[5, 4, 3, 2, 1].map((star) => {
                        const count = stats.distribution[star] ?? 0;
                        const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                        return (
                            <div key={star} className="flex items-center gap-2">
                                <span className="text-xs text-slate-400 w-3">{star}</span>
                                <svg className="w-3.5 h-3.5 text-yellow-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                <span className="text-xs text-slate-500 w-6 text-right">{count}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Yorum Formu ─────────────────────────────────────────────────── */}
            {user ? (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                    <h3 className="text-base font-semibold text-white mb-4">Yorum Yaz</h3>

                    {success && (
                        <div className="mb-4 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20
                            text-sm text-green-400">
                            ✓ Yorumunuz gönderildi. Admin onayından sonra yayınlanacak.
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20
                            text-sm text-red-400">{error}</div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Yıldız seçimi */}
                        <div>
                            <label className="block text-sm text-slate-300 mb-2">Puanınız</label>
                            <StarRating
                                rating={hoverRating || currentRating}
                                size="lg"
                                interactive
                                onChange={(r) => {
                                    setValue('rating', r, { shouldValidate: true });
                                    setHoverRating(0);
                                }}
                            />
                            {errors.rating && (
                                <p className="mt-1 text-xs text-red-400">{errors.rating.message}</p>
                            )}
                        </div>

                        {/* Başlık */}
                        <div>
                            <input
                                {...register('title')}
                                placeholder="Yorum başlığı (opsiyonel)"
                                className="input"
                            />
                        </div>

                        {/* Yorum */}
                        <div>
                            <textarea
                                {...register('comment')}
                                rows={3}
                                placeholder="Deneyiminizi paylaşın…"
                                className="input resize-none"
                            />
                            {errors.comment && (
                                <p className="mt-1 text-xs text-red-400">{errors.comment.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                        >
                            {loading ? 'Gönderiliyor…' : 'Yorum Gönder'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 text-center">
                    <p className="text-slate-400 text-sm">
                        Yorum yapmak için{' '}
                        <a href="/auth/login" className="text-indigo-400 hover:underline">
                            giriş yapın
                        </a>
                    </p>
                </div>
            )}

            {/* ── Yorum Listesi ──────────────────────────────────────────────── */}
            <div className="space-y-4">
                {reviews.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-8">
                        Henüz yorum yok. İlk yorumu siz yazın!
                    </p>
                ) : (
                    reviews.map((r) => (
                        <div
                            key={r.id}
                            className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-5 space-y-2
                         animate-fade-in"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {/* Avatar */}
                                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300
                                  flex items-center justify-center text-sm font-bold">
                                        {r.user.name?.charAt(0).toUpperCase() ?? '?'}
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-white">{r.user.name}</span>
                                        {r.is_verified_purchase && (
                                            <span className="ml-2 text-[10px] bg-green-500/10 text-green-400
                                       px-1.5 py-0.5 rounded-full border border-green-500/20">
                                                ✓ Doğrulanmış Alıcı
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <time className="text-xs text-slate-500">
                                    {new Date(r.created_at).toLocaleDateString('tr-TR', {
                                        year: 'numeric', month: 'short', day: 'numeric',
                                    })}
                                </time>
                            </div>
                            <StarRating rating={r.rating} size="sm" />
                            {r.title && <h4 className="text-sm font-semibold text-white">{r.title}</h4>}
                            {r.comment && <p className="text-sm text-slate-300 leading-relaxed">{r.comment}</p>}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
