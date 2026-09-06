export default function Loading() {
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 animate-fade-in">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-2 border-slate-700" />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500
                          animate-spin" />
                </div>
                <p className="text-sm text-slate-500">Yükleniyor…</p>
            </div>
        </div>
    );
}
