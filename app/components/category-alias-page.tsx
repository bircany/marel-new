import Link from "next/link";
import { CatalogBrowser } from "@/app/components/catalog-browser";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { listProducts } from "@/db";

const categoryNotes: Record<string, { title: string; text: string; rootCategory: string }> = {
  sineklikler: {
    title: "Sineklikler",
    text: "Menteşeli, sabit, akordiyon, sürme ve evcil hayvan tüllü sistemler için Marel ürün akışına uygun kategori vitrini.",
    rootCategory: "Sineklikler",
  },
  perdeler: {
    title: "Perdeler",
    text: "Marel katalog fotoğraflarındaki plise perde serileri burada ayrı ürünler olarak listelenir.",
    rootCategory: "Perdeler",
  },
  "plise-perdeler": {
    title: "Plise Perdeler",
    text: "Her seri klasöründeki her fotoğraf ayrı renk/model ürünü olarak tanımlandı.",
    rootCategory: "Perdeler",
  },
  tutamaklar: {
    title: "Tutamaklar",
    text: "Merdiven, kapı ve yardımcı montaj parçaları için ürün grubu sayfası.",
    rootCategory: "Tutamaklar",
  },
  profiller: {
    title: "Profiller",
    text: "Perde ve sineklik sistemlerinde kullanılan profil seçenekleri için kategori sayfası.",
    rootCategory: "Profiller",
  },
  "kosebentler-1": {
    title: "Köşebentler",
    text: "Montaj ve bağlantı ürünleri için kategori sayfası.",
    rootCategory: "Köşebentler",
  },
  aksesuarlar: {
    title: "Aksesuarlar",
    text: "Sineklik tülü, bağlantı ekipmanı ve pencere-kapı aksesuarları için kategori vitrini.",
    rootCategory: "Aksesuarlar",
  },
  "separator-kapi": {
    title: "Seperatör Kapılar",
    text: "Işık yalıtımlı ve termal separatör kapı çözümleri için kategori sayfası.",
    rootCategory: "Separatör Kapı",
  },
  "sperator-perdeler": {
    title: "Seperatör Kapılar",
    text: "Işık yalıtımlı ve termal separatör kapı çözümleri için kategori sayfası.",
    rootCategory: "Separatör Kapı",
  },
  "otomatik-panjurlar": {
    title: "Otomatik Panjurlar",
    text: "Motorlu panjur ve kumanda sistemleri için kategori sayfası.",
    rootCategory: "Otomatik Panjurlar",
  },
};

export async function CategoryAliasPage({ slug }: { slug: keyof typeof categoryNotes }) {
  const config = categoryNotes[slug] || { title: slug, text: "", rootCategory: slug };
  // Category landing pages should still show catalog items when an older
  // product record has not yet had its active flag backfilled.
  const allProducts = await listProducts(slug === "perdeler" || slug === "plise-perdeler");

  // Filter by rootCategory or category text match
  const targetRoot = config.rootCategory.toLowerCase();
  const products = allProducts.filter((p) => {
    const pRoot = ((p as any).rootCategory || "").toLowerCase();
    const pCat = (p.category || "").toLowerCase();

    if (slug === "otomatik-panjurlar") {
      return pRoot.includes("panjur") || pCat.includes("panjur");
    }
    if (slug === "separator-kapi" || slug === "sperator-perdeler") {
      return (
        pRoot.includes("separat") ||
        pRoot.includes("seperat") ||
        pCat.includes("separat") ||
        pCat.includes("seperat")
      );
    }
    if (slug === "tutamaklar") {
      return pRoot.includes("tutamak") || pCat.includes("tutamak");
    }
    if (slug === "aksesuarlar") {
      return (
        pRoot.includes("aksesuar") ||
        pCat.includes("aksesuar") ||
        pCat.includes("tül") ||
        pCat.includes("tul")
      );
    }
    if (slug === "sineklikler") {
      return (
        (pRoot.includes("sineklik") || pCat.includes("sineklik")) &&
        !pCat.includes("aksesuar") &&
        !pCat.includes("tül")
      );
    }
    if (slug === "perdeler" || slug === "plise-perdeler") {
      return pRoot.includes("perde") || pRoot.includes("plise") || pCat.includes("perde") || pCat.includes("plise");
    }

    return pRoot === targetRoot || pCat.includes(targetRoot);
  });
  // Some legacy catalog rows have no root/category metadata. The plise
  // catalog is still the intended content for these aliases, so do not show
  // an empty state when the source contains products but metadata is sparse.
  const visibleProducts = products.length > 0 || (slug !== "perdeler" && slug !== "plise-perdeler")
    ? products
    : allProducts;

  return (
    <>
      <SiteHeader />
      <main className="catalog-page-main alias-catalog-page">
        <div className="catalog-page-header shop-container">
          <div className="breadcrumbs">
            <Link href="/">Ana sayfa</Link>
            <span>/</span>
            <span>{config.title}</span>
          </div>
          <h1 className="catalog-page-title">{config.title}</h1>
          <p className="alias-catalog-copy">{config.text}</p>
        </div>

        <section className="catalog-browser-section shop-container">
          {visibleProducts.length > 0 ? (
            <CatalogBrowser products={visibleProducts} />
          ) : (
            <div className="alias-empty-category">
              <h2>{config.title} ürünleri hazırlanıyor.</h2>
              <p>Bu kategori sayfası oluşturuldu. Ürün girişi yapıldığında burada listelenecek.</p>
              <Link href="/plise-perdeler">Marel plise perdeleri incele</Link>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
