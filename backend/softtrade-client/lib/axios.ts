import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    withCredentials: false,
});

// ─── Request Interceptor: Token ekle ─────────────────────────────────────────
// Zustand store'dan token'ı direkt oku (cookie/localStorage bağımlılığı yok)
apiClient.interceptors.request.use(
    (config) => {
        // getState() React hook değil, store state'e senkron erişim sağlar
        // Bu sayede SSR/hydration zamanlaması sorunları ortadan kalkar
        // Dinamik import ile circular dependency engellenir
        if (typeof window !== 'undefined') {
            try {
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                const { useAuthStore } = require('@/store/auth');
                const token: string | null = useAuthStore.getState().token;
                if (token && token !== 'undefined' && token !== 'null') {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch {
                // Store henüz yüklenmemişse sessizce geç
            }
        }

        // Misafir sepeti için X-Session-ID header'ı
        if (typeof window !== 'undefined') {
            const sessionId = localStorage.getItem('guest_session_id');
            if (sessionId) {
                config.headers['X-Session-ID'] = sessionId;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // 401 hataları sayfa bazlı yönetilir, global redirect yapılmaz
        // (profil güncelleme gibi sayfalarda kendi hata mesajları gösterilir)
        return Promise.reject(error);
    }
);

export default apiClient;

// ─── Typed helper'lar ─────────────────────────────────────────────────────────

/** Genel API çağrısı — generic response wrapper */
export async function callApi<T>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    url: string,
    data?: unknown,
    params?: Record<string, unknown>
): Promise<T> {
    const response = await apiClient.request<{ data: T }>({
        method,
        url,
        data,
        params,
    });
    // Laravel ApiResponse'dan data alanını döner
    return (response.data as unknown as { data: T }).data ?? (response.data as unknown as T);
}
