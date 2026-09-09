"use client";

import React, { useState } from "react";
import Link from "next/link";

export function KamatasOrderTracker() {
  const [yurticiCode, setYurticiCode] = useState("");

  const handleYurticiDirect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!yurticiCode.trim()) return;
    const url = `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${encodeURIComponent(yurticiCode.trim())}`;
    window.open(url, "_blank");
  };

  return (
    <div className="kamatas-tracking-container shop-container">
      <h1 className="kamatas-tracking-title" style={{ textAlign: "center", marginBottom: 40 }}>Sipariş & Kargo Takip</h1>

      <div style={{ maxWidth: 600, margin: "0 auto 60px", background: "#1e293b", padding: 40, borderRadius: 20, boxShadow: "0 20px 40px rgba(0,0,0,0.2)", border: "1px solid #334155" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <img src="https://www.yurticikargo.com/Content/theme/img/logo.png" alt="Yurtiçi Kargo" style={{ height: 36, filter: "brightness(0) invert(1)" }} />
          <p style={{ color: "#cbd5e1", marginTop: 20, lineHeight: 1.6 }}>
            SMS veya e-posta ile tarafınıza ulaşan 12 haneli Yurtiçi Kargo gönderi kodunuzu buradan sorgulayabilirsiniz.
          </p>
        </div>
        
        <form onSubmit={handleYurticiDirect} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", color: "#94a3b8", fontSize: "0.9rem", fontWeight: 700, marginBottom: 8 }}>
              Kargo Takip Numarası
            </label>
            <input
              type="text"
              placeholder="Örn: 123456789012"
              value={yurticiCode}
              onChange={(e) => setYurticiCode(e.target.value)}
              style={{
                width: "100%",
                height: 56,
                padding: "0 20px",
                borderRadius: 12,
                background: "#0f172a",
                border: "2px solid #475569",
                color: "#fff",
                fontSize: "1.1rem",
                boxSizing: "border-box",
                outline: "none",
                transition: "border-color 0.2s"
              }}
              onFocus={(e) => e.target.style.borderColor = "#38bdf8"}
              onBlur={(e) => e.target.style.borderColor = "#475569"}
            />
          </div>
          <button 
            type="submit" 
            style={{
              height: 56,
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontWeight: 800,
              fontSize: "1.1rem",
              cursor: "pointer",
              transition: "background 0.2s",
              boxShadow: "0 4px 15px rgba(37,99,235,0.4)"
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "#1d4ed8"}
            onMouseOut={(e) => e.currentTarget.style.background = "#2563eb"}
          >
            Kargo Sorgula ↗
          </button>
        </form>
      </div>

      {/* Information Blocks from Screenshot */}
      <div className="kamatas-tracking-info-sections" style={{ maxWidth: 900, margin: "0 auto" }}>
        <section className="info-block" style={{ marginBottom: 30 }}>
          <h3 style={{ color: "#38bdf8", marginBottom: 10 }}>Ürününüzü Teslim Alırken</h3>
          <p style={{ color: "#94a3b8", lineHeight: 1.7 }}>
            Kargo tutanağını imzalamadan önce ürününüzün kutusunda herhangi bir hasar ya da sorun olup
            olmadığını kontrol ediniz. Herhangi bir nedenle hasar veya eksiklik, kolinin bandında
            açılma var ise teslimatla ilgili hiçbir belgeyi imzalamadan kargo görevlisine tutanak
            tutulması talebiyle birlikte kutunuzu iade ediniz. Bu yükümlülüğünüzü yerine getirdiğiniz
            taktirde, yeni ürünleriniz derhal tarafınıza gönderilecektir. Kutusu hasarlı olan, içeriği
            eksik olduğu iddia edilen ürünlerin teslim alınması durumunda içindeki ürünlerin hasarından
            veya eksikliğinden sorumluluğumuz bulunmamaktadır. Bu durumu en kısa zamanda çağrı
            merkezimize bildiriniz.
          </p>
        </section>

        <section className="info-block">
          <h3 style={{ color: "#38bdf8", marginBottom: 10 }}>Müşteri Hizmetlerimiz</h3>
          <p style={{ color: "#94a3b8", lineHeight: 1.7 }}>
            Siparişlerinizle ilgili tüm sorularınız ve ürünlerle ilgili bilgi almak için Türkiye'nin
            her yerinden <strong style={{ color: "#e2e8f0" }}>+90 (546) 735 66 02</strong> numaralı telefonumuzdan çağrı
            merkezimize ulaşabilirsiniz.
          </p>
        </section>
      </div>
    </div>
  );
}
