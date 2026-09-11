import Link from "next/link";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";
import { listProducts } from "@/db";
import { absoluteUrl } from "@/app/lib/site";

export const metadata = { title: "Ürün Çeşitlerimiz | Marel Plise Perde", description: "Marel plise perde serileri ve tüm renk seçenekleri.", alternates: { canonical: absoluteUrl("/urun-cesitleri") } };

export default async function UrunCesitleriPage() {
  const products = await listProducts(true);
  const groups = Array.from(new Set(products.map((product) => product.category))).map((category) => ({ category, items: products.filter((p) => p.category === category) }));
  return <><SiteHeader /><main style={{ background: "#f8f7f2", minHeight: "100vh", padding: "42px 20px 90px" }}><div style={{ maxWidth: 1240, margin: "0 auto" }}>
    <div style={{ marginBottom: 40 }}><span style={{ color: "#a8792a", fontWeight: 800, letterSpacing: ".12em", fontSize: 12 }}>MAREL KATALOG</span><h1 style={{ fontSize: "clamp(2rem,5vw,3.5rem)", color: "#14213d", margin: "10px 0" }}>Plise perde serileri</h1><p style={{ color: "#64748b", maxWidth: 620, lineHeight: 1.7 }}>Her seri için kumaş ve renk seçeneklerini inceleyin. Bir ürüne dokunarak ayrı ürün sayfasına geçin.</p></div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14, maxWidth: 980 }}>
      {groups.map((group) => {
        const filter = group.category.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
        return <Link key={group.category} href={`/urunler?filter=${encodeURIComponent(filter)}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, background: "#fff", border: "1px solid #e2ddd1", borderRadius: 12, padding: "18px 20px", color: "#14213d", textDecoration: "none", boxShadow: "0 3px 12px rgba(20,33,61,.04)" }}><span style={{ fontWeight: 800, fontSize: 17 }}>{group.category.replace("TÜLLE", "TULLE")}</span><span style={{ color: "#a8792a", fontSize: 20 }} aria-hidden="true">→</span></Link>;
      })}
    </div>
  </div></main><SiteFooter /></>;
}
