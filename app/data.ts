export const categories = [
  { name: "Plise Perde", description: "Dengeli ışık, mahremiyet ve geniş kumaş seçimi.", image: "/images/ai/plise-perde.webp", href: "/urunler/plise-perde" },
];

export const collections = [
  { name: "Diamond Series", group: "Plise perde", filtration: "%50 ışık filtrasyonu", colors: "10+ kumaş rengi", image: "/images/catalog/diamond.webp", href: "/urunler/plise-perde/diamond-serisi", badge: "En çok incelenen" },
  { name: "Blackout Series", group: "Plise perde", filtration: "%100 karartma", colors: "5 kumaş rengi", image: "/images/catalog/blackout.webp", href: "/urunler/plise-perde/diamond-serisi", badge: "Tam karartma" },
  { name: "Silver Series", group: "Plise perde", filtration: "%70 ışık filtrasyonu", colors: "Seçili modern tonlar", image: "/images/catalog/silver.webp", href: "/urunler/plise-perde/diamond-serisi", badge: "Isı kontrolü" },
];

export const galleryItems = [
  { title: "Diamond / doğal ışık dengesi", image: "/images/catalog/diamond.webp" },
  { title: "Blackout / derin mahremiyet", image: "/images/catalog/blackout.webp" },
  { title: "Kumaş dokuları / yakın plan", image: "/images/catalog/pages/page-03.webp" },
  { title: "Profil ve renk kombinasyonları", image: "/images/configurator/diamond-110-antrasit-bronz-3.webp" },
];

export const productGroups = [
  { id: "plise-perde", title: "Plise Perde", description: "Cam balkon, pencere, ofis ve yaşam alanları için ışık filtrasyonu %25'ten %100'e uzanan kumaş serileri.", image: "/images/ai/plise-perde.webp", href: "/urunler/plise-perde", tags: ["Diamond", "Blackout", "Silver", "Reina"] },
];

export type CategoryPageConfig = {
  slug: string;
  title: string;
  headline: string;
  description: string;
  image: string;
  metrics: Array<{ value: string; label: string }>;
  solutions: Array<{ title: string; description: string }>;
  specs: Array<{ label: string; value: string }>;
  featuredHref?: string;
  featuredTitle?: string;
  featuredText?: string;
};

export const categoryPages: Record<string, CategoryPageConfig> = {
  "plise-perde": { slug: "plise-perde", title: "Plise Perde", headline: "Işığı, mahremiyeti ve mekânın ritmini siz belirleyin.", description: "Cam balkon, pencere ve yaşam alanları için ölçüye özel plise perde; zengin kumaş, profil ve ışık filtrasyonu seçenekleriyle üretilir.", image: "/images/ai/plise-perde.webp", metrics: [{ value: "%25–100", label: "Işık kontrol aralığı" }, { value: "10+", label: "Kumaş ve renk seçeneği" }, { value: "Özel", label: "Milimetreye göre üretim" }, { value: "2 yıl", label: "Kumaş garantisi" }], solutions: [{ title: "Cam balkon", description: "Her cam kanadına uyarlanan ince profil ve kolay kullanım." }, { title: "Pencere", description: "Gün ışığını dengelerken mahremiyeti koruyan kompakt çözüm." }, { title: "Tavan ve özel form", description: "Standart dışı açıklıklara göre projelendirilen özel uygulamalar." }], specs: [{ label: "Kumaş seçenekleri", value: "Diamond, Honeycomb, Blackout, Silver ve Reina" }, { label: "Işık geçirgenliği", value: "%25, %50, %70 ve tam karartma" }, { label: "Profil renkleri", value: "Beyaz, gri, antrasit, bronz ve özel renk" }, { label: "Kullanım", value: "Manuel; projeye göre motorlu sistem" }], featuredHref: "/urunler/plise-perde/diamond-serisi", featuredTitle: "Diamond Series", featuredText: "Günlük yaşam alanları için dengeli ışık filtrasyonu ve gerçek katalog renkleri." },
};

export function getCategoryPage(slug: string) {
  return categoryPages[slug];
}
