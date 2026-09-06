import Link from 'next/link';

export default function NotFound() {
    return (
        <main className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
            <div className="text-center py-20 animate-fade-in">
                <div className="text-8xl font-black text-transparent bg-clip-text
                        bg-gradient-to-br from-indigo-400 to-purple-500 mb-4">
                    404
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Sayfa Bulunamadı</h1>
                <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto">
                    Aradığınız sayfa mevcut değil veya taşınmış olabilir.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/" className="btn-primary">Ana Sayfaya Dön</Link>
                    <Link href="/products" className="btn-ghost">Ürünlere Göz At</Link>
                </div>
            </div>
        </main>
    );
}
