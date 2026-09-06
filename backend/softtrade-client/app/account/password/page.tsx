'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import apiClient from '@/lib/axios';

const pwSchema = z
    .object({
        current_password: z.string().min(1, 'Mevcut sifre zorunlu.'),
        password: z.string().min(8, 'Yeni sifre en az 8 karakter.'),
        password_confirmation: z.string(),
    })
    .refine((d) => d.password === d.password_confirmation, {
        message: 'Sifreler eslesmiyor.',
        path: ['password_confirmation'],
    });

type PwForm = z.infer<typeof pwSchema>;

type ApiValidationError = {
    response?: {
        data?: {
            message?: string;
            errors?: Record<string, string[]>;
        };
    };
};

export default function PasswordPage() {
    const {
        register,
        handleSubmit,
        reset,
        setError,
        clearErrors,
        formState: { errors, isSubmitting },
    } = useForm<PwForm>({ resolver: zodResolver(pwSchema) });

    const onSubmit = async (data: PwForm) => {
        clearErrors();

        try {
            await apiClient.put('/user/password', data);
            toast.success('Sifreniz basariyla guncellendi.');
            reset();
        } catch (err: unknown) {
            const apiErr = err as ApiValidationError;
            const validationErrors = apiErr.response?.data?.errors;

            if (validationErrors) {
                if (validationErrors.current_password?.[0]) {
                    setError('current_password', {
                        type: 'server',
                        message: validationErrors.current_password[0],
                    });
                }

                if (validationErrors.password?.[0]) {
                    setError('password', {
                        type: 'server',
                        message: validationErrors.password[0],
                    });
                }

                if (validationErrors.password_confirmation?.[0]) {
                    setError('password_confirmation', {
                        type: 'server',
                        message: validationErrors.password_confirmation[0],
                    });
                }

                const firstFieldError =
                    validationErrors.current_password?.[0] ??
                    validationErrors.password?.[0] ??
                    validationErrors.password_confirmation?.[0];

                if (firstFieldError) {
                    toast.error(firstFieldError);
                    return;
                }
            }

            const msg = apiErr.response?.data?.message ?? 'Sifre guncellenemedi.';
            toast.error(msg);
        }
    };

    const inputCls = (hasErr: boolean) => `input ${hasErr ? 'input-error' : ''}`;

    return (
        <div>
            <h1 className="text-xl font-bold text-white mb-6">Sifre Degistir</h1>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 max-w-md">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-300 mb-1.5">Mevcut Sifre</label>
                        <input
                            {...register('current_password')}
                            type="password"
                            autoComplete="current-password"
                            className={inputCls(!!errors.current_password)}
                        />
                        {errors.current_password && (
                            <p className="text-xs text-red-400 mt-1">{errors.current_password.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm text-slate-300 mb-1.5">Yeni Sifre</label>
                        <input
                            {...register('password')}
                            type="password"
                            autoComplete="new-password"
                            className={inputCls(!!errors.password)}
                        />
                        {errors.password && (
                            <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm text-slate-300 mb-1.5">Yeni Sifre Tekrar</label>
                        <input
                            {...register('password_confirmation')}
                            type="password"
                            autoComplete="new-password"
                            className={inputCls(!!errors.password_confirmation)}
                        />
                        {errors.password_confirmation && (
                            <p className="text-xs text-red-400 mt-1">{errors.password_confirmation.message}</p>
                        )}
                    </div>

                    <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
                        {isSubmitting ? 'Guncelleniyor...' : 'Sifreyi Guncelle'}
                    </button>
                </form>
            </div>
        </div>
    );
}
