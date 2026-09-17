/**
 * Kargo firmaları ve public takip URL şablonları.
 * SoftTrade `config/cargo.php` ile senkron tutulmalı.
 */

export type CargoCompany =
  | "mng"
  | "yurtici"
  | "aras"
  | "surat"
  | "ptt"
  | "hepsijet"
  | "sendeo"
  | "other";

export const CARGO_PROVIDERS: Array<{
  id: CargoCompany;
  label: string;
  trackUrl: string | null;
}> = [
  { id: "mng", label: "MNG Kargo", trackUrl: "https://www.mngkargo.com.tr/tr/online-islemler/gonderi-takip?kod={tracking}" },
  { id: "yurtici", label: "Yurtiçi Kargo", trackUrl: "https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code={tracking}" },
  { id: "aras", label: "Aras Kargo", trackUrl: "https://www.araskargo.com.tr/tr/kargo-takip?code={tracking}" },
  { id: "surat", label: "Sürat Kargo", trackUrl: "https://www.suratkargo.com.tr/KargoTakip/?kargotakipno={tracking}" },
  { id: "ptt", label: "PTT Kargo", trackUrl: "https://gonderitakip.ptt.gov.tr/Track/Verify?q={tracking}" },
  { id: "hepsijet", label: "HepsiJet", trackUrl: "https://www.hepsijet.com/gonderi-takibi/{tracking}" },
  { id: "sendeo", label: "Sendeo", trackUrl: "https://www.sendeo.com.tr/gonderi-takip?barcode={tracking}" },
  { id: "other", label: "Diğer", trackUrl: null },
];

const aliases: Record<string, CargoCompany> = {
  mng: "mng",
  "mng kargo": "mng",
  mngkargo: "mng",
  dhl: "mng",
  yurtici: "yurtici",
  "yurtiçi": "yurtici",
  aras: "aras",
  surat: "surat",
  "sürat": "surat",
  ptt: "ptt",
  hepsijet: "hepsijet",
  sendeo: "sendeo",
  other: "other",
};

export function normalizeCargoCompany(value?: string | null): CargoCompany {
  const key = String(value ?? "yurtici").trim().toLowerCase();
  return aliases[key] ?? "other";
}

export function cargoLabel(company?: string | null): string {
  const id = normalizeCargoCompany(company);
  return CARGO_PROVIDERS.find((p) => p.id === id)?.label ?? "Kargo";
}

export function cargoTrackingUrl(company?: string | null, trackingNumber?: string | null): string | null {
  const tracking = String(trackingNumber ?? "").trim();
  if (!tracking) return null;
  const id = normalizeCargoCompany(company);
  const template = CARGO_PROVIDERS.find((p) => p.id === id)?.trackUrl;
  if (!template) return null;
  return template.replace("{tracking}", encodeURIComponent(tracking));
}
