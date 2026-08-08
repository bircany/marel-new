"use client";

import { useState } from "react";

export function ContactForm() {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setPending(true); setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) });
    const data = await response.json() as { error?: string; message?: string };
    setPending(false); setMessage(data.error ?? data.message ?? "");
    if (response.ok) event.currentTarget.reset();
  };
  return <form className="contact-form" onSubmit={submit}>
    <input className="contact-honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
    <div><label>Adınız ve soyadınız<input name="name" minLength={2} maxLength={100} required /></label><label>E-posta<input name="email" type="email" maxLength={160} required /></label></div>
    <div><label>Telefon<input name="phone" type="tel" maxLength={40} /></label><label>Konu<select name="subject" defaultValue="Ürün ve ölçü danışmanlığı"><option>Ürün ve ölçü danışmanlığı</option><option>Sipariş hakkında</option><option>İade ve değişim</option><option>Kurumsal iş birliği</option><option>Diğer</option></select></label></div>
    <label>Mesajınız<textarea name="message" minLength={10} maxLength={2500} rows={7} required /></label>
    <button type="submit" disabled={pending}>{pending ? "Gönderiliyor…" : "Mesajı gönder"}<span>→</span></button>
    {message ? <p className="contact-form-message">{message}</p> : null}
    <small>Göndererek kişisel verilerinizin talebinize yanıt verilmesi amacıyla işlenmesini kabul etmiş olursunuz. <a href="/gizlilik-ve-iade-kosullari">Aydınlatma metni</a></small>
  </form>;
}
