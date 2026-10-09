import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        ...["", "/en", "/vi"].flatMap((prefix) =>
          ["app", "admin"].flatMap((area) => [`${prefix}/${area}$`, `${prefix}/${area}/`]),
        ),
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
