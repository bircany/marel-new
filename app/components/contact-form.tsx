"use client";

import { useState } from "react";

export function ContactForm() {
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setMessage("");
    setIsSuccess(false);

    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string; message?: string };
      setPending(false);

      if (response.ok) {
        setIsSuccess(true);
        setMessage("Talebiniz başarıyla alındı. Marel danışmanımız en kısa sürede sizinle iletişime geçecektir.");
        event.currentTarget.reset();
      } else {
        setIsSuccess(false);
        setMessage(data.error ?? "Mesaj gönderilemedi. Lütfen bilgilerinizi kontrol edin.");
      }
    } catch {
      setPending(false);
      setIsSuccess(false);
      setMessage("Sunucuya bağlanılamadı. Lütfen doğrudan WhatsApp üzerinden bize ulaşın.");
    }
  };

  return (
    <div className="contact-form-card">
      <div className="contact-form-header">
        <span className="contact-badge">MESAJ GÖNDERİN</span>
        <h3>Bize Ulaşın</h3>
        <p>Ürün, ölçü alma desteği, özel projeler veya sipariş durumunuz için formu doldurun.</p>
      </div>

      <form className="contact-form-modern" onSubmit={submit}>
        <input className="contact-honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />

        <div className="form-row-2">
          <div className="form-group">
            <label htmlFor="c-name">Adınız ve Soyadınız *</label>
            <input
              id="c-name"
              name="name"
              placeholder="Ahmet Yılmaz"
              minLength={2}
              maxLength={100}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="c-email">E-Posta Adresiniz *</label>
            <input
              id="c-email"
              name="email"
              type="email"
              placeholder="ahmet@example.com"
              maxLength={160}
              required
            />
          </div>
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label htmlFor="c-phone">Telefon Numaranız</label>
            <input
              id="c-phone"
              name="phone"
              type="tel"
              placeholder="05XX XXX XX XX"
              maxLength={40}
            />
          </div>
          <div className="form-group">
            <label htmlFor="c-subject">Konu / Hizmet Türü *</label>
            <select id="c-subject" name="subject" defaultValue="Ölçü ve Ürün Danışmanlığı">
              <option value="Ölçü ve Ürün Danışmanlığı">Ölçü ve Ürün Danışmanlığı</option>
              <option value="Plise Perde Özel Sipariş">Plise Perde Özel Sipariş</option>
              <option value="Jaluzi / Zip Perde Teklifi">Jaluzi / Zip Perde Teklifi</option>
              <option value="Sineklik / Sürme Kapı">Sineklik / Sürme Kapı</option>
              <option value="Mevcut Sipariş Durumu">Mevcut Sipariş Durumu</option>
              <option value="Diğer Talepler">Diğer Talepler</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="c-message">Mesajınız & Pencere/Mekân Detayları *</label>
          <textarea
            id="c-message"
            name="message"
            placeholder="Örn: 4 adet cam balkon kanadı için plise perde yaptırmak istiyorum, yaklaşık ölçüler..."
            minLength={10}
            maxLength={2500}
            rows={5}
            required
          />
        </div>

        <div className="contact-privacy-consent">
          <small>
            Göndererek, kişisel verilerinizin talebinizin yanıtlanması amacıyla işlenmesini ve{" "}
            <a href="/kvkk-aydinlatma-metni" target="_blank" rel="noreferrer">
              KVKK Aydınlatma Metni
            </a>
            &apos;ni kabul etmiş olursunuz.
          </small>
        </div>

        {message ? (
          <div className={`contact-status-alert ${isSuccess ? "success" : "error"}`} role="alert">
            <span>{isSuccess ? "✓" : "⚠️"}</span>
            <span>{message}</span>
          </div>
        ) : null}

        <button type="submit" className="contact-submit-btn" disabled={pending}>
          {pending ? (
            <span>İletiliyor…</span>
          ) : (
            <>
              Mesajı İlet <span>→</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
