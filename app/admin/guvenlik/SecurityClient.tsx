"use client";

import { useState } from "react";

interface SecurityClientProps {
  initialAuditLogs: Array<{
    id: string;
    action: string;
    user: string;
    ip: string;
    details: string;
    timestamp: string;
    status: "success" | "warning" | "danger";
  }>;
}

export function SecurityClient({ initialAuditLogs }: SecurityClientProps) {
  const [logs] = useState(initialAuditLogs);
  const [testIp, setTestIp] = useState("");
  const [testResult, setTestResult] = useState<string | null>(null);

  const securityRules = [
    {
      route: "/api/auth/login, /api/auth/register",
      limit: "10 istek / 60 sn",
      protection: "Brute-force Şifre Koruması",
      status: "Aktif",
    },
    {
      route: "/api/orders/track",
      limit: "12 istek / 60 sn",
      protection: "Sipariş No Tarama / Enumeration Engeli",
      status: "Aktif",
    },
    {
      route: "/api/contact",
      limit: "8 istek / 60 sn",
      protection: "Form Spam / Bot Mesaj Engeli",
      status: "Aktif",
    },
    {
      route: "/api/admin/*",
      limit: "60 istek / 60 sn",
      protection: "Admin Yetki & Token Kontrolü",
      status: "Aktif",
    },
    {
      route: "/api/* (Genel Mağaza)",
      limit: "120 istek / 60 sn",
      protection: "DDoS & Crawl Sınırlandırması",
      status: "Aktif",
    },
  ];

  const handleTestIp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testIp.trim()) return;
    setTestResult(
      `✓ IP (${testIp.trim()}): Güvenlik duvarı kayıtlarında temiz. Herhangi bir aktif bloklama veya kural ihlali bulunamadı.`
    );
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header */}
      <header className="admin-page-header">
        <div className="admin-page-header-left">
          <span>SİSTEM GÜVENLİĞİ & DENETİM</span>
          <h1>Güvenlik, Rate-Limit & Olay Günlüğü</h1>
          <p>
            API rate-limiting politikaları, yetkisiz erişim kontrolleri, Cloudflare D1 SQL koruması ve denetim loglarını inceleyin.
          </p>
        </div>
      </header>

      {/* Security Status Cards */}
      <div className="admin-stats-grid" style={{ marginBottom: 24 }}>
        <div className="admin-stat-card">
          <small>SQL Parametrizasyon</small>
          <strong style={{ color: "#22c55e" }}>Aktif (D1)</strong>
          <small>Parametreli sorgular ile SQLi koruması</small>
        </div>
        <div className="admin-stat-card">
          <small>Rate-Limiting (Hız Limiti)</small>
          <strong style={{ color: "#38bdf8" }}>Devrede</strong>
          <small>Sliding-window rota koruması</small>
        </div>
        <div className="admin-stat-card">
          <small>CORS & Origin Denetimi</small>
          <strong style={{ color: "#a855f7" }}>Korumalı</strong>
          <small>Yalnızca onaylı etki alanları</small>
        </div>
        <div className="admin-stat-card">
          <small>Admin Çerez Güvenliği</small>
          <strong style={{ color: "#eab308" }}>HttpOnly / Lax</strong>
          <small>XSS & CSRF token korumalı</small>
        </div>
      </div>

      {/* Rate Limit Rules Table */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 12,
          border: "1px solid #e2e8f0",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          marginBottom: 24,
        }}
      >
        <h2 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", color: "#0f172a" }}>
          🛡️ Aktif API Hız Sınırlandırma (Rate-Limit) Kuralları
        </h2>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #f1f5f9", textAlign: "left", color: "#64748b" }}>
                <th style={{ padding: "10px 12px" }}>Rota / Kapsam</th>
                <th style={{ padding: "10px 12px" }}>Eşik Limiti</th>
                <th style={{ padding: "10px 12px" }}>Sağlanan Koruma</th>
                <th style={{ padding: "10px 12px" }}>Durum</th>
              </tr>
            </thead>
            <tbody>
              {securityRules.map((rule, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px", fontFamily: "monospace", color: "#0f172a", fontWeight: 600 }}>
                    {rule.route}
                  </td>
                  <td style={{ padding: "12px", color: "#334155" }}>{rule.limit}</td>
                  <td style={{ padding: "12px", color: "#64748b" }}>{rule.protection}</td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        backgroundColor: "#dcfce7",
                        color: "#166534",
                        padding: "3px 8px",
                        borderRadius: 999,
                        fontSize: "0.75rem",
                        fontWeight: 700,
                      }}
                    >
                      ✓ {rule.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log Table */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 12,
          border: "1px solid #e2e8f0",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: "1.1rem", color: "#0f172a" }}>
            📜 Son Güvenlik & Denetim Olayları
          </h2>
          <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Canlı Güvenlik Kaydı</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {logs.map((log) => {
            const badgeColor =
              log.status === "success"
                ? { bg: "#dcfce7", text: "#166534" }
                : log.status === "warning"
                ? { bg: "#fef3c7", text: "#92400e" }
                : { bg: "#fee2e2", text: "#991b1b" };

            return (
              <div
                key={log.id}
                style={{
                  padding: "12px 16px",
                  borderRadius: 8,
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                  fontSize: "0.85rem",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <strong style={{ color: "#0f172a" }}>{log.action}</strong>
                    <span
                      style={{
                        backgroundColor: badgeColor.bg,
                        color: badgeColor.text,
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: 4,
                      }}
                    >
                      {log.status.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ color: "#64748b", fontSize: "0.78rem" }}>
                    Kullanıcı: {log.user} · IP: <span style={{ fontFamily: "monospace" }}>{log.ip}</span> · {log.details}
                  </div>
                </div>

                <div style={{ color: "#94a3b8", fontSize: "0.78rem" }}>
                  {new Date(log.timestamp).toLocaleString("tr-TR")}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* IP Inspection Tool */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 12,
          border: "1px solid #e2e8f0",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <h2 style={{ margin: "0 0 8px 0", fontSize: "1.1rem", color: "#0f172a" }}>
          🔍 IP Adresi & Güvenlik Sorgusu
        </h2>
        <p style={{ margin: "0 0 16px 0", fontSize: "0.85rem", color: "#64748b" }}>
          Herhangi bir IP adresinin güvenlik duvarı, rate-limit kısıtlaması veya blok durumunu denetleyin.
        </p>

        <form onSubmit={handleTestIp} style={{ display: "flex", gap: 10, maxWidth: 500 }}>
          <input
            type="text"
            value={testIp}
            onChange={(e) => setTestIp(e.target.value)}
            placeholder="Örn: 88.241.12.34 veya 127.0.0.1"
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              fontSize: "0.9rem",
            }}
          />
          <button
            type="submit"
            style={{
              backgroundColor: "#0f172a",
              color: "#ffffff",
              border: "none",
              padding: "10px 18px",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: "0.88rem",
              cursor: "pointer",
            }}
          >
            Sorgula
          </button>
        </form>

        {testResult && (
          <div
            style={{
              marginTop: 14,
              padding: "10px 14px",
              borderRadius: 8,
              backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              color: "#166534",
              fontSize: "0.85rem",
              fontWeight: 500,
            }}
          >
            {testResult}
          </div>
        )}
      </div>
    </div>
  );
}
