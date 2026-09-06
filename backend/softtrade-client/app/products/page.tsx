import type { Metadata } from 'next';
import { Suspense } from 'react';
import ProductCard from '@/components/ProductCard';
import FilterSidebar from '@/components/FilterSidebar';
import Pagination from '@/components/Pagination';
import { getProducts, getCategories, getBrands } from '@/lib/serverApi';
import type { ProductFilters } from '@/types';

// ─── Dynamic SEO Metadata ─────────────────────────────────────────────────────

interface PageProps {
    searchParams: Promise<Record<string, string | undefined>>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
    const sp = await searchParams;
    const category = sp.category ?? null;
    const brand = sp.brand ?? null;
    const search = sp.search ?? null;

    const parts: string[] = ['Ürünler'];
    if (category) parts.push(category);
    if (brand) parts.push(brand);
    if (search) parts.push(`"${search}"`);

    return {
        title: parts.join(' — '),
        description: `SoftTrade'de ${parts.slice(1).join(', ')} kategorisindeki ürünleri inceleyin.`,
    };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProductsPage({ searchParams }: PageProps) {
    const sp = await searchParams;

    const filters: ProductFilters = {
        category: sp.category,
        brand: sp.brand,
        min_price: sp.min_price ? Number(sp.min_price) : undefined,
        max_price: sp.max_price ? Number(sp.max_price) : undefined,
        search: sp.search,
        sort: (sp.sort as ProductFilters['sort']) ?? 'newest',
        page: sp.page ? Number(sp.page) : 1,
        per_page: 20,
    };

    // Paralel veri çekimi
    const [{ data: products, meta }, categories, brands] = await Promise.all([
        getProducts(filters),
        getCategories(),
        getBrands(),
    ]);

    const hasActiveFilters =
        !!(filters.category || filters.brand || filters.min_price || filters.max_price || filters.search);

    return (
        <main className="min-h-screen bg-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Başlık */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">
                        {filters.search ? `"${filters.search}" araması` : 'Tüm Ürünler'}
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        {meta.total} ürün bulundu
                        {filters.category && ` · ${filters.category}`}
                        {filters.brand && ` · ${filters.brand}`}
                    </p>
                </div>

                {/* Layout: Sidebar + Grid */}
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* ── Sol Sidebar ──────────────────────────────────────────────── */}
                    <div className="lg:w-60 xl:w-64 shrink-0">
                        <div className="lg:sticky lg:top-6 bg-slate-800/50 border border-slate-700/50
                            rounded-2xl p-5">
                            <Suspense fallback={<div className="animate-pulse text-slate-600">Yükleniyor…</div>}>
                                <FilterSidebar categories={categories} brands={brands} />
                            </Suspense>
                        </div>
                    </div>

                    {/* ── Ürün Grid'i ──────────────────────────────────────────────── */}
                    <div className="flex-1 min-w-0">

                        {/* Mobil sıralama butonu (küçük ekranda sidebar gizli) */}
                        <div className="flex items-center justify-between mb-5 lg:hidden">
                            <span className="text-sm text-slate-400">{meta.total} ürün</span>
                        </div>

                        {products.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                                    {products.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                                <Pagination
                                    currentPage={meta.current_page}
                                    lastPage={meta.last_page}
                                    total={meta.total}
                                />
                            </>
                        ) : (
                            /* Boş durum */
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center mb-5">
                                    <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-semibold text-white mb-2">Ürün bulunamadı</h2>
                                <p className="text-slate-400 text-sm max-w-sm">
                                    {hasActiveFilters
                                        ? 'Filtrelerinizi değiştirmeyi veya temizlemeyi deneyin.'
                                        : 'Henüz ürün eklenmemiş. Lütfen daha sonra tekrar kontrol edin.'}
                                </p>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </main>
    );
}
