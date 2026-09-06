/**
 * Server-side API yardımcı fonksiyonları.
 * Next.js Server Component'larında doğrudan fetch kullanır.
 * Authorization header yoksa public endpoint, varsa cookie'den token ekler.
 */

import { cookies } from 'next/headers';
import type {
    ApiResponse,
    Product,
    Category,
    Brand,
    PaginationMeta,
    ProductFilters,
} from '@/types';

const BASE_URL = process.env.SERVER_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';
const AUTH_COOKIE = process.env.NEXT_PUBLIC_AUTH_COOKIE ?? 'st_token';

async function getToken(): Promise<string | undefined> {
    try {
        const cookieStore = await cookies();
        return cookieStore.get(AUTH_COOKIE)?.value;
    } catch {
        return undefined;
    }
}

async function apiFetch<T>(
    path: string,
    options: RequestInit = {},
    auth = false
): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (auth) {
        const token = await getToken();
        if (token) headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
        next: { revalidate: 60 }, // 60 saniye ISR
    });

    if (!res.ok) {
        throw new Error(`API Error ${res.status}: ${path}`);
    }

    return res.json() as Promise<T>;
}

// ─── Ürünler ──────────────────────────────────────────────────────────────────

export interface ProductListResponse {
    data: Product[];
    meta: PaginationMeta;
}

export async function getProducts(
    filters: ProductFilters = {}
): Promise<ProductListResponse> {
    const params = new URLSearchParams();
    if (filters.category) params.set('category_id', filters.category);
    if (filters.brand) params.set('brand_id', filters.brand);
    if (filters.min_price !== undefined) params.set('min_price', String(filters.min_price));
    if (filters.max_price !== undefined) params.set('max_price', String(filters.max_price));
    if (filters.search) params.set('search', filters.search);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.per_page) params.set('per_page', String(filters.per_page));
    if (filters.in_stock) params.set('in_stock', '1');

    // sort → sort_by + sort_dir dönüşümü
    if (filters.sort) {
        const sortMap: Record<string, { by: string; dir: string }> = {
            newest: { by: 'created_at', dir: 'desc' },
            oldest: { by: 'created_at', dir: 'asc' },
            price_asc: { by: 'price', dir: 'asc' },
            price_desc: { by: 'price', dir: 'desc' },
            popular: { by: 'view_count', dir: 'desc' },
        };
        const mapped = sortMap[filters.sort];
        if (mapped) {
            params.set('sort_by', mapped.by);
            params.set('sort_dir', mapped.dir);
        }
    }

    const qs = params.toString();
    const res = await apiFetch<ApiResponse<Product[]>>(`/products${qs ? `?${qs}` : ''}`);

    return {
        data: res.data,
        meta: res.meta ?? { current_page: 1, last_page: 1, total: 0 },
    };
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
    const res = await apiFetch<ApiResponse<Product[]>>(
        `/products?sort_by=created_at&sort_dir=desc&per_page=${limit}`
    );
    return res.data;
}

export async function getProductBySlug(slug: string): Promise<Product> {
    const res = await apiFetch<ApiResponse<Product>>(`/products/${slug}`);
    return res.data;
}

// ─── Kategoriler ──────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
    const res = await apiFetch<ApiResponse<Category[]>>('/categories');
    return res.data;
}

// ─── Markalar ─────────────────────────────────────────────────────────────────

export async function getBrands(): Promise<Brand[]> {
    const res = await apiFetch<ApiResponse<Brand[]>>('/brands');
    return res.data;
}
