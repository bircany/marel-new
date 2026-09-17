import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function NotFoundPage() {
  return <><SiteHeader /><main style={{ minHeight: "55vh", display: "grid", placeItems: "center", textAlign: "center", padding: 40 }}><div><h1>Sayfa bulunamadı</h1><p>Aradığınız sayfa kaldırılmış veya taşınmış olabilir.</p><Link href="/" className="contact-submit-btn" style={{ display: "inline-block", width: "auto", padding: "12px 24px", textDecoration: "none" }}>Ana sayfaya dön</Link></div></main><SiteFooter /></>;
}

