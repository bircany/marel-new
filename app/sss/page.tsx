import { SiteHeader } from "@/app/components/site-header";
import { SiteFooter } from "@/app/components/site-footer";
import Link from "next/link";
import { absoluteUrl } from "@/app/lib/site";

export const metadata = {
  title: "Sıkça Sorulan Sorular (SSS) | Marel Plise Perde",
  description:
    "Plise perde ölçüsü nasıl alınır, montaj kolay mı, kumaş temizliği nasıl yapılır, kargo ve teslimat süreleri hakkında merak ettiğiniz tüm sorular.",
  alternates: { canonical: absoluteUrl("/sss") },
};

const FAQS = [
  {
    q: "Plise perde ölçüsü nasıl alınır?",
    a: "Cam balkon veya pencere kanadınızın cam contasından diğer cam contasına kadar olan genişliği (En) ve yüksekliği (Boy) milimetre veya santimetre cinsinden ölçmeniz yeterlidir. Kanat açılım kollarına dikkat ederek pay bırakılması önerilir. Canlı destek hattımızdan ölçü rehberimizi talep edebilirsiniz.",
  },
  {
    q: "Montaj için delme / vidalama şart mı, yapıştırmalı model var mı?",
    a: "Marel Plise Perdeler hem vidalı (sağlam profil sabitlemeli) hem de vidalama istemeyen çift taraflı güçlü montaj bantlı / geçmeli sistem seçenekleriyle sunulmaktadır. Çelik vidalı sistem uzun ömürlü kullanım için tavsiye edilir.",
  },
  {
    q: "Plise perdeler nasıl temizlenir, yıkanabilir mi?",
    a: "Özel apreli kumaşlarımız toz ve kir tutmaz özelliğe sahiptir. Nemli bir mikrofiber bez veya ılık sabunlu sünger ile nazikçe silerek kolayca temizleyebilirsiniz. Kesinlikle çamaşır makinesinde yıkanmamalı ve sert kimyasallar kullanılmamalıdır.",
  },
  {
    q: "Siparişim ne kadar sürede üretilir ve kargoya verilir?",
    a: "Marel Plise Perdeler siparişinize ve verdiğiniz özel ölçülere istinaden fabrikamızda özel olarak üretilir. Standart imalat süremiz 2 ila 4 iş günüdür. Üretim tamamlandığında anlaşmalı kargo firmalarımızla sigortalı olarak adresinize sevk edilir.",
  },
  {
    q: "Kargo ücreti ne kadar, ücretsiz kargo limiti var mı?",
    a: "Belirlenen sepet limitinin (genellikle 1.500 ₺ ve üzeri) üzerindeki tüm Türkiye geneli siparişlerde kargo tamamen ücretsizdir. Altındaki siparişlerde sabit kargo ücreti uygulanmaktadır.",
  },
  {
    q: "Ölçüye özel üretilen plise perdelerde iade koşulları nedir?",
    a: "Tüketici Hakları ve Mesafeli Satış Sözleşmesi yönetmeliği gereğince, tüketicinin özel istek ve ölçüleri doğrultusunda kişiye özel üretilen ürünlerde cayma hakkı bulunmamaktadır. Ancak imalat hatası, kumaş defosu veya hatalı ölçü gönderimi durumunda koşulsuz değişim ve onarım garantimiz mevcuttur.",
  },
  {
    q: "Kargo takip numaramı nereden öğrenebilirim?",
    a: "Siparişiniz kargoya verildiğinde SMS ve e-posta ile kargo takip barkodunuz iletilir. Ayrıca sitemizdeki 'Sipariş Takip' sayfasından sipariş numaranız ve e-postanız ile anlık kargo hareketlerinizi görebilirsiniz.",
  },
];

export default function SssPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />
      <main style={{ minHeight: "75vh", backgroundColor: "#f8fafc", padding: "40px 20px 80px 20px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <span
              style={{
                backgroundColor: "#e2e8f0",
                color: "#475569",
                fontSize: "0.78rem",
                fontWeight: 700,
                padding: "4px 12px",
                borderRadius: 999,
                display: "inline-block",
                marginBottom: 10,
              }}
            >
              YARDIM & DESTEK MERKEZİ
            </span>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", margin: "0 0 12px 0" }}>
              Sıkça Sorulan Sorular (SSS)
            </h1>
            <p style={{ color: "#64748b", fontSize: "1rem", maxWidth: 600, margin: "0 auto" }}>
              Ölçü alma, montaj, temizlik, teslimat ve plise perde sistemlerimiz hakkında en çok merak edilen konular.
            </p>
          </div>

          {/* FAQ Accordion List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {FAQS.map((item, idx) => (
              <details
                key={idx}
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  padding: "18px 22px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                  cursor: "pointer",
                }}
              >
                <summary
                  style={{
                    fontWeight: 700,
                    fontSize: "1.02rem",
                    color: "#0f172a",
                    listStyle: "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>{item.q}</span>
                  <span style={{ fontSize: "1.2rem", color: "#94a3b8", marginLeft: 12 }}>+</span>
                </summary>
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #f1f5f9", color: "#475569", fontSize: "0.92rem", lineHeight: 1.6 }}>
                  {item.a}
                </div>
              </details>
            ))}
          </div>

          {/* Help Box */}
          <div
            style={{
              marginTop: 48,
              backgroundColor: "#0f172a",
              color: "#ffffff",
              borderRadius: 16,
              padding: "32px 28px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 700 }}>
              Sorunuza Cevap Bulamadınız mı?
            </h2>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.92rem", maxWidth: 500 }}>
              Plise perde uzmanlarımız canlı destek hattımızda ölçü, renk seçimi ve teknik detaylar konusunda size yardımcı olmaktan memnuniyet duyar.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
              <a
                href="https://wa.me/905467356602?text=Merhaba,%20plise%20perde%20hakkında%20bilgi%20almak%20istiyorum."
                target="_blank"
                rel="noreferrer"
                style={{
                  backgroundColor: "#16a34a",
                  color: "#ffffff",
                  padding: "10px 20px",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  textDecoration: "none",
                }}
              >
                💬 WhatsApp Destek Hattı
              </a>
              <Link
                href="/iletisim"
                style={{
                  backgroundColor: "#334155",
                  color: "#ffffff",
                  padding: "10px 20px",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  textDecoration: "none",
                }}
              >
                ✉️ İletişim Formu
              </Link>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
