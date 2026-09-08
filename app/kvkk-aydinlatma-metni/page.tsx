import Link from "next/link";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { absoluteUrl } from "@/app/lib/site";

export const metadata = {
  title: "Kişisel Veriler Politikası (KVKK) | Marel Plise Perde",
  description:
    "6698 Sayılı Kişisel Verilerin Korunması Kanunu uyarınca Marel Plise Perde aydınlatma metni, veri işleme ilkeleri ve haklarınız.",
  alternates: { canonical: absoluteUrl("/kvkk-aydinlatma-metni") },
};

export default function KvkkPage() {
  return (
    <>
      <SiteHeader />
      <main className="legal-page">
        <section className="legal-hero shop-container">
          <span>6698 SAYILI KVKK KAPSAMINDA AYDINLATMA METNİ</span>
          <h1>Kişisel Veriler Politikası & KVKK</h1>
          <p>Son Güncelleme: 1 Ocak 2026 · Marel Plise Perde ve Mimari Yaşam Alanı Sistemleri</p>
        </section>

        <div className="legal-layout shop-container">
          <aside className="legal-sidebar-nav">
            <Link href="/gizlilik-politikasi">Gizlilik Güvenlik Politikası</Link>
            <Link href="/mesafeli-satis-sozlesmesi">Mesafeli Satış Sözleşmesi</Link>
            <Link href="/iade-ve-iptal-kosullari">İade ve İptal Koşulları</Link>
            <Link href="/kvkk-aydinlatma-metni" className="active">
              Kişisel Veriler Politikası (KVKK)
            </Link>
            <Link href="/iletisim">İletişim & Danışma</Link>
          </aside>

          <article className="legal-content-body">
            <section>
              <h2>1. Veri Sorumlusunun Kimliği</h2>
              <p>
                6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca, veri sorumlusu sıfatıyla{" "}
                <strong>Marel Plise Perde ve Mimari Sistemler</strong> (Adres: Sanayi Sitesi, Marel İmalat Atölyesi,
                Elbistan / Kahramanmaraş, Telefon: +90 546 735 66 02, E-Posta: info@marelpliseperde.com) olarak,
                kişisel verilerinizi kanunda öngörülen temel ilkeler ve veri güvenliği standartları çerçevesinde işlemekteyiz.
              </p>
            </section>

            <section>
              <h2>2. İşlenen Kişisel Veri Kategorileri</h2>
              <p>Müşterilerimiz ve ziyaretçilerimiz tarafından paylaşılan veriler şu kategorilerde toplanmaktadır:</p>
              <ul>
                <li>
                  <strong>Kimlik Bilgileri:</strong> Ad, soyad, T.C. kimlik numarası (fatura zorunluluğu durumunda).
                </li>
                <li>
                  <strong>İletişim Bilgileri:</strong> Teslimat ve fatura adresi, telefon numarası, e-posta adresi.
                </li>
                <li>
                  <strong>Müşteri İşlem Bilgileri:</strong> Özel sipariş ölçüleri (en x boy cm), kumaş ve profil rengi
                  tercihleri, sepet içeriği, sipariş notları, fatura ve ödeme makbuz bilgileri.
                </li>
                <li>
                  <strong>İşlem Güvenliği ve Cihaz Bilgileri:</strong> IP adresi, site erişim logları, çerez kayıtları ve
                  cihaz tarayıcı bilgileri.
                </li>
              </ul>
            </section>

            <section>
              <h2>3. Kişisel Verilerin İşlenme Amaçları ve Hukuki Sebepleri</h2>
              <p>
                Kişisel verileriniz, KVKK&apos;nın 5. ve 6. maddelerinde belirtilen &quot;Sözleşmenin kurulması veya
                ifasıyla doğrudan doğruya ilgili olması&quot;, &quot;Veri sorumlusunun hukuki yükümlülüğünü yerine
                getirebilmesi&quot; ve &quot;Meşru menfaat&quot; hukuki sebeplerine dayalı olarak:
              </p>
              <ul>
                <li>Özel ölçüye göre plise perde, sineklik ve alüminyum sistemlerinin imalatının gerçekleştirilmesi,</li>
                <li>Ürünlerin Yurtiçi Kargo güvencesiyle doğru adrese sevkiyatı ve kargo durum bildirimlerinin iletilmesi,</li>
                <li>Satış öncesi ölçü danışmanlığı, teklif hazırlama ve satış sonrası 2 yıl teknik servis süreçlerinin yürütülmesi,</li>
                <li>Vergi Usul Kanunu, Türk Ticaret Kanunu ve Tüketicinin Korunması Kanunu gereğince yasal defter ve fatura kayıtlarının tutulması,</li>
                <li>Müşteri memnuniyetinin ölçülmesi ve olası talep/şikayetlerin çözüme kavuşturulması</li>
              </ul>
              <p>amaçlarıyla sınırlı ve ölçülü olarak işlenmektedir.</p>
            </section>

            <section>
              <h2>4. Kişisel Verilerin Aktarıldığı Taraflar ve Aktarım Amaçları</h2>
              <p>
                Toplanan verileriniz, kanunun 8. ve 9. maddeleri uyarınca ve yalnızca yukarıda belirtilen amaçların ifası
                için gerekli olduğu ölçüde:
              </p>
              <ul>
                <li>
                  <strong>Lojistik ve Dağıtım Ortakları:</strong> Siparişlerin güvenli teslimatı amacıyla anlaşmalı kargo
                  firmamız olan <em>Yurtiçi Kargo Servisi A.Ş.</em> ile,
                </li>
                <li>
                  <strong>Finans ve Muhasebe Danışmanları:</strong> Yasal e-arşiv / e-fatura düzenlenmesi ve mali
                  beyannameler için yetkili mali müşavirler ve Gelir İdaresi Başkanlığı ile,
                </li>
                <li>
                  <strong>Hukuki ve Resmi Merciiler:</strong> Mevzuat gereği talep edilmesi durumunda adli ve idari
                  merciler ile paylaşılabilmektedir.
                </li>
              </ul>
              <p>
                Kişisel verileriniz hiçbir surette ticari amaçlarla üçüncü şahıslara veya reklam ağlarına devredilmez ya da satılmaz.
              </p>
            </section>

            <section>
              <h2>5. Kişisel Veri Sahibinin KVKK Madde 11 Kapsamındaki Hakları</h2>
              <p>Veri sahibi olarak 6698 sayılı Kanun&apos;un 11. maddesi uyarınca şu haklara sahipsiniz:</p>
              <ul>
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
                <li>İşlenmişse buna ilişkin detaylı bilgi talep etme,</li>
                <li>İşlenme amacını ve bu amaca uygun kullanılıp kullanılmadığını öğrenme,</li>
                <li>Yurt içinde veya yurt dışında verilerin aktarıldığı üçüncü kişileri bilme,</li>
                <li>Eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme,</li>
                <li>KVKK 7. maddesi uyarınca verilerin silinmesini veya yok edilmesini talep etme,</li>
                <li>
                  İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir
                  sonucun ortaya çıkmasına itiraz etme.
                </li>
              </ul>
            </section>

            <section>
              <h2>6. Başvuru Yöntemi ve İletişim</h2>
              <p>
                Yukarıda sıralanan haklarınıza ilişkin başvurularınızı kimliğinizi tevsik edici belgeler ile birlikte
                yazılı olarak <strong>Sanayi Sitesi, Marel İmalat Atölyesi, Elbistan / Kahramanmaraş</strong> adresine
                veya sistemimizde kayıtlı e-posta adresinizden <strong>info@marelpliseperde.com</strong> adresine
                iletebilirsiniz. Başvurularınız KVKK&apos;nın 13. maddesi gereğince en geç 30 (otuz) gün içinde ücretsiz
                olarak neticelendirilecektir.
              </p>
            </section>
          </article>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
