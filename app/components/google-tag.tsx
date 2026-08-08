import Script from "next/script";

export function GoogleTag() {
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  if (!adsId || adsId.includes("000000000")) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${adsId}`} strategy="afterInteractive" />
      <Script id="marel-google-tag" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;var c=localStorage.getItem('marel-google-consent')==='granted'?'granted':'denied';gtag('consent','default',{ad_storage:c,analytics_storage:c,ad_user_data:c,ad_personalization:c,wait_for_update:500});gtag('js',new Date());gtag('config','${adsId}');`}
      </Script>
    </>
  );
}
