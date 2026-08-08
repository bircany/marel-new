import Image from "next/image";
import { Reveal } from "@/app/components/motion-media";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { listAnnouncements } from "@/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Duyurular", description: "Marel ürün rehberleri, koleksiyon duyuruları ve ölçüye özel üretim bilgileri." };

export default async function AnnouncementsPage() { const announcements = await listAnnouncements(true); return <><SiteHeader /><main className="content-page">
  <section className="content-hero announcement-hero"><div className="content-hero-media"><Image unoptimized src="/images/catalog/pages/page-03.webp" alt="Marel perde kumaşları" fill priority sizes="100vw" /></div><div className="shop-container"><span>GÜNCEL MAREL</span><h1>Duyurular ve ilham veren rehberler.</h1><p>Ürün seçimi, ölçü, bakım ve yeni koleksiyonlara dair güncel içerikler.</p></div></section>
  <section className="announcement-page-list shop-container">{announcements.length ? announcements.map((item, index) => <Reveal key={item.id} direction={index % 2 ? "right" : "left"}><article id={item.slug}><div className="announcement-page-image"><Image unoptimized src={item.imageUrl} alt="" fill sizes="(max-width: 760px) 100vw, 42vw" /></div><div><span>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }) : "Marel"}</span>{item.featured ? <small>ÖNE ÇIKAN</small> : null}<h2>{item.title}</h2><p>{item.body}</p><a href="https://wa.me/905467356602" target="_blank" rel="noreferrer">Bilgi almak için yazın →</a></div></article></Reveal>) : <div className="content-empty"><h2>Yakında burada.</h2><p>Yeni Marel duyuruları hazırlandığında bu sayfada yayınlanacak.</p></div>}</section>
</main><SiteFooter /></>; }
