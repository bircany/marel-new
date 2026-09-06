import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ImageGallery from '@/components/ImageGallery';
import ProductActions from '@/components/ProductActions';
import Tabs from '@/components/Tabs';
import ReviewSection from '@/components/ReviewSection';
import ProductCard from '@/components/ProductCard';
import StarRating from '@/components/StarRating';
import { getProductBySlug, getProducts } from '@/lib/serverApi';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageProps {
    params: Promise<{ slug: string }>;
}

// ─── Dynamic Metadata (SEO) ──────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    try {
        const product = await getProductBySlug(slug);
        return {
            title: product.name,
            description: product.description?.slice(0, 160) ?? `${product.name} — SoftTrade'de en iyi fiyatla`,
            openGraph: {
                title: product.name,
                description: product.description?.slice(0, 160) ?? '',
                images: product.cover_image?.url ? [{ url: product.cover_image.url }] : [],
            },
        };
    } catch {
        return { title: 'Ürün Bulunamadı' };
    }
}

// ─── Static Params (popüler ürünler) ──────────────────────────────────────────

export async function generateStaticParams() {
    try {
        const { data } = await getProducts({ sort: 'popular', per_page: 20 });
        return data.map((p) => ({ slug: p.slug }));
    } catch {
        return [];
    }
}

// ─── Server-Side Review Fetch ─────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

async function getProductReviews(slug: string) {
    try {
        const res = await fetch(`${BASE_URL}/products/${slug}/reviews`, {
            headers: { Accept: 'application/json' },
            next: { revalidate: 60 },
        });
        if (!res.ok) throw new Error();
        const json = await res.json();
        return {
            reviews: json.data ?? [],
            stats: json.stats ?? { total: 0, average: null, distribution: {} },
        };
    } catch {
        return { reviews: [], stats: { total: 0, average: null, distribution: {} } };
    }
}

async function getRelatedProducts(categoryId: number, excludeId: number) {
    try {
        const { data } = await getProducts({ per_page: 4 });
        return data.filter((p) => p.id !== excludeId).slice(0, 4);
    } catch {
        return [];
    }
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default async function ProductDetailPage({ params }: PageProps) {
    const { slug } = await params;

    let product;
    try {
        product = await getProductBySlug(slug);
    } catch {
        notFound();
    }
    const galleryImages =
        product.images && product.images.length > 0
            ? product.images
            : product.cover_image
                ? [product.cover_image]
                : [];

    // Paralel veri çekimi
    const [{ reviews, stats }, related] = await Promise.all([
        getProductReviews(slug),
        getRelatedProducts(product.category_id, product.id),
    ]);

    return (
        <main className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                    <Link href="/" className="hover:text-slate-600 transition-colors">Ana Sayfa</Link>
                    <span>/</span>
                    <Link href="/products" className="hover:text-slate-600 transition-colors">Ürünler</Link>
                    {product.category && (
                        <>
                            <span>/</span>
                            <Link
                                href={`/products?category=${product.category.slug}`}
                                className="hover:text-slate-600 transition-colors"
                            >
                                {product.category.name}
                            </Link>
                        </>
                    )}
                    <span>/</span>
                    <span className="text-slate-600 truncate max-w-[200px]">{product.name}</span>
                </nav>

                {/* ── Ana Layout: Galeri + Bilgi ────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">

                    {/* Sol: Galeri */}
                    <ImageGallery
                        images={galleryImages}
                        productName={product.name}
                    />

                    {/* Sağ: Bilgiler */}
                    <div className="flex flex-col gap-5">

                        {/* Marka */}
                        {product.brand && (
                            <Link
                                href={`/products?brand=${product.brand.slug}`}
                                className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors w-fit"
                            >
                                {product.brand.name}
                            </Link>
                        )}

                        {/* İsim */}
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
                            {product.name}
                        </h1>

                        {/* Rating Özeti */}
                        {stats.average !== null && (
                            <div className="flex items-center gap-2">
                                <StarRating rating={stats.average} size="sm" />
                                <span className="text-sm text-slate-400">
                                    {stats.average.toFixed(1)} ({stats.total} değerlendirme)
                                </span>
                            </div>
                        )}

                        {/* Fiyat Etiketi */}
                        <div className="flex items-end gap-3">
                            <span className="text-3xl font-bold text-slate-900">
                                {product.formatted_current_price}
                            </span>
                            {product.is_on_sale && (
                                <>
                                    <span className="text-lg text-slate-500 line-through">
                                        {product.formatted_price}
                                    </span>
                                    <span className="bg-red-500/10 text-red-400 text-xs font-bold
                                   px-2 py-0.5 rounded-full border border-red-500/20">
                                        -%{product.discount_percentage}
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Stok Durumu */}
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${product.in_stock ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className={`text-sm ${product.in_stock ? 'text-green-400' : 'text-red-400'}`}>
                                {product.in_stock ? 'Stokta Var' : 'Stokta Yok'}
                            </span>
                        </div>

                        {/* Ayırıcı */}
                        <div className="border-t border-slate-200" />

                        {/* Varyant Seçimi + Sepete Ekle */}
                        <ProductActions
                            productId={product.id}
                            productSlug={product.slug}
                            variants={product.variants ?? []}
                            optionAxes={product.option_axes ?? []}
                            stock={product.stock}
                            inStock={product.in_stock}
                            stockMode={product.stock_mode ?? 'product'}
                            measurementMode={product.measurement_mode ?? 'fixed'}
                            customMeasurementRule={product.custom_measurement_rule ?? null}
                            currentPrice={product.current_price}
                            formattedCurrentPrice={product.formatted_current_price}
                        />

                        {/* Kısa Bilgiler */}
                        <div className="grid grid-cols-2 gap-3 mt-2">
                            {[
                                { icon: '🚚', text: 'Ücretsiz Kargo' },
                                { icon: '↩️', text: '30 Gün İade' },
                                { icon: '🔒', text: 'Güvenli Ödeme' },
                                { icon: '📦', text: 'Hızlı Teslimat' },
                            ].map((info) => (
                                <div
                                    key={info.text}
                                    className="flex items-center gap-2 text-xs text-slate-400
                             bg-white rounded-lg px-3 py-2"
                                >
                                    <span>{info.icon}</span>
                                    {info.text}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Sekmeler: Açıklama + Yorumlar ────────────────────────────── */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8 mb-14">
                    <Tabs
                        tabs={[
                            {
                                label: 'Ürün Açıklaması',
                                content: (
                                    <div className="prose  prose-sm max-w-none text-slate-600 leading-relaxed">
                                        {product.description ? (
                                            <div dangerouslySetInnerHTML={{ __html: product.description }} />
                                        ) : (
                                            <p className="text-slate-500">Bu ürün için henüz açıklama eklenmemiş.</p>
                                        )}
                                    </div>
                                ),
                            },
                            {
                                label: `Yorumlar (${stats.total})`,
                                content: (
                                    <ReviewSection
                                        productId={product.id}
                                        productSlug={slug}
                                        initialReviews={reviews}
                                        initialStats={stats}
                                    />
                                ),
                            },
                        ]}
                    />
                </div>

                {/* ── İlgili Ürünler ───────────────────────────────────────────── */}
                {related.length > 0 && (
                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Benzer Ürünler</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {related.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </section>
                )}

            </div>
        </main>
    );
}
