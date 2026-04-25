"use client";

import Script from "next/script";

import { plausibleConfig } from "@/lib/analytics/plausible";

/**
 * Mounts the Plausible analytics snippet only when
 * `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is configured.
 *
 * No cookies, no PII. The inline primer sets up `window.plausible` as a
 * no-op queue so calls made before the deferred script lands are buffered
 * and replayed once it loads (Plausible's standard outbound-link pattern).
 */
export function PlausibleScript() {
  if (!plausibleConfig.isConfigured || plausibleConfig.domain === null) {
    return null;
  }

  const domain = plausibleConfig.domain;

  return (
    <>
      <Script
        id="plausible-queue"
        strategy="afterInteractive"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html:
            "window.plausible=window.plausible||function(){(window.plausible.q=window.plausible.q||[]).push(arguments)};",
        }}
      />
      <Script
        id="plausible-script"
        strategy="afterInteractive"
        defer
        data-domain={domain}
        src="https://plausible.io/js/script.js"
      />
    </>
  );
}

export default PlausibleScript;
