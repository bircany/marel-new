"use client";

import { useState } from "react";

const phone = "905467356602";
const products = ["Plise Perde", "Honeycomb Isı Yalıtımlı Perde", "Sineklik", "Zip Perde", "Jaluzi Perde", "Sürgülü Kapı"];

export function WhatsAppAdvisor() {
  const [open, setOpen] = useState(false);
  const [product, setProduct] = useState(products[0]);
  const [message, setMessage] = useState("Ölçüye özel fiyat ve renk seçenekleri hakkında bilgi almak istiyorum.");

  const goToWhatsApp = () => {
    const text = `Merhaba Marel,\nÜrün: ${product}\nTalebim: ${message}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <aside className={`wa-advisor ${open ? "is-open" : ""}`} aria-label="WhatsApp ürün danışmanı">
      {open ? (
        <div className="wa-panel">
          <div className="wa-panel-head">
            <div><span>M</span><p><strong>Marel Ürün Danışmanı</strong><small>Genellikle kısa sürede yanıt verir</small></p></div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Danışmanı kapat">×</button>
          </div>
          <div className="wa-panel-body">
            <p>Merhaba! Hangi ürün için yardımcı olalım?</p>
            <label><span>Ürün</span><select value={product} onChange={(event) => setProduct(event.target.value)}>{products.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label><span>Mesajınız</span><textarea rows={3} value={message} onChange={(event) => setMessage(event.target.value)} /></label>
            <button className="wa-send" type="button" onClick={goToWhatsApp}>WhatsApp&apos;ta konuşmayı başlat <b>↗</b></button>
            <small>Mesajınız 0546 735 66 02 numaralı Marel WhatsApp hattına yönlendirilir.</small>
          </div>
        </div>
      ) : null}
      <button className="wa-trigger" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <span>◉</span><b>{open ? "Kapat" : "WhatsApp Destek"}</b>
      </button>
    </aside>
  );
}
