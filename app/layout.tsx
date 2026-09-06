import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import "./storefront.css";
import "./storefront-enhancements.css";
import "./category-pages.css";
import "./product-refresh.css";
import "./commerce.css";
import "./content-pages.css";
import "./admin-panel.css";
import "./kamatas-theme.css";
import { WhatsAppAdvisor } from "./components/whatsapp-advisor";
import { GoogleTag } from "./components/google-tag";
import { ConsentBanner } from "./components/consent-banner";
import { absoluteUrl, siteUrl } from "./lib/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Marel | Online Perde ve Sineklik Mağazası",
    template: "%s | Marel",
  },
  description:
    "Plise perde, jaluzi, zip perde, sineklik ve sürgülü kapı sistemlerinde ölçüye özel çözümler.",
  alternates: { canonical: absoluteUrl("/") },
  robots: { index: true, follow: true, "max-image-preview": "large" },
  openGraph: {
    title: "Marel | Online Perde ve Sineklik Mağazası",
    description: "Plise perde, sineklik ve zip sistemlerini inceleyin; kumaş, kasa ve ölçü bilgileriyle hızlı teklif alın.",
    locale: "tr_TR",
    type: "website",
    images: [{ url: "/og.png", width: 1714, height: 909, alt: "Marel ölçüye özel perde ve sineklik" }],
  },
  twitter: { card: "summary_large_image", title: "Marel | Online Perde ve Sineklik Mağazası", description: "Ölçüye özel perde, sineklik ve sürgülü kapı sistemleri.", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body className={inter.variable}>
        {children}
        <WhatsAppAdvisor />
        <ConsentBanner />
        <GoogleTag />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
