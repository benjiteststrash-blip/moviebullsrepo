import Script from "next/script";

const MONETAG_DOMAIN = "5gvci.com";
const MONETAG_ZONE_ID = "11035219";

export function MonetagTag() {
  return (
    <Script
      id="monetag-multitag"
      src={`https://${MONETAG_DOMAIN}/act/files/tag.min.js?z=${MONETAG_ZONE_ID}`}
      strategy="afterInteractive"
      data-cfasync="false"
    />
  );
}
