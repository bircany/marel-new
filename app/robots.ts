import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/app/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/hesabim", "/sepet", "/siparis-takip"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
