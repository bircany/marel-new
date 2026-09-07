import Link from "next/link";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { absoluteUrl } from "@/app/lib/site";

export const metadata = {
  title: "Mesafeli Satış Sözleşmesi | Marel Plise Perde",
  description:
    "6502 sayılı Tüketicinin Korunması Kanunu ve Mesafeli Sözleşmeler Yönetmeliği uyarınca Marel Plise Perde online sipariş şartları.",
  alternates: { canonical: absoluteUrl("/mesafeli-satis-sozlesmesi") },
};

export default function DistanceSalesPage() {
  return (
    <>
      <SiteHeader />
      <main className="legal-page">
        <section className="legal-hero shop-container">
          <span>TÜKETİCİ HUKUKU & TİCARİ SÖZLEŞME ŞARTLARI</span>
          <h1>Mesafeli Satış Sözleşmesi</h1>
          <p>Son Güncelleme: 1 Ocak 2026 · 6502 Sayılı Tüketicinin Korunması Hakkında Kanun Kapsamında</p>
        </section>

        <div className="legal-layout shop-container">
          <aside className="legal-sidebar-nav">
            <Link href="/pages/gizlilikguvenlikpolitikasi">Gizlilik Güvenlik Politikası</Link>
            <Link href="/pages/mesafeli-satis-sozlesmesi" className="active">
              Mesafeli Satış Sözleşmesi
            </Link>
            <Link href="/pages/tuketici-haklari-cayma-iptal-iade-kosullari">İade ve İptal Koşulları</Link>
            <Link href="/pages/kisisel-veriler-politikasi">Kişisel Veriler Politikası (KVKK)</Link>
            <Link href="/pages/iletisim">İletişim & Danışma</Link>
          </aside>

          <article className="legal-content-body">
            <section>
              <h2>Madde 1 — Taraflar</h2>
              <div style={{ background: "#f8fafc", padding: "16px 20px", borderRadius: 10, marginBottom: 16 }}>
                <p style={{ margin: "0 0 8px" }}>
                  <strong>SATICI BİLGİLERİ:</strong>
                </p>
                <p style={{ margin: "0 0 4px" }}><strong>Unvan:</strong> Marel Plise Perde ve Mimari Sistemler</p>
                <p style={{ margin: "0 0 4px" }}><strong>Adres:</strong> Sanayi Sitesi, Marel Üretim Atölyesi, Elbistan / Kahramanmaraş</p>
                <p style={{ margin: "0 0 4px" }}><strong>Müşteri Hizmetleri / WhatsApp:</strong> +90 546 735 66 02</p>
                <p style={{ margin: 0 }}><strong>E-posta:</strong> info@marelpliseperde.com</p>
              </div>
              <div style={{ background: "#f8fafc", padding: "16px 20px", borderRadius: 10 }}>
                <p style={{ margin: "0 0 8px" }}>
                  <strong>ALICI (TÜKETİCİ) BİLGİLERİ:</strong>
                </p>
                <p style={{ margin: 0 }}>
                  www.marelpliseperde.com web sitesi üzerinden elektronik ortamda siparişi onaylayan, fatura ve teslimat
                  adresi sipariş formunda belirtilen gerçek veya tüzel kişidir.
                </p>
              </div>
            </section>

            <section>
              <h2>Madde 2 — Sözleşmenin Konusu ve Kapsamı</h2>
              <p>
                İşbu sözleşmenin konusu, ALICI&apos;nın SATICI&apos;ya ait internet sitesinden elektronik ortamda siparişini
                gerçekleştirdiği, nitelikleri, en-boy ölçüleri, kumaş kodu, profil rengi ve KDV dahil toplam satış fiyatı
                belirtilen özel üretim plise perde, sineklik ve montaj aksesuarlarının satışı ve teslimi ile ilgili olarak
                6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri uyarınca
                tarafların hak ve yükümlülüklerinin belirlenmesidir.
              </p>
            </section>

            <section>
              <h2>Madde 3 — Sipariş, Fiyatlandırma ve Ödeme Koşulları</h2>
              <p>
                Ürünlerin cinsi, modeli, ölçüleri, kumaş özellikleri, adetleri ve KDV dahil peşin veya taksitli toplam
                satış bedeli sipariş özetinde ve ALICI&apos;ya iletilen sipariş onay belgesinde açıkça belirtilir.
              </p>
              <p>
                ALICI, kredi kartı, banka kartı veya SATICI tarafından sunulan diğer güvenli online ödeme yöntemleri ile
                ödemesini gerçekleştirir. Ödeme onaylanmadan sipariş üretim planına alınmaz.
              </p>
            </section>

            <section>
              <h2>Madde 4 — İmalat Süreci ve Teslimat Şartları</h2>
              <ul>
                <li>
                  <strong>Ölçü Teyit Prosedürü:</strong> ALICI sipariş verdikten sonra, olası ölçü ve montaj hatalarını
                  sıfırlamak amacıyla Marel teknik destek ekibi WhatsApp (+90 546 735 66 02) üzerinden ALICI ile iletişime
                  geçerek ölçü ve kasa tipini teyit eder.
                </li>
                <li>
                  <strong>Termin Süresi:</strong> Ölçü onayı tamamlanan siparişler, SATICI&apos;nın atölyesinde 10 ila 15 iş günü
                  içerisinde milimetrik hassasiyetle üretilerek paketlenir.
                </li>
                <li>
                  <strong>Kargo ve Sevkiyat:</strong> Siparişler anlaşmalı <strong>Yurtiçi Kargo</strong> güvencesiyle
                  ALICI&apos;nın belirttiği adrese sevk edilir. 1.000 TL ve üzerindeki tüm siparişlerde kargo ücreti SATICI&apos;ya aittir.
                </li>
                <li>
                  <strong>Kargo Takibi:</strong> Kargo barkodu oluşturulduğunda ALICI&apos;ya Yurtiçi Kargo takip numarası iletilir
                  ve ALICI web sitesindeki canlı takip portalından kargosunu anlık olarak sorgulayabilir.
                </li>
              </ul>
            </section>

            <section>
              <h2>Madde 5 — Cayma Hakkı ve Kişiye Özel Üretim İstisnası</h2>
              <p>
                Mesafeli Sözleşmeler Yönetmeliği&apos;nin <strong>15. maddesinin (b) bendi</strong> uyarınca:
              </p>
              <blockquote
                style={{
                  background: "#fef3c7",
                  borderLeft: "4px solid #f59e0b",
                  padding: "12px 18px",
                  margin: "14px 0",
                  fontStyle: "italic",
                  color: "#92400e",
                  borderRadius: "0 8px 8px 0",
                }}
              >
                &ldquo;Tüketicinin istekleri veya kişisel ihtiyaçları doğrultusunda hazırlanan mallara ilişkin sözleşmelerde
                tüketici cayma hakkını kullanamaz.&rdquo;
              </blockquote>
              <p>
                Marel bünyesinde siparişi verilen plise perde ve sineklik ürünleri; ALICI&apos;nın pencere ve cam balkonuna ait
                özel en ve boy ölçülerine göre kesilip üretildiği için ikinci bir müşteriye satışı hukuken ve fiilen mümkün
                olmayan <strong>&quot;Kişiye Özel İmal Edilen Ürün&quot;</strong> statüsündedir. Bu nedenle ölçü onayı
                alınıp atölyede kesimi yapılan ürünlerde keyfi cayma ve iade hakkı geçerli değildir.
              </p>
            </section>

            <section>
              <h2>Madde 6 — Hasarlı Ürün ve Garanti Kapsamı</h2>
              <p>
                Özel imalat ürünlerde dahi, SATICI kaynaklı kumaş ayıbı, mekanizma arızası, yanlış ölçü kesimi veya kargo
                esnasında oluşan ezilme/kırılma durumlarında ALICI&apos;nın tüm yasal hakları <strong>Marel 2 Yıl Garantisi</strong>{" "}
                kapsamında korunur.
              </p>
              <p>
                ALICI, kargo teslimi esnasında pakette hasar görmesi durumunda kargo kuryesine <strong>Hasar Tespit Tutanağı</strong>{" "}
                tutturarak ürünü teslim almadan iade eder. Tutanak tutulan veya üretim hatası bulunan ürünler derhal ücretsiz
                olarak yeniden üretilerek ALICI&apos;ya sevk edilir.
              </p>
            </section>

            <section>
              <h2>Madde 7 — Yetkili Mahkeme ve Uyuşmazlıkların Çözümü</h2>
              <p>
                İşbu sözleşmenin uygulanmasında, Sanayi ve Ticaret Bakanlığınca ilan edilen değere kadar Tüketici Hakem
                Heyetleri ile ALICI&apos;nın veya SATICI&apos;nın yerleşim yerindeki Tüketici Mahkemeleri yetkilidir.
              </p>
            </section>
          </article>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
