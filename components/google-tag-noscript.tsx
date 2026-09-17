export function GoogleTagNoScript() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || "GTM-XXXXXXX";

  return (
    <noscript>
      <iframe 
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0" 
        width="0" 
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
}
