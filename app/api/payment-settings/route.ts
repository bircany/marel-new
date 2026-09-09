import { getPaymentSettingsSync } from "@/app/lib/payment";
import { SOFTRADE_API_URL } from "@/app/lib/softtrade";
import { getSettingsFromDb } from "@/db";

export async function GET() {
  const fallback = getPaymentSettingsSync();
  let databaseSettings: Record<string, string> = {};
  try {
    databaseSettings = await getSettingsFromDb();
  } catch {
    databaseSettings = {};
  }

  try {
    const response = await fetch(`${SOFTRADE_API_URL}/settings/public`, { cache: "no-store" });
    const json = (await response.json().catch(() => null)) as {
      success?: boolean;
      data?: { payment?: Record<string, unknown> };
    } | null;
    const payment = json?.data?.payment;
    if (payment && typeof payment === "object") {
      return Response.json({
        iban: databaseSettings.bank_iban ?? String(payment.iban ?? fallback.iban),
        bankName: databaseSettings.bank_name ?? String(payment.bank_name ?? payment.bankName ?? fallback.bankName),
        accountHolder: databaseSettings.bank_account_holder ?? String(payment.account_holder ?? payment.accountHolder ?? fallback.accountHolder),
        whatsappPhone: databaseSettings.site_whatsapp ?? String(payment.whatsapp_phone ?? payment.whatsappPhone ?? fallback.whatsappPhone),
        paymentNote: String(payment.payment_note ?? payment.paymentNote ?? fallback.paymentNote),
        freeShippingMin: Number(databaseSettings.shipping_free_threshold ?? payment.free_shipping_min ?? payment.freeShippingMin ?? fallback.freeShippingMin),
        shippingFee: Number(databaseSettings.shipping_flat_rate ?? databaseSettings.shipping_fee ?? fallback.shippingFee),
      });
    }
  } catch {
    /* fallback */
  }
  return Response.json({
    ...fallback,
    iban: databaseSettings.bank_iban ?? fallback.iban,
    bankName: databaseSettings.bank_name ?? fallback.bankName,
    accountHolder: databaseSettings.bank_account_holder ?? fallback.accountHolder,
    whatsappPhone: databaseSettings.site_whatsapp ?? fallback.whatsappPhone,
    freeShippingMin: Number(databaseSettings.shipping_free_threshold ?? fallback.freeShippingMin),
    shippingFee: Number(databaseSettings.shipping_flat_rate ?? databaseSettings.shipping_fee ?? fallback.shippingFee),
  });
}
