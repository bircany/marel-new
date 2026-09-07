"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/app/lib/commerce";
import type { CustomerRecord } from "@/db";

interface CustomersClientProps {
  initialCustomers: CustomerRecord[];
}

export function CustomersClient({ initialCustomers }: CustomersClientProps) {
  const [customers] = useState<CustomerRecord[]>(initialCustomers);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        (c.fullName || "").toLowerCase().includes(q) ||
        (c.email || "").toLowerCase().includes(q) ||
        (c.phone || "").includes(q),
    );
  }, [customers, search]);

  const stats = useMemo(() => {
    const total = customers.length;
    const repeat = customers.filter((c) => c.orderCount > 1).length;
    const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    const avgSpent = total > 0 ? totalRevenue / total : 0;
    return { total, repeat, totalRevenue, avgSpent };
  }, [customers]);

  const sendWhatsAppCustomer = (phone: string, name: string) => {
    const raw = phone.replace(/[^0-9]/g, "");
    if (!raw) return alert("Telefon numarası bulunamadı.");
    const clean = raw.startsWith("0") ? `9${raw}` : raw.startsWith("90") ? raw : `90${raw}`;
    const msg = `Merhaba Sn. ${name},\nMarel Plise Perde müşteri hizmetlerinden yazıyoruz. Size nasıl yardımcı olabiliriz?`;
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header */}
      <header className="admin-page-header">
        <div className="admin-page-header-left">
          <span>CRM & MÜŞTERİ YÖNETİMİ</span>
          <h1>Müşteri Rehberi & Analizi</h1>
          <p>
            Mağazanızdan sipariş veren kayıtlı ve misafir müşterilerin harcama hacimlerini, sipariş sıklıklarını ve iletişim bilgilerini görüntüleyin.
          </p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="admin-stats-grid" style={{ marginBottom: 24 }}>
        <div className="admin-stat-card">
          <small>Toplam Müşteri</small>
          <strong>{stats.total}</strong>
          <small style={{ color: "#38bdf8" }}>Sipariş veren tekil alıcılar</small>
        </div>
        <div className="admin-stat-card">
          <small>Tekrar Sipariş Veren</small>
          <strong style={{ color: "#22c55e" }}>{stats.repeat}</strong>
          <small>1'den fazla siparişi olanlar</small>
        </div>
        <div className="admin-stat-card">
          <small>Ortalama Harcama (LTV)</small>
          <strong style={{ color: "#eab308" }}>{formatMoney(stats.avgSpent)}</strong>
          <small>Müşteri başına ortalama ciro</small>
        </div>
        <div className="admin-stat-card">
          <small>Kümülatif Müşteri Hacmi</small>
          <strong style={{ color: "#6366f1" }}>{formatMoney(stats.totalRevenue)}</strong>
          <small>Toplam müşteri cirosu</small>
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar" style={{ marginBottom: 20 }}>
        <div className="admin-search-input" style={{ width: "100%", maxWidth: 450 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="İsim, e-posta veya telefon ile ara..."
          />
        </div>
      </div>

      {/* Customer Cards / Table */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.length > 0 ? (
          filtered.map((customer) => (
            <div
              key={customer.id || customer.email}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                padding: "18px 22px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 16,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              {/* Customer Avatar & Primary Info */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 260 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    backgroundColor: "#0f172a",
                    color: "#f8fafc",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {(customer.fullName || "M").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <strong style={{ fontSize: "1rem", color: "#0f172a" }}>{customer.fullName}</strong>
                    {customer.orderCount > 1 && (
                      <span
                        style={{
                          backgroundColor: "#fef3c7",
                          color: "#92400e",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: 4,
                        }}
                      >
                        ★ Sadık Müşteri ({customer.orderCount} Sipariş)
                      </span>
                    )}
                  </div>
                  <div style={{ color: "#64748b", fontSize: "0.82rem", marginTop: 2 }}>
                    ✉️ {customer.email} {customer.phone ? `· 📞 ${customer.phone}` : ""}
                  </div>
                </div>
              </div>

              {/* Financial & Order Metric */}
              <div style={{ display: "flex", gap: 24, alignItems: "center", fontSize: "0.85rem" }}>
                <div>
                  <small style={{ color: "#64748b", display: "block" }}>Toplam Harcama</small>
                  <strong style={{ color: "#16a34a", fontSize: "1.05rem" }}>
                    {formatMoney(customer.totalSpent)}
                  </strong>
                </div>

                <div>
                  <small style={{ color: "#64748b", display: "block" }}>Sipariş Sayısı</small>
                  <strong style={{ color: "#0f172a" }}>{customer.orderCount} Adet</strong>
                </div>

                <div>
                  <small style={{ color: "#64748b", display: "block" }}>Son Sipariş</small>
                  <span style={{ color: "#334155" }}>
                    {customer.lastOrderDate
                      ? new Date(customer.lastOrderDate).toLocaleDateString("tr-TR")
                      : "-"}
                  </span>
                </div>
              </div>

              {/* Quick Contact & Action Buttons */}
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {customer.phone && (
                  <button
                    type="button"
                    onClick={() => sendWhatsAppCustomer(customer.phone, customer.fullName)}
                    style={{
                      backgroundColor: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      color: "#166534",
                      padding: "7px 12px",
                      borderRadius: 6,
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    💬 WhatsApp
                  </button>
                )}
                {customer.phone && (
                  <a
                    href={`tel:${customer.phone}`}
                    style={{
                      backgroundColor: "#f8fafc",
                      border: "1px solid #cbd5e1",
                      color: "#334155",
                      padding: "7px 12px",
                      borderRadius: 6,
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    📞 Ara
                  </a>
                )}
                <Link
                  href={`/admin/siparisler`}
                  style={{
                    backgroundColor: "#0f172a",
                    color: "#ffffff",
                    padding: "7px 12px",
                    borderRadius: 6,
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Siparişleri Gör →
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              backgroundColor: "#ffffff",
              borderRadius: 12,
              border: "1px dashed #cbd5e1",
              color: "#64748b",
            }}
          >
            Arama kriterinize uygun müşteri bulunamadı.
          </div>
        )}
      </div>
    </div>
  );
}
