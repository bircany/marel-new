'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import apiClient from '@/lib/axios';
import IntlPhoneInput from '@/components/IntlPhoneInput';
import type { Address } from '@/types';

const addrSchema = z.object({
    title: z.string().min(1, 'Baslik zorunlu.'),
    name: z.string().min(2, 'Ad Soyad zorunlu.'),
    phone: z.string().min(10, 'Telefon zorunlu.'),
    city: z.string().min(2, 'Sehir zorunlu.'),
    district: z.string().min(2, 'Ilce zorunlu.'),
    full_address: z.string().min(10, 'Min 10 karakter.'),
});

type AddrForm = z.infer<typeof addrSchema>;

export default function AddressesPage() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [editId, setEditId] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [phoneValue, setPhoneValue] = useState('');
    const [phoneValid, setPhoneValid] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        setError,
        clearErrors,
        formState: { errors, isSubmitting },
    } = useForm<AddrForm>({ resolver: zodResolver(addrSchema) });

    const fetchAddresses = async () => {
        try {
            const res = await apiClient.get('/addresses');
            setAddresses(res.data?.data ?? []);
        } catch {
            // ignore
        }
        setLoading(false);
    };

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { fetchAddresses(); }, []);

    const openAdd = () => {
        setEditId(null);
        reset({ title: '', name: '', phone: '', city: '', district: '', full_address: '' });
        setPhoneValue('');
        setPhoneValid(false);
        setShowForm(true);
    };

    const openEdit = (addr: Address) => {
        setEditId(addr.id);
        reset({
            title: addr.title,
            name: addr.name,
            phone: addr.phone,
            city: addr.city,
            district: addr.district,
            full_address: addr.full_address,
        });
        setPhoneValue(addr.phone ?? '');
        setPhoneValid(true);
        setShowForm(true);
    };

    const onSubmit = async (data: AddrForm) => {
        if (!phoneValue || !phoneValid) {
            setError('phone', { type: 'manual', message: 'Gecerli bir telefon numarasi giriniz.' });
            return;
        }
        clearErrors('phone');

        const payload = {
            ...data,
            phone: phoneValue,
        };

        try {
            if (editId) {
                await apiClient.put(`/addresses/${editId}`, payload);
                toast.success('Adres guncellendi.');
            } else {
                await apiClient.post('/addresses', payload);
                toast.success('Adres eklendi.');
            }
            setShowForm(false);
            setEditId(null);
            fetchAddresses();
        } catch (err: unknown) {
            toast.error((err as { response?: { data?: { message?: string } } })
                ?.response?.data?.message ?? 'Islem basarisiz.');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bu adresi silmek istediginize emin misiniz?')) return;
        try {
            await apiClient.delete(`/addresses/${id}`);
            toast.success('Adres silindi.');
            fetchAddresses();
        } catch {
            toast.error('Adres silinemedi.');
        }
    };

    const handleDefault = async (id: number) => {
        try {
            await apiClient.put(`/addresses/${id}/default`);
            toast.success('Varsayilan adres guncellendi.');
            fetchAddresses();
        } catch {
            // ignore
        }
    };

    const inputCls = (hasErr: boolean) => `input ${hasErr ? 'input-error' : ''}`;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold text-white">Adreslerim</h1>
                {!showForm && (
                    <button onClick={openAdd} className="btn-primary text-sm">+ Yeni Adres</button>
                )}
            </div>

            {showForm && (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 mb-6 animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-white">
                            {editId ? 'Adresi Duzenle' : 'Yeni Adres'}
                        </h2>
                        <button onClick={() => { setShowForm(false); setEditId(null); }} className="text-slate-500 hover:text-slate-300 text-sm">
                            Iptal
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <input {...register('title')} placeholder="Baslik (Ev, Is)" className={inputCls(!!errors.title)} />
                                {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>}
                            </div>
                            <div>
                                <input {...register('name')} placeholder="Ad Soyad" className={inputCls(!!errors.name)} />
                                {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
                            </div>
                        </div>

                        <input type="hidden" {...register('phone')} />
                        <IntlPhoneInput
                            value={phoneValue}
                            required
                            defaultCountry="tr"
                            className={inputCls(!!errors.phone)}
                            onChange={(value, isValid) => {
                                setPhoneValue(value);
                                setPhoneValid(isValid);
                                setValue('phone', value, { shouldValidate: true });
                            }}
                        />
                        {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone.message}</p>}

                        <div className="grid grid-cols-2 gap-3">
                            <input {...register('city')} placeholder="Sehir" className={inputCls(!!errors.city)} />
                            <input {...register('district')} placeholder="Ilce" className={inputCls(!!errors.district)} />
                        </div>
                        <textarea {...register('full_address')} rows={2} placeholder="Acik Adres" className={`${inputCls(!!errors.full_address)} resize-none`} />
                        {errors.full_address && <p className="text-xs text-red-400">{errors.full_address.message}</p>}
                        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                            {isSubmitting ? 'Kaydediliyor...' : editId ? 'Guncelle' : 'Kaydet'}
                        </button>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="space-y-3">
                    {[1, 2].map((i) => <div key={i} className="h-28 rounded-2xl bg-slate-800/50 animate-pulse" />)}
                </div>
            ) : addresses.length === 0 ? (
                <div className="text-center py-16 text-slate-500 text-sm">Henuz adres eklenmemis.</div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {addresses.map((addr) => (
                        <div
                            key={addr.id}
                            className={`relative bg-slate-800/50 border rounded-2xl p-5 transition-all ${
                                addr.is_default ? 'border-indigo-500/50 ring-1 ring-indigo-500/20' : 'border-slate-700/50'
                            }`}
                        >
                            {addr.is_default && (
                                <span className="absolute top-3 right-3 text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20">
                                    Varsayilan
                                </span>
                            )}
                            <h3 className="text-sm font-semibold text-white mb-1">{addr.title}</h3>
                            <p className="text-xs text-slate-400">{addr.name} - {addr.phone}</p>
                            <p className="text-xs text-slate-500 mt-1">{addr.full_address}</p>
                            <p className="text-xs text-slate-500">{addr.district} / {addr.city}</p>

                            <div className="flex gap-2 mt-4 pt-3 border-t border-slate-700/50">
                                {!addr.is_default && (
                                    <button onClick={() => handleDefault(addr.id)} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                                        Varsayilan Yap
                                    </button>
                                )}
                                <button onClick={() => openEdit(addr)} className="text-xs text-slate-400 hover:text-white transition-colors">
                                    Duzenle
                                </button>
                                <button onClick={() => handleDelete(addr.id)} className="text-xs text-red-400/60 hover:text-red-400 transition-colors ml-auto">
                                    Sil
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
