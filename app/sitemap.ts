import type { MetadataRoute } from "next";

import { getAppUrl } from "@/lib/url";

const PUBLIC_PATHS = [
  "",
  "/teclado",
  "/precios",
  "/para-padres",
  "/privacidad",
  "/terminos",
  "/registro",
  "/ingresar",
  "/beta",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getAppUrl();
  const now = new Date();
  return PUBLIC_PATHS.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1.0 : 0.7,
  }));
}
