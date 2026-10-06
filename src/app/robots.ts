import type { MetadataRoute } from "next";
import { siteUrl } from "@/modules/landing/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/__clerk/",
        "/app",
        "/admin",
        "/en/app",
        "/en/admin",
        "/vi/app",
        "/vi/admin",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
