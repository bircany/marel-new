'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import apiClient from '@/lib/axios';
import type { Category } from '@/types';

const schema = z.object({
    name: z.string().min(2, 'Kategori adi zorunlu.'),
    parent_id: z.union([z.number(), z.null()]).optional(),
});

type Form = z.infer<typeof schema>;

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [editId, setEditId] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(false);

    const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } =
        useForm<Form>({ resolver: zodResolver(schema) });

    const load = () => {
        setLoading(true);
        apiClient.get('/categories')
            .then((r) => setCategories(r.data?.data ?? []))
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            void load();
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    const openAdd = () => {
        setEditId(null);
        reset({ name: '', parent_id: null });
        setShowForm(true);
    };

    const openEdit = (c: Category) => {
        setEditId(c.id);
        reset({ name: c.name, parent_id: c.parent_id ?? null });
        setShowForm(true);
    };

    const onSubmit = async (data: Form) => {
        try {
            const payload = {
                name: data.name,
                parent_id: data.parent_id ?? null,
            };

            if (editId) {
                await apiClient.put(`/admin/categories/${editId}`, payload);
                toast.success('Kategori guncellendi.');
            } else {
                await apiClient.post('/admin/categories', payload);
                toast.success('Kategori olusturuldu.');
            }

            setShowForm(false);
            setEditId(null);
            load();
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data;
            const first = msg?.errors ? Object.values(msg.errors).flat()[0] : null;
            toast.error(first ?? msg?.message ?? 'Kategori kaydedilemedi.');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bu kategoriyi silmek istediginize emin misiniz?')) return;
        try {
            await apiClient.delete(`/admin/categories/${id}`);
            toast.success('Kategori silindi.');
            load();
        } catch {
            toast.error('Kategori silinemedi.');
        }
    };

    return (
        <div className="space-y-5 max-w-2xl">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-white">Kategoriler</h1>
                {!showForm && <button onClick={openAdd} className="btn-primary text-sm">+ Yeni Kategori</button>}
            </div>

            {showForm && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-white">{editId ? 'Duzenle' : 'Yeni Kategori'}</h2>
                        <button onClick={() => { setShowForm(false); setEditId(null); }} className="text-xs text-slate-500 hover:text-slate-300">Iptal</button>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                        <div>
                            <input {...register('name')} placeholder="Kategori Adi" className={`input ${errors.name ? 'input-error' : ''}`} />
                            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
                        </div>
                        <select
                            className="input"
                            defaultValue={''}
                            onChange={(e) => setValue('parent_id', e.target.value ? Number(e.target.value) : null)}
                        >
                            <option value="">Ust Kategori (Yok)</option>
                            {categories.filter((c) => c.id !== editId).map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                            {isSubmitting ? 'Kaydediliyor...' : editId ? 'Guncelle' : 'Olustur'}
                        </button>
                    </form>
                </div>
            )}

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="p-4 space-y-2">
                        {[1, 2, 3].map((i) => <div key={i} className="h-8 bg-slate-800/50 rounded animate-pulse" />)}
                    </div>
                ) : categories.length === 0 ? (
                    <p className="p-8 text-center text-slate-500 text-sm">Henuz kategori yok.</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-xs text-slate-500 border-b border-slate-800">
                                <th className="p-4 text-left font-medium">Ad</th>
                                <th className="p-4 text-left font-medium hidden sm:table-cell">Ust Kategori</th>
                                <th className="p-4 font-medium w-32">Islem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {categories.map((c) => (
                                <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="p-4 text-white font-medium">{c.name}</td>
                                    <td className="p-4 text-slate-400 text-xs hidden sm:table-cell">{c.parent?.name ?? '-'}</td>
                                    <td className="p-4 flex gap-3 justify-center">
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
