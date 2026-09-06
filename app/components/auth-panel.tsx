"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type AuthUser = {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
};

export function AuthPanel({
  successRoute,
}: {
  heading?: string;
  subheading?: string;
  successRoute?: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const url = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const body: Record<string, FormDataEntryValue> = {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    };
    if (mode === "register") {
      body.firstName = String(form.get("firstName") ?? "");
      body.lastName = String(form.get("lastName") ?? "");
      body.phone = String(form.get("phone") ?? "");
    }
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await response.json()) as { error?: string; errors?: Record<string, string[]>; user?: AuthUser };
    setPending(false);
    if (!response.ok) {
      const first = data.errors ? Object.values(data.errors).flat()[0] : null;
      setMessage(data.error ?? first ?? "Giriş başarısız.");
      return;
    }
    if (successRoute) {
      router.push(successRoute);
      return;
    }
    router.refresh();
  };

  return (
    <div className="simple-auth-card">
      <div className="simple-auth-tabs">
        <button
          className={mode === "login" ? "active" : ""}
          type="button"
          onClick={() => { setMode("login"); setMessage(""); }}
        >
          Giriş Yap
        </button>
        <button
          className={mode === "register" ? "active" : ""}
          type="button"
          onClick={() => { setMode("register"); setMessage(""); }}
        >
          Kayıt Ol
        </button>
      </div>

      <form onSubmit={submit} className="simple-auth-form">
        {mode === "register" && (
          <div className="simple-auth-row">
            <div className="simple-auth-field">
              <label htmlFor="auth-firstName">Ad</label>
              <input id="auth-firstName" name="firstName" placeholder="Adınız" maxLength={80} required />
            </div>
            <div className="simple-auth-field">
              <label htmlFor="auth-lastName">Soyad</label>
              <input id="auth-lastName" name="lastName" placeholder="Soyadınız" maxLength={80} required />
            </div>
          </div>
        )}

        <div className="simple-auth-field">
          <label htmlFor="auth-email">E-posta</label>
          <input id="auth-email" name="email" type="email" autoComplete="email" placeholder="ornek@email.com" required />
        </div>

        {mode === "register" && (
          <div className="simple-auth-field">
            <label htmlFor="auth-phone">Telefon <span>(opsiyonel)</span></label>
            <input id="auth-phone" name="phone" type="tel" placeholder="05XX XXX XX XX" maxLength={20} />
          </div>
        )}

        <div className="simple-auth-field">
          <label htmlFor="auth-password">Şifre</label>
          <div className="simple-auth-password-wrap">
            <input
              id="auth-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder={mode === "login" ? "Şifrenizi girin" : "En az 8 karakter"}
              minLength={8}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
            >
              {showPassword ? "Gizle" : "Göster"}
            </button>
          </div>
        </div>

        {message && <p className="simple-auth-error" role="alert">{message}</p>}

        <button className="simple-auth-submit" type="submit" disabled={pending}>
          {pending ? "İşleniyor…" : mode === "login" ? "Giriş Yap" : "Hesap Oluştur"}
        </button>
      </form>

      <div className="simple-auth-footer">
        <span>Yardıma mı ihtiyacınız var?</span>
        <a href="https://wa.me/905467356602" target="_blank" rel="noreferrer">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm4.47 13.95c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.53.07-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.71-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.2 3.7.59.25 1.05.4 1.41.51.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.23-.17-.47-.29z" />
          </svg>
          WhatsApp ile iletişim
        </a>
      </div>
    </div>
  );
}
