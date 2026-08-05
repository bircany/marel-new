import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://marelpliseperde.com"),
  title: {
    default: "Marel | Ölçünüze Özel Perde ve Sineklik Sistemleri",
    template: "%s | Marel",
  },
  description:
    "Plise perde, jaluzi, zip perde, sineklik ve sürgülü kapı sistemlerinde ölçüye özel çözümler.",
  icons: { icon: "/images/marel-logo.png" },
  openGraph: {
    title: "Marel | Ölçünüze Özel Perde ve Sineklik Sistemleri",
    description: "Kumaşı, kasa rengini ve ölçünüzü seçin; WhatsApp üzerinden hızlı teklif alın.",
    locale: "tr_TR",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Marel perde ve sineklik sistemleri" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body className={manrope.variable}>{children}</body>
    </html>
  );
}
