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
        <meta name="description" content="Ölçüye özel plise perde sistemleri." />
        <link rel="icon" href="/favicon.png" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "LocalBusiness", name: "Marel Plise Perde", url: siteUrl, telephone: "+90 546 735 66 02", address: { "@type": "PostalAddress", addressLocality: "Elbistan", addressRegion: "Kahramanmaraş", addressCountry: "TR" } }).replace(/</g, "\\u003c") }} />
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
