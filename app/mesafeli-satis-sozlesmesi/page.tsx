import Link from "next/link";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { absoluteUrl } from "@/app/lib/site";

export const metadata = {
  title: "Mesafeli Satış Sözleşmesi | Marel",
  description: "Marel online sipariş ve ölçüye özel perde/sineklik mesafeli satış sözleşmesi şartları.",
  alternates: { canonical: absoluteUrl("/mesafeli-satis-sozlesmesi") },
};

export default function DistanceSalesPage() {
  return (
    <>
      <SiteHeader />
      <main className="legal-page">
        <section className="legal-hero shop-container">
          <span>TÜKETİCİ MEVZUATI & SÖZLEŞME</span>
          <h1>Mesafeli Satış Sözleşmesi</h1>
          <p>Marel Dijital Sipariş ve Hizmet Koşulları</p>
        </section>

        <div className="legal-layout shop-container">
          <aside className="legal-sidebar-nav">
            <Link href="/gizlilik-politikasi">Gizlilik Politikası</Link>
            <Link href="/iade-ve-iptal-kosullari">İade ve İptal Koşulları</Link>
            <Link href="/kvkk-aydinlatma-metni">KVKK Aydınlatma Metni</Link>
            <Link href="/cerez-politikasi">Çerez Politikası</Link>
            <Link href="/mesafeli-satis-sozlesmesi" className="active">
              Mesafeli Satış Sözleşmesi
            </Link>
            <Link href="/iletisim">İletişim & Danışma</Link>
          </aside>

          <article className="legal-content-body">
            <section>
              <h2>Madde 1 — Taraflar</h2>
              <p>
                <strong>SATICI:</strong> Marel Perde ve Mimari Yaşam Alanı Sistemleri (Bundan böyle &quot;SATICI&quot;
                olarak anılacaktır).
              </p>
              <p>
                <strong>ALICI:</strong> www.marel.com internet sitesinden sipariş veren, fatura ve teslimat bilgileri
                sipariş formunda belirtilen gerçek veya tüzel kişi (Bundan böyle &quot;ALICI&quot; olarak anılacaktır).
              </p>
            </section>

            <section>
              <h2>Madde 2 — Konu</h2>
              <p>
                İşbu sözleşmenin konusu, ALICI&apos;nın SATICI&apos;ya ait internet sitesinden elektronik ortamda siparişini
                yaptığı, nitelikleri ve satış fiyatı belirtilen ölçüye özel perde, sineklik ve montaj aksesuarlarının
                satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli
                Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin belirlenmesidir.
              </p>
            </section>

            <section>
              <h2>Madde 3 — Ürün, Ödeme ve Teslimat Şartları</h2>
              <p>
                Ürünlerin cinsi, miktarı, kumaş rengi, profil tipi, en-boy ölçüleri ve KDV dahil toplam satış bedeli
                sipariş özetinde ve ALICI&apos;ya gönderilen e-postada belirtilmektedir.
              </p>
              <p>
                Ölçüye özel siparişler, ölçü teyidinin ardından atölyemizde <strong>2 ila 4 iş günü</strong> içerisinde
                özenle üretilerek anlaşmalı kargo firmasına teslim edilir. 1.000 TL üzeri siparişlerde kargo ücretsizdir.
              </p>
            </section>

            <section>
              <h2>Madde 4 — Özel Üretim ve Cayma Hakkı İstisnası</h2>
              <p>
                ALICI&apos;nın özel talepleri veya açıkça kişisel ihtiyaçları doğrultusunda hazırlanan (ölçüye göre
                kesilmiş kumaş ve profil) ürünlerde, Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15/b maddesi uyarınca
                cayma hakkı kullanılamaz. Üründe SATICI kaynaklı üretim veya malzeme ayıbı bulunması durumunda ise
                ücretsiz onarım veya yeniden üretim garantisi geçerlidir.
              </p>
            </section>
          </article>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
