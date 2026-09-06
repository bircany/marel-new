import Link from "next/link";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { absoluteUrl } from "@/app/lib/site";

export const metadata = {
  title: "Yasal Bilgilendirme ve Koşullar | Marel",
  description: "Marel gizlilik, iade, KVKK, çerez politikası ve mesafeli satış sözleşmesi bilgilendirme merkezi.",
  alternates: { canonical: absoluteUrl("/gizlilik-ve-iade-kosullari") },
};

export default function LegalHubPage() {
  return (
    <>
      <SiteHeader />
      <main className="legal-page">
        <section className="legal-hero shop-container">
          <span>YASAL BİLGİLENDİRME MERKEZİ</span>
          <h1>Kurumsal & Yasal Koşullar</h1>
          <p>Müşteri hakları, veri güvenliği, iade ve mesafeli satış bilgilendirmeleri.</p>
        </section>

        <div className="legal-layout shop-container">
          <aside className="legal-sidebar-nav">
            <Link href="/gizlilik-politikasi">Gizlilik Politikası</Link>
            <Link href="/iade-ve-iptal-kosullari">İade ve İptal Koşulları</Link>
            <Link href="/kvkk-aydinlatma-metni">KVKK Aydınlatma Metni</Link>
            <Link href="/cerez-politikasi">Çerez Politikası</Link>
            <Link href="/mesafeli-satis-sozlesmesi">Mesafeli Satış Sözleşmesi</Link>
            <Link href="/iletisim">İletişim & Danışma</Link>
          </aside>

          <article className="legal-content-body">
            <section>
              <h2>Tüm Yasal ve Tüketici Hakları Dokümanları</h2>
              <p>
                Marel olarak şeffaflık, müşteri hakları ve veri güvenliği ilkelerine tam bağlılıkla hizmet veriyoruz.
                İhtiyaç duyduğunuz yasal bilgilendirme metnine aşağıdaki başlıklardan doğrudan ulaşabilirsiniz:
              </p>

              <div className="legal-cards-grid">
                <Link href="/gizlilik-politikasi" className="legal-doc-card">
                  <strong>🔒 Gizlilik Politikası</strong>
                  <p>Kişisel verilerinizin hangi amaçlarla toplandığı ve nasıl korunduğu.</p>
                  <span>Metni İncele →</span>
                </Link>

                <Link href="/iade-ve-iptal-kosullari" className="legal-doc-card">
                  <strong>📦 İade ve İptal Koşulları</strong>
                  <p>Özel üretim istisnaları, cayma hakkı ve hasarlı ürün değişim süreçleri.</p>
                  <span>Metni İncele →</span>
                </Link>

                <Link href="/kvkk-aydinlatma-metni" className="legal-doc-card">
                  <strong>⚖️ KVKK Aydınlatma Metni</strong>
                  <p>6698 sayılı kanun kapsamındaki haklarınız ve veri sorumlusu bilgilendirmesi.</p>
                  <span>Metni İncele →</span>
                </Link>

                <Link href="/cerez-politikasi" className="legal-doc-card">
                  <strong>🍪 Çerez (Cookie) Politikası</strong>
                  <p>Web sitemizde kullanılan zorunlu ve işlevsel çerezler hakkında detaylar.</p>
                  <span>Metni İncele →</span>
                </Link>

                <Link href="/mesafeli-satis-sozlesmesi" className="legal-doc-card">
                  <strong>📑 Mesafeli Satış Sözleşmesi</strong>
                  <p>Alışveriş esnasında tarafların hak, yükümlülük ve teslimat şartları.</p>
                  <span>Metni İncele →</span>
                </Link>
              </div>
            </section>
          </article>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
