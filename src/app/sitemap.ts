import type { MetadataRoute } from "next";
import { languageUrls } from "@/modules/landing/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["vi", "en"].map((locale) => ({
    url: languageUrls[locale as "vi" | "en"],
    alternates: { languages: languageUrls },
  }));
}
