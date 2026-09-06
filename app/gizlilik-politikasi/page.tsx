import Link from "next/link";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { absoluteUrl } from "@/app/lib/site";

export const metadata = {
  title: "Gizlilik Politikası | Marel",
  description: "Marel kişisel verilerin korunması, gizlilik standartları ve veri güvenliği politikası.",
  alternates: { canonical: absoluteUrl("/gizlilik-politikasi") },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <SiteHeader />
      <main className="legal-page">
        <section className="legal-hero shop-container">
          <span>YASAL BİLGİLENDİRME & GÜVENLİK</span>
          <h1>Gizlilik Politikası</h1>
          <p>Son Güncelleme: 1 Ocak 2026 · Marel Mimari ve Perde Sistemleri</p>
        </section>

        <div className="legal-layout shop-container">
          <aside className="legal-sidebar-nav">
            <Link href="/gizlilik-politikasi" className="active">
              Gizlilik Politikası
            </Link>
            <Link href="/iade-ve-iptal-kosullari">İade ve İptal Koşulları</Link>
            <Link href="/kvkk-aydinlatma-metni">KVKK Aydınlatma Metni</Link>
            <Link href="/cerez-politikasi">Çerez Politikası</Link>
            <Link href="/mesafeli-satis-sozlesmesi">Mesafeli Satış Sözleşmesi</Link>
            <Link href="/iletisim">İletişim & Danışma</Link>
          </aside>

          <article className="legal-content-body">
            <section>
              <h2>1. Gizlilik Yaklaşımımız ve Kapsam</h2>
              <p>
                Marel (&quot;Şirket&quot;) olarak, web sitemizi (www.marel.com) ziyaret eden, ürünlerimizi inceleyen ve
                ölçüye özel sipariş veren tüm kullanıcılarımızın kişisel gizliliğine ve bilgi güvenliğine azami önem
                vermekteyiz. İşbu Gizlilik Politikası, sitemizi kullanımınız sırasında toplanan, işlenen ve saklanan
                bilgilerin mahiyetini ve bu bilgilerin hangi amaçlarla kullanıldığını açıklamaktadır.
              </p>
            </section>

            <section>
              <h2>2. Toplanan Bilgiler ve Toplama Yöntemleri</h2>
              <p>Hizmetlerimizi en yüksek kalitede sunabilmek adına aşağıdaki veriler toplanabilmektedir:</p>
              <ul>
                <li>
                  <strong>Kimlik ve İletişim Bilgileri:</strong> Ad, soyad, telefon numarası, teslimat adresi ve e-posta
                  adresi.
                </li>
                <li>
                  <strong>Sipariş ve Ölçü Verileri:</strong> Tercih ettiğiniz perde/sineklik modeli, kumaş ve profil
                  rengi, en-boy ölçüleri, montaj tipi ve müşteri sipariş notları.
                </li>
                <li>
                  <strong>İşlem ve Destek Kayıtları:</strong> İletişim formu mesajları, WhatsApp danışma kayıtları ve
                  müşteri hizmetleri talepleri.
                </li>
                <li>
                  <strong>Teknik ve Cihaz Bilgileri:</strong> IP adresi, tarayıcı türü, oturum çerezleri ve sayfa
                  etkileşim verileri.
                </li>
              </ul>
            </section>

            <section>
              <h2>3. Bilgilerin Kullanım Amaçları</h2>
              <p>Toplanan kişisel verileriniz aşağıdaki hukuki ve operasyonel amaçlar doğrultusunda işlenir:</p>
              <ul>
                <li>Ölçüye özel perde ve sineklik siparişlerinin atölyemizde milimetrik üretilmesi ve montaj teyidi.</li>
                <li>Siparişlerinizin anlaşmalı kargo firmaları aracılığıyla adresinize güvenle teslim edilmesi.</li>
                <li>Kargo takip numarası ve sipariş durum bildirimlerinin SMS veya WhatsApp yoluyla iletilmesi.</li>
                <li>Satış sonrası teknik destek, kumaş/mekanizma garantisi ve müşteri memnuniyeti süreçlerinin yürütülmesi.</li>
                <li>Mevzuattan kaynaklanan faturalandırma ve yasal muhasebe yükümlülüklerinin ifası.</li>
              </ul>
            </section>

            <section>
              <h2>4. Veri Güvenliği ve Üçüncü Taraflarla Paylaşım</h2>
              <p>
                Marel, kişisel verilerinizi hiçbir surette ticari veya pazarlama amacıyla üçüncü şahıslara satmaz veya
                kiralamaz. Verileriniz yalnızca siparişinizin tamamlanması için zorunlu olan iş ortaklarımızla (kargo
                firmaları, güvenli SMS altyapısı, yasal merciler) ve yürürlükteki mevzuat çerçevesinde paylaşılır.
              </p>
              <p>
                Sitemiz genelinde tüm veri transferleri <strong>256-Bit SSL (Secure Sockets Layer)</strong> şifreleme
                protokolü ile korunmaktadır.
              </p>
            </section>

            <section>
              <h2>5. İletişim ve Haklarınız</h2>
              <p>
                Gizlilik politikamız veya kişisel verilerinizin işlenmesi ile ilgili her türlü soru ve talebiniz için{" "}
                <Link href="/iletisim">İletişim Sayfamız</Link> üzerinden veya <strong>0546 735 66 02</strong> numaralı
                destek hattımızdan bize ulaşabilirsiniz.
              </p>
            </section>
          </article>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
