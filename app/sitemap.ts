import type { MetadataRoute } from "next";
import { categoryPages } from "@/app/data";
import { absoluteUrl } from "@/app/lib/site";
import { stListProducts } from "@/app/lib/softtrade";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await stListProducts(false, "Marel").catch(() => [] as Awaited<ReturnType<typeof stListProducts>>);
  const now = new Date();
  const staticPages = [
    "/",
    "/urunler",
    "/siparis-takip",
    "/iletisim",
    "/gizlilik-politikasi",
    "/iade-ve-iptal-kosullari",
    "/kvkk-aydinlatma-metni",
    "/cerez-politikasi",
    "/mesafeli-satis-sozlesmesi",
    "/gizlilik-ve-iade-kosullari",
  ];

  const categoryEntries = Object.values(categoryPages).map((category) => ({
    url: absoluteUrl(`/urunler/${category.slug}`),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const productEntries = products.map((product) => ({
    url: absoluteUrl(`/urunler/${product.slug}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    ...staticPages.map((path) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.7,
    })),
    ...categoryEntries,
    ...productEntries,
  ];
}
