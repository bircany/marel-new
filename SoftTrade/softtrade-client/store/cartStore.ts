import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import apiClient from '@/lib/axios';
import type { CartItem, CartSummary, CouponApplyResult } from '@/types';

// ─── State Tipi ───────────────────────────────────────────────────────────────

interface CartState {
    items: CartItem[];
    summary: CartSummary;
    coupon: CouponApplyResult | null;
    loading: boolean;
    error: string | null;

    // Actions
    fetchCart: () => Promise<void>;
    addItem: (
        productId: number,
        quantity?: number,
        variantId?: number | null,
        width?: number,
        height?: number
    ) => Promise<void>;
    updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
    removeItem: (cartItemId: number) => Promise<void>;
    clearCart: () => Promise<void>;
    mergeCart: () => Promise<void>;
    applyCoupon: (code: string) => Promise<void>;
    removeCoupon: () => Promise<void>;
    clearError: () => void;
}

// ─── Boş summary ─────────────────────────────────────────────────────────────

const emptySummary: CartSummary = {
    item_count: 0,
    total_quantity: 0,
    subtotal: 0,
    formatted_subtotal: '0,00 ₺',
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCartStore = create<CartState>()(
    devtools(
        (set) => ({
            items: [],
            summary: emptySummary,
            coupon: null,
            loading: false,
            error: null,

            // ── Sepeti API'den çek ──────────────────────────────────────────────
            fetchCart: async () => {
                set({ loading: true, error: null });
                try {
                    const res = await apiClient.get('/cart');
                    const data = res.data?.data ?? res.data;
                    set({
                        items: data.items ?? [],
                        summary: data.summary ?? emptySummary,
                        loading: false,
                    });
                } catch {
                    set({ loading: false });
                }
            },

            // ── Ürün ekle ───────────────────────────────────────────────────────
            addItem: async (productId, quantity = 1, variantId = null, width, height) => {
                set({ loading: true, error: null });
                try {
                    const res = await apiClient.post('/cart', {
                        product_id: productId,
                        variant_id: variantId,
                        quantity,
                        ...(width !== undefined ? { width } : {}),
                        ...(height !== undefined ? { height } : {}),
                    });
                    const data = res.data?.data ?? res.data;
                    set({
                        items: data.items ?? [],
                        summary: data.summary ?? emptySummary,
                        loading: false,
                    });
                } catch (err: unknown) {
                    const msg =
                        (err as { response?: { data?: { message?: string } } })
                            ?.response?.data?.message ?? 'Ürün eklenemedi.';
                    set({ error: msg, loading: false });
                }
            },

            // ── Adet güncelle ───────────────────────────────────────────────────
            updateQuantity: async (cartItemId, quantity) => {
                set({ error: null });
                try {
                    const res = await apiClient.put(`/cart/${cartItemId}`, { quantity });
                    const data = res.data?.data ?? res.data;
                    set({
                        items: data.items ?? [],
                        summary: data.summary ?? emptySummary,
                    });
                } catch (err: unknown) {
                    const msg =
                        (err as { response?: { data?: { message?: string } } })
                            ?.response?.data?.message ?? 'Adet güncellenemedi.';
                    set({ error: msg });
                }
            },

            // ── Ürün sil ────────────────────────────────────────────────────────
            removeItem: async (cartItemId) => {
                set({ error: null });
                try {
                    const res = await apiClient.delete(`/cart/${cartItemId}`);
                    const data = res.data?.data ?? res.data;
                    set({
                        items: data.items ?? [],
                        summary: data.summary ?? emptySummary,
                    });
                } catch {
                    set({ error: 'Ürün silinemedi.' });
                }
            },

            // ── Sepeti temizle ──────────────────────────────────────────────────
            clearCart: async () => {
                try {
                    await apiClient.delete('/cart');
                    set({ items: [], summary: emptySummary, coupon: null });
                } catch { /* ignore */ }
            },

            // ── Misafir sepeti birleştir ────────────────────────────────────────
            mergeCart: async () => {
                const sessionId = typeof window !== 'undefined'
                    ? localStorage.getItem('guest_session_id')
                    : null;
                if (!sessionId) return;

                try {
                    await apiClient.post('/cart/merge', { session_id: sessionId });
                    localStorage.removeItem('guest_session_id');
                    // Birleşme sonrası yeniden çek
                    const res = await apiClient.get('/cart');
                    const data = res.data?.data ?? res.data;
                    set({
                        items: data.items ?? [],
                        summary: data.summary ?? emptySummary,
                    });
                } catch { /* ignore */ }
            },

            // ── Kupon uygula ────────────────────────────────────────────────────
            applyCoupon: async (code) => {
                set({ loading: true, error: null });
                try {
                    const res = await apiClient.post('/cart/apply-coupon', { coupon_code: code });
                    const data = res.data?.data ?? res.data;
                    set({ coupon: data, loading: false });
                } catch (err: unknown) {
                    const msg =
                        (err as { response?: { data?: { message?: string } } })
                            ?.response?.data?.message ?? 'Kupon uygulanamadı.';
                    set({ error: msg, loading: false, coupon: null });
                }
            },

            // ── Kuponu kaldır ───────────────────────────────────────────────────
            removeCoupon: async () => {
                try {
                    await apiClient.delete('/cart/remove-coupon');
                    set({ coupon: null });
                } catch { /* ignore */ }
            },

            clearError: () => set({ error: null }),
        }),
        { name: 'CartStore' }
    )
);

