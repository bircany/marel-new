import { getPaymentSettingsSync } from "@/app/lib/payment";
import { SOFTRADE_API_URL } from "@/app/lib/softtrade";

export async function GET() {
  try {
    const response = await fetch(`${SOFTRADE_API_URL}/settings/public`, { cache: "no-store" });
    const json = (await response.json().catch(() => null)) as {
      success?: boolean;
      data?: { payment?: Record<string, unknown> };
    } | null;
    const payment = json?.data?.payment;
    if (payment && typeof payment === "object") {
      const fallback = getPaymentSettingsSync();
      return Response.json({
        iban: String(payment.iban ?? fallback.iban),
        bankName: String(payment.bank_name ?? payment.bankName ?? fallback.bankName),
        accountHolder: String(payment.account_holder ?? payment.accountHolder ?? fallback.accountHolder),
        whatsappPhone: String(payment.whatsapp_phone ?? payment.whatsappPhone ?? fallback.whatsappPhone),
        paymentNote: String(payment.payment_note ?? payment.paymentNote ?? fallback.paymentNote),
        freeShippingMin: Number(payment.free_shipping_min ?? payment.freeShippingMin ?? fallback.freeShippingMin),
      });
    }
  } catch {
    /* fallback */
  }
  return Response.json(getPaymentSettingsSync());
}
