'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import apiClient from '@/lib/axios';
import type { Coupon } from '@/types';

const schema = z.object({
    code: z.string().min(3, 'Kod zorunlu.').transform((s) => s.toUpperCase()),
    audience: z.enum(['public', 'personal']),
    type: z.enum(['fixed', 'percent']),
    amount: z.coerce.number().min(0.01, 'Tutar zorunlu.'),
    max_discount: z.coerce.number().optional(),
    min_order: z.coerce.number().min(0),
    usage_limit: z.coerce.number().int().optional(),
    expires_at: z.string().optional(),
    is_active: z.boolean(),
    user_ids: z.array(z.number()).optional(),
});

type Form = z.infer<typeof schema>;

type AdminUser = { id: number; first_name: string; last_name: string; email: string };

function randomCode() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let out = 'ST-';
    for (let i = 0; i < 8; i++) out += letters[Math.floor(Math.random() * letters.length)];
    return out;
}

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [editId, setEditId] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(false);

    const { register, handleSubmit, reset, setValue, control, formState: { errors, isSubmitting } } =
        useForm<Form>({ resolver: zodResolver(schema), defaultValues: { type: 'fixed', audience: 'public', is_active: true, min_order: 0, user_ids: [] } });

    const couponType = useWatch({ control, name: 'type' });
    const audience = useWatch({ control, name: 'audience' });
    const watchedUserIds = useWatch({ control, name: 'user_ids' });
    const selectedUsers = useMemo(() => watchedUserIds ?? [], [watchedUserIds]);

    const selectedUserSet = useMemo(() => new Set(selectedUsers), [selectedUsers]);

    const load = () => {
        setLoading(true);
        Promise.all([
            apiClient.get('/admin/coupons'),
            apiClient.get('/admin/users', { params: { per_page: 200 } }),
        ])
            .then(([cRes, uRes]) => {
                setCoupons(cRes.data?.data ?? []);
                setUsers(uRes.data?.data?.data ?? []);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        const timer = setTimeout(() => { load(); }, 0);
        return () => clearTimeout(timer);
    }, []);

    const openAdd = () => {
        setEditId(null);
        reset({
            code: randomCode(),
            audience: 'public',
            type: 'fixed',
            amount: 0,
            max_discount: undefined,
            min_order: 0,
            usage_limit: undefined,
            expires_at: '',
            is_active: true,
            user_ids: [],
        });
        setShowForm(true);
    };

    const openEdit = async (c: Coupon) => {
        setEditId(c.id);
        let userIds: number[] = [];

        try {
            const detail = await apiClient.get(`/admin/coupons/${c.id}`);
            userIds = (detail.data?.data?.users ?? []).map((u: { id: number }) => u.id);
        } catch {
            userIds = [];
        }

        reset({
            code: c.code,
            audience: c.audience ?? 'public',
            type: c.type,
            amount: c.amount,
            max_discount: c.max_discount ?? undefined,
            min_order: c.min_order,
            usage_limit: c.usage_limit ?? undefined,
            expires_at: c.expires_at?.slice(0, 10) ?? '',
            is_active: c.is_active,
            user_ids: userIds,
        });
        setShowForm(true);
    };

    const toggleUser = (id: number) => {
        const current = new Set(selectedUsers ?? []);
        if (current.has(id)) current.delete(id);
        else current.add(id);
        setValue('user_ids', Array.from(current), { shouldValidate: true });
    };

    const onSubmit = async (data: Form) => {
        try {
            const payload = {
                ...data,
                expires_at: data.expires_at || null,
                user_ids: data.audience === 'personal' ? (data.user_ids ?? []) : [],
            };

            if (editId) {
                await apiClient.put(`/admin/coupons/${editId}`, payload);
                toast.success('Kupon guncellendi.');
            } else {
                await apiClient.post('/admin/coupons', payload);
                toast.success('Kupon olusturuldu.');
            }

            setShowForm(false);
            setEditId(null);
            load();
        } catch (err: unknown) {
            const dataErr = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data;
            const first = dataErr?.errors ? Object.values(dataErr.errors).flat()[0] : null;
            toast.error(first ?? dataErr?.message ?? 'Hata.');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bu kuponu silmek istediginize emin misiniz?')) return;
        try {
            await apiClient.delete(`/admin/coupons/${id}`);
            toast.success('Silindi.');
            load();
        } catch {
            toast.error('Silinemedi.');
        }
    };

    return (
        <div className="space-y-5 max-w-4xl">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-white">Kuponlar</h1>
                {!showForm && <button onClick={openAdd} className="btn-primary text-sm">+ Yeni Kupon</button>}
            </div>

            {showForm && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-white">{editId ? 'Duzenle' : 'Yeni Kupon'}</h2>
                        <button onClick={() => { setShowForm(false); setEditId(null); }} className="text-xs text-slate-500">Iptal</button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2">
                                <label className="block text-xs text-slate-400 mb-1">Kupon Kodu</label>
                                <input {...register('code')} className={`input uppercase ${errors.code ? 'input-error' : ''}`} />
                            </div>
                            <div className="flex items-end">
                                <button type="button" onClick={() => setValue('code', randomCode())} className="btn-ghost w-full text-sm">Kod Uret</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Hedef</label>
                                <select {...register('audience')} className="input">
                                    <option value="public">Herkese Acik</option>
                                    <option value="personal">Kisiye Ozel</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Tip</label>
                                <select {...register('type')} className="input">
                                    <option value="fixed">Sabit (TL)</option>
                                    <option value="percent">Yuzde (%)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">{couponType === 'percent' ? 'Yuzde (%)' : 'Tutar (TL)'}</label>
                                <input {...register('amount')} type="number" step="0.01" className={`input ${errors.amount ? 'input-error' : ''}`} />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {couponType === 'percent' ? (
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Maks. Indirim (TL)</label>
                                    <input {...register('max_discount')} type="number" step="0.01" className="input" />
                                </div>
                            ) : <div />}
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Min. Siparis (TL)</label>
                                <input {...register('min_order')} type="number" step="0.01" className="input" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Son Tarih</label>
                                <input {...register('expires_at')} type="date" className="input" />
                            </div>
                        </div>

                        {audience === 'personal' && (
                            <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-3">
                                <p className="text-xs text-slate-300 mb-2">Kullanici Secimi</p>
                                <div className="max-h-40 overflow-auto space-y-1">
                                    {users.map((u) => (
                                        <label key={u.id} className="flex items-center gap-2 text-sm text-slate-300">
                                            <input
                                                type="checkbox"
                                                checked={selectedUserSet.has(u.id)}
                                                onChange={() => toggleUser(u.id)}
                                                className="accent-indigo-500"
                                            />
                                            <span>{u.first_name} {u.last_name} ({u.email})</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input {...register('is_active')} type="checkbox" className="w-4 h-4 accent-indigo-500" />
                            <span className="text-sm text-slate-300">Aktif</span>
                        </label>

                        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                            {isSubmitting ? 'Kaydediliyor...' : editId ? 'Guncelle' : 'Olustur'}
                        </button>
                    </form>
                </div>
            )}

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-x-auto">
                {loading ? (
                    <div className="p-4 space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-8 bg-slate-800/50 rounded animate-pulse" />)}</div>
                ) : coupons.length === 0 ? (
                    <p className="p-8 text-center text-slate-500 text-sm">Henuz kupon yok.</p>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="text-xs text-slate-500 border-b border-slate-800">
                                <th className="p-4 font-medium">Kod</th>
                                <th className="p-4 font-medium">Hedef</th>
                                <th className="p-4 font-medium">Tip</th>
                                <th className="p-4 font-medium">Tutar</th>
                                <th className="p-4 font-medium hidden sm:table-cell">Atanan</th>
                                <th className="p-4 font-medium">Islem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {coupons.map((c) => (
                                <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="p-4 text-white font-mono font-medium">{c.code}</td>
                                    <td className="p-4 text-slate-300 text-xs">{c.audience === 'personal' ? 'Kisiye Ozel' : 'Herkese Acik'}</td>
                                    <td className="p-4 text-slate-400 text-xs">{c.type === 'fixed' ? 'Sabit' : 'Yuzde'}</td>
                                    <td className="p-4 text-white">{c.type === 'fixed' ? `${c.amount} TL` : `%${c.amount}`}</td>
                                    <td className="p-4 text-slate-400 text-xs hidden sm:table-cell">{c.assigned_users_count ?? 0}</td>
                                    <td className="p-4 flex gap-3">
                                        <button onClick={() => openEdit(c)} className="text-xs text-indigo-400 hover:text-indigo-300">Duzenle</button>
                                        <button onClick={() => handleDelete(c.id)} className="text-xs text-red-400/60 hover:text-red-400">Sil</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
