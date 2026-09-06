export function ProductCardSkeleton() {
    return (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden animate-pulse">
            <div className="aspect-square bg-slate-700/40" />
            <div className="p-4 space-y-3">
                <div className="h-3 bg-slate-700/60 rounded w-1/3" />
                <div className="h-4 bg-slate-700/60 rounded w-3/4" />
                <div className="h-4 bg-slate-700/60 rounded w-1/2" />
                <div className="h-10 bg-slate-700/40 rounded-xl mt-2" />
            </div>
        </div>
    );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
    return (
        <tr>
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} className="p-4">
                    <div className="h-5 bg-slate-800/50 rounded animate-pulse" />
                </td>
            ))}
        </tr>
    );
}

export function DetailSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="aspect-square bg-slate-800/50 rounded-2xl" />
                <div className="space-y-4 py-4">
                    <div className="h-4 bg-slate-700/60 rounded w-1/4" />
                    <div className="h-6 bg-slate-700/60 rounded w-3/4" />
                    <div className="h-4 bg-slate-700/60 rounded w-1/3" />
                    <div className="h-8 bg-slate-700/60 rounded w-1/2 mt-4" />
                    <div className="h-12 bg-slate-700/40 rounded-xl mt-6" />
                </div>
            </div>
        </div>
    );
}
