"use client";

import { useState } from "react";
import { formatMoney } from "@/app/lib/commerce";

const statusNames: Record<string, string> = { pending: "Sipariş alındı", confirmed: "Onaylandı", production: "Üretimde", shipped: "Kargoya verildi", delivered: "Teslim edildi", cancelled: "İptal edildi" };
const progressByStatus: Record<string, number> = { pending: 12, confirmed: 34, production: 58, shipped: 82, delivered: 100, cancelled: 0 };

export function OrderTracker({ initialEmail = "", initialOrderNumber = "" }: { initialEmail?: string; initialOrderNumber?: string }) {
  const [result, setResult] = useState<{ orderNumber: string; status: string; total: number; currency: string; updatedAt: string } | null>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setPending(true); setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/orders/track?email=${encodeURIComponent(String(form.get("email")))}&orderNumber=${encodeURIComponent(String(form.get("orderNumber")))}`);
    const data = await response.json() as { order?: typeof result; error?: string };
    setResult(data.order ?? null); setMessage(data.error ?? ""); setPending(false);
  };
  const progress = result ? progressByStatus[result.status] ?? 0 : 0;
  return <section className="tracking-experience">
    <div className="tracking-story"><span>MAREL SİPARİŞ TAKİBİ</span><h1>Üretimden teslimata, her adım burada.</h1><p>Ölçü teyidi, üretim ve kargo durumunuzu sipariş numaranızla güvenli biçimde sorgulayın.</p><div className="tracking-steps"><article><b>01</b><span><strong>Sipariş onayı</strong><small>Ölçü, kumaş ve profil teyidi</small></span></article><article><b>02</b><span><strong>Ölçüye özel üretim</strong><small>Marel atölyesinde hazırlık</small></span></article><article><b>03</b><span><strong>Kargo ve teslimat</strong><small>Güncel durum bilgilendirmesi</small></span></article></div></div>
    <div className="tracking-panel"><span>SİPARİŞİNİZ NEREDE?</span><h2>Durumu sorgulayın.</h2><p>Siparişte kullandığınız e-posta ve size iletilen sipariş numarasını girin.</p><form onSubmit={submit} className="tracking-form"><label>E-posta<input name="email" type="email" defaultValue={initialEmail} placeholder="ornek@email.com" required /></label><label>Sipariş numarası<input name="orderNumber" defaultValue={initialOrderNumber} placeholder="MRL-260808-ABC123" required /></label><button type="submit" disabled={pending}>{pending ? "Sorgulanıyor…" : "Siparişimi sorgula"}<b>→</b></button></form>{message ? <p className="form-error">{message}</p> : null}{result ? <div className="tracking-result-card"><div><small>SİPARİŞ</small><h3>{result.orderNumber}</h3><strong className={`order-status status-${result.status}`}>{statusNames[result.status] ?? result.status}</strong></div>{result.status !== "cancelled" ? <div className="tracking-progress"><i style={{ width: `${progress}%` }} /></div> : null}<div className="tracking-result-meta"><span><small>Güncel durum</small><b>{statusNames[result.status] ?? result.status}</b></span><span><small>Sipariş toplamı</small><b>{formatMoney(result.total, result.currency)}</b></span><span><small>Son güncelleme</small><b>{new Date(result.updatedAt).toLocaleString("tr-TR")}</b></span></div></div> : null}<small className="tracking-secure">Bilgileriniz yalnız siparişinizi doğrulamak için kullanılır.</small></div>
  </section>;
}
