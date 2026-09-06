'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import type { Category, Brand } from '@/types';

const SORT_OPTIONS = [
    { value: 'newest', label: 'En Yeni' },
    { value: 'price_asc', label: 'Fiyat: Artan' },
    { value: 'price_desc', label: 'Fiyat: Azalan' },
    { value: 'popular', label: 'En Çok Satan' },
] as const;

interface FilterSidebarProps {
    categories: Category[];
    brands: Brand[];
}

export default function FilterSidebar({ categories, brands }: FilterSidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const params = useSearchParams();

    // URL güncelleme helper'ı
    const setParam = useCallback(
        (key: string, value: string | null) => {
            const p = new URLSearchParams(params.toString());
            if (value === null || value === '') {
                p.delete(key);
            } else {
                p.set(key, value);
            }
            p.delete('page'); // filtre değişince sayfa sıfırlansın
            router.push(`${pathname}?${p.toString()}`);
        },
        [params, pathname, router]
    );

    const activeCategory = params.get('category') ?? '';
    const activeBrand = params.get('brand') ?? '';
    const activeSort = params.get('sort') ?? 'newest';
    const minPrice = params.get('min_price') ?? '';
    const maxPrice = params.get('max_price') ?? '';

    const hasFilters = !!(activeCategory || activeBrand || minPrice || maxPrice);

    return (
        <aside className="w-full space-y-6">

            {/* Sıralama */}
            <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Sıralama</h3>
                <div className="space-y-1">
                    {SORT_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setParam('sort', opt.value)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all
                ${activeSort === opt.value
                                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Separator */}
            <div className="border-t border-slate-700/50" />

            {/* Kategoriler */}
            <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Kategori</h3>
                <div className="space-y-1">
                    <button
                        onClick={() => setParam('category', null)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all
              ${!activeCategory
                                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                    >
                        Tümü
                    </button>
                    {categories.filter((c) => !c.parent_id).map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setParam('category', cat.slug)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all
                ${activeCategory === cat.slug
                                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                        >
                            <span>{cat.name}</span>
                            {cat.products_count !== undefined && (
                                <span className="ml-auto float-right text-xs text-slate-600">{cat.products_count}</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Separator */}
            <div className="border-t border-slate-700/50" />

            {/* Markalar */}
            {brands.length > 0 && (
                <div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Marka</h3>
                    <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                        <button
                            onClick={() => setParam('brand', null)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all
                ${!activeBrand
                                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                        >
                            Tümü
                        </button>
                        {brands.map((brand) => (
                            <button
                                key={brand.id}
                                onClick={() => setParam('brand', brand.slug)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all
                  ${activeBrand === brand.slug
                                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                            >
                                {brand.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Separator */}
            <div className="border-t border-slate-700/50" />

            {/* Fiyat Aralığı */}
            <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Fiyat Aralığı</h3>
                <div className="flex gap-2 items-center">
                    <input
                        type="number"
                        placeholder="Min ₺"
                        defaultValue={minPrice}
                        onBlur={(e) => setParam('min_price', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900/70 border border-slate-700
                       text-white text-sm placeholder-slate-600 focus:border-indigo-500
                       focus:outline-none transition-all"
                    />
                    <span className="text-slate-600 text-sm shrink-0">—</span>
                    <input
                        type="number"
                        placeholder="Max ₺"
                        defaultValue={maxPrice}
                        onBlur={(e) => setParam('max_price', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900/70 border border-slate-700
                       text-white text-sm placeholder-slate-600 focus:border-indigo-500
                       focus:outline-none transition-all"
                    />
                </div>
            </div>

            {/* Filtreleri Temizle */}
            {hasFilters && (
                <button
                    onClick={() => router.push(pathname)}
                    className="w-full py-2 rounded-xl border border-slate-700 hover:border-red-500/50
                     text-slate-400 hover:text-red-400 text-sm transition-all"
                >
                    Filtreleri Temizle
                </button>
            )}
        </aside>
    );
}
