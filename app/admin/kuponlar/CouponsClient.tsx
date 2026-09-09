"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CouponRecord } from "@/db";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function createCouponCode() {
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  return `MRL-${Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("")}`;
}

interface CouponsClientProps {
  initialCoupons: CouponRecord[];
}

export function CouponsClient({ initialCoupons }: CouponsClientProps) {
  const router = useRouter();
  const [coupons, setCoupons] = useState<CouponRecord[]>(initialCoupons);
  const [code, setCode] = useState(createCouponCode);
  const [type, setType] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [value, setValue] = useState("");
  const [minSubtotal, setMinSubtotal] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "inactive" | "expired">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/admin/coupons", { cache: "no-store" })
      .then(async (res) => {
        const data = (await res.json()) as CouponRecord[] | { error?: string };
        if (!res.ok) throw new Error("error" in data ? data.error : "Kuponlar yüklenemedi.");
        if (!cancelled && Array.isArray(data)) setCoupons(data);
      })
      .catch((error) => {
        if (!cancelled) setToast({ type: "error", text: error instanceof Error ? error.message : "Kuponlar yüklenemedi." });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          discountType: type,
          discountValue: Number(value),
          minimumSubtotal: minSubtotal ? Number(minSubtotal) : 0,
          usageLimit: usageLimit ? Number(usageLimit) : null,
          expiresAt: expiresAt || null,
          isActive: true,
        }),
      });

      const data = (await res.json()) as any;
      if (!res.ok) throw new Error(data?.error || "Kupon oluşturulamadı.");

      setCoupons((prev) => [data, ...prev]);
      setCode(createCouponCode());
      setValue("");
      setMinSubtotal("");
      setUsageLimit("");
      setExpiresAt("");
      setToast({ type: "success", text: `"${code}" kuponu başarıyla oluşturuldu!` });
      router.refresh();
    } catch (err) {
      setToast({ type: "error", text: err instanceof Error ? err.message : "Kupon oluşturulamadı." });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, couponCode: string) => {
    if (!window.confirm(`"${couponCode}" kuponunu silmek istediğinize emin misiniz?`)) return;

    try {
      const res = await fetch(`/api/admin/coupons?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Kupon silinemedi.");

      setCoupons((prev) => prev.filter((c) => c.id !== id));
      setToast({ type: "success", text: `"${couponCode}" kuponu silindi.` });
      router.refresh();
    } catch (err) {
      setToast({ type: "error", text: err instanceof Error ? err.message : "Silme başarısız." });
    }
  };

  const handleToggle = async (coupon: CouponRecord) => {
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: coupon.id, active: !coupon.active }),
      });
      const data = (await res.json()) as CouponRecord & { error?: string };
      if (!res.ok) throw new Error(data?.error || "Kupon güncellenemedi.");
      setCoupons((prev) => prev.map((item) => item.id === coupon.id ? data : item));
    } catch (err) {
      setToast({ type: "error", text: err instanceof Error ? err.message : "Kupon güncellenemedi." });
    }
  };

  const filteredCoupons = coupons.filter((coupon) => {
    const expired = Boolean(coupon.expiresAt && new Date(coupon.expiresAt) < new Date());
    return (!search || coupon.code.toLowerCase().includes(search.toLowerCase())) &&
      (filter === "all" || (filter === "active" && coupon.active && !expired) || (filter === "inactive" && !coupon.active) || (filter === "expired" && expired));
  });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 60 }}>
      {/* Toast */}
      {toast && (
        <div
          style={{
            padding: "12px 20px",
            borderRadius: 8,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: toast.type === "success" ? "#dcfce7" : "#fee2e2",
            color: toast.type === "success" ? "#15803d" : "#b91c1c",
            border: `1px solid ${toast.type === "success" ? "#86efac" : "#fca5a5"}`,
            fontWeight: 500,
          }}
        >
          <span>{toast.text}</span>
          <button
            onClick={() => setToast(null)}
            style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <header className="admin-page-header">
        <div className="admin-page-header-left">
          <span>PAZARLAMA & DÖNÜŞÜM</span>
          <h1>Kupon & İndirim Yönetimi</h1>
          <p>
            Müşterileriniz için özel indirim kuponları oluşturun, sepet alt limitleri belirleyin ve kullanım oranlarını anlık takip edin.
          </p>
        </div>
      </header>

      {/* 2-Column Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* Left Column: Create Coupon Form */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <h2 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", color: "#0f172a" }}>
            Yeni Kupon Oluştur
          </h2>

          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Code Generator Box */}
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                Kupon Kodu
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    fontFamily: "monospace",
                    fontWeight: 700,
                    fontSize: "1rem",
                    letterSpacing: 1,
                  }}
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  style={{
                    backgroundColor: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    color: "#334155",
                    padding: "0 14px",
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  {copied ? "✓ Kopyalandı" : "Kopyala"}
                </button>
                <button
                  type="button"
                  onClick={() => setCode(createCouponCode())}
                  title="Yeni Kod Üret"
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    color: "#64748b",
                    padding: "0 12px",
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                >
                  🔄
                </button>
              </div>
            </div>

            {/* Discount Type & Value */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                  İndirim Türü
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as "PERCENT" | "FIXED")}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    fontSize: "0.9rem",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <option value="PERCENT">Yüzde (%)</option>
                  <option value="FIXED">Sabit Tutar (₺)</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                  İndirim Değeri {type === "PERCENT" ? "(%)" : "(₺)"}
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={type === "PERCENT" ? "Örn: 15" : "Örn: 250"}
                  required
                  min="1"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    fontSize: "0.9rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {/* Min Subtotal & Usage Limit */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                  Min. Sepet Tutarı (₺)
                </label>
                <input
                  type="number"
                  value={minSubtotal}
                  onChange={(e) => setMinSubtotal(e.target.value)}
                  placeholder="0 = Limitsiz"
                  min="0"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    fontSize: "0.9rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                  Kullanım Sınırı
                </label>
                <input
                  type="number"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  placeholder="Boş = Sınırsız"
                  min="1"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    fontSize: "0.9rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {/* Expiry Date */}
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                Son Kullanma Tarihi (Opsiyonel)
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  fontSize: "0.9rem",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: "#0f172a",
                color: "#ffffff",
                padding: "12px 20px",
                borderRadius: 8,
                border: "none",
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: 6,
                transition: "opacity 0.2s",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Oluşturuluyor..." : "+ Kuponu Kaydet & Aktifleştir"}
            </button>
          </form>
        </div>

        {/* Right Column: Existing Coupons List */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: "1.1rem", color: "#0f172a" }}>
              Aktif & Geçmiş Kuponlar ({coupons.length})
            </h2>
            <a href="/api/admin/coupons?format=csv" download style={{ color: "#334155", fontSize: "0.8rem", fontWeight: 600 }}>CSV dışa aktar</a>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Kod ara…" style={{ flex: 1, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }} />
            <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} style={{ padding: "8px", border: "1px solid #cbd5e1", borderRadius: 6 }}>
              <option value="all">Tümü</option><option value="active">Aktif</option><option value="inactive">Pasif</option><option value="expired">Süresi dolan</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredCoupons.length > 0 ? (
              filteredCoupons.map((coupon) => {
                const discountText =
                  coupon.discountType === "PERCENT"
                    ? `%${coupon.discountValue} İndirim`
                    : `${(coupon.discountValue / 100).toLocaleString("tr-TR")} ₺ İndirim`;

                const minText =
                  coupon.minimumSubtotal > 0
                    ? `Min. ${(coupon.minimumSubtotal / 100).toLocaleString("tr-TR")} ₺`
                    : "Alt limitsiz";

                const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();

                return (
                  <div
                    key={coupon.id}
                    style={{
                      padding: "14px 16px",
                      borderRadius: 10,
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#f8fafc",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <strong
                          style={{
                            fontFamily: "monospace",
                            fontSize: "1rem",
                            color: "#0f172a",
                            backgroundColor: "#e2e8f0",
                            padding: "2px 8px",
                            borderRadius: 4,
                          }}
                        >
                          {coupon.code}
                        </strong>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            padding: "2px 8px",
                            borderRadius: 999,
                            backgroundColor: isExpired ? "#fee2e2" : coupon.active ? "#dcfce7" : "#f1f5f9",
                            color: isExpired ? "#991b1b" : coupon.active ? "#166534" : "#64748b",
                          }}
                        >
                          {isExpired ? "Süresi Doldu" : coupon.active ? "Aktif" : "Pasif"}
                        </span>
                      </div>

                      <div style={{ fontSize: "0.85rem", color: "#334155" }}>
                        <strong>{discountText}</strong> · <span style={{ color: "#64748b" }}>{minText}</span>
                      </div>

                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>
                        Kullanım: {coupon.usageCount}
                        {coupon.usageLimit ? ` / ${coupon.usageLimit}` : " (Limitsiz)"}
                        {coupon.expiresAt ? ` · Bitiş: ${coupon.expiresAt}` : ""}
                      </div>
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => handleToggle(coupon)}
                        style={{ backgroundColor: "#fff", border: "1px solid #cbd5e1", color: "#334155", padding: "6px 10px", borderRadius: 6, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", marginRight: 6 }}
                      >
                        {coupon.active ? "Pasifleştir" : "Aktifleştir"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(coupon.id, coupon.code)}
                        style={{
                          backgroundColor: "#fff",
                          border: "1px solid #fca5a5",
                          color: "#b91c1c",
                          padding: "6px 12px",
                          borderRadius: 6,
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
                Henüz tanımlanmış kupon bulunmuyor.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
