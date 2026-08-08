"use client";

import { useState } from "react";
import type { ReviewRecord } from "@/db";

const statusNames: Record<string, string> = { pending: "Onay bekliyor", approved: "Yayında", rejected: "Yayınlanmadı" };

export function CustomerReviews({ products, reviews }: { products: Array<{ id: string; name: string }>; reviews: ReviewRecord[] }) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true); setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/reviews", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId: form.get("productId"), rating: Number(form.get("rating")), title: form.get("title"), body: form.get("body") }) });
    const data = await response.json() as { error?: string; message?: string };
    setPending(false); setMessage(data.error ?? data.message ?? "");
    if (response.ok) { event.currentTarget.reset(); window.setTimeout(() => window.location.reload(), 900); }
  };
  return <section className="customer-review-panel" id="yorumlar">
    <div className="customer-review-heading"><div><span>DENEYİMİNİZ</span><h2>Yorumlarım</h2><p>Marel deneyiminizi paylaşın. Yorumunuz içerik kontrolünün ardından sitede yayınlanır.</p></div><b>{reviews.length} yorum</b></div>
    <div className="customer-review-grid">
      <form className="customer-review-form" onSubmit={submit}>
        <label>Ürün<select name="productId"><option value="">Genel Marel deneyimi</option>{products.map((product) => <option value={product.id} key={product.id}>{product.name}</option>)}</select></label>
        <label>Puan<select name="rating" defaultValue="5"><option value="5">★★★★★ — Çok iyi</option><option value="4">★★★★☆ — İyi</option><option value="3">★★★☆☆ — Orta</option><option value="2">★★☆☆☆ — Zayıf</option><option value="1">★☆☆☆☆ — Kötü</option></select></label>
        <label>Başlık<input name="title" minLength={3} maxLength={100} placeholder="Deneyiminizi özetleyin" required /></label>
        <label>Yorumunuz<textarea name="body" minLength={10} maxLength={1200} rows={5} placeholder="Ürün, ölçü veya hizmet deneyiminizi anlatın" required /></label>
        <button type="submit" disabled={pending}>{pending ? "Gönderiliyor…" : "Yorumu onaya gönder"}</button>
        {message ? <p className="customer-review-message">{message}</p> : null}
      </form>
      <div className="customer-review-history">{reviews.length ? reviews.map((review) => <article key={review.id}><div><span>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span><strong className={`review-state review-state-${review.status}`}>{statusNames[review.status] ?? review.status}</strong></div><h3>{review.title}</h3><small>{review.productName ?? "Genel Marel deneyimi"} · {new Date(review.createdAt).toLocaleDateString("tr-TR")}</small><p>{review.body}</p>{review.adminReply ? <blockquote><b>Marel yanıtı</b>{review.adminReply}</blockquote> : null}</article>) : <div className="customer-review-empty"><b>İlk yorumunuzu yazın</b><p>Gönderdiğiniz yorumlar ve yayın durumları burada görünür.</p></div>}</div>
    </div>
  </section>;
}
