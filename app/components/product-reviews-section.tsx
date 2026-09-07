"use client";

import React, { useState, useMemo } from "react";
import type { ReviewRecord } from "@/db";

interface ProductReviewsSectionProps {
  productId: string;
  productName: string;
  initialReviews: ReviewRecord[];
}

export function ProductReviewsSection({
  productId,
  productName,
  initialReviews,
}: ProductReviewsSectionProps) {
  const [reviews, setReviews] = useState<ReviewRecord[]>(initialReviews);
  const [visibleCount, setVisibleCount] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Form states
  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState("");
  const [formComment, setFormComment] = useState("");
  const [formName, setFormName] = useState("");

  // Calculations for score and breakdown
  const stats = useMemo(() => {
    if (reviews.length === 0) {
      return {
        avg: 4.8,
        total: 0,
        counts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>,
        percents: { 5: 85, 4: 15, 3: 0, 2: 0, 1: 0 } as Record<number, number>,
      };
    }
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    reviews.forEach((r) => {
      const star = Math.min(5, Math.max(1, r.rating));
      counts[star] = (counts[star] || 0) + 1;
      sum += star;
    });
    const avg = (sum / reviews.length).toFixed(1);
    const percents: Record<number, number> = {
      5: Math.round((counts[5] / reviews.length) * 100),
      4: Math.round((counts[4] / reviews.length) * 100),
      3: Math.round((counts[3] / reviews.length) * 100),
      2: Math.round((counts[2] / reviews.length) * 100),
      1: Math.round((counts[1] / reviews.length) * 100),
    };
    return { avg, total: reviews.length, counts, percents };
  }, [reviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formComment && !formTitle) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating: formRating,
          title: formTitle || "Müşteri Değerlendirmesi",
          body: formComment,
        }),
      });

      if (res.ok) {
        const newRev: ReviewRecord = {
          id: `rev-user-${Date.now()}`,
          userId: null,
          productId,
          productName,
          authorName: formName || "Değerli Müşterimiz",
          rating: formRating,
          title: formTitle || "Müşteri Değerlendirmesi",
          body: formComment,
          status: "approved",
          adminReply: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setReviews([newRev, ...reviews]);
        setSuccessMessage("Yorumunuz başarıyla kaydedildi! Teşekkür ederiz.");
        setFormTitle("");
        setFormComment("");
        setFormName("");
        setTimeout(() => {
          setIsModalOpen(false);
          setSuccessMessage("");
        }, 2000);
      } else {
        alert("Yorum gönderilirken bir hata oluştu.");
      }
    } catch {
      alert("Bağlantı hatası oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  const visibleReviews = reviews.slice(0, visibleCount);

  return (
    <section className="product-reviews-container shop-container" id="yorumlar">
      <h2 className="reviews-section-title">Yorumlar</h2>

      <div className="reviews-summary-card">
        <div className="reviews-score-col">
          <div className="reviews-big-score">{stats.avg}</div>
        </div>

        <div className="reviews-bars-col">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="review-bar-row">
              <div className="review-bar-stars">
                {"★".repeat(star)}
                <span className="empty-stars">{"★".repeat(5 - star)}</span>
              </div>
              <div className="review-progress-track">
                <div
                  className="review-progress-fill"
                  style={{ width: `${stats.percents[star]}%` }}
                />
              </div>
              <span className="review-star-label">{star}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="add-review-btn-wrap">
        <button
          type="button"
          className="kamatas-black-btn"
          onClick={() => setIsModalOpen(true)}
        >
          Yorum Ekle
        </button>
      </div>

      {isModalOpen && (
        <div className="review-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="review-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="review-modal-header">
              <h3>{productName} - Yorum Yazın</h3>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {successMessage ? (
              <div className="review-success-box">{successMessage}</div>
            ) : (
              <form onSubmit={handleSubmitReview} className="review-form">
                <div className="form-group">
                  <label>Puanınız *</label>
                  <div className="star-picker">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`star-pick-btn ${s <= formRating ? "selected" : ""}`}
                        onClick={() => setFormRating(s)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Adınız Soyadınız</label>
                  <input
                    type="text"
                    placeholder="Örn: Ahmet Y."
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Başlık *</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Kaliteli ve tam ölçüsünde"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Yorumunuz *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Ürün hakkındaki deneyimlerinizi paylaşın..."
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="kamatas-btn"
                  style={{ width: "100%", marginTop: "12px" }}
                >
                  {submitting ? "Gönderiliyor..." : "Yorumu Gönder"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="reviews-list">
        {visibleReviews.map((rev) => {
          const formattedDate = new Date(rev.createdAt).toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });

          return (
            <article key={rev.id} className="kamatas-review-item">
              <div className="review-item-header">
                <div className="review-item-title-col">
                  <h4 className="review-item-title">{rev.title}</h4>
                  <p className="review-item-body">{rev.body}</p>
                  <span className="review-item-author">{rev.authorName || "Müşteri"}</span>
                </div>
                <div className="review-item-meta-col">
                  <div className="review-item-stars">
                    {"★".repeat(rev.rating)}
                  </div>
                  <span className="review-item-date">{formattedDate} Ö</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {visibleCount < reviews.length && (
        <div className="reviews-more-wrap">
          <button
            type="button"
            className="kamatas-more-btn"
            onClick={() => setVisibleCount((prev) => prev + 5)}
          >
            Daha Fazla Göster ({reviews.length - visibleCount}) ⌄
          </button>
        </div>
      )}
    </section>
  );
}
