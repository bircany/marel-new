import type { MetadataRoute } from "next";
import { categoryPages } from "@/app/data";
import { absoluteUrl } from "@/app/lib/site";

export const dynamic = "force-static";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages = [
    "/",
    "/urunler",
    "/urun-cesitleri",
    "/blog",
    "/iletisim",
    "/duyurular",
    "/gizlilik-politikasi",
    "/iade-ve-iptal-kosullari",
    "/kvkk-aydinlatma-metni",
    "/cerez-politikasi",
    "/mesafeli-satis-sozlesmesi",
    "/sss",
  ];

  const categoryEntries = Object.values(categoryPages).map((category) => ({
    url: absoluteUrl(`/urunler/${category.slug}`),
    changeFrequency: "monthly" as const,
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
  ];
}
