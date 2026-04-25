import type { MetadataRoute } from "next";

import { getAppUrl } from "@/lib/url";

export default function robots(): MetadataRoute.Robots {
  const base = getAppUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin",
          "/admin/",
          "/nino/",
          "/padres/",
          "/onboarding/",
          "/auth/",
          "/verificar",
          "/recuperar",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
