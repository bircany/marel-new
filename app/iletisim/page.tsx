import Image from "next/image";
import { ContactForm } from "@/app/components/contact-form";
import { Reveal } from "@/app/components/motion-media";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { absoluteUrl } from "@/app/lib/site";

export const metadata = {
  title: "İletişim & Danışma | Marel Perde ve Sineklik Sistemleri",
  description:
    "Marel plise perde, jaluzi, zip perde ve sineklik sistemleri için doğrudan WhatsApp hattı, müşteri hizmetleri ve iletişim formu.",
  alternates: { canonical: absoluteUrl("/iletisim") },
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="content-page">
        {/* Contact Hero */}
        <section className="content-hero contact-hero">
          <div className="content-hero-media">
            <Image
              unoptimized
              src="/images/hero/marel-honeycomb-hero-v3.png"
              alt="Marel Honeycomb perde uygulaması"
              fill
              priority
              sizes="100vw"
            />
          </div>
          <div className="shop-container">
            <span>MAREL MİMARİ DESTEK</span>
            <h1>Doğru sistemi birlikte seçelim.</h1>
            <p>Ürün seçimi, ölçü desteği, sipariş veya satış sonrası talepleriniz için bize anında ulaşın.</p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="contact-section shop-container">
          <Reveal direction="left">
            <div className="contact-info-col">
              <span className="contact-badge">HIZLI DANIŞMA</span>
              <h2>Size nasıl yardımcı olabiliriz?</h2>
              <p>
                Mekânınızın veya pencerenizin fotoğrafı ile yaklaşık ölçünüz hazırsa, WhatsApp üzerinden doğrudan
                uzman danışmanımıza iletebilirsiniz. En uygun sistem ve kumaş alternatiflerini hemen sunalım.
              </p>

              {/* Direct WhatsApp Call/Chat Card */}
              <a
                className="contact-whatsapp-card"
                href="https://wa.me/905467356602?text=Merhaba%2C%20Marel%20perde%2Fsineklik%20sistemleri%20hakk%C4%B1nda%20bilgi%20ve%20%C3%B6l%C3%A7%C3%BC%20deste%C4%9Fi%20almak%20istiyorum."
                target="_blank"
                rel="noreferrer"
              >
                <div className="wa-card-left">
                  <div className="wa-icon-bubble">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
                      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.13 8.13 0 0 1-1.25-4.38c0-4.5 3.66-8.16 8.16-8.16 2.18 0 4.23.85 5.77 2.39a8.11 8.11 0 0 1 2.39 5.77c0 4.5-3.66 8.16-8.16 8.16zm4.47-6.1c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.53.07-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.71-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.2 3.7.59.25 1.05.4 1.41.51.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.23-.17-.47-.29z" />
                    </svg>
                  </div>
                  <div>
                    <strong>Canlı WhatsApp Danışmanı</strong>
                    <small>0546 735 66 02 · Anında Yanıt</small>
                  </div>
                </div>
                <span className="wa-arrow">↗</span>
              </a>

              {/* Direct Support Channels */}
              <div className="contact-channels-grid">
                <article className="channel-box">
                  <span className="channel-icon">📍</span>
                  <div>
                    <strong>İmalat & Atölye Adresi</strong>
                    <small>Sanayi Sitesi, Marel İmalat Atölyesi, Elbistan / Kahramanmaraş</small>
                  </div>
                </article>

                <article className="channel-box">
                  <span className="channel-icon">📞</span>
                  <div>
                    <strong>Müşteri Hizmetleri & WhatsApp</strong>
                    <small>+90 546 735 66 02 · info@marelpliseperde.com</small>
                  </div>
                </article>

                <article className="channel-box">
                  <span className="channel-icon">📐</span>
                  <div>
                    <strong>Ölçü & Kumaş Desteği</strong>
                    <small>Pencerenize özel milimetrik ölçü ve renk kartelası danışmanlığı</small>
                  </div>
                </article>

                <article className="channel-box">
                  <span className="channel-icon">🚚</span>
                  <div>
                    <strong>Yurtiçi Kargo Takibi</strong>
                    <small>Türkiye geneli sigortalı ve korunaklı kargo teslimatı</small>
                  </div>
                </article>

                <article className="channel-box">
                  <span className="channel-icon">⏰</span>
                  <div>
                    <strong>Çalışma Saatleri</strong>
                    <small>Pazartesi – Cumartesi: 09:00 – 19:00</small>
                  </div>
                </article>

                <article className="channel-box">
                  <span className="channel-icon">🛡️</span>
                  <div>
                    <strong>Garanti & Teknik Destek</strong>
                    <small>2 yıl parça, ip ve mekanizma garantisi</small>
                  </div>
                </article>
              </div>
            </div>
          </Reveal>

          <Reveal direction="right">
            <ContactForm />
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
