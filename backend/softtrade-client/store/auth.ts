import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import Cookies from 'js-cookie';
import apiClient from '@/lib/axios';
import type {
    User,
    LoginCredentials,
    RegisterCredentials,
    AuthResponse,
} from '@/types';

const AUTH_COOKIE = process.env.NEXT_PUBLIC_AUTH_COOKIE ?? 'st_token';
const COOKIE_EXPIRES = 7; // gün

// ─── State Tipi ───────────────────────────────────────────────────────────────

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    logout: () => Promise<void>;
    fetchMe: () => Promise<void>;
    clearError: () => void;
    setUser: (user: User) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeToken(token: string | null | undefined): string | null {
    if (!token) return null;
    if (token === 'undefined' || token === 'null') return null;
    return token;
}

function resolveAuthToken(payload: { access_token?: string; token?: string }): string {
    const token = normalizeToken(payload.access_token ?? payload.token);
    if (!token) {
        throw new Error('Auth token response is missing or invalid.');
    }
    return token;
}

function resolveApiErrorMessage(err: unknown, fallback: string): string {
    const response = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response;
    const apiMessage = response?.data?.message;
    const errors = response?.data?.errors;

    if (errors && typeof errors === 'object') {
        for (const fieldErrors of Object.values(errors)) {
            if (Array.isArray(fieldErrors) && fieldErrors.length > 0 && fieldErrors[0]) {
                return fieldErrors[0];
            }
        }
    }

    return apiMessage ?? fallback;
}

function saveToken(token: string) {
    const safeToken = normalizeToken(token);
    if (!safeToken) return;

    Cookies.set(AUTH_COOKIE, safeToken, {
        expires: COOKIE_EXPIRES,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });
}

function clearToken() {
    Cookies.remove(AUTH_COOKIE);
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
    devtools(
        persist(
            (set, get) => ({
                user: null,
                token: normalizeToken(Cookies.get(AUTH_COOKIE) ?? null),
                isLoading: false,
                error: null,

                // ── Login ──────────────────────────────────────────────────────────
                login: async (credentials) => {
                    set({ isLoading: true, error: null });
                    try {
                        const res = await apiClient.post<{ data: AuthResponse }>(
                            '/auth/login',
                            credentials
                        );
                        const { user } = res.data.data;
                        const token = resolveAuthToken(res.data.data);

                        saveToken(token);
                        set({ user, token, isLoading: false });

                        // Misafir sepetini kullanıcı hesabıyla birleştir
                        const sessionId =
                            typeof window !== 'undefined'
                                ? localStorage.getItem('guest_session_id')
                                : null;

                        if (sessionId) {
                            try {
                                await apiClient.post('/cart/merge', { session_id: sessionId });
                                localStorage.removeItem('guest_session_id');
                            } catch {
                                // merge hatası kritik değil, sessizce geç
                            }
                        }
                    } catch (err: unknown) {
                        const msg = resolveApiErrorMessage(err, 'Giriş yapılamadı.');
                        set({ error: msg, isLoading: false });
                        throw err;
                    }
                },

                // ── Register ───────────────────────────────────────────────────────
                register: async (credentials) => {
                    set({ isLoading: true, error: null });
                    try {
                        const res = await apiClient.post<{ data: AuthResponse }>(
                            '/auth/register',
                            credentials
                        );
                        const { user } = res.data.data;
                        const token = resolveAuthToken(res.data.data);

                        saveToken(token);
                        set({ user, token, isLoading: false });
                    } catch (err: unknown) {
                        const msg = resolveApiErrorMessage(err, 'Kayıt oluşturulamadı.');
                        set({ error: msg, isLoading: false });
                        throw err;
                    }
                },

                // ── Logout ─────────────────────────────────────────────────────────
                logout: async () => {
                    try {
                        await apiClient.post('/auth/logout');
                    } catch {
                        // sunucu hatası olsa bile local state temizlenir
                    } finally {
                        clearToken();
                        set({ user: null, token: null });
                    }
                },

                // ── Me (token yenilemede veya sayfa yenilemede) ─────────────────────
                fetchMe: async () => {
                    const token = normalizeToken(get().token ?? Cookies.get(AUTH_COOKIE) ?? null);
                    if (!token) return;

                    set({ isLoading: true });
                    try {
                        const res = await apiClient.get<{ data: User }>('/auth/me');
                        set({ user: res.data.data, token, isLoading: false });
                    } catch {
                        clearToken();
                        set({ user: null, token: null, isLoading: false });
                    }
                },

                setUser: (user) => set({ user }),
                clearError: () => set({ error: null }),
            }),
            {
                name: 'auth-store',
                // Sadece user ve token persist edilsin; isLoading ve error session'a yazılmasın
                partialize: (state) => ({ user: state.user, token: state.token }),
            }
        ),
        { name: 'AuthStore' }
    )
);
