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
import { ScrollingTitle } from "./components/scrolling-title";
import { absoluteUrl, siteUrl } from "./lib/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Marel Plise Perde",
    template: "%s | Marel Plise Perde",
  },
  description:
    "Plise perde, jaluzi, zip perde, sineklik ve sürgülü kapı sistemlerinde ölçüye özel çözümler.",
  alternates: { canonical: absoluteUrl("/") },
  robots: { index: true, follow: true, "max-image-preview": "large" },
  openGraph: {
    title: "Marel Plise Perde",
    description: "Plise perde, sineklik ve zip sistemlerini inceleyin; kumaş, kasa ve ölçü bilgileriyle hızlı teklif alın.",
    locale: "tr_TR",
    type: "website",
    images: [{ url: "/og.png", width: 1714, height: 909, alt: "Marel ölçüye özel perde ve sineklik" }],
  },
  twitter: { card: "summary_large_image", title: "Marel Plise Perde", description: "Ölçüye özel perde, sineklik ve sürgülü kapı sistemleri.", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="128x128" href="/favicon.png" />
        <link rel="icon" type="image/png" href="/icon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body className={inter.variable}>
        <ScrollingTitle text="Marel Plise Perde Elbistan" />
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
