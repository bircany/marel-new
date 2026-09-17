import type { AppProps } from "next/app";
import Head from "next/head";
import "@/app/globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function MarelApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0b1736" />
      </Head>
      <Component {...pageProps} />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
