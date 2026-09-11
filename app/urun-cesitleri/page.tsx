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
    <nav style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 48 }}>{groups.map((group) => <a key={group.category} href={`#${group.category.toLowerCase().split(/\s+/)[0]}`} style={{ color: "#14213d", border: "1px solid #d8d4c8", borderRadius: 999, padding: "9px 15px", textDecoration: "none", background: "#fff" }}>{group.category} <small>({group.items.length})</small></a>)}</nav>
    {groups.map((group) => { const anchor = group.category.toLowerCase().split(/\s+/)[0]; return <section key={group.category} id={anchor} style={{ scrollMarginTop: 100, marginBottom: 58 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}><h2 style={{ color: "#14213d", margin: 0 }}>{group.category} <small style={{ color: "#a8792a", fontSize: 14 }}>{group.items.length} renk</small></h2><Link href={`/products?q=${encodeURIComponent(group.category)}`} style={{ color: "#a8792a", textDecoration: "none", fontWeight: 700 }}>Tümünü gör →</Link></div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 16 }}>{group.items.map((product) => <Link key={product.id} href={`/urunler/${product.slug}`} style={{ background: "#fff", border: "1px solid #e8e4da", borderRadius: 12, overflow: "hidden", textDecoration: "none" }}><div style={{ position: "relative", aspectRatio: "1/1", background: "#f2f1ec" }}><Image src={product.image} alt={product.name} fill sizes="240px" style={{ objectFit: "cover" }} /></div><div style={{ padding: "14px 16px", color: "#14213d", fontWeight: 800 }}>{product.name}<div style={{ color: "#a8792a", fontSize: 12, marginTop: 5 }}>Özel ölçü üretim</div></div></Link>)}</div></section>; })}
  </div></main><SiteFooter /></>;
}
