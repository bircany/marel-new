'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import type { LoginCredentials, RegisterCredentials } from '@/types';

/**
 * Auth işlemleri için kolay kullanım hook'u.
 * Store'u sarmalar; component'ler doğrudan store'a bağımlı olmaz.
 */
export function useAuth() {
    const router = useRouter();

    const user = useAuthStore((s) => s.user);
    const token = useAuthStore((s) => s.token);
    const isLoading = useAuthStore((s) => s.isLoading);
    const error = useAuthStore((s) => s.error);
    const storeLogin = useAuthStore((s) => s.login);
    const storeRegister = useAuthStore((s) => s.register);
    const storeLogout = useAuthStore((s) => s.logout);
    const clearError = useAuthStore((s) => s.clearError);
    const fetchMe = useAuthStore((s) => s.fetchMe);

    const isAuthenticated = !!token && !!user;
    const isAdmin = user?.role === 'admin';

    // ── Login: başarılı → redirect ────────────────────────────────────────────
    const login = useCallback(
        async (credentials: LoginCredentials, redirectTo = '/account') => {
            await storeLogin(credentials);
            router.push(redirectTo);
            router.refresh();
        },
        [storeLogin, router]
    );

    // ── Register ──────────────────────────────────────────────────────────────
    const register = useCallback(
        async (credentials: RegisterCredentials, redirectTo = '/account') => {
            await storeRegister(credentials);
            router.push(redirectTo);
            router.refresh();
        },
        [storeRegister, router]
    );

    // ── Logout ────────────────────────────────────────────────────────────────
    const logout = useCallback(async () => {
        await storeLogout();
        router.push('/auth/login');
        router.refresh();
    }, [storeLogout, router]);

    return {
        user,
        token,
        isLoading,
        error,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        fetchMe,
        clearError,
    };
}
