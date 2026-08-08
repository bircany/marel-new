"use client";

import { useState } from "react";
import { formatMoney } from "@/app/lib/commerce";

export function OrderTracker({ initialEmail = "", initialOrderNumber = "" }: { initialEmail?: string; initialOrderNumber?: string }) {
  const [result, setResult] = useState<{ orderNumber: string; status: string; total: number; currency: string; updatedAt: string } | null>(null);
  const [message, setMessage] = useState("");
  const submit = async (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); const response = await fetch(`/api/orders/track?email=${encodeURIComponent(String(form.get("email")))}&orderNumber=${encodeURIComponent(String(form.get("orderNumber")))}`); const data = await response.json() as { order?: typeof result; error?: string }; setResult(data.order ?? null); setMessage(data.error ?? ""); };
  return <section className="tracking-card"><span>SİPARİŞ TAKİP</span><h1>Siparişiniz nerede?</h1><form onSubmit={submit} className="commerce-form"><label>E-posta<input name="email" type="email" defaultValue={initialEmail} required /></label><label>Sipariş numarası<input name="orderNumber" defaultValue={initialOrderNumber} required /></label><button type="submit">Sorgula</button></form>{message ? <p className="form-error">{message}</p> : null}{result ? <div className="tracking-result"><h2>{result.orderNumber}</h2><strong className={`order-status status-${result.status}`}>{result.status}</strong><p>{formatMoney(result.total, result.currency)}</p><small>Son güncelleme: {new Date(result.updatedAt).toLocaleString("tr-TR")}</small></div> : null}</section>;
}
