import Link from "next/link";
import Image from "next/image";
import type { GetStaticProps, InferGetStaticPropsType } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

type Product = { category: string; image?: string };

export const getStaticProps: GetStaticProps<{ products: Product[] }> = async () => {
  try {
    const { listProducts } = await import("@/db");
    const products = await listProducts(true);
    return { props: { products: JSON.parse(JSON.stringify(products)) }, revalidate: 60 };
  } catch {
    return { props: { products: [] }, revalidate: 30 };
  }
};

export default function ProductCategories({ products }: InferGetStaticPropsType<typeof getStaticProps>) {
  const groups = Array.from(new Set(products.map((p) => p.category))).map((category) => ({ category, item: products.find((p) => p.category === category) }));
  return <><SiteHeader /><main style={{ background: "#f8f7f2", minHeight: "100vh", padding: "42px 20px 90px" }}><div style={{ maxWidth: 1240, margin: "0 auto" }}><span style={{ color: "#a8792a", fontWeight: 800, letterSpacing: ".12em", fontSize: 12 }}>MAREL KATALOG</span><h1 style={{ fontSize: "clamp(2rem,5vw,3.5rem)", color: "#14213d", margin: "10px 0" }}>Plise perde serileri</h1><p style={{ color: "#64748b", maxWidth: 620, lineHeight: 1.7 }}>Her seri için kumaş ve renk seçeneklerini inceleyin.</p><div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }}>{groups.map(({ category, item }) => { const filter = category.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, ""); return <Link key={category} href={`/urunler?filter=${encodeURIComponent(filter)}`} style={{ display: "grid", gridTemplateColumns: "170px minmax(0,1fr) auto", alignItems: "center", gap: 24, width: "100%", background: "#fff", border: "1px solid #e2ddd1", borderRadius: 14, overflow: "hidden", color: "#14213d", textDecoration: "none" }}><div style={{ position: "relative", height: 108, background: "#f2f1ec" }}>{item?.image && <Image src={item.image} alt={`${category} plise perde`} fill sizes="170px" style={{ objectFit: "cover" }} />}</div><span style={{ fontWeight: 800, fontSize: 19 }}>{category.replace("TÜLLE", "TULLE")}</span><span style={{ color: "#a8792a", fontSize: 24, padding: "0 24px" }}>→</span></Link>; })}</div></div></main><SiteFooter /></>;
}

