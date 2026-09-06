/**
 * Marel ödeme / WhatsApp / IBAN ayarları (storefront).
 * SoftTrade site_settings.payment ile senkron; env fallback.
 */

export type PaymentSettings = {
  iban: string;
  bankName: string;
  accountHolder: string;
  whatsappPhone: string;
  paymentNote: string;
  freeShippingMin: number;
};

const defaults: PaymentSettings = {
  iban: process.env.NEXT_PUBLIC_MAREL_IBAN ?? "TR00 0000 0000 0000 0000 0000 00",
  bankName: process.env.NEXT_PUBLIC_MAREL_BANK_NAME ?? "Marel Havale Hesabı",
  accountHolder: process.env.NEXT_PUBLIC_MAREL_ACCOUNT_HOLDER ?? "Marel",
  whatsappPhone: process.env.NEXT_PUBLIC_MAREL_WHATSAPP ?? "905467356602",
  paymentNote:
    process.env.NEXT_PUBLIC_MAREL_PAYMENT_NOTE ??
    "Açıklamaya sipariş numaranızı yazın. Dekontu WhatsApp üzerinden gönderin.",
  freeShippingMin: 1000,
};

export function getPaymentSettingsSync(): PaymentSettings {
  return { ...defaults };
}

export function whatsappPaymentUrl(orderNumber: string, totalLabel: string, settings = defaults): string {
  const phone = settings.whatsappPhone.replace(/\D/g, "") || "905467356602";
  const text = [
    `Merhaba Marel,`,
    `${orderNumber} numaralı siparişim için havale dekontumu iletiyorum.`,
    `Tutar: ${totalLabel}`,
    `IBAN: ${settings.iban}`,
  ].join("\n");
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
