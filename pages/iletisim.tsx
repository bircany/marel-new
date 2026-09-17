import { SiteHeader } from "@/app/components/site-header";
import { SiteFooter } from "@/app/components/site-footer";
import { absoluteUrl } from "@/app/lib/site";

export const metadata = {
  title: "İletişim | Marel Plise Perde",
  description:
    "Marel Plise Perde iletişim bilgileri. Elbistan / Kahramanmaraş üretim atölyesi adresi, telefon, WhatsApp danışma hattı ve harita konumu.",
  alternates: { canonical: absoluteUrl("/iletisim") },
  other: {
    "geo.region": "TR-46",
    "geo.placename": "Elbistan, Kahramanmaraş",
    "geo.position": "38.2002172;37.1850268",
    "ICBM": "38.2002172, 37.1850268",
  },
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="static-page-main" style={{ background: "#f8fafc", minHeight: "85vh" }}>
        
        {/* Hero Section */}
        <section style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "50px 20px" }}>
          <div className="shop-container" style={{ maxWidth: 1140, margin: "0 auto", textAlign: "center" }}>
            <span
              style={{
                display: "inline-block",
                background: "#fef3c7",
                color: "#b45309",
                fontWeight: 850,
                fontSize: "0.8rem",
                padding: "5px 14px",
                borderRadius: 999,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              Marel Müşteri & İmalat Merkezi
            </span>
            <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3rem)", color: "#0f172a", fontWeight: 900, marginBottom: 12 }}>
              Bizimle İletişime Geçin
            </h1>
            <p style={{ color: "#64748b", fontSize: "1.1rem", maxWidth: 640, margin: "0 auto", lineHeight: 1.6 }}>
              Ölçü alma, kumaş ve profil renkleri, özel siparişler veya atölye ziyareti için bize dilediğiniz kanaldan ulaşabilirsiniz.
            </p>
          </div>
        </section>

        {/* Contact Content Grid */}
        <section className="shop-container" style={{ maxWidth: 1140, margin: "0 auto", padding: "50px 20px 70px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 36, alignItems: "start" }}>
            
            {/* Contact Details Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              
              {/* Address Card */}
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 16,
                  padding: "26px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                  display: "flex",
                  gap: 16,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 12,
                    background: "#fef3c7",
                    color: "#b45309",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: "1.3rem",
                  }}
                >
                  📍
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 6px", fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
                    Üretim Atölyesi & Showroom
                  </h3>
                  <p style={{ margin: "0 0 12px", color: "#475569", fontSize: "0.95rem", lineHeight: 1.6 }}>
                    Marel Plise Perde<br />
                    Sanayi Sitesi, Marel İmalat Atölyesi<br />
                    Elbistan / Kahramanmaraş
                  </p>
                  <a
                    href="https://maps.app.goo.gl/VRmB3BWWzfTWmJNP8"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      color: "#0284c7",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      textDecoration: "none",
                    }}
                  >
                    <span>Google Haritalarda Aç & Yol Tarifi Al</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Phone & WhatsApp Card */}
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 16,
                  padding: "26px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                  display: "flex",
                  gap: 16,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 12,
                    background: "#dcfce7",
                    color: "#15803d",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: "1.3rem",
                  }}
                >
                  💬
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 6px", fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
                    Telefon & WhatsApp Danışma
                  </h3>
                  <p style={{ margin: "0 0 12px", color: "#475569", fontSize: "0.95rem", lineHeight: 1.6 }}>
                    Fotoğraflı ölçü desteği ve sipariş sorularınız için haftanın 7 günü hizmetinizdeyiz.
                  </p>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <a
                      href="https://wa.me/905467356602"
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        background: "#22c55e",
                        color: "#ffffff",
                        padding: "8px 16px",
                        borderRadius: 8,
                        fontWeight: 800,
                        fontSize: "0.9rem",
                        textDecoration: "none",
                      }}
                    >
                      WhatsApp (0546 735 66 02)
                    </a>
                    <a
                      href="tel:+905467356602"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        background: "#f1f5f9",
                        color: "#0f172a",
                        padding: "8px 16px",
                        borderRadius: 8,
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        textDecoration: "none",
                      }}
                    >
                      Hemen Ara
                    </a>
                  </div>
                </div>
              </div>

              {/* Email & Working Hours Card */}
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 16,
                  padding: "26px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                  display: "flex",
                  gap: 16,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 12,
                    background: "#e0f2fe",
                    color: "#0369a1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: "1.3rem",
                  }}
                >
                  ✉️
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 6px", fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
                    E-Posta & Çalışma Saatleri
                  </h3>
                  <p style={{ margin: "0 0 4px", color: "#475569", fontSize: "0.95rem" }}>
                    <strong>E-Posta:</strong> <a href="mailto:info@marelpliseperde.com" style={{ color: "#0284c7" }}>info@marelpliseperde.com</a>
                  </p>
                  <p style={{ margin: 0, color: "#475569", fontSize: "0.95rem" }}>
                    <strong>Atölye Mesaisi:</strong> Pazartesi – Cumartesi 08:30 – 19:00
                  </p>
                </div>
              </div>

            </div>

            {/* Direct Quick Contact Box */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 20,
                padding: "36px clamp(20px, 4vw, 36px)",
                boxShadow: "0 6px 24px rgba(0,0,0,0.04)",
              }}
            >
              <h2 style={{ fontSize: "1.45rem", fontWeight: 850, color: "#0f172a", margin: "0 0 10px" }}>
                Mesaj Gönderin
              </h2>
              <p style={{ color: "#64748b", fontSize: "0.95rem", lineHeight: 1.6, margin: "0 0 24px" }}>
                Aşağıdaki formu doldurarak veya doğrudan WhatsApp üzerinden teknik ekibimize sorularınızı iletebilirsiniz.
              </p>

              <form
                action="https://wa.me/905467356602"
                method="GET"
                target="_blank"
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                      Adınız Soyadınız *
                    </label>
                    <input
                      name="name"
                      type="text"
                      placeholder="Adınız"
                      required
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: 10,
                        border: "1px solid #cbd5e1",
                        fontSize: "0.95rem",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                      Telefon Numaranız *
                    </label>
                    <input
                      name="phone"
                      type="tel"
                      placeholder="05XX XXX XX XX"
                      required
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: 10,
                        border: "1px solid #cbd5e1",
                        fontSize: "0.95rem",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                    Konu
                  </label>
                  <input
                    name="subject"
                    type="text"
                    placeholder="Örn: Plise Perde Ölçü ve Fiyat Bilgisi"
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 10,
                      border: "1px solid #cbd5e1",
                      fontSize: "0.95rem",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                    Mesajınız *
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    placeholder="Pencerelerinizin adet ve yaklaşık ölçülerini veya merak ettiklerinizi yazabilirsiniz..."
                    required
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 10,
                      border: "1px solid #cbd5e1",
                      fontSize: "0.95rem",
                      outline: "none",
                      boxSizing: "border-box",
                      resize: "vertical",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    background: "#0f172a",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 10,
                    padding: "14px 24px",
                    fontWeight: 800,
                    fontSize: "1rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    marginTop: 8,
                  }}
                >
                  <span>WhatsApp ile Hızlı Gönder</span>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.13 8.13 0 0 1-1.25-4.38c0-4.5 3.66-8.16 8.16-8.16 2.18 0 4.23.85 5.77 2.39a8.11 8.11 0 0 1 2.39 5.77c0 4.5-3.66 8.16-8.16 8.16zm4.47-6.1c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.53.07-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.71-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.2 3.7.59.25 1.05.4 1.41.51.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.23-.17-.47-.29z" />
                  </svg>
                </button>
              </form>
            </div>

          </div>
        </section>

        {/* Fullwidth Modern Google Map Section */}
        <section style={{ width: "100%", height: 480, position: "relative", borderTop: "1px solid #e2e8f0" }}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3164.129339230537!2d37.1824519!3d38.2002172!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x152d670ff139a92d%3A0xb9a000747d2df142!2sMarel%20Plise%20Perde!5e0!3m2!1str!2str!4v1715873030000!5m2!1str!2str"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Marel Plise Perde Elbistan Konumu"
          />
          <div
            style={{
              position: "absolute",
              bottom: 24,
              left: "50%",
              transform: "translateX(-50%)",
              background: "#ffffff",
              borderRadius: 999,
              padding: "10px 24px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: "0.95rem",
              fontWeight: 800,
            }}
          >
            <span style={{ color: "#d97706" }}>📍 Marel Plise Perde</span>
            <span>•</span>
            <a
              href="https://maps.app.goo.gl/VRmB3BWWzfTWmJNP8"
              target="_blank"
              rel="noreferrer"
              style={{ color: "#0284c7", textDecoration: "none" }}
            >
              Yol Tarifi Al ↗
            </a>
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  );
}
