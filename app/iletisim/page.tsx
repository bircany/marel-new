import Image from "next/image";
import { ContactForm } from "@/app/components/contact-form";
import { Reveal } from "@/app/components/motion-media";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";

export const metadata = { title: "İletişim", description: "Marel ürün, ölçü, sipariş ve satış sonrası destek iletişim kanalları." };

export default function ContactPage() { return <><SiteHeader /><main className="content-page">
  <section className="content-hero contact-hero"><div className="content-hero-media"><Image unoptimized src="/images/hero/marel-honeycomb-hero-v3.png" alt="Marel Honeycomb perde uygulaması" fill priority sizes="100vw" /></div><div className="shop-container"><span>MAREL İLETİŞİM</span><h1>Doğru sistemi birlikte seçelim.</h1><p>Ürün seçimi, ölçü desteği, sipariş veya satış sonrası talepleriniz için bize ulaşın.</p></div></section>
  <section className="contact-section shop-container"><Reveal direction="left"><div className="contact-copy"><span>HIZLI DESTEK</span><h2>Size nasıl yardımcı olabiliriz?</h2><p>Mekân fotoğrafı ve yaklaşık ölçünüz hazırsa WhatsApp üzerinden doğrudan danışmanımıza gönderebilirsiniz. Daha ayrıntılı talepler için formu kullanın.</p><a className="contact-whatsapp" href="https://wa.me/905467356602" target="_blank" rel="noreferrer"><b>WhatsApp danışmanı</b><span>0546 735 66 02</span><strong>↗</strong></a><div className="contact-detail-grid"><article><small>ÜRÜN DESTEĞİ</small><b>Kumaş, profil ve sistem seçimi</b></article><article><small>SİPARİŞ DESTEĞİ</small><b>Üretim ve teslimat süreci</b></article></div></div></Reveal><Reveal direction="right"><ContactForm /></Reveal></section>
</main><SiteFooter /></>; }
