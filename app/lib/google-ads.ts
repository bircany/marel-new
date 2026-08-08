export type GoogleItem = {
  item_id: string;
  item_name: string;
  item_brand?: string;
  item_category?: string;
  price?: number;
  quantity?: number;
  google_business_vertical?: "retail";
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackCommerceEvent(event: string, value: number, items: GoogleItem[], extra: Record<string, unknown> = {}): void {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", event, { currency: "TRY", value, items, ...extra });
}

export function trackAdsConversion(value: number, transactionId: string): void {
  if (typeof window === "undefined" || !window.gtag) return;
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;
  if (!adsId || !label || adsId.includes("000000000") || label.startsWith("replace-")) return;
  window.gtag("event", "conversion", {
    send_to: `${adsId}/${label}`,
    value,
    currency: "TRY",
    transaction_id: transactionId,
  });
}
