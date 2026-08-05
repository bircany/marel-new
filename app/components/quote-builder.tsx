"use client";

import { useMemo, useState } from "react";

const fabricColors = [
  { name: "100 Beyaz", hex: "#e9e6de" }, { name: "108 Krem", hex: "#cbbfa7" },
  { name: "102 Gri", hex: "#8d8e8c" }, { name: "109 Açık Gri", hex: "#b9bab5" },
  { name: "110 Antrasit", hex: "#2d2d2d" }, { name: "111 Siyah", hex: "#111111" },
];
const frameColors = [
  { name: "Beyaz", hex: "#f3f2ed" }, { name: "Antrasit", hex: "#37393b" },
  { name: "Siyah", hex: "#111214" }, { name: "Bronz", hex: "#67523e" }, { name: "Kahve", hex: "#6a3f22" },
];

export function QuoteBuilder() {
  const [fabric, setFabric] = useState(fabricColors[0].name);
  const [frame, setFrame] = useState(frameColors[1].name);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [quantity, setQuantity] = useState("1");

  const message = useMemo(() => [
    "Merhaba Marel, Diamond Series için teklif almak istiyorum.", "",
    `Kumaş rengi: ${fabric}`, `Kasa rengi: ${frame}`,
    `Ölçü: ${width || "Belirtilmedi"} cm x ${height || "Belirtilmedi"} cm`,
    `Adet: ${quantity || "1"}`, "", "Ürün sayfası: marelpliseperde.com/urunler/plise-perde/diamond-serisi",
  ].join("\n"), [fabric, frame, width, height, quantity]);

  const openWhatsApp = () => window.open(`https://wa.me/905467356602?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");

  return (
    <div className="quote-builder">
      <div className="form-section">
        <div className="form-label">Kumaş rengi <span>{fabric}</span></div>
        <div className="swatch-grid">
          {fabricColors.map((color) => <button type="button" className={`swatch-button ${fabric === color.name ? "selected" : ""}`} onClick={() => setFabric(color.name)} key={color.name} aria-pressed={fabric === color.name}><span className="swatch-color" style={{ backgroundColor: color.hex }} /><small>{color.name}</small></button>)}
        </div>
      </div>
      <div className="form-section">
        <div className="form-label">Kasa rengi <span>{frame}</span></div>
        <div className="swatch-grid">
          {frameColors.map((color) => <button type="button" className={`swatch-button ${frame === color.name ? "selected" : ""}`} onClick={() => setFrame(color.name)} key={color.name} aria-pressed={frame === color.name}><span className="swatch-color" style={{ backgroundColor: color.hex }} /><small>{color.name}</small></button>)}
        </div>
      </div>
      <div className="form-section">
        <div className="form-label">Ölçü ve adet <span>Santimetre</span></div>
        <div className="input-grid">
          <div className="field"><label htmlFor="width">Genişlik (cm)</label><input id="width" type="number" inputMode="decimal" min="1" placeholder="Örn. 120" value={width} onChange={(e) => setWidth(e.target.value)} /></div>
          <div className="field"><label htmlFor="height">Yükseklik (cm)</label><input id="height" type="number" inputMode="decimal" min="1" placeholder="Örn. 180" value={height} onChange={(e) => setHeight(e.target.value)} /></div>
          <div className="field"><label htmlFor="quantity">Adet</label><input id="quantity" type="number" inputMode="numeric" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></div>
        </div>
      </div>
      <div className="selection-summary">
        <h3>Teklif özeti</h3>
        <dl>
          <div><dt>Seri</dt><dd>Diamond</dd></div><div><dt>Kumaş</dt><dd>{fabric}</dd></div>
          <div><dt>Kasa</dt><dd>{frame}</dd></div><div><dt>Ölçü</dt><dd>{width || "—"} × {height || "—"} cm</dd></div>
          <div><dt>Adet</dt><dd>{quantity || "1"}</dd></div><div><dt>Fiyat</dt><dd>Ölçüye göre</dd></div>
        </dl>
      </div>
      <button className="whatsapp-button" type="button" onClick={openWhatsApp}>WhatsApp&apos;tan teklif al ↗</button>
      <p className="quote-note">Butona bastığınızda seçimleriniz hazır mesaj olarak WhatsApp&apos;a aktarılır. Sipariş oluşturulmaz.</p>
    </div>
  );
}
