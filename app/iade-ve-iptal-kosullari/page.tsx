import Link from "next/link";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { absoluteUrl } from "@/app/lib/site";

export const metadata = {
  title: "İade ve İptal Koşulları | Marel",
  description: "Marel sipariş iptali, cayma hakkı, özel üretim istisnaları ve iade süreçleri bilgilendirmesi.",
  alternates: { canonical: absoluteUrl("/iade-ve-iptal-kosullari") },
};

export default function ReturnsCancellationPage() {
  return (
    <>
      <SiteHeader />
      <main className="legal-page">
        <section className="legal-hero shop-container">
          <span>TÜKETİCİ HAKLARI & TESLİMAT</span>
          <h1>İade ve İptal Koşulları</h1>
          <p>Son Güncelleme: 1 Ocak 2026 · Marel Tüketici Bilgilendirme Metni</p>
        </section>

        <div className="legal-layout shop-container">
          <aside className="legal-sidebar-nav">
            <Link href="/gizlilik-politikasi">Gizlilik Politikası</Link>
            <Link href="/iade-ve-iptal-kosullari" className="active">
              İade ve İptal Koşulları
            </Link>
            <Link href="/kvkk-aydinlatma-metni">KVKK Aydınlatma Metni</Link>
            <Link href="/cerez-politikasi">Çerez Politikası</Link>
            <Link href="/mesafeli-satis-sozlesmesi">Mesafeli Satış Sözleşmesi</Link>
            <Link href="/iletisim">İletişim & Danışma</Link>
          </aside>

          <article className="legal-content-body">
            <section>
              <h2>1. Genel İade ve Cayma Hakkı</h2>
              <p>
                6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca alıcı,
                standart (hazır) ürünlerde malı teslim aldığı tarihten itibaren <strong>14 (on dört) gün</strong>{" "}
                içerisinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin cayma hakkını kullanabilir.
              </p>
            </section>

            <section>
              <h2>2. Ölçüye Özel Üretim İstisnası (Kişiye Özel İmalat)</h2>
              <p>
                Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15. maddesinin (b) bendi gereğince:{" "}
                <em>
                  &quot;Tüketicinin istekleri veya kişisel ihtiyaçları doğrultusunda hazırlanan mallara ilişkin
                  sözleşmelerde cayma hakkı kullanılamaz.&quot;
                </em>
              </p>
              <p>
                Marel bünyesinde sipariş verilen plise perde, jaluzi, zip perde ve sineklik sistemleri, müşterinin
                pencere/balkon ölçüsüne (en-boy milimetre bazlı), seçilen özel kumaş koduna ve kasa profili rengine göre
                özel olarak kesilip üretilmektedir. Bu nedenle:
              </p>
              <ul>
                <li>Ölçü onayı verilip atölyede kesimi yapılan ürünlerde cayma ve keyfi iade hakkı bulunmamaktadır.</li>
                <li>
                  Olası ölçü hatalarının önüne geçmek adına, sipariş sonrasında uzman danışmanlarımız WhatsApp üzerinden
                  müşterimizle irtibata geçerek ölçüleri teyit etmektedir.
                </li>
              </ul>
            </section>

            <section>
              <h2>3. Ayıplı, Kusurlu veya Hasarlı Ürün Durumu</h2>
              <p>
                Özel üretim dahi olsa; üretim hatası, kumaş yırtığı, mekanizma bozukluğu veya kargo kaynaklı kırık/hasar
                taşıyan ürünler derhal <strong>Marel Garantisi</strong> altındadır:
              </p>
              <ul>
                <li>
                  Kargo teslimatı sırasında paketinde ezilme veya kırık tespit edilen ürünler için kargo görevlisine{" "}
                  <strong>Hasar Tespit Tutanağı</strong> tutturulmalıdır.
                </li>
                <li>
                  Kusurlu veya hatalı ölçüde gelen ürünler, ücretsiz olarak atölyemize geri alınarak hızlıca revize
                  edilir veya sıfırdan yeniden üretilerek adresinize gönderilir.
                </li>
              </ul>
            </section>

            <section>
              <h2>4. Sipariş İptali Süreci</h2>
              <p>
                Verilen siparişler, atölyemizde kumaş kesim ve profil işleme sürecine girmeden önce (genellikle siparişi
                takip eden ilk 4 saat içerisinde) iptal edilebilir. İptal talebinizi sipariş numaranız ile birlikte{" "}
                <strong>0546 735 66 02</strong> WhatsApp hattımızdan iletebilirsiniz.
              </p>
            </section>
          </article>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
