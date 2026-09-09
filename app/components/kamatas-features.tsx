"use client";

import { useState } from "react";

export function KamatasFeatures() {
  return (
    <section className="kamatas-features-section" style={{ background: "#ffffff", borderTop: "1px solid #f1f3f5", padding: "40px 0" }}>
      <div className="shop-container">
        <div className="kamatas-features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
          <div className="kamatas-feature-item" style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", background: "#f9fafb", borderRadius: 12 }}>
            <div className="kamatas-feature-icon" style={{ color: "#d97706", flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" width="32" height="32">
                <path d="M20 12V22H4V12" />
                <path d="M22 7H2V12H22V7Z" />
                <path d="M12 22V7" />
                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
              </svg>
            </div>
            <h3 style={{ fontSize: "0.86rem", fontWeight: 800, color: "#111827", margin: 0, lineHeight: 1.4 }}>
              1000 TL VE ÜZERİ SİPARİŞLERDE ÜCRETSİZ KARGO
            </h3>
          </div>
          <div className="kamatas-feature-item" style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", background: "#f9fafb", borderRadius: 12 }}>
            <div className="kamatas-feature-icon" style={{ color: "#2563eb", flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" width="32" height="32">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <h3 style={{ fontSize: "0.86rem", fontWeight: 800, color: "#111827", margin: 0, lineHeight: 1.4 }}>
              10-15 GÜN ÖZEL ATÖLYE TERMİN SÜRESİ
            </h3>
          </div>
          <div className="kamatas-feature-item" style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", background: "#f9fafb", borderRadius: 12 }}>
            <div className="kamatas-feature-icon" style={{ color: "#10b981", flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" width="32" height="32">
                <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9m-9 9a9 9 0 0 1 9-9" />
              </svg>
            </div>
            <h3 style={{ fontSize: "0.86rem", fontWeight: 800, color: "#111827", margin: 0, lineHeight: 1.4 }}>
              15 GÜN İÇİNDE İADE & MÜŞTERİ MEMNUNİYETİ
            </h3>
          </div>
        </div>
      </div>
    </section>
  );
}

export function KamatasOrderTracking() {
  const [orderNumber, setOrderNumber] = useState("");

  return (
    <section className="kamatas-features-track" id="takip" style={{ background: "#0f172a", color: "#ffffff", padding: "70px 0" }}>
      <div className="shop-container">
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 35 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <img src="https://www.yurticikargo.com/Content/theme/img/logo.png" alt="Yurtiçi Kargo" style={{ height: 28, filter: "brightness(0) invert(1)" }} />
            </div>
            <h2 style={{ fontSize: "2rem", fontWeight: 900, color: "#ffffff", margin: "6px 0 10px" }}>
              Kargonuz Nerede?
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "0.94rem", maxWidth: 580, margin: "0 auto" }}>
              Gönderi takip numaranızı girerek kargonuzun durumunu anında Yurtiçi Kargo üzerinden sorgulayabilirsiniz.
            </p>
          </div>

          <div
            style={{
              background: "#1e293b",
              borderRadius: 18,
              padding: "36px 32px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
              border: "1px solid #334155",
            }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!orderNumber.trim()) return;
                window.open(`https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${encodeURIComponent(orderNumber.trim())}`, "_blank");
              }}
              style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%", margin: 0 }}
            >
              <div>
                <label htmlFor="track-order" style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 8 }}>
                  Yurtiçi Kargo Takip Numarası
                </label>
                <input
                  id="track-order"
                  name="order"
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Örn: 123456789012"
                  style={{
                    width: "100%",
                    height: 52,
                    padding: "0 16px",
                    borderRadius: 10,
                    background: "#0f172a",
                    border: "1.5px solid #475569",
                    color: "#ffffff",
                    fontSize: "1rem",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  height: 52,
                  width: "100%",
                  borderRadius: 10,
                  background: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: 800,
                  fontSize: "1rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
                  transition: "background 0.2s ease",
                  marginTop: 10
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "#1d4ed8")}
                onMouseOut={(e) => (e.currentTarget.style.background = "#2563eb")}
              >
                Sorgula ↗
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
