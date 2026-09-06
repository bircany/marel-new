/**
 * SWR ile API verilerini cache'leyen custom hook'lar.
 * Client component'lerde kullanılır.
 */
import useSWR, { type SWRConfiguration } from 'swr';
import apiClient from '@/lib/axios';
import type {
    Product, Category, Brand, CartItem, CartSummary, Order, OrderDetail,
} from '@/types';

// ─── Generic fetcher ──────────────────────────────────────────────────────────

const fetcher = async (url: string) => {
    const res = await apiClient.get(url);
    return res.data?.data ?? res.data;
};

const defaultOpts: SWRConfiguration = {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
};

// ─── Products ─────────────────────────────────────────────────────────────────

export function useProducts(params?: string) {
    const key = params ? `/products?${params}` : '/products';
    return useSWR<{ data: Product[]; meta: { current_page: number; last_page: number; total: number } }>(
        key, fetcher, defaultOpts
    );
}

export function useProduct(slug: string) {
    return useSWR<Product>(slug ? `/products/${slug}` : null, fetcher, defaultOpts);
}

// ─── Categories ───────────────────────────────────────────────────────────────

export function useCategories() {
    return useSWR<Category[]>('/categories', fetcher, {
        ...defaultOpts,
        revalidateOnMount: true,
        dedupingInterval: 60000, // 1 dk
    });
}

// ─── Brands ───────────────────────────────────────────────────────────────────

export function useBrands() {
    return useSWR<Brand[]>('/brands', fetcher, {
        ...defaultOpts,
        dedupingInterval: 60000,
    });
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

interface CartData {
    items: CartItem[];
    summary: CartSummary;
}

export function useCart() {
    return useSWR<CartData>('/cart', fetcher, {
        ...defaultOpts,
        revalidateOnFocus: true,
    });
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export function useOrders() {
    return useSWR<Order[]>('/orders', fetcher, defaultOpts);
}

export function useOrder(id: string | number) {
    return useSWR<OrderDetail>(id ? `/orders/${id}` : null, fetcher, defaultOpts);
}
