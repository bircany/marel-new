import type { Metadata } from 'next';
import Link from 'next/link';
import HeroBanner from '@/components/HeroBanner';
import CategoryScroll from '@/components/CategoryScroll';
import ProductCard from '@/components/ProductCard';
import { getFeaturedProducts, getCategories } from '@/lib/serverApi';

async function getPublicSettings() {
  const base = process.env.SERVER_API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!base) return null;

  try {
    const res = await fetch(`${base}/settings/public`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

export const metadata: Metadata = {
  title: 'SoftTrade — Güvenilir Alışveriş',
  description:
    'Binlerce ürün, en iyi fiyatlar. Elektronik, giyim, ev & yaşam ve daha fazlası.',
  openGraph: {
    title: 'SoftTrade',
    description: 'Güvenilir e-ticaret platformu',
    type: 'website',
  },
};

export default async function HomePage() {
  // Paralel SSR veri çekimi
  const [products, categories] = await Promise.all([
    getFeaturedProducts(8),
    getCategories(),
  ]);
  const settings = await getPublicSettings();
  const homepage = settings?.homepage ?? {};
  const pages = settings?.pages ?? {};

  if (pages.home === false) {
    return (
      <main className="min-h-screen bg-slate-900 px-4 py-16">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-700 bg-slate-800/40 p-8 text-center">
          <h1 className="text-2xl font-bold text-white">Anasayfa Gecici Olarak Kapali</h1>
          <p className="text-slate-400 mt-2">Lutfen daha sonra tekrar deneyin.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Hero */}
        <HeroBanner title={homepage.hero_title} subtitle={homepage.hero_subtitle} />

        {/* Kategoriler */}
        <CategoryScroll categories={categories} />

        {/* Öne Çıkan Ürünler */}
        <section className="py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Öne Çıkan Ürünler</h2>
              <p className="text-slate-400 text-sm mt-1">En yeni eklemeler</p>
            </div>
            <Link
              href="/products"
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
            >
              Tümünü gör
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-lg font-medium">Henüz ürün eklenmemiş</p>
            </div>
          )}
        </section>

        {/* Avantajlar Bandı */}
        <section className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🚚', title: 'Ücretsiz Kargo', desc: '150₺ üzeri siparişlerde' },
            { icon: '🔒', title: 'Güvenli Ödeme', desc: 'SSL korumalı ödeme sistemi' },
            { icon: '↩️', title: 'Kolay İade', desc: '30 gün içinde iade garantisi' },
            { icon: '⚡', title: 'Hızlı Teslimat', desc: 'Aynı gün kargo imkânı' },
          ].map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-center text-center p-5 rounded-2xl
                         bg-slate-800/50 border border-slate-700/50 gap-2"
            >
              <span className="text-3xl">{item.icon}</span>
              <h3 className="text-sm font-semibold text-white">{item.title}</h3>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </div>
          ))}
        </section>

      </div>
    </main>
  );
}
