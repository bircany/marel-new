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
  heading = "Tekrar hoş geldiniz.",
  subheading = "Hesabınıza giriş yaparak siparişlerinizi, adreslerinizi ve yorumlarınızı yönetin.",
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
    <div className="account-auth-panel">
      <div className="account-mark" aria-hidden="true">M</div>
      <span className="account-auth-kicker">Marel müşteri hesabı</span>
      <h2>{mode === "login" ? heading : "Hesabınızı oluşturun."}</h2>
      <p>{mode === "login" ? subheading : "E-posta ve şifre ile kalıcı Marel hesabınızı oluşturun."}</p>
      <div className="auth-mode-switch">
        <button className={mode === "login" ? "active" : ""} type="button" onClick={() => setMode("login")}>Giriş yap</button>
        <button className={mode === "register" ? "active" : ""} type="button" onClick={() => setMode("register")}>Kayıt ol</button>
      </div>
      <form onSubmit={submit} className="auth-form">
        {mode === "register" ? (
          <div className="auth-name-row">
            <label>Ad<input name="firstName" maxLength={80} required /></label>
            <label>Soyad<input name="lastName" maxLength={80} required /></label>
          </div>
        ) : null}
        <label>E-posta<input name="email" type="email" autoComplete="email" required /></label>
        {mode === "register" ? <label>Telefon<input name="phone" type="tel" maxLength={20} /></label> : null}
        <label>Şifre<input name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required /></label>
        {mode === "register" ? <small className="auth-hint">En az 8 karakterlik bir şifre belirleyin.</small> : null}
        <button className="account-primary-action" type="submit" disabled={pending}>{pending ? "İşleniyor…" : mode === "login" ? "Hesabıma giriş yap" : "Hesabımı oluştur"}<b aria-hidden="true">→</b></button>
      </form>
      {message ? <p className="form-error" role="alert">{message}</p> : null}
      <div className="account-panel-divider"><span>Yardıma mı ihtiyacınız var?</span></div>
      <a className="account-support-link" href="https://wa.me/905467356602" target="_blank" rel="noreferrer">
        <span><b>WhatsApp desteği</b><small>Marel danışmanına hızlıca ulaşın</small></span><strong aria-hidden="true">↗</strong>
      </a>
    </div>
  );
}
