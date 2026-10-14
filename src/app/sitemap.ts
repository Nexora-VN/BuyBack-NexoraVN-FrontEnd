import type { MetadataRoute } from "next";
import { siteIndexable, siteUrl } from "@/lib/seo/site";
import { localizedPath, pageLanguages, publicPages } from "@/lib/seo/public-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteIndexable) return [];
  return publicPages.flatMap((page) =>
    page.locales.map((locale) => ({
      url: siteUrl + localizedPath(page.path, locale),
      alternates: { languages: pageLanguages(page) },
    })),
  );
}
