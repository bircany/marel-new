export const categories = [
  { name: "Plise Perde", description: "Dengeli ışık, mahremiyet ve geniş kumaş seçimi.", image: "/images/ai/plise-perde.webp", href: "/urunler/plise-perde" },
  { name: "Jaluzi Perde", description: "Ayarlanabilir ışık kontrolü ve net mimari çizgiler.", image: "/images/ai/jaluzi-perde.webp", href: "/urunler/jaluzi-perde" },
  { name: "Zip Perde", description: "Dış cephe, teras ve geniş açıklıklar için güçlü koruma.", image: "/images/ai/zip-perde.webp", href: "/urunler/zip-perde" },
  { name: "Sineklik", description: "Pencere ve kapılar için ölçüye özel, pratik sistemler.", image: "/images/ai/sineklik.webp", href: "/urunler/sineklik" },
  { name: "Sürgülü Kapılar", description: "İç ve dış mekân geçişlerinde hafif, modern çözümler.", image: "/images/ai/surgulu-kapi.webp", href: "/urunler/surgulu-kapilar" },
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
  { id: "jaluzi-perde", title: "Jaluzi Perde", description: "Alüminyum ve dekoratif yüzey seçenekleriyle hassas ışık yönlendirmesi ve kolay bakım.", image: "/images/ai/jaluzi-perde.webp", href: "/urunler/jaluzi-perde", tags: ["Alüminyum", "Ahşap görünüm", "Motorlu opsiyon"] },
  { id: "zip-perde", title: "Zip Perde", description: "Teras, veranda ve geniş cephelerde rüzgâr dayanımı ve güneş kontrolü sağlayan dış mekân sistemi.", image: "/images/ai/zip-perde.webp", href: "/urunler/zip-perde", tags: ["Dış mekân", "Güneş kontrolü", "Motorlu sistem"] },
  { id: "sineklik", title: "Sineklik", description: "Pencere ve kapılarda sabit, sürme ve plise seçenekleriyle havalandırmadan ödün vermeyen çözüm.", image: "/images/ai/sineklik.webp", href: "/urunler/sineklik", tags: ["Pencere", "Kapı", "Sürme", "Plise"] },
  { id: "surgulu-kapilar", title: "Sürgülü Kapılar", description: "Mekânları bölmeden tanımlayan, geniş açıklıklara uyarlanan modern geçiş sistemleri.", image: "/images/ai/surgulu-kapi.webp", href: "/urunler/surgulu-kapilar", tags: ["İç mekân", "Geniş açıklık", "Özel ölçü"] },
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
  "jaluzi-perde": { slug: "jaluzi-perde", title: "Jaluzi Perde", headline: "Işığı tek bir hareketle hassas biçimde yönetin.", description: "Alüminyum veya dekoratif yüzey seçenekleriyle çalışma alanları ve modern yaşam mekânlarında kontrollü gölge, kolay bakım ve net mimari çizgiler.", image: "/images/ai/jaluzi-perde.webp", metrics: [{ value: "25–50 mm", label: "Lamel seçenekleri" }, { value: "180°", label: "Ayarlanabilir ışık yönü" }, { value: "Kolay", label: "Silinebilir yüzey bakımı" }, { value: "Özel", label: "Ölçüye göre üretim" }], solutions: [{ title: "Alüminyum jaluzi", description: "Neme dayanıklı, hafif ve modern çalışma alanlarına uygun." }, { title: "Ahşap görünüm", description: "Sıcak iç mekân dili için dekoratif lamel seçenekleri." }, { title: "Motorlu jaluzi", description: "Geniş açıklıklarda uzaktan kontrollü kullanım konforu." }], specs: [{ label: "Lamel genişliği", value: "25 mm ve 50 mm" }, { label: "Kontrol", value: "İpli, zincirli veya motorlu" }, { label: "Montaj", value: "Duvar, tavan ya da doğrama üzeri" }, { label: "Kullanım alanı", value: "Ofis, mutfak, çalışma ve yaşam alanları" }] },
  "zip-perde": { slug: "zip-perde", title: "Zip Perde", headline: "Geniş cephelerde güneşi ve rüzgârı kontrol altına alın.", description: "Teras, veranda ve dış cephelerde kumaşı yan kanallarda sabitleyen güçlü zip sistemi; güneş kontrolü ve dış mekân konforu için projeye özel hazırlanır.", image: "/images/ai/zip-perde.webp", metrics: [{ value: "Dış mekân", label: "Cepheye uygun sistem" }, { value: "Motorlu", label: "Uzaktan kontrol seçeneği" }, { value: "UV", label: "Güneş korumalı kumaş" }, { value: "Güçlü", label: "Yan kanallı yapı" }], solutions: [{ title: "Teras ve veranda", description: "Açık alanlarda güneş yükünü azaltan konforlu gölgelendirme." }, { title: "Geniş cam cephe", description: "Manzarayı korurken parlamayı ve ısı kazanımını sınırlar." }, { title: "Ticari alan", description: "Kafe, restoran ve mağaza cephelerine ölçeklenebilir uygulama." }], specs: [{ label: "Kumaş", value: "Screen, blackout ve projeye özel teknik kumaş" }, { label: "Kasa", value: "Ekstrüzyon alüminyum kapalı kasa" }, { label: "Kontrol", value: "Motor, kumanda ve otomasyon seçeneği" }, { label: "Renk", value: "Standart RAL tonları ve proje rengi" }] },
  "sineklik": { slug: "sineklik", title: "Sineklik", headline: "Temiz hava içeride, istenmeyen misafirler dışarıda kalsın.", description: "Pencere, balkon ve kapılar için sabit, plise veya sürme sineklik çözümleri; açıklığın ölçüsüne ve kullanım sıklığına göre hazırlanır.", image: "/images/ai/sineklik.webp", metrics: [{ value: "3 sistem", label: "Sabit, plise ve sürme" }, { value: "İnce", label: "Görüşü koruyan tül" }, { value: "Pratik", label: "Kolay açma ve kapama" }, { value: "Özel", label: "Doğramaya uygun ölçü" }], solutions: [{ title: "Plise sineklik", description: "Kapı ve geniş açıklıklarda katlanarak toplanan pratik sistem." }, { title: "Sürme sineklik", description: "Sürgülü doğramalarda ray üzerinde sessiz ve rahat kullanım." }, { title: "Sabit sineklik", description: "Sık açılmayan pencereler için sade ve ekonomik çözüm." }], specs: [{ label: "Tül seçenekleri", value: "Standart fiberglas, dayanımlı ve evcil hayvan tülü" }, { label: "Profil", value: "İnce alüminyum profil ve farklı renk seçenekleri" }, { label: "Uygulama", value: "Pencere, balkon kapısı ve sürme doğrama" }, { label: "Bakım", value: "Kolay temizlenebilir, değiştirilebilir tül" }] },
  "surgulu-kapilar": { slug: "surgulu-kapilar", title: "Sürgülü Kapılar", headline: "Mekânları bölmeden tanımlayan akıcı geçişler oluşturun.", description: "İç ve dış mekân geçişlerinde geniş açıklıkları verimli kullanan, ince çerçeveli ve ölçüye özel sürgülü kapı sistemleri.", image: "/images/ai/surgulu-kapi.webp", metrics: [{ value: "Geniş", label: "Açıklıklara uyarlanabilir" }, { value: "Sessiz", label: "Akıcı ray hareketi" }, { value: "İnce", label: "Modern çerçeve yapısı" }, { value: "Özel", label: "Projeye göre üretim" }], solutions: [{ title: "Balkon geçişi", description: "İç ve dış mekân arasında ferah, kesintisiz bağlantı." }, { title: "Mekân bölücü", description: "Işığı kaybetmeden yaşam alanlarını işlevsel olarak ayırır." }, { title: "Geniş cephe", description: "Büyük açıklıklarda dengeli taşıma ve kolay hareket." }], specs: [{ label: "Kanat düzeni", value: "Tek, çift veya çoklu sürme kanat" }, { label: "Çerçeve", value: "İnce alüminyum profil ve proje rengi" }, { label: "Dolgu", value: "Cam, panel veya projeye özel kombinasyon" }, { label: "Ray", value: "Zemin ve açıklığa göre seçilen taşıyıcı sistem" }] },
};

export function getCategoryPage(slug: string) {
  return categoryPages[slug];
}
