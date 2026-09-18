export function formatMoney(amountInKurus: number, currency = "TRY"): string {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency }).format(amountInKurus / 100);
}
