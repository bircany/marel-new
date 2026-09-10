"use client";

import { useState, useEffect } from "react";
import { formatMoney } from "@/app/lib/commerce";

interface ConfiguratorProps {
  product: {
    name: string;
    price: number; // m2 price in cents (e.g. 60500 for 605.00₺)
    colors?: string; // JSON array string
    options?: string; // JSON string for profile colors
  };
}

export function ProductConfigurator({ product }: ConfiguratorProps) {
  const [width, setWidth] = useState<number | "">("");
  const [height, setHeight] = useState<number | "">("");
  const [quantity, setQuantity] = useState<number>(1);
  const [profileColor, setProfileColor] = useState<string>("Beyaz (Standart)");
  const [fabricColor, setFabricColor] = useState<string>("");
  const [totalPrice, setTotalPrice] = useState<number>(0);

  // Parse colors & options if any
  let parsedFabricColors: string[] = [];
  try {
    parsedFabricColors = JSON.parse(product.colors || "[]");
  } catch (e) {}

  const profileOptions = [
    "Beyaz (Standart)",
    "Antrasit",
    "Kahverengi",
    "Ahşap Desenli",
    "Siyah"
  ];

  // Fiyat Hesaplama
  useEffect(() => {
    const w = typeof width === "number" ? width : 0;
    const h = typeof height === "number" ? height : 0;
    
    if (w > 0 && h > 0) {
      let m2 = (w * h) / 10000;
      // Genellikle minimum 1 m2 baz alınır
      if (m2 < 1) m2 = 1;
      
      const total = m2 * (product.price / 100) * quantity;
      setTotalPrice(total);
    } else {
      setTotalPrice(0);
    }
  }, [width, height, quantity, product.price]);

  const handleWhatsapp = () => {
    if (!width || !height || typeof width !== "number" || typeof height !== "number") {
      alert("Lütfen en ve boy ölçülerini giriniz.");
      return;
    }
    const message = `Merhaba, ${product.name} için sipariş vermek istiyorum.
- En: ${width} cm
- Boy: ${height} cm
- Adet: ${quantity}
- Profil Rengi: ${profileColor}
- Kumaş Seçimi: ${fabricColor || "Belirtilmedi"}
- Tahmini Fiyat: ${formatMoney(totalPrice * 100)}`;
    
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/905467356602?text=${encoded}`, "_blank");
  };

  return (
    <div className="product-configurator" style={{ background: "#f8fafc", padding: 24, borderRadius: 16, border: "1px solid #e2e8f0" }}>
      <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 20, color: "#0f172a" }}>Ölçü ve Seçenekler</h3>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div>
          <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "#475569", marginBottom: 6 }}>
            En (Genişlik) cm
          </label>
          <input 
            type="number" 
            placeholder="Örn: 60"
            value={width}
            onChange={(e) => setWidth(e.target.value ? Number(e.target.value) : "")}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "1rem" }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "#475569", marginBottom: 6 }}>
            Boy (Yükseklik) cm
          </label>
          <input 
            type="number" 
            placeholder="Örn: 120"
            value={height}
            onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : "")}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "1rem" }}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div>
          <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "#475569", marginBottom: 6 }}>
            Profil Rengi
          </label>
          <select 
            value={profileColor}
            onChange={(e) => setProfileColor(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "1rem", background: "#fff" }}
          >
            {profileOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "#475569", marginBottom: 6 }}>
            Adet
          </label>
          <input 
            type="number" 
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value) || 1)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "1rem" }}
          />
        </div>
      </div>

      {parsedFabricColors.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "#475569", marginBottom: 6 }}>
            Kumaş Seçimi
          </label>
          <select 
            value={fabricColor}
            onChange={(e) => setFabricColor(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "1rem", background: "#fff" }}
          >
            <option value="">Seçiniz...</option>
            {parsedFabricColors.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}

      {!parsedFabricColors.length && (
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "#475569", marginBottom: 6 }}>
            Kumaş Kodu / Rengi (İsteğe Bağlı)
          </label>
          <input 
            type="text" 
            placeholder="Örn: 3001 Siyah"
            value={fabricColor}
            onChange={(e) => setFabricColor(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "1rem" }}
          />
        </div>
      )}

      <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 20, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: "1.1rem", color: "#475569", fontWeight: 500 }}>Toplam Tutar:</span>
          <span style={{ fontSize: "2rem", color: "#0f172a", fontWeight: 800 }}>
            {totalPrice > 0 ? formatMoney(totalPrice * 100) : "---"}
          </span>
        </div>
        {totalPrice > 0 && <p style={{ fontSize: "0.8rem", color: "#64748b", textAlign: "right", marginTop: 4 }}>*Minimum 1 m² üzerinden hesaplanmıştır.</p>}
      </div>

      <button 
        onClick={handleWhatsapp}
        style={{
          width: "100%",
          padding: "16px",
          background: "#25D366",
          color: "#fff",
          fontSize: "1.1rem",
          fontWeight: 700,
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 10,
          transition: "transform 0.1s, background 0.2s"
        }}
        onMouseOver={(e) => e.currentTarget.style.background = "#1da851"}
        onMouseOut={(e) => e.currentTarget.style.background = "#25D366"}
        onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.98)"}
        onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        WhatsApp'tan Sipariş Ver
      </button>
    </div>
  );
}
