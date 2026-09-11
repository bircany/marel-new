import Link from "next/link";
import Image from "next/image";
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
    <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%", maxWidth: 1180 }}>
      {groups.map((group) => {
        const filter = group.category.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
        const preview = group.items[0]?.image || "/images/catalog/diamond.webp";
        return <Link className="series-list-card" key={group.category} href={`/urunler?filter=${encodeURIComponent(filter)}`} style={{ display: "grid", gridTemplateColumns: "170px minmax(0,1fr) auto", alignItems: "center", gap: 24, width: "100%", background: "#fff", border: "1px solid #e2ddd1", borderRadius: 14, overflow: "hidden", color: "#14213d", textDecoration: "none", boxShadow: "0 3px 12px rgba(20,33,61,.04)" }}>
          <div style={{ position: "relative", height: 108, background: "#f2f1ec" }}><Image src={preview} alt={`${group.category} plise perde`} fill sizes="170px" style={{ objectFit: "cover" }} /></div>
          <span style={{ fontWeight: 800, fontSize: 19 }}>{group.category.replace("TÜLLE", "TULLE")}</span>
          <span style={{ color: "#a8792a", fontSize: 24, padding: "0 24px" }} aria-hidden="true">→</span>
        </Link>;
      })}
    </div>
  </div></main><SiteFooter /></>;
}
