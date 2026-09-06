"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLogin({
  heading = "Marel Yönetim Portalı",
  subheading = "Katalog, sipariş, kargo, müşteri talepleri ve duyuruları yönetmek için yetkili hesabınızla giriş yapın.",
  successRoute = "/admin",
}: {
  heading?: string;
  subheading?: string;
  successRoute?: string;
}) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setMessage("");

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as {
        error?: string;
        errors?: Record<string, string[]>;
        user?: { role?: string; full_name?: string };
      };

      setPending(false);

      if (!response.ok) {
        const first = data.errors ? Object.values(data.errors).flat()[0] : null;
        setMessage(data.error ?? first ?? "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
        return;
      }

      if (data.user?.role !== "admin") {
        setMessage("Bu hesap yönetici yetkilerine sahip değil.");
        return;
      }

      if (successRoute) {
        router.push(successRoute);
        router.refresh();
        return;
      }
      router.refresh();
    } catch {
      setPending(false);
      setMessage("Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.");
    }
  };

  return (
    <main className="admin-login-wrapper">
      <div className="admin-login-bg-glow" aria-hidden="true" />

      <div className="admin-login-card">
        <header className="admin-login-header">
          <div className="admin-login-brand">
            <span className="brand-logo-badge">M</span>
            <div className="brand-text">
              <strong>MAREL</strong>
              <small>ADMIN CONSOLE</small>
            </div>
          </div>
          <div className="admin-login-shield-badge">
            <span className="status-dot-pulse" />
            <span>GÜVENLİ ERİŞİM ALANI</span>
          </div>
          <h1>{heading}</h1>
          <p>{subheading}</p>
        </header>

        <form onSubmit={submit} className="admin-login-form">
          <div className="admin-input-group">
            <label htmlFor="admin-email">Yönetici E-Postası</label>
            <div className="input-with-icon">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="admin@marel.com"
                required
              />
            </div>
          </div>

          <div className="admin-input-group">
            <label htmlFor="admin-password">Yönetici Şifresi</label>
            <div className="input-with-icon">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="admin-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••••••"
                required
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {message ? (
            <div className="admin-login-error" role="alert">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{message}</span>
            </div>
          ) : null}

          <button className="admin-login-submit" type="submit" disabled={pending}>
            {pending ? (
              <span className="btn-loading-content">
                <span className="spinner-dots" />
                Yetki Doğrulanıyor…
              </span>
            ) : (
              <span className="btn-normal-content">
                Yönetim Paneline Giriş Yap
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            )}
          </button>
        </form>

        <footer className="admin-login-footer">
          <Link href="/" className="admin-back-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Marel Mağazasına Geri Dön
          </Link>
          <div className="admin-security-note">
            <span>256-Bit SSL Koruma</span> · <span>IP Korumalı Oturum</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
