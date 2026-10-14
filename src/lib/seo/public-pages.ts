import baseRoutes from "./public-routes.json";
import { siteUrl } from "./site";

export function localizedPath(path: string, locale: string) {
  return locale === "vi" ? path : `/en${path === "/" ? "" : path}`;
}

export const publicPages = baseRoutes;

export function pageLanguages(page: (typeof publicPages)[number]) {
  return Object.fromEntries([
    ...page.locales.map((locale) => [locale, siteUrl + localizedPath(page.path, locale)]),
    ["x-default", siteUrl + page.path],
  ]);
}
