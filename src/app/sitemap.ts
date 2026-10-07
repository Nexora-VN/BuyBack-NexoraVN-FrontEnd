import type { MetadataRoute } from "next";
import { languageUrls, guideUrls } from "@/modules/landing/seo";
import { siteIndexable } from "@/lib/seo/site";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteIndexable) return [];
  return [languageUrls, guideUrls].flatMap((urls) =>
    ["vi", "en"].map((locale) => ({
      url: urls[locale as "vi" | "en"],
      alternates: { languages: urls },
    })),
  );
}
