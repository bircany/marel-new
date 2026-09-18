import type { AppProps } from "next/app";
import Head from "next/head";
import "@/globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { WhatsAppAdvisor } from "@/components/whatsapp-advisor";
import { GoogleTag } from "@/components/google-tag";
import { GoogleTagNoScript } from "@/components/google-tag-noscript";
import { ConsentBanner } from "@/components/consent-banner";
import { ScrollingTitle } from "@/components/scrolling-title";
import { PageTransitionLoader } from "@/components/page-transition-loader";
import { siteUrl } from "@/lib/site";

export default function MarelApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0b1736" />
        <title>Marel Plise Perde</title>
        <meta name="description" content="Elbistan'dan Türkiye geneline özel ölçü plise perde üretimi. Kumaş, renk, fiyat ve teklif seçeneklerini inceleyin." />
        <meta property="og:site_name" content="Marel Plise Perde" />
        <meta property="og:locale" content="tr_TR" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="icon" href="/favicon.png" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": [{ "@type": "HomeAndConstructionBusiness", "@id": `${siteUrl}/#organization`, name: "Marel Plise Perde", url: siteUrl, logo: `${siteUrl}/og.png`, image: `${siteUrl}/og.png`, telephone: "+90 546 735 66 02", priceRange: "₺₺", address: { "@type": "PostalAddress", addressLocality: "Elbistan", addressRegion: "Kahramanmaraş", addressCountry: "TR" }, areaServed: { "@type": "Country", name: "Türkiye" }, sameAs: ["https://www.instagram.com/marelpliseperde", "https://www.youtube.com/@marelpliseperde"], contactPoint: { "@type": "ContactPoint", telephone: "+90 546 735 66 02", contactType: "customer service", availableLanguage: "Turkish" } }, { "@type": "WebSite", "@id": `${siteUrl}/#website`, url: siteUrl, name: "Marel Plise Perde", inLanguage: "tr-TR" }] }).replace(/</g, "\\u003c") }} />
      </Head>
      <GoogleTagNoScript />
      <ScrollingTitle text="Marel Plise Perde Elbistan" />
      <PageTransitionLoader />
      <Component {...pageProps} />
      <WhatsAppAdvisor />
      <ConsentBanner />
      <GoogleTag />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
