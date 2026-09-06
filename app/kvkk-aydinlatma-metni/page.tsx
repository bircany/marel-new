import Link from "next/link";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { absoluteUrl } from "@/app/lib/site";

export const metadata = {
  title: "KVKK Aydınlatma Metni | Marel",
  description: "6698 Sayılı Kişisel Verilerin Korunması Kanunu uyarınca Marel aydınlatma metni ve haklarınız.",
  alternates: { canonical: absoluteUrl("/kvkk-aydinlatma-metni") },
};

export default function KvkkPage() {
  return (
    <>
      <SiteHeader />
      <main className="legal-page">
        <section className="legal-hero shop-container">
          <span>YASAL UYUM & VERİ HAKLARI</span>
          <h1>KVKK Aydınlatma Metni</h1>
          <p>6698 Sayılı Kişisel Verilerin Korunması Kanunu Kapsamında Bilgilendirme</p>
        </section>

        <div className="legal-layout shop-container">
          <aside className="legal-sidebar-nav">
            <Link href="/gizlilik-politikasi">Gizlilik Politikası</Link>
            <Link href="/iade-ve-iptal-kosullari">İade ve İptal Koşulları</Link>
            <Link href="/kvkk-aydinlatma-metni" className="active">
              KVKK Aydınlatma Metni
            </Link>
            <Link href="/cerez-politikasi">Çerez Politikası</Link>
            <Link href="/mesafeli-satis-sozlesmesi">Mesafeli Satış Sözleşmesi</Link>
            <Link href="/iletisim">İletişim & Danışma</Link>
          </aside>

          <article className="legal-content-body">
            <section>
              <h2>1. Veri Sorumlusunun Kimliği</h2>
              <p>
                6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca, veri sorumlusu sıfatıyla{" "}
                <strong>Marel Perde ve Mimari Yaşam Alanı Sistemleri</strong> olarak, kişisel verilerinizi kanunda
                öngörülen ilkeler çerçevesinde işlemekteyiz.
              </p>
            </section>

            <section>
              <h2>2. Kişisel Verilerin İşlenme Amaçları</h2>
              <p>Toplanan kişisel verileriniz KVKK&apos;nın 5. ve 6. maddelerinde belirtilen şartlara uygun olarak:</p>
              <ul>
                <li>Ölçüye özel sipariş sözleşmelerinin kurulması ve ifası,</li>
                <li>Ürünlerin adresinize sevkiyatı ve kargo takibinin yapılması,</li>
                <li>Satış sonrası teknik servis, parça değişimi ve garanti hizmetlerinin sağlanması,</li>
                <li>Finansal, vergisel ve muhasebesel yasal kayıtların tutulması,</li>
                <li>Yetkili kamu kurum ve kuruluşlarına yasal bildirimlerin gerçekleştirilmesi</li>
              </ul>
              <p>amaçlarıyla sınırlı olarak işlenmektedir.</p>
            </section>

            <section>
              <h2>3. Kişisel Verilerin Aktarılması</h2>
              <p>
                Kişisel verileriniz, yukarıda sayılan amaçların gerçekleştirilebilmesi için kanunun çizdiği sınırlar
                dahilinde anlaşmalı kargo firmalarına, bilgi teknolojileri altyapı sağlayıcılarına ve kanunen yetkili
                kamu otoritelerine aktarılabilmektedir.
              </p>
            </section>

            <section>
              <h2>4. İlgili Kişi Olarak Haklarınız (Madde 11)</h2>
              <p>KVKK&apos;nın 11. maddesi uyarınca veri sahipleri;</p>
              <ul>
                <li>Kişisel veri işlenip işlenmediğini öğrenme,</li>
                <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
                <li>İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
                <li>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme,</li>
                <li>Eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme,</li>
                <li>KVKK 7. maddesinde öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme</li>
              </ul>
              <p>
                haklarına sahiptir. Taleplerinizi <Link href="/iletisim">iletişim sayfamız</Link> üzerinden bize
                iletebilirsiniz.
              </p>
            </section>
          </article>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
