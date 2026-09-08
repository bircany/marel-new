import { redirect, notFound } from "next/navigation";

const PAGE_REDIRECTS: Record<string, string> = {
  iletisim: "/iletisim",
  "mesafeli-satis-sozlesmesi": "/mesafeli-satis-sozlesmesi",
  gizlilikguvenlikpolitikasi: "/gizlilik-politikasi",
  "tuketici-haklari-cayma-iptal-iade-kosullari": "/iade-ve-iptal-kosullari",
  "kisisel-veriler-politikasi": "/kvkk-aydinlatma-metni",
  "cerez-politikasi": "/cerez-politikasi",
  sss: "/sss",
  duyurular: "/duyurular",
};

export default async function ShopifyPagesFallback({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const target = PAGE_REDIRECTS[slug.toLowerCase()];

  if (target) {
    redirect(target);
  }

  notFound();
}
