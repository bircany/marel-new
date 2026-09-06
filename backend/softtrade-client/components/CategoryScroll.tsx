'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Category } from '@/types';

interface CategoryScrollProps {
    categories: Category[];
}

export default function CategoryScroll({ categories }: CategoryScrollProps) {
    const router = useRouter();

    const top = categories.filter((c) => !c.parent_id);

    const colors = [
        'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30',
        'from-purple-500/20 to-purple-600/10 border-purple-500/30',
        'from-pink-500/20 to-pink-600/10 border-pink-500/30',
        'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30',
        'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
        'from-amber-500/20 to-amber-600/10 border-amber-500/30',
    ];

    return (
        <section className="py-8">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-white">Kategoriler</h2>
                <Link href="/products" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                    Tümünü gör →
                </Link>
            </div>

            {/* Yatay kaydırma */}
            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory">
                {top.map((cat, i) => (
                    <button
                        key={cat.id}
                        onClick={() => router.push(`/products?category=${cat.slug}`)}
                        className={`snap-start shrink-0 flex flex-col items-center gap-2.5 p-4 rounded-2xl
                        bg-gradient-to-br ${colors[i % colors.length]}
                        border transition-all duration-200
                        hover:scale-105 hover:shadow-lg w-28`}
                    >
                        {/* Kategori görseli veya emoji */}
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800/50 flex items-center justify-center">
                            {cat.image_url ? (
                                <Image src={cat.image_url} alt={cat.name} width={48} height={48} className="object-cover" />
                            ) : (
                                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            )}
                        </div>
                        <span className="text-xs font-medium text-slate-200 text-center leading-tight line-clamp-2">
                            {cat.name}
                        </span>
                        {cat.products_count !== undefined && (
                            <span className="text-[10px] text-slate-400">{cat.products_count} ürün</span>
                        )}
                    </button>
                ))}
            </div>
        </section>
    );
}
