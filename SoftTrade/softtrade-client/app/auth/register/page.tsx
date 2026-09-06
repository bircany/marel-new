'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import IntlPhoneInput from '@/components/IntlPhoneInput';

const registerSchema = z
    .object({
        first_name: z.string().min(2, 'Ad en az 2 karakter olmalidir.'),
        last_name: z.string().min(2, 'Soyad en az 2 karakter olmalidir.'),
        email: z.string().email('Gecerli bir e-posta adresi giriniz.'),
        phone: z.string().optional(),
        password: z.string().min(8, 'Sifre en az 8 karakter olmalidir.'),
        password_confirmation: z.string(),
    })
    .refine((d) => d.password === d.password_confirmation, {
        message: 'Sifreler eslesmiyor.',
        path: ['password_confirmation'],
    });

type RegisterFormValues = z.infer<typeof registerSchema>;

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
            {children}
            {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
        </div>
    );
}

const inputCls = (hasError: boolean) =>
    `w-full px-4 py-2.5 rounded-xl bg-slate-900/70 border text-white placeholder-slate-500
   text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/50
   ${hasError ? 'border-red-500/60' : 'border-slate-700 focus:border-indigo-500'}`;

export default function RegisterPage() {
    const { register: signup, isLoading, error, clearError } = useAuth();
    const [phoneValue, setPhoneValue] = useState('');
    const [phoneValid, setPhoneValid] = useState(true);

    const {
        register,
        handleSubmit,
        setValue,
        setError,
        clearErrors,
        formState: { errors },
    } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

    useEffect(() => {
        clearError();
        setValue('phone', '');
    }, [clearError, setValue]);

    const onSubmit = async (data: RegisterFormValues) => {
        if (phoneValue && !phoneValid) {
            setError('phone', { type: 'manual', message: 'Gecerli bir telefon numarasi giriniz.' });
            return;
        }

        clearErrors('phone');

        const payload: RegisterFormValues = {
            ...data,
            phone: phoneValue || undefined,
        };

        try {
            await signup(payload);
        } catch {
            // hata store'da
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500 shadow-lg mb-4">
                        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Hesap Olusturun</h1>
                    <p className="text-slate-400 text-sm mt-1">Ucretsiz kaydolun, alisverise baslayin</p>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
                    {error && (
                        <div className="mb-5 flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                            <svg className="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Ad" error={errors.first_name?.message}>
                                <input {...register('first_name')} placeholder="Ad" className={inputCls(!!errors.first_name)} />
                            </Field>
                            <Field label="Soyad" error={errors.last_name?.message}>
                                <input {...register('last_name')} placeholder="Soyad" className={inputCls(!!errors.last_name)} />
                            </Field>
                        </div>

                        <Field label="E-posta" error={errors.email?.message}>
                            <input
                                {...register('email')}
                                type="email"
                                autoComplete="email"
                                placeholder="ornek@email.com"
                                className={inputCls(!!errors.email)}
                            />
                        </Field>

                        <Field label="Telefon (opsiyonel)" error={errors.phone?.message}>
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
                        </Field>

                        <Field label="Sifre" error={errors.password?.message}>
                            <input
                                {...register('password')}
                                type="password"
                                autoComplete="new-password"
                                placeholder="En az 8 karakter"
                                className={inputCls(!!errors.password)}
                            />
                        </Field>

                        <Field label="Sifre Onayi" error={errors.password_confirmation?.message}>
                            <input
                                {...register('password_confirmation')}
                                type="password"
                                autoComplete="new-password"
                                placeholder="Sifreyi tekrar girin"
                                className={inputCls(!!errors.password_confirmation)}
                            />
                        </Field>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500
                disabled:bg-indigo-600/50 text-white text-sm font-semibold
                transition-all duration-200 focus:outline-none focus:ring-2
                focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800
                flex items-center justify-center gap-2"
                        >
                            {isLoading ? 'Hesap olusturuluyor...' : 'Kaydol'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-slate-500 text-sm mt-6">
                    Zaten hesabin var mi?{' '}
                    <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                        Giris yap
                    </Link>
                </p>
            </div>
        </div>
    );
}
