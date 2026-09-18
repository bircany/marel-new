import type { GetServerSideProps } from "next";
import { listAnnouncements, listProducts } from "@/db";
import { siteUrl } from "@/lib/site";

const staticPaths = ["/", "/urunler", "/urun-cesitleri", "/plise-perdeler", "/blog", "/iletisim", "/sss", "/hakkimizda", "/mesafeli-satis-sozlesmesi", "/iade-ve-iptal-kosullari", "/gizlilik-politikasi", "/kvkk-aydinlatma-metni", "/cerez-politikasi"];
const escapeXml = (value: string) => value.replace(/[<>&'\"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char] ?? char);

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const [products, posts] = await Promise.all([listProducts(false), listAnnouncements(true)]).catch(() => [[], []] as const);
  const urls = [...staticPaths, ...products.map((product) => `/urunler/${product.slug}`), ...posts.map((post) => `/blog/${post.slug}`)];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((path) => `\n  <url><loc>${escapeXml(new URL(path, siteUrl).toString())}</loc></url>`).join("")}\n</urlset>`;
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  res.write(xml);
  res.end();
  return { props: {} };
};

export default function Sitemap() { return null; }
