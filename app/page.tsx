import Link from "next/link";
import Image from "next/image";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import { absoluteUrl } from "@/app/lib/site";

import { formatMoney } from "@/app/lib/commerce";
import { ensureDatabase, getDb } from "@/db";

export const revalidate = 60;

export const metadata = {
  title: "Marel Plise Perde | Ana Sayfa",
  description: "Marel Plise Perde - Plise perde sistemlerinde özel ölçüye göre kaliteli üretim.",
};

export default async function Home() {
  await ensureDatabase();
  const db = getDb();
  let blogPosts: any[] = [];
  let products: any[] = [];
  try {
    const raw = await db.prepare("SELECT * FROM announcements WHERE published = 1 ORDER BY created_at DESC LIMIT 3").all();
    blogPosts = raw.results || [];
    const productsRaw = await db.prepare("SELECT * FROM products WHERE active = 1 ORDER BY sort_order ASC, created_at DESC LIMIT 8").all();
    products = productsRaw.results || [];
  } catch (err) {
    console.error(err);
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "HomeAndConstructionBusiness",
                "@id": `${absoluteUrl("/")}#organization`,
                name: "Marel Plise Perde",
                url: absoluteUrl("/"),
                logo: absoluteUrl("/icon.png"),
                image: absoluteUrl("/og.png"),
                email: "info@marelpliseperde.com",
                telephone: "+905467356602",
                address: {
                  "@type": "PostalAddress",
                  streetAddress: "Elbistan",
                  addressLocality: "Elbistan",
                  addressRegion: "Kahramanmaraş",
                  addressCountry: "TR",
                },
                geo: {
                  "@type": "GeoCoordinates",
                  latitude: 38.2045,
                  longitude: 37.1983
                },
                openingHoursSpecification: [
                  {
                    "@type": "OpeningHoursSpecification",
                    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                    opens: "08:30",
                    closes: "19:00"
                  }
                ],
                sameAs: ["https://wa.me/905467356602"],
              },
              {
                "@type": "WebSite",
                "@id": `${absoluteUrl("/")}#website`,
                name: "Marel Plise Perde",
                url: absoluteUrl("/"),
                inLanguage: "tr-TR",
                publisher: { "@id": `${absoluteUrl("/")}#organization` },
              },
            ],
          }).replace(/</g, "\\u003c"),
        }}
      />
      <SiteHeader />
      <main>
        {/* Yaren Plise Perde Inspired Hero Section */}
        <section className="relative w-full h-[60vh] md:h-[80vh] bg-neutral-900 flex items-center overflow-hidden">
          <Image
            src="/images/catalog/diamond.webp" // We use an existing high quality image for the hero background
            alt="Plise Perde Hero"
            fill
            priority
            style={{ objectFit: "cover", opacity: 0.6 }}
          />
          <div className="relative z-10 shop-container w-full">
            <div className="max-w-2xl text-white">
              <h1 className="text-5xl md:text-7xl font-light mb-4 tracking-tight" style={{fontFamily: "serif"}}>Özel Ölçü Plise Perde</h1>
              <div className="mt-8">
                <Link href="/urunler" className="inline-block bg-[#d4af37] hover:bg-[#c29a28] text-white px-8 py-3 text-sm font-medium tracking-wider transition-colors">
                  SİPARİŞ VERİN
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid Section */}
        <section className="py-16 bg-white">
          <div className="shop-container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.slug} className="group flex flex-col border border-neutral-200">
                  <Link href={`/urunler/${product.slug}`} className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                    <Image
                      src={product.image || '/images/real/diamond-beyaz-siyah-ip.jpeg'}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      style={{ objectFit: "cover" }}
                      className="transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>
                  <div className="p-4 text-center flex flex-col items-center justify-center bg-white">
                    <h3 className="text-sm font-medium text-neutral-800 mb-2 min-h-[40px]">
                      <Link href={`/urunler/${product.slug}`} className="hover:text-black">
                        {product.name}
                      </Link>
                    </h3>
                    <p className="text-sm text-neutral-500 mb-4">{formatMoney(Number(product.price || 0), "TRY")}</p>
                  </div>
                  <div className="w-full flex">
                      <Link href={`/urunler/${product.slug}`} className="w-full bg-[#d4af37] hover:bg-[#c29a28] text-white text-center py-3 text-xs font-medium tracking-wider transition-colors">
                        Sipariş Ver
                      </Link>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <Link href="/urunler" className="inline-block bg-[#d4af37] hover:bg-[#c29a28] text-white px-10 py-3 text-sm font-medium tracking-wider transition-colors">
                Tüm Ürünler
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20" style={{backgroundColor: "#f9f8f6"}}>
          <div className="shop-container">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
              <div className="lg:col-span-1">
                <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase mb-2 block">MAREL PLİSE PERDE</span>
                <h2 className="text-3xl md:text-4xl font-light text-neutral-900 mb-6" style={{fontFamily: "serif"}}>Plise Perdede Uzman Üretim</h2>
              </div>
              <div className="lg:col-span-2">
                <p className="text-neutral-600 mb-6 leading-relaxed">
                  Plise perdede uzman ekibimizle, ölçüye özel üretim ve modern tasarımları bir araya getiriyoruz. Kaliteli mekanizmalar, dayanıklı kumaşlar ve delmeden montaj seçenekleriyle hem şık hem de fonksiyonel çözümler sunuyoruz.
                </p>
                <p className="text-neutral-600 leading-relaxed mb-12">
                  İmalattan direkt satış avantajı, hızlı üretim ve güvenilir kargo süreçleriyle uygun fiyatlı ve güvenli bir alışveriş deneyimi sağlıyoruz.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div>
                    <div className="w-12 h-12 mb-4 text-[#b08d6a]">
                      <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 10.5L16.5 12.75M16.5 12.75L18.75 10.5M16.5 12.75V3.75M7.5 13.5L5.25 11.25M5.25 11.25L3 13.5M5.25 11.25V20.25M10.5 7.5h3" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900 mb-2">Ölçüye Özel Üretim</h3>
                    <p className="text-xs text-neutral-500 leading-relaxed">Pencerenize tam uyum sağlayan kişiye özel plise perde tasarımları. Hızlı üretim, sorunsuz montaj.</p>
                  </div>
                  <div>
                    <div className="w-12 h-12 mb-4 text-[#b08d6a]">
                      <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900 mb-2">Modern ve Şık Tasarım</h3>
                    <p className="text-xs text-neutral-500 leading-relaxed">Minimal ve zarif görünümlerle yaşam alanlarınıza estetik dokunuş. Her dekorasyona uyumlu seçenekler.</p>
                  </div>
                  <div>
                    <div className="w-12 h-12 mb-4 text-[#b08d6a]">
                      <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900 mb-2">Kolay Montaj</h3>
                    <p className="text-xs text-neutral-500 leading-relaxed">Delme gerektirmeyen pratik montaj seçenekleri. Kolay temizlenebilir kumaş yapısı.</p>
                  </div>
                  <div>
                    <div className="w-12 h-12 mb-4 text-[#b08d6a]">
                      <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900 mb-2">Kalite ve Dayanıklılık</h3>
                    <p className="text-xs text-neutral-500 leading-relaxed">Uzun ömürlü kullanım için yüksek kaliteli mekanizma ve kumaş seçenekleri. İmalattan direkt satış.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Showcase Section */}
        <section className="py-20" style={{backgroundColor: "#f1f0ec"}}>
          <div className="shop-container">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="md:w-1/2 relative">
                 <div className="relative aspect-[4/5] w-full max-w-md mx-auto">
                   <Image 
                     src="/images/catalog/blackout.webp" 
                     alt="Stil Sahibi Mekanlar"
                     fill
                     style={{objectFit: "cover"}}
                   />
                   <div className="absolute bottom-0 right-0 bg-[#111] p-8 max-w-[280px]">
                     <h3 className="text-2xl text-white font-light" style={{fontFamily: "serif"}}>Stil Sahibi Mekânlar İçin Özel Plise Koleksiyonu</h3>
                   </div>
                 </div>
              </div>
              <div className="md:w-1/2">
                <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase mb-2 block">MAREL PLİSE PERDE</span>
                <h2 className="text-3xl md:text-4xl font-light text-neutral-900 mb-6" style={{fontFamily: "serif"}}>Mekânınıza Değer Katan Tasarımlar</h2>
                <p className="text-neutral-600 mb-8 leading-relaxed max-w-md">
                  Yaşam alanlarınızı tamamlayan modern plise perde modellerimizi keşfedin. Her pencereye özel ölçü, dayanıklı mekanizma ve zengin renk seçenekleri ile hem estetik hem de fonksiyonel çözümler sunuyoruz.
                </p>
                <Link href="/urunler" className="inline-block bg-[#d4af37] hover:bg-[#c29a28] text-white px-8 py-3 text-sm font-medium tracking-wider transition-colors">
                  Ürünlerimizi Keşfedin
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Urun Cesitlerimiz Section */}
        <section className="py-20" style={{backgroundColor: "#fff"}}>
          <div className="container" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <h2 className="text-3xl md:text-4xl font-light text-neutral-900 mb-4" style={{fontFamily: "serif"}}>Ürün Çeşitlerimiz</h2>
              <p className="text-neutral-500 max-w-2xl mx-auto">Her mekana ve pencere tipine özel olarak üretilen, premium kalitede plise perde çözümlerimizi keşfedin.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 30 }}>
              {[
                { title: "Cam Balkon Plise Perde", img: "/images/real/diamond-beyaz-siyah-ip.jpeg" },
                { title: "Karartma (Blackout)", img: "/images/hero/marel-honeycomb-hero-v3.png" },
                { title: "Kış Bahçesi", img: "/images/catalog/blackout.webp" }
              ].map((cat, i) => (
                <Link href="/urun-cesitleri" key={i} style={{ display: "block", position: "relative", height: 280, borderRadius: 12, overflow: "hidden", textDecoration: "none" }}>
                  <Image src={cat.img} alt={cat.title} fill style={{ objectFit: "cover", transition: "transform 0.3s" }} className="hover:scale-105" />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0))" }} />
                  <div style={{ position: "absolute", bottom: 20, left: 20 }}>
                    <h3 style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 700 }}>{cat.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 40 }}>
              <Link href="/urun-cesitleri" className="inline-block bg-[#0f172a] hover:bg-[#1e293b] text-white px-8 py-3 text-sm font-medium tracking-wider transition-colors rounded-full">
                Tüm Çeşitleri Gör
              </Link>
            </div>
          </div>
        </section>

        {/* Blog Section */}
        {blogPosts.length > 0 && (
          <section className="py-20" style={{backgroundColor: "#f8fafc"}}>
            <div className="container" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
              <div style={{ textAlign: "center", marginBottom: 40 }}>
                <span style={{ color: "#d4af37", fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: 2 }}>Marel Blog</span>
                <h2 className="text-3xl md:text-4xl font-light text-neutral-900 mt-2 mb-4" style={{fontFamily: "serif"}}>Güncel İçeriklerimiz</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 30 }}>
                {blogPosts.map((post) => (
                  <Link href={`/blog/${post.slug}`} key={post.id} style={{ display: "block", background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", textDecoration: "none", transition: "transform 0.2s" }} className="hover:-translate-y-1">
                    <div style={{ position: "relative", height: 200, background: "#e2e8f0" }}>
                      <Image src={post.image_url || "/images/real/diamond-beyaz-siyah-ip.jpeg"} alt={post.title} fill style={{ objectFit: "cover" }} />
                    </div>
                    <div style={{ padding: 20 }}>
                      <h3 style={{ fontSize: "1.1rem", color: "#0f172a", fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>{post.title}</h3>
                      <p style={{ color: "#64748b", fontSize: "0.9rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.summary}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <div style={{ textAlign: "center", marginTop: 40 }}>
                <Link href="/blog" className="inline-block border-2 border-[#0f172a] text-[#0f172a] hover:bg-[#0f172a] hover:text-white px-8 py-3 text-sm font-medium tracking-wider transition-colors rounded-full">
                  Tüm Yazıları İncele
                </Link>
              </div>
            </div>
          </section>
        )}

      </main>
      <SiteFooter />
    </>
  );
}
