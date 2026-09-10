import { SiteHeader } from "@/app/components/site-header";
import { SiteFooter } from "@/app/components/site-footer";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hakkımızda | Marel Plise Perde",
  description: "Marel Plise Perde olarak 2015 yılından bu yana kusursuz kalite ve koşulsuz müşteri memnuniyeti ile hizmet vermekteyiz.",
};

export default function HakkimizdaPage() {
  return (
    <>
      <SiteHeader />
      <main className="static-page-main">
        {/* Page Hero */}
        <section className="static-page-hero" style={{ background: "#fbf8ee", padding: "60px 20px", textAlign: "center", borderBottom: "1px solid #e5e5e5" }}>
          <div className="shop-container">
            <h1 style={{ fontSize: "2.5rem", color: "#1e293b", marginBottom: "15px", fontWeight: "700" }}>Hakkımızda</h1>
            <p style={{ color: "#64748b", maxWidth: "700px", margin: "0 auto", fontSize: "1.1rem", lineHeight: "1.6" }}>
              Güçlü üretim altyapımız, geniş ürün yelpazemiz ve yüksek müşteri memnuniyetimizle iş ortaklarımıza kârlı ve sürdürülebilir bir model sunuyoruz.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="shop-container" style={{ padding: "60px 20px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "40px", alignItems: "center" }}>
            <div style={{ flex: "1 1 500px" }}>
              <h2 style={{ fontSize: "2rem", color: "#1e293b", marginBottom: "20px", fontWeight: "700" }}>Plise Perdede Uzman Üretim</h2>
              <p style={{ color: "#475569", fontSize: "1.05rem", lineHeight: "1.7", marginBottom: "15px" }}>
                2015 yılında cam balkon sistemleri üretimiyle adım attığımız sektörde, ilk günden itibaren “kusursuz kalite” ve “koşulsuz müşteri memnuniyeti” ilkelerini merkezimize aldık. Bu vizyonla geçen her yıl, tecrübemizi yenilikçi teknolojilerle harmanlayarak büyümemizi sürdürdük.
              </p>
              <p style={{ color: "#475569", fontSize: "1.05rem", lineHeight: "1.7", marginBottom: "15px" }}>
                Bugün Marel, plise perde sistemleri alanında uzmanlaşmış tam donanımlı teknik kadrosuyla sektörün öncü kuruluşları arasında yer almaktadır. Türkiye genelindeki geniş bayilik ağımızla, modern yaşam alanlarına estetik ve fonksiyonel çözümler sunuyoruz.
              </p>
              <p style={{ color: "#475569", fontSize: "1.05rem", lineHeight: "1.7" }}>
                Yüksek standartlardaki imalat kapasitemizi, erişilebilir fiyat politikası ve satış sonrası destek güvencesiyle birleştirerek, yaşam alanlarınıza değer katmaya devam ediyoruz.
              </p>
            </div>
            <div style={{ flex: "1 1 400px", borderRadius: "12px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>
              <Image 
                src="/images/real/diamond-beyaz-siyah-ip.jpeg" 
                alt="Plise Perde Üretim" 
                width={800} 
                height={600} 
                style={{ width: "100%", height: "auto", display: "block" }} 
              />
            </div>
          </div>
        </section>

        {/* Vision & Values */}
        <section style={{ background: "#0f172a", color: "#fff", padding: "80px 20px" }}>
          <div className="shop-container" style={{ display: "flex", flexWrap: "wrap", gap: "40px" }}>
            <div style={{ flex: "1 1 400px" }}>
              <h2 style={{ fontSize: "2rem", color: "#fbf8ee", marginBottom: "20px", fontWeight: "700" }}>Vizyonumuz ve Değerlerimiz</h2>
              <p style={{ color: "#cbd5e1", fontSize: "1.05rem", lineHeight: "1.7", marginBottom: "20px" }}>
                Marel Plise olarak temel vizyonumuz; plise perde sistemlerinde yenilikçi teknolojileri takip ederek sektördeki liderliğimizi sürdürmek ve modern trendlere uygun, şık koleksiyonlarımızla yaşam alanlarına değer katmaktır.
              </p>
              <p style={{ color: "#cbd5e1", fontSize: "1.05rem", lineHeight: "1.7" }}>
                Müşteri beklentilerini en üst seviyede karşılamayı ve kurduğumuz güçlü iletişimle sürdürülebilir bir güven bağı oluşturmayı önceliğimiz sayıyoruz.
              </p>
            </div>
            <div style={{ flex: "1 1 400px", background: "rgba(255,255,255,0.05)", padding: "30px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
              <h3 style={{ fontSize: "1.4rem", color: "#fcd34d", marginBottom: "15px", fontWeight: "600" }}>Kurumsal İlkelerimiz</h3>
              <p style={{ color: "#cbd5e1", fontSize: "1.05rem", lineHeight: "1.7" }}>
                Hizmet kalitesini iş etiğimizin merkezine koyarak; operasyonel verimlilik, doğru yatırım ve çevreye duyarlı üretim anlayışıyla hareket ediyoruz. Deneyimli kadromuz ve güçlü organizasyon yapımızla, evrensel kalite standartlarını tüm süreçlerimize entegre ediyoruz. İnsana ve emeğe verdiğimiz değerle, hem müşterilerimiz hem de iş ortaklarımız için daima en doğru kaynak planlamasını yaparak sektöre yön vermeye devam ediyoruz.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="shop-container" style={{ padding: "60px 20px", textAlign: "center" }}>
          <h2 style={{ fontSize: "2rem", color: "#1e293b", marginBottom: "20px", fontWeight: "700" }}>Bayimiz Olun</h2>
          <p style={{ color: "#475569", fontSize: "1.1rem", marginBottom: "30px", maxWidth: "600px", margin: "0 auto 30px" }}>
            Hızlı üretim, rekabetçi fiyatlar ve sürekli gelişen ürün portföyü ile işletmenize değer katıyoruz. Sürdürülebilir büyüme için siz de Marel ailesine katılın.
          </p>
          <a 
            href="https://wa.me/905467356602" 
            target="_blank" 
            rel="noreferrer"
            className="pdp-whatsapp-btn"
            style={{ display: "inline-flex", textDecoration: "none" }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" style={{ marginRight: 8 }}>
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.13 8.13 0 0 1-1.25-4.38c0-4.5 3.66-8.16 8.16-8.16 2.18 0 4.23.85 5.77 2.39a8.11 8.11 0 0 1 2.39 5.77c0 4.5-3.66 8.16-8.16 8.16zm4.47-6.1c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.53.07-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.71-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.2 3.7.59.25 1.05.4 1.41.51.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.23-.17-.47-.29z" />
            </svg>
            WhatsApp'tan İletişime Geç
          </a>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
