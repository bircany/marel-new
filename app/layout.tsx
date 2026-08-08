import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import "./storefront.css";
import "./product-refresh.css";
import { WhatsAppAdvisor } from "./components/whatsapp-advisor";
import { GoogleTag } from "./components/google-tag";
import { ConsentBanner } from "./components/consent-banner";
import "./commerce.css";
import "./content-pages.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://marelpliseperde.com"),
  title: {
    default: "Marel | Online Perde ve Sineklik Mağazası",
    template: "%s | Marel",
  },
  description:
    "Plise perde, jaluzi, zip perde, sineklik ve sürgülü kapı sistemlerinde ölçüye özel çözümler.",
  openGraph: {
    title: "Marel | Online Perde ve Sineklik Mağazası",
    description: "Plise perde, sineklik ve zip sistemlerini inceleyin; kumaş, kasa ve ölçü bilgileriyle hızlı teklif alın.",
    locale: "tr_TR",
    type: "website",
    images: [{ url: "/og.png", width: 1714, height: 909, alt: "Marel ölçüye özel perde ve sineklik" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body className={manrope.variable}>{children}<WhatsAppAdvisor /><ConsentBanner /><GoogleTag /></body>
    </html>
  );
}
