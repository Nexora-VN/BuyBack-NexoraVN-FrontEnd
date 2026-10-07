import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

it("uses the approved public origin even when the preview uses localhost", async () => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
  const { landingMetadata } = await import("./seo");
  expect(landingMetadata("vi").alternates?.canonical).toBe("https://piggyback.vn/");
  expect(landingMetadata("en").alternates?.canonical).toBe("https://piggyback.vn/en");
});

it("keeps a prelaunch build out of indexing and its sitemap empty", async () => {
  vi.stubEnv("SEO_INDEXABLE", "false");
  const { landingMetadata } = await import("./seo");
  const { default: sitemap } = await import("@/app/sitemap");
  expect(landingMetadata("vi").robots).toMatchObject({ index: false });
  expect(sitemap()).toEqual([]);
});

it("publishes reciprocal canonical homepages when launch indexing is enabled", async () => {
  vi.stubEnv("SEO_INDEXABLE", "true");
  const { landingMetadata, languageUrls } = await import("./seo");
  const { default: sitemap } = await import("@/app/sitemap");
  expect(landingMetadata("en").robots).toMatchObject({ index: true, follow: true });
  expect(sitemap().map((entry) => entry.url)).toEqual([
    "https://piggyback.vn/",
    "https://piggyback.vn/en",
    "https://piggyback.vn/huong-dan",
    "https://piggyback.vn/en/huong-dan",
  ]);
  for (const entry of sitemap().slice(0, 2))
    expect(entry.alternates?.languages).toEqual(languageUrls);
});

it("gives the public guide its own intent, canonical and breadcrumb hierarchy", async () => {
  const { guideMetadata, guideStructuredData } = await import("./seo");
  expect(guideMetadata("vi").alternates?.canonical).toBe("https://piggyback.vn/huong-dan");
  expect(guideMetadata("en").alternates?.languages).toMatchObject({
    vi: "https://piggyback.vn/huong-dan",
    en: "https://piggyback.vn/en/huong-dan",
  });
  const graph = guideStructuredData("vi")["@graph"];
  const breadcrumb = graph.find((entry) => entry["@type"] === "BreadcrumbList");
  expect(breadcrumb).toMatchObject({
    itemListElement: [
      { position: 1, item: "https://piggyback.vn/" },
      { position: 2, item: "https://piggyback.vn/huong-dan" },
    ],
  });
});

it("allows brand assets and public pages while blocking only private route boundaries", async () => {
  const { default: robots } = await import("@/app/robots");
  const rules = robots().rules;
  if (Array.isArray(rules)) throw new Error("Expected the shared crawler policy");
  const blocked = (path: string) =>
    (rules.disallow as string[]).some((rule) =>
      rule.endsWith("$") ? path === rule.slice(0, -1) : path.startsWith(rule),
    );
  for (const path of ["/", "/en", "/login", "/apple-icon.png"]) expect(blocked(path)).toBe(false);
  for (const path of ["/app", "/app/orders", "/en/admin", "/vi/app/wallet", "/api/auth/me"])
    expect(blocked(path)).toBe(true);
});
