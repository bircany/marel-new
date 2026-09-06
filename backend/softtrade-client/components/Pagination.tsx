'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface PaginationProps {
    currentPage: number;
    lastPage: number;
    total: number;
}

export default function Pagination({ currentPage, lastPage, total }: PaginationProps) {
    const router = useRouter();
    const pathname = usePathname();
    const params = useSearchParams();

    if (lastPage <= 1) return null;

    function goTo(page: number) {
        const p = new URLSearchParams(params.toString());
        p.set('page', String(page));
        router.push(`${pathname}?${p.toString()}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Sayfa numaraları: max 7 göster
    const getPages = () => {
        const delta = 2;
        const pages: (number | '...')[] = [];
        const left = Math.max(2, currentPage - delta);
        const right = Math.min(lastPage - 1, currentPage + delta);

        pages.push(1);
        if (left > 2) pages.push('...');
        for (let i = left; i <= right; i++) pages.push(i);
        if (right < lastPage - 1) pages.push('...');
        if (lastPage > 1) pages.push(lastPage);

        return pages;
    };

    return (
        <div className="flex flex-col items-center gap-3 mt-10">
            <p className="text-xs text-slate-500">{total} ürün içinde</p>

            <div className="flex items-center gap-1.5">
                {/* Önceki */}
                <button
                    onClick={() => goTo(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="w-9 h-9 rounded-xl flex items-center justify-center
                     border border-slate-700 hover:border-indigo-500
                     text-slate-400 hover:text-white
                     disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {getPages().map((p, i) =>
                    p === '...' ? (
                        <span key={`dot-${i}`} className="w-9 h-9 flex items-center justify-center text-slate-500 text-sm">
                            …
                        </span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => goTo(p as number)}
                            className={`w-9 h-9 rounded-xl text-sm font-medium transition-all
                ${p === currentPage
                                    ? 'bg-indigo-600 text-white'
                                    : 'border border-slate-700 text-slate-400 hover:border-indigo-500 hover:text-white'
                                }`}
                        >
                            {p}
                        </button>
                    )
                )}

                {/* Sonraki */}
                <button
                    onClick={() => goTo(currentPage + 1)}
                    disabled={currentPage >= lastPage}
                    className="w-9 h-9 rounded-xl flex items-center justify-center
                     border border-slate-700 hover:border-indigo-500
                     text-slate-400 hover:text-white
                     disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
