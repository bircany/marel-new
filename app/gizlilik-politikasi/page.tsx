import Link from "next/link";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { absoluteUrl } from "@/app/lib/site";

export const metadata = {
  title: "Gizlilik ve Güvenlik Politikası | Marel Plise Perde",
  description:
    "Marel Plise Perde kişisel verilerin korunması, 256-bit SSL veri güvenliği, ödeme altyapısı ve müşteri gizliliği standartları.",
  alternates: { canonical: absoluteUrl("/gizlilik-politikasi") },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <SiteHeader />
      <main className="legal-page">
        <section className="legal-hero shop-container">
          <span>YASAL BİLGİLENDİRME & GÜVENLİK STANDARTLARI</span>
          <h1>Gizlilik ve Güvenlik Politikası</h1>
          <p>Son Güncelleme: 1 Ocak 2026 · Marel Plise Perde ve Mimari Sistemler</p>
        </section>

        <div className="legal-layout shop-container">
          <aside className="legal-sidebar-nav">
            <Link href="/gizlilik-politikasi" className="active">
              Gizlilik Güvenlik Politikası
            </Link>
            <Link href="/mesafeli-satis-sozlesmesi">Mesafeli Satış Sözleşmesi</Link>
            <Link href="/iade-ve-iptal-kosullari">İade ve İptal Koşulları</Link>
            <Link href="/kvkk-aydinlatma-metni">Kişisel Veriler Politikası (KVKK)</Link>
            <Link href="/iletisim">İletişim & Danışma</Link>
          </aside>

          <article className="legal-content-body">
            <section>
              <h2>1. Gizlilik İlkelerimiz ve Genel Yaklaşım</h2>
              <p>
                <strong>Marel Plise Perde</strong> (&quot;Şirket&quot;) olarak, web sitemizi (www.marelpliseperde.com)
                ziyaret eden, ürünlerimizi inceleyen ve özel ölçüye göre sipariş oluşturan tüm müşterilerimizin kişisel
                gizliliğine, finansal güvenliğine ve bilgi mahremiyetine en üst düzeyde hassasiyet göstermekteyiz.
              </p>
              <p>
                İşbu Gizlilik ve Güvenlik Politikası; ziyaretçilerimizin ve müşterilerimizin web sitemizi kullanımı
                esnasında elde edilen verilerin ne şekilde toplandığını, nasıl korunduğunu, hangi amaçlarla işlendiğini ve
                hangi koşullarda üçüncü taraflarla paylaşıldığını şeffaf bir biçimde açıklamaktadır.
              </p>
            </section>

            <section>
              <h2>2. Ödeme ve Kart Güvenliği Standartları</h2>
              <p>
                Müşterilerimizin ödeme güvenliği sitemizin en temel önceliğidir. Alışveriş süreçlerinizde aşağıdaki
                güvenlik katmanları eksiksiz uygulanmaktadır:
              </p>
              <ul>
                <li>
                  <strong>256-Bit SSL Şifreleme:</strong> Sitemiz üzerinden gerçekleştirilen tüm veri akışları uluslararası
                  güvenlik standardı olan 256-Bit SSL (Secure Sockets Layer) sertifikası ile uçtan uca şifrelenmektedir.
                </li>
                <li>
                  <strong>Kart Bilgilerinin Saklanmaması:</strong> Ödeme esnasında girilen kredi kartı ve banka kartı
                  bilgileri (kart numarası, son kullanma tarihi, CVV kodu) hiçbir şekilde Marel sunucularında veya veri
                  tabanlarında saklanmaz, kaydedilmez veya şirket çalışanları tarafından görüntülenemez.
                </li>
                <li>
                  <strong>3D Secure Zorunluluğu:</strong> Tüm online ödemeler bankanız tarafından cep telefonunuza
                  gönderilen tek kullanımlık SMS onay kodu (3D Secure) ile doğrulanarak tamamlanır.
                </li>
              </ul>
            </section>

            <section>
              <h2>3. Toplanan Bilgiler ve Toplanma Amaçları</h2>
              <p>
                Sizlere kusursuz bir alışveriş ve atölye üretim deneyimi sunabilmek için aşağıdaki bilgiler işlenmektedir:
              </p>
              <ul>
                <li>
                  <strong>Kimlik ve İletişim Bilgileri:</strong> Ad, soyad, cep telefonu numarası, e-posta adresi ve
                  teslimat / fatura adresi (sipariş teyidi, faturalandırma ve kargo sevkiyatı için zorunludur).
                </li>
                <li>
                  <strong>Özel Ölçü ve Ürün Tercihleri:</strong> Sipariş ettiğiniz plise perde veya sineklik sistemine ait
                  milimetrik en ve boy ölçüleri, kumaş kodu, profil rengi ve montaj yönü (atölyemizde kişiye özel üretim
                  için kullanılır).
                </li>
                <li>
                  <strong>Kargo ve Lojistik Verileri:</strong> Siparişinizin Yurtiçi Kargo sistemine aktarılması ve kargo
                  takip barkodunun tarafınıza SMS ve e-posta ile bildirilmesi amacıyla kargo firmasıyla paylaşılır.
                </li>
              </ul>
            </section>

            <section>
              <h2>4. Çerez (Cookie) Kullanımı ve Analitik</h2>
              <p>
                Web sitemizde, kullanıcı deneyiminizi geliştirmek, sepetinizdeki ürünleri hatırlamak, sayfa yüklenme
                hızlarını optimize etmek ve tercihlerinizi kaydedebilmek adına zorunlu ve performans çerezleri
                kullanılmaktadır. Tarayıcı ayarlarınız üzerinden çerez kullanımını dilediğiniz zaman engelleyebilir veya
                silebilirsiniz.
              </p>
            </section>

            <section>
              <h2>5. Üçüncü Taraflarla Bilgi Paylaşımı</h2>
              <p>
                Marel Plise Perde, müşterilerine ait kişisel bilgileri hiçbir koşulda ticari, reklam veya pazarlama amacıyla
                üçüncü şahıslara satmaz, kiralamaz ve yetkisiz kurumlarla paylaşmaz. Bilgiler yalnızca siparişin yerine
                getirilmesi için zorunlu olan resmi iş ortaklarımızla (Yurtiçi Kargo, BDDK onaylı ödeme kuruluşları, yasal
                muhasebe ve resmi merciler) yasal mevzuat sınırlarında paylaşılır.
              </p>
            </section>

            <section>
              <h2>6. İletişim ve Müşteri Hakları</h2>
              <p>
                Gizlilik politikamızla ilgili tüm sorularınız, veri silme veya bilgi güncelleme talepleriniz için bize
                aşağıdaki iletişim kanallarından dilediğiniz zaman ulaşabilirsiniz:
              </p>
              <div style={{ background: "#f1f5f9", padding: "18px 20px", borderRadius: 10, marginTop: 15 }}>
                <p style={{ margin: "0 0 6px", fontWeight: 750, color: "#0f172a" }}>Marel Plise Perde ve Mimari Sistemler</p>
                <p style={{ margin: "0 0 6px" }}>📍 Adres: Sanayi Sitesi, Marel İmalat Atölyesi, Elbistan / Kahramanmaraş</p>
                <p style={{ margin: "0 0 6px" }}>📞 Telefon & WhatsApp: <strong>+90 546 735 66 02</strong></p>
                <p style={{ margin: 0 }}>✉️ E-posta: <strong>info@marelpliseperde.com</strong></p>
              </div>
            </section>
          </article>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
