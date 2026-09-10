import { SiteHeader } from "@/app/components/site-header";
import { SiteFooter } from "@/app/components/site-footer";
import { absoluteUrl } from "@/app/lib/site";

export const metadata = {
  title: "İletişim | Marel Plise Perde",
  description: "Marel plise perde iletişim bilgileri. Adres, telefon ve iletişim formu ile bize ulaşın.",
  alternates: { canonical: absoluteUrl("/iletisim") },
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="static-page-main" style={{ background: "#fbf8ee" }}>
        
        <section className="shop-container" style={{ padding: "80px 20px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "60px" }}>
            
            {/* Contact Info */}
            <div style={{ flex: "1 1 400px" }}>
              <h1 style={{ fontSize: "2.5rem", color: "#1e293b", marginBottom: "20px", fontWeight: "700" }}>
                İletişime geçin!
              </h1>
              <p style={{ color: "#64748b", fontSize: "1.05rem", lineHeight: "1.7", marginBottom: "30px" }}>
                Ürünlerimiz, hizmetlerimiz veya sipariş süreçlerimizle ilgili merak ettiklerinizi yanıtlamaktan memnuniyet duyarız.
                <br /><br />
                İhtiyacınıza en uygun çözümü sunabilmemiz için bize telefon, e-posta veya iletişim formu üzerinden dilediğiniz zaman ulaşabilirsiniz.
              </p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "20px", color: "#334155", fontSize: "1.05rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                  <span style={{ fontSize: "1.5rem", color: "#d97706" }}>📍</span>
                  <span>Sanayi Sitesi, Marel İmalat Atölyesi, Elbistan / Kahramanmaraş</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                  <span style={{ fontSize: "1.5rem", color: "#d97706" }}>📞</span>
                  <a href="tel:+905467356602" style={{ color: "inherit", textDecoration: "none" }}>+90 546 735 66 02</a>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                  <span style={{ fontSize: "1.5rem", color: "#d97706" }}>✉️</span>
                  <a href="mailto:info@marelpliseperde.com" style={{ color: "inherit", textDecoration: "none" }}>info@marelpliseperde.com</a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div style={{ flex: "1 1 500px", background: "#ffffff", padding: "40px", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
              <form style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                  <input 
                    type="text" 
                    placeholder="Adınız *" 
                    required
                    style={{ flex: "1 1 200px", padding: "15px", border: "1px solid #e2e8f0", borderRadius: "8px", outline: "none" }}
                  />
                  <input 
                    type="tel" 
                    placeholder="Numaranız *" 
                    required
                    style={{ flex: "1 1 200px", padding: "15px", border: "1px solid #e2e8f0", borderRadius: "8px", outline: "none" }}
                  />
                </div>
                <textarea 
                  placeholder="Size nasıl yardımcı olabiliriz?" 
                  rows={5}
                  required
                  style={{ width: "100%", padding: "15px", border: "1px solid #e2e8f0", borderRadius: "8px", outline: "none", resize: "vertical" }}
                ></textarea>
                
                <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.9rem", color: "#64748b", cursor: "pointer" }}>
                  <input type="checkbox" required style={{ marginTop: "4px" }} />
                  <span>Kişisel bilgilerimin toplanıp saklanmasını kabul ediyorum.</span>
                </label>

                <button 
                  type="submit" 
                  style={{ 
                    padding: "15px 30px", 
                    background: "#cda434", 
                    color: "#fff", 
                    border: "none", 
                    borderRadius: "8px", 
                    fontSize: "1.05rem", 
                    fontWeight: "600",
                    cursor: "pointer",
                    alignSelf: "flex-start",
                    transition: "background 0.3s ease"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = "#b8922f"}
                  onMouseOut={(e) => e.currentTarget.style.background = "#cda434"}
                >
                  İletişime Geçin
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section style={{ width: "100%", height: "500px", background: "#e2e8f0" }}>
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d101252.70997198188!2d37.11477755!3d38.204593!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1531e2197e411cbb%3A0x67faaf27a1ef24a!2sElbistan%2C%20Kahramanmara%C5%9F!5e0!3m2!1str!2str!4v1715873030000!5m2!1str!2str" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={false} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Marel İmalat Atölyesi Harita"
          ></iframe>
        </section>

      </main>
      <SiteFooter />
    </>
  );
}
