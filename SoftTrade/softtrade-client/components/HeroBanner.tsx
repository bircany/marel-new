import Link from 'next/link';

interface HeroBannerProps {
    title?: string;
    subtitle?: string;
}

export default function HeroBanner({ title, subtitle }: HeroBannerProps) {
    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 py-16 px-8 md:px-14 mb-10">
            {/* Dekoratif daireler */}
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-10 w-60 h-60 bg-white/5 rounded-full blur-3xl" />

            {/* İçerik */}
            <div className="relative z-10 max-w-xl">
                <span className="inline-block bg-white/15 backdrop-blur-sm text-white text-xs font-semibold
                         px-3 py-1 rounded-full mb-4 border border-white/20">
                    🔥 Yeni Sezon Fırsatları
                </span>
                <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4">
                    {title ?? 'En Iyi Urunler'}
                    <br />
                    <span className="text-yellow-300">En Iyi Fiyatlar</span>
                </h1>
                <p className="text-white/75 text-base md:text-lg mb-8 leading-relaxed">
                    {subtitle ?? 'Binlerce urun arasindan ihtiyaciniza en uygun olani bulun. Guvenli odeme, hizli teslimat.'}
                </p>
                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-indigo-700
                       font-semibold text-sm hover:bg-white/90 transition-all shadow-lg"
                    >
                        Alışverişe Başla
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                    <Link
                        href="/products?sort=popular"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/15 text-white
                       font-semibold text-sm hover:bg-white/25 transition-all border border-white/30"
                    >
                        En Çok Satanlar
                    </Link>
                </div>
            </div>

            {/* Dekor sayısı */}
            <div className="absolute bottom-6 right-6 hidden md:flex gap-6">
                {[
                    { num: '10K+', label: 'Ürün' },
                    { num: '50K+', label: 'Müşteri' },
                    { num: '%99', label: 'Memnuniyet' },
                ].map((stat) => (
                    <div key={stat.label} className="text-center">
                        <div className="text-2xl font-extrabold text-white">{stat.num}</div>
                        <div className="text-xs text-white/60">{stat.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
