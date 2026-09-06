'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import apiClient from '@/lib/axios';
import IntlPhoneInput from '@/components/IntlPhoneInput';
import { useAuthStore } from '@/store/auth';

const profileSchema = z.object({
    first_name: z.string().min(2, 'Ad en az 2 karakter.'),
    last_name: z.string().min(2, 'Soyad en az 2 karakter.'),
    email: z.string().email('Gecerli e-posta giriniz.'),
    phone: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
    const user = useAuthStore((s) => s.user);
    const setUser = useAuthStore((s) => s.setUser);
    const [isUpdating, setIsUpdating] = useState(false);
    const [phoneValue, setPhoneValue] = useState('');
    const [phoneValid, setPhoneValid] = useState(true);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [pendingData, setPendingData] = useState<ProfileForm | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        setError,
        clearErrors,
        formState: { errors },
    } = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });

    useEffect(() => {
        if (user) {
            reset({
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                phone: user.phone ?? '',
            });
            setPhoneValue(user.phone ?? '');
            setPhoneValid(true);
        }
    }, [user, reset]);

    const onSubmit = async (data: ProfileForm) => {
        if (phoneValue && !phoneValid) {
            setError('phone', { type: 'manual', message: 'Gecerli bir telefon numarasi giriniz.' });
            return;
        }
        clearErrors('phone');
        setPasswordError('');
        setCurrentPassword('');
        setPendingData(data);
        setIsPasswordModalOpen(true);
    };

    const submitProfileUpdate = async () => {
        if (!pendingData) return;
        if (!currentPassword.trim()) {
            setPasswordError('Mevcut sifrenizi giriniz.');
            return;
        }

        setPasswordError('');
        setIsUpdating(true);
        try {
            const res = await apiClient.put('/user', {
                first_name: pendingData.first_name,
                last_name: pendingData.last_name,
                phone: phoneValue || null,
                current_password: currentPassword,
            });
            setUser(res.data?.data ?? res.data);
            toast.success('Profil bilgileriniz basariyla guncellendi.');
            setIsPasswordModalOpen(false);
            setPendingData(null);
            setCurrentPassword('');
        } catch (err: unknown) {
            const axiosErr = err as {
                response?: { data?: { message?: string; errors?: Record<string, string[]> } };
            };
            const serverErrors = axiosErr?.response?.data?.errors;
            const passwordFieldError = serverErrors?.current_password?.[0];
            const phoneFieldError = serverErrors?.phone?.[0];
            const genericMessage = axiosErr?.response?.data?.message ?? 'Bir hata olustu.';

            if (passwordFieldError) {
                setPasswordError(passwordFieldError);
            } else if (phoneFieldError) {
                setError('phone', { type: 'server', message: phoneFieldError });
            }

            toast.error(passwordFieldError ?? phoneFieldError ?? genericMessage);
        } finally {
            setIsUpdating(false);
        }
    };

    const inputCls = (hasErr: boolean) =>
        `w-full px-4 py-3 rounded-xl bg-slate-900/50 border ${hasErr ? 'border-red-500/50' : 'border-slate-700/50'} text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm`;

    return (
        <div className="max-w-2xl">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Profil Bilgileri</h1>
                <p className="text-slate-400 text-sm">Hesap bilgilerinizi buradan guncelleyebilirsiniz.</p>
            </header>

            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8 shadow-xl">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300 ml-1">Ad</label>
                            <input {...register('first_name')} placeholder="Adiniz" className={inputCls(!!errors.first_name)} />
                            {errors.first_name && <p className="text-xs text-red-400 font-medium ml-1">{errors.first_name.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300 ml-1">Soyad</label>
                            <input {...register('last_name')} placeholder="Soyadiniz" className={inputCls(!!errors.last_name)} />
                            {errors.last_name && <p className="text-xs text-red-400 font-medium ml-1">{errors.last_name.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-300 ml-1">E-posta Adresi</label>
                        <input
                            {...register('email')}
                            type="email"
                            disabled
                            className={inputCls(!!errors.email) + ' opacity-50 cursor-not-allowed'}
                        />
                        <p className="text-[10px] text-slate-500 ml-1">* E-posta degisimi icin destek ile iletisime gecin.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-300 ml-1">Telefon Numarasi</label>
                        <input type="hidden" {...register('phone')} />
                        <IntlPhoneInput
                            value={phoneValue}
                            required={false}
                            defaultCountry="tr"
                            className={inputCls(!!errors.phone)}
                            onChange={(value, isValid) => {
                                setPhoneValue(value);
                                setPhoneValid(isValid);
                                setValue('phone', value, { shouldValidate: true });
                            }}
                        />
                        {errors.phone && <p className="text-xs text-red-400 font-medium ml-1">{errors.phone.message}</p>}
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="w-full md:w-auto px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-2"
                        >
                            {isUpdating ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Kaydediliyor...
                                </>
                            ) : 'Degisiklikleri Kaydet'}
                        </button>
                    </div>
                </form>
            </div>

            {isPasswordModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4">
                    <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
                        <h2 className="text-lg font-bold text-white">Guncelleme Onayi</h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Profilinizi guncellemek icin mevcut sifrenizi giriniz.
                        </p>

                        <div className="mt-4 space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Mevcut Sifre</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className={inputCls(!!passwordError)}
                                autoFocus
                            />
                            {passwordError && <p className="text-xs text-red-400">{passwordError}</p>}
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsPasswordModalOpen(false);
                                    setPendingData(null);
                                    setCurrentPassword('');
                                    setPasswordError('');
                                }}
                                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800"
                                disabled={isUpdating}
                            >
                                Vazgec
                            </button>
                            <button
                                type="button"
                                onClick={submitProfileUpdate}
                                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold disabled:opacity-50"
                                disabled={isUpdating}
                            >
                                {isUpdating ? 'Kaydediliyor...' : 'Onayla ve Kaydet'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
