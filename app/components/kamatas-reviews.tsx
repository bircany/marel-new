"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type ReviewItem = {
  id?: string;
  name?: string;
  authorName?: string;
  rating: number;
  text?: string;
  body?: string;
  title?: string;
  productName?: string;
};

const defaultReviews: ReviewItem[] = [
  {
    name: "Betül K***",
    rating: 5,
    title: "Mükemmel Kalite & Tam Ölçü",
    text: "Dışarıda bize fahiş fiyatlar verdiler, Marel'de kalite birebir aynı hatta çok daha sağlam geldi. Teşekkür ederiz.",
  },
  {
    name: "Berke O***",
    rating: 5,
    title: "Hızlı Kargo & Kusursuz Paketleme",
    text: "Ürün tam istediğim gibi ve görselde gösterildiği gibi geldi. Çok güzel paketlemişler, satıcıya ve kargoya teşekkürler.",
  },
  {
    name: "Şahin Ş***",
    rating: 5,
    title: "4. Siparişim, Çok Memnunum",
    text: "Marel'den 4. siparişim. Montajı çok kolay, plise mekanizması pürüzsüz çalışıyor. Düşünmeden sipariş verebilirsiniz.",
  },
  {
    name: "Ahmet Y***",
    rating: 5,
    title: "Montajı 10 Dakikada Yaptım",
    text: "Çok beğendim, tam istediğim gibi geldi. Profil kalınlığı ve kumaş dokusu çok kaliteli. Emeğinize sağlık Marel!",
  },
  {
    name: "Ayşe D***",
    rating: 5,
    title: "Cam Balkonumuza Çok Yakıştı",
    text: "Güneşi ve sıcaklığı çok iyi kesiyor, odanın havası değişti. Ölçüleri milimetrik oturttular.",
  },
  {
    name: "Mehmet K***",
    rating: 5,
    title: "Tavsiye Ederim",
    text: "Ürün tam zamanında geldi, paketleme çok iyiydi. Montaj videosu sayesinde rahatça kurdum. Teşekkürler.",
  },
];

export function KamatasReviews({ initialReviews }: { initialReviews?: ReviewItem[] }) {
  const reviewsList = useMemo(() => {
    if (initialReviews && initialReviews.length >= 3) {
      return initialReviews.map((r) => ({
        id: r.id,
        name: r.authorName || r.name || "Müşteri",
        rating: r.rating || 5,
        title: r.title || "Müşteri Değerlendirmesi",
        text: r.body || r.text || "",
        productName: r.productName,
      }));
    }
    return defaultReviews;
  }, [initialReviews]);

  const [current, setCurrent] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Review form state
  const [formData, setFormData] = useState({
    name: "",
    rating: 5,
    title: "",
    comment: "",
  });

  useEffect(() => {
    if (reviewsList.length <= 3) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % reviewsList.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [reviewsList.length]);

  const visibleReviews = () => {
    const items = [];
    const count = Math.min(3, reviewsList.length);
    for (let i = 0; i < count; i++) {
      items.push(reviewsList[(current + i) % reviewsList.length]);
    }
    return items;
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.comment.trim()) {
      setSubmitError("Lütfen adınızı ve yorumunuzu giriniz.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: formData.name.trim(),
          rating: formData.rating,
          title: formData.title.trim() || "Müşteri Değerlendirmesi",
          body: formData.comment.trim(),
        }),
      });

      if (res.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setIsModalOpen(false);
          setSubmitSuccess(false);
          setFormData({ name: "", rating: 5, title: "", comment: "" });
        }, 2500);
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setSubmitError(data.error || "Yorum iletilirken bir hata oluştu.");
      }
    } catch {
      setSubmitError("Bağlantı hatası oluştu, lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="store-reviews kamatas-reviews" id="yorumlar" style={{ background: "#f8f9fa", padding: "60px 0" }}>
      <div className="shop-container">
        <div style={{ textAlign: "center", marginBottom: 35 }}>
          <span style={{ color: "#d97706", fontWeight: 800, fontSize: "0.8rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            GERÇEK MÜŞTERİ DENEYİMLERİ
          </span>
          <h2 style={{ fontSize: "1.85rem", fontWeight: 900, color: "#111827", margin: "6px 0" }}>
            Müşterilerimiz Bizim İçin Ne Diyor?
          </h2>
          <p style={{ color: "#6b7280", fontSize: "0.92rem", maxWidth: 580, margin: "0 auto" }}>
            Marel Plise Perde kalitesiyle buluşan binlerce memnun müşterimizin onaylı yorumları.
          </p>
        </div>

        {/* 3 Auto-cycling reviews */}
        <div className="review-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {visibleReviews().map((review, idx) => (
            <article
              key={`${review.name}-${idx}-${review.title}`}
              style={{
                background: "#ffffff",
                padding: "24px 22px",
                borderRadius: 14,
                boxShadow: "0 6px 20px rgba(0,0,0,0.04)",
                border: "1px solid #f1f3f5",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: 180,
                transition: "all 0.3s ease",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div className="review-stars" style={{ color: "#f59e0b", fontSize: "1.1rem" }}>
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </div>
                  <span style={{ fontSize: "0.68rem", color: "#10b981", background: "#ecfdf5", padding: "3px 8px", borderRadius: 20, fontWeight: 700 }}>
                    ✓ Onaylı Alışveriş
                  </span>
                </div>
                {review.title ? (
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#1f2937", margin: "0 0 8px" }}>
                    {review.title}
                  </h4>
                ) : null}
                <p style={{ color: "#4b5563", fontSize: "0.86rem", lineHeight: 1.55, margin: 0 }}>
                  &ldquo;{review.text}&rdquo;
                </p>
              </div>

              <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ color: "#111827", fontSize: "0.88rem", fontWeight: 750 }}>
                  {review.name}
                </strong>
                {review.productName ? (
                  <small style={{ color: "#9ca3af", fontSize: "0.72rem" }}>
                    {review.productName}
                  </small>
                ) : null}
              </div>
            </article>
          ))}
        </div>

        {/* Action Buttons: Google'da Bizi Değerlendirin & Yorum Bırakın */}
        <div
          style={{
            marginTop: 40,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 16,
            alignItems: "center",
          }}
        >
          {/* Google Review Button */}
          <a
            href="https://www.google.com/search?q=Marel+Plise+Perde+Elbistan#lrd=0x0:0x0,3,,,"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "13px 24px",
              borderRadius: 30,
              background: "#ffffff",
              color: "#1f2937",
              border: "1.5px solid #e5e7eb",
              boxShadow: "0 4px 14px rgba(0,0,0,0.05)",
              fontWeight: 750,
              fontSize: "0.88rem",
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = "#4285f4")}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google&apos;da Bizi Değerlendirin</span>
            <span style={{ color: "#f59e0b", fontSize: "0.95rem" }}>★★★★★</span>
          </a>

          {/* Leave a Review Button */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "13px 26px",
              borderRadius: 30,
              background: "#111827",
              color: "#ffffff",
              border: "none",
              boxShadow: "0 4px 16px rgba(17,24,39,0.15)",
              fontWeight: 750,
              fontSize: "0.88rem",
              cursor: "pointer",
              transition: "background 0.2s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#2563eb")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#111827")}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            <span>Yorum Bırakın</span>
          </button>
        </div>
      </div>

      {/* Review Submission Modal */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0, 0, 0, 0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => !isSubmitting && setIsModalOpen(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 18,
              maxWidth: 500,
              width: "100%",
              padding: "32px 28px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              style={{
                position: "absolute",
                top: 18,
                right: 18,
                background: "#f3f4f6",
                border: "none",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
                cursor: "pointer",
                color: "#4b5563",
              }}
            >
              ✕
            </button>

            {submitSuccess ? (
              <div style={{ textAlign: "center", padding: "30px 10px" }}>
                <div style={{ fontSize: "3rem", marginBottom: 12 }}>🎉</div>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#111827", margin: "0 0 8px" }}>
                  Yorumunuz İçin Teşekkür Ederiz!
                </h3>
                <p style={{ color: "#4b5563", fontSize: "0.9rem", lineHeight: 1.5 }}>
                  Değerlendirmeniz başarıyla iletildi. İncelendikten sonra sitemizde yayınlanacaktır.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview}>
                <h3 style={{ fontSize: "1.35rem", fontWeight: 900, color: "#111827", margin: "0 0 6px" }}>
                  Marel Deneyiminizi Paylaşın
                </h3>
                <p style={{ color: "#6b7280", fontSize: "0.84rem", margin: "0 0 20px" }}>
                  Görüşleriniz hizmet kalitemizi artırmamızda bize ışık tutuyor.
                </p>

                {submitError && (
                  <div style={{ padding: "10px 14px", background: "#fef2f2", color: "#dc2626", borderRadius: 8, fontSize: "0.82rem", marginBottom: 14 }}>
                    {submitError}
                  </div>
                )}

                {/* Rating Selector */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                    Puanınız:
                  </label>
                  <div style={{ display: "flex", gap: 8, fontSize: "1.8rem", cursor: "pointer" }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFormData({ ...formData, rating: star })}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: star <= formData.rating ? "#f59e0b" : "#d1d5db",
                          fontSize: "1.8rem",
                          padding: 0,
                          lineHeight: 1,
                        }}
                      >
                        ★
                      </button>
                    ))}
                    <span style={{ fontSize: "0.85rem", color: "#6b7280", alignSelf: "center", marginLeft: 8, fontWeight: 600 }}>
                      {formData.rating} / 5 Yıldız
                    </span>
                  </div>
                </div>

                {/* Name */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#374151", marginBottom: 5 }}>
                    Adınız Soyadınız *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Örn: Ahmet Yılmaz"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: "1px solid #d1d5db",
                      fontSize: "0.88rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Title */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#374151", marginBottom: 5 }}>
                    Başlık (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Örn: Kaliteli malzeme, tam zamanında teslimat"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: "1px solid #d1d5db",
                      fontSize: "0.88rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Comment */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#374151", marginBottom: 5 }}>
                    Yorumunuz *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    placeholder="Ürünün kalitesi, montaj kolaylığı veya kargo süreci hakkındaki düşünceleriniz..."
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: "1px solid #d1d5db",
                      fontSize: "0.88rem",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: "100%",
                    padding: "13px",
                    borderRadius: 8,
                    background: "#111827",
                    color: "#ffffff",
                    border: "none",
                    fontWeight: 750,
                    fontSize: "0.92rem",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    transition: "background 0.2s ease",
                  }}
                >
                  {isSubmitting ? "Gönderiliyor..." : "Yorumu Gönder"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
