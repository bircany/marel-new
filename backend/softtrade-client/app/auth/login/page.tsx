'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

// ─── Zod Schema ───────────────────────────────────────────────────────────────
const loginSchema = z.object({
    email: z.string().email('Geçerli bir e-posta adresi giriniz.'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// ─── Component ────────────────────────────────────────────────────────────────
export default function LoginPage() {
    const { login, isLoading, error, clearError } = useAuth();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') ?? '/account';
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

    useEffect(() => {
        clearError();
    }, [clearError]);

    const onSubmit = async (data: LoginFormValues) => {
        try {
            await login(data, redirectTo);
        } catch {
            // Hata store üzerinden otomatik olarak yakalanıyor ve UI'da gösteriliyor
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0A0F1D]">

            {/* ─── Dinamik Mesh Gradient Arka Plan ─────────────────────────────── */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-600/10 blur-[100px]" />
            </div>

            <div className="relative z-10 w-full max-w-md px-4 py-12">

                {/* ─── Logo / Başlık ─────────────────────────────────────────────── */}
                <div className="text-center mb-10">
                    <div className="relative inline-block group">
                        <div className="absolute inset-0 bg-indigo-500 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-2xl mb-6 mx-auto transform hover:scale-105 transition-transform duration-300">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Hoş Geldiniz</h1>
                    <p className="text-slate-400 font-medium">Lütfen bilgilerinizi girerek devam edin</p>
                </div>

                {/* ─── Login Kartı (Glassmorphism) ─────────────────────────────────── */}
                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">

                    {/* Global Hata Mesajı */}
                    {error && (
                        <div className="mb-6 flex items-start gap-3 rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3.5 text-sm text-red-400 animate-in fade-in slide-in-from-top-2 duration-300">
                            <svg className="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="leading-relaxed font-medium">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        {/* E-posta Alanı */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-slate-300 mb-2 ml-1">
                                E-posta Adresi
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </span>
                                <input
                                    {...register('email')}
                                    type="email"
                                    placeholder="ornek@mail.com"
                                    className={`w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-900/50 border text-white placeholder-slate-600
                                        text-sm outline-none transition-all duration-300
                                        ${errors.email ? 'border-red-500/40 ring-4 ring-red-500/5' : 'border-white/5 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}`}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-2 text-xs text-red-400 font-medium ml-1">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Şifre Alanı */}
                        <div className="group">
                            <div className="flex items-center justify-between mb-2 ml-1">
                                <label className="text-sm font-semibold text-slate-300">
                                    Şifre
                                </label>
                                <Link href="/auth/forgot-password" title="Şifremi unuttum" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                                    Şifremi unuttum?
                                </Link>
                            </div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </span>
                                <input
                                    {...register('password')}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className={`w-full pl-12 pr-12 py-3.5 rounded-2xl bg-slate-900/50 border text-white placeholder-slate-600
                                        text-sm outline-none transition-all duration-300
                                        ${errors.password ? 'border-red-500/40 ring-4 ring-red-500/5' : 'border-white/5 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-1"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.882 9.882L5.146 5.147m13.712 13.712l-4.738-4.736m-4.736-4.736L13.875 18.825zM3 3l18 18" /></svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-2 text-xs text-red-400 font-medium ml-1">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Giriş Yap Butonu */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="relative w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 
                                disabled:from-indigo-600/50 disabled:to-blue-600/50 disabled:cursor-not-allowed
                                text-white text-sm font-bold tracking-wider uppercase transition-all duration-300 shadow-xl shadow-indigo-500/20
                                active:scale-[0.98] group overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                        Giriş Yapılıyor…
                                    </>
                                ) : (
                                    <>
                                        <span>Hesabıma Giriş Yap</span>
                                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </>
                                )}
                            </span>
                        </button>
                    </form>
                </div>

                {/* ─── Footer ────────────────────────────────────────────────────── */}
                <div className="mt-10 text-center animate-in fade-in slide-in-from-bottom-2 duration-700">
                    <p className="text-slate-500 text-sm font-medium">
                        Henüz bir hesabınız yok mu?{' '}
                        <Link href="/auth/register" className="text-white hover:text-indigo-400 font-bold underline underline-offset-4 decoration-indigo-500/30 transition-all">
                            Hemen ücretsiz kayıt olun
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
}
