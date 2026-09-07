import Link from "next/link";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { absoluteUrl } from "@/app/lib/site";

export const metadata = {
  title: "Tüketici Hakları, Cayma, İptal ve İade Koşulları | Marel Plise Perde",
  description:
    "Marel Plise Perde sipariş iptali, cayma hakkı kapsamı, kişiye özel üretim istisnaları, kargo hasarı ve iade prosedürü bilgilendirmesi.",
  alternates: { canonical: absoluteUrl("/iade-ve-iptal-kosullari") },
};

export default function ReturnsCancellationPage() {
  return (
    <>
      <SiteHeader />
      <main className="legal-page">
        <section className="legal-hero shop-container">
          <span>TÜKETİCİ HAKLARI, CAYMA & İADE SÜREÇLERİ</span>
          <h1>Tüketici Hakları, Cayma, İptal ve İade Koşulları</h1>
          <p>Son Güncelleme: 1 Ocak 2026 · Marel Şeffaf Müşteri Memnuniyeti Standartları</p>
        </section>

        <div className="legal-layout shop-container">
          <aside className="legal-sidebar-nav">
            <Link href="/pages/gizlilikguvenlikpolitikasi">Gizlilik Güvenlik Politikası</Link>
            <Link href="/pages/mesafeli-satis-sozlesmesi">Mesafeli Satış Sözleşmesi</Link>
            <Link href="/pages/tuketici-haklari-cayma-iptal-iade-kosullari" className="active">
              İade ve İptal Koşulları
            </Link>
            <Link href="/pages/kisisel-veriler-politikasi">Kişisel Veriler Politikası (KVKK)</Link>
            <Link href="/pages/iletisim">İletişim & Danışma</Link>
          </aside>

          <article className="legal-content-body">
            <section>
              <h2>1. Genel Tüketici Hakları ve 14 Günlük Cayma Hakkı</h2>
              <p>
                6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca tüketiciler,
                satın aldıkları <strong>standart ve hazır ürünlerde</strong> (montaj aksesuarları, standart ölçülü tutamaklar
                ve hazır profiller) hiçbir hukuki ve cezai sorumluluk üstlenmeksizin ve hiçbir gerekçe göstermeksizin, malı
                teslim aldıkları tarihten itibaren <strong>14 (on dört) gün</strong> içerisinde cayma hakkını kullanabilir.
              </p>
            </section>

            <section>
              <h2>2. Ölçüye Özel İmalat (Kişiye Özel Üretim) İstisnası</h2>
              <p>
                Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15. maddesinin (b) fıkrası gereğince:
              </p>
              <div
                style={{
                  background: "#fffbeb",
                  borderLeft: "4px solid #d97706",
                  padding: "16px 20px",
                  borderRadius: "0 10px 10px 0",
                  margin: "16px 0",
                }}
              >
                <strong style={{ color: "#92400e", display: "block", marginBottom: 6 }}>
                  Yasal Cayma Hakkı İstisnası (Madde 15/b):
                </strong>
                <p style={{ color: "#b45309", margin: 0, fontSize: "0.85rem", fontStyle: "italic" }}>
                  &ldquo;Tüketicinin istekleri veya kişisel ihtiyaçları doğrultusunda hazırlanan mallara ilişkin
                  sözleşmelerde cayma hakkı kullanılamaz.&rdquo;
                </p>
              </div>
              <p>
                Marel bünyesinde satışı yapılan plise perdeler, cam balkon perdeleri ve akordiyon sineklikler;
                müşterilerimizin pencerelerine ait <strong>özel en ve boy milimetrik ölçülerine</strong>, seçilen kumaş
                desenine ve alüminyum profil rengine göre fabrikamızda siparişe özel kesilip monte edilmektedir.
              </p>
              <p>
                Bu ürünler başka bir pencereye veya başka bir müşteriye uymayacağından ötürü, üretim teyidi verilip kesim
                yapıldıktan sonra keyfi cayma, vazgeçme veya iade hakkı bulunmamaktadır.
              </p>
            </section>

            <section>
              <h2>3. Sipariş İptali Nasıl Yapılır?</h2>
              <p>
                Siparişinizi oluşturduktan sonra, ürünleriniz atölyemizde kumaş kesim ve profil işleme aşamasına girmeden
                önce siparişinizi iptal edebilirsiniz:
              </p>
              <ul>
                <li>Siparişin verildiği ilk 2 ila 4 saat içerisinde doğrudan WhatsApp hattımızdan iptal talebinde bulunabilirsiniz.</li>
                <li>İptal edilen siparişlerin ücret iadesi, bankanıza bağlı olarak 2 ila 5 iş günü içerisinde kartınıza eksiksiz yansıtılır.</li>
              </ul>
            </section>

            <section>
              <h2>4. Ayıplı, Hatalı Ölçü veya Kargo Hasarı Durumunda Ne Yapılır?</h2>
              <p>
                Kişiye özel üretim dahi olsa, Marel olarak müşterilerimizi asla mağdur etmiyoruz. Tarafımızdan veya kargodan
                kaynaklanan her türlü sorun <strong>%100 Marel Müşteri Memnuniyeti Garantisi</strong> altındadır:
              </p>
              <div style={{ display: "grid", gap: 14, margin: "16px 0" }}>
                <div style={{ background: "#f8fafc", padding: "16px 18px", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                  <strong style={{ color: "#0f172a" }}>📦 Kargo Hasarı Durumu:</strong>
                  <p style={{ margin: "6px 0 0", color: "#475569", fontSize: "0.84rem" }}>
                    Ürününüzü Yurtiçi Kargo kuryesinden teslim alırken paketi mutlaka kontrol ediniz. Eğer koli veya ambalajda
                    ezilme, yırtılma veya kırık varsa, kargo görevlisine derhal <strong>Hasar Tespit Tutanağı</strong> tutturup
                    ürünü teslim almayınız. Hasarlı ürünler anında atölyemizde sıfırdan yeniden üretilir.
                  </p>
                </div>
                <div style={{ background: "#f8fafc", padding: "16px 18px", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                  <strong style={{ color: "#0f172a" }}>📏 Ölçü veya Üretim Hatası Durumu:</strong>
                  <p style={{ margin: "6px 0 0", color: "#475569", fontSize: "0.84rem" }}>
                    Sipariş verdiğiniz ölçüler ile gelen ürün arasında Marel kaynaklı bir uyumsuzluk, kumaş lekesi veya
                    mekanizma arızası varsa, ürününüz anlaşmalı kargo kodumuzla ücretsiz olarak atölyemize alınır ve 48 saat
                    içinde düzeltilerek yeniden gönderilir.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2>5. İade ve Değişim Gönderim Prosedürü</h2>
              <p>
                Onaylanan iade veya revizyon işlemlerinde, ürünlerinizi orijinal kutusunda, tüm montaj aparatları, vidaları ve
                faturaları ile birlikte paketleyiniz.
              </p>
              <p>
                Anlaşmalı kargo firmamız <strong>Yurtiçi Kargo</strong> şubesine Marel Müşteri Kargo Kodunu belirterek
                ücretsiz teslim edebilirsiniz. Kargo takip kodunu almak için lütfen <strong>+90 546 735 66 02</strong>{" "}
                WhatsApp destek hattımız ile iletişime geçiniz.
              </p>
            </section>
          </article>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
