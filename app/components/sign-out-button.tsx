"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const signOut = async () => {
    setPending(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } finally {
      setPending(false);
    }
  };
  return <button className={className} type="button" onClick={signOut} disabled={pending}>{pending ? "Çıkış yapılıyor…" : "Güvenli çıkış ↗"}</button>;
}
