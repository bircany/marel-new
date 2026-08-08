"use client";

import { useEffect, useState } from "react";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setVisible(window.localStorage.getItem("marel-google-consent") === null));
    return () => window.cancelAnimationFrame(frame);
  }, []);
  const choose = (granted: boolean) => {
    window.localStorage.setItem("marel-google-consent", granted ? "granted" : "denied");
    window.gtag?.("consent", "update", { ad_storage: granted ? "granted" : "denied", analytics_storage: granted ? "granted" : "denied", ad_user_data: granted ? "granted" : "denied", ad_personalization: granted ? "granted" : "denied" });
    setVisible(false);
  };
  if (!visible) return null;
  return <aside className="consent-banner" aria-label="Çerez tercihleri"><div><strong>Gizlilik tercihiniz</strong><p>Reklam performansını ve alışveriş adımlarını ölçmek için Google etiketlerini yalnız izninizle kullanıyoruz.</p></div><button type="button" onClick={() => choose(false)}>Reddet</button><button type="button" className="consent-accept" onClick={() => choose(true)}>Kabul et</button></aside>;
}
