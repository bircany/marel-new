import { absoluteUrl } from "@/app/lib/site";
import { listAnnouncements } from "@/db";

export async function buildLlmIndex() {
  const announcements = await listAnnouncements(true).catch(() => []);
  const lines = [
    "# Marel",
    "",
    "> Marel, Türkiye'de ölçüye özel perde, sineklik ve sürgülü kapı sistemleri sunan online mağazadır.",
    "",
    "## Önemli sayfalar",
    `- Ana sayfa: ${absoluteUrl("/")}`,
    `- Ürünler: ${absoluteUrl("/urunler")}`,
    `- Kategoriler: ${absoluteUrl("/urunler/plise-perde")}, ${absoluteUrl("/urunler/jaluzi-perde")}, ${absoluteUrl("/urunler/zip-perde")}, ${absoluteUrl("/urunler/sineklik")}, ${absoluteUrl("/urunler/surgulu-kapilar")}`,
    `- Duyurular ve rehberler: ${absoluteUrl("/duyurular")}`,
    `- İletişim ve teklif: ${absoluteUrl("/iletisim")}`,
    "",
    "## Marka ve hizmet özeti",
    "- Ürünler: plise perde, jaluzi perde, zip perde, sineklik ve sürgülü kapılar.",
    "- Hizmet: ölçü, kumaş, profil ve kullanım alanına göre danışmanlık; WhatsApp üzerinden hızlı teklif.",
    "- Ürün bilgileri katalog kodları, renk seçenekleri, teknik özellikler ve stok durumu üzerinden sunulur.",
    "- Sipariş ve teslimat durumu kullanıcı hesabı veya sipariş takip sayfasından izlenir.",
    "",
    "## Yayınlanmış içerikler",
  ];
  for (const item of announcements) lines.push(`- ${item.title}: ${absoluteUrl(`/duyurular#${item.slug}`)} - ${item.summary}`);
  return `${lines.join("\n")}\n`;
}
