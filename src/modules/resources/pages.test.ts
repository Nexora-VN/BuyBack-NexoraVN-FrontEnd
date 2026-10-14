import { afterEach, expect, it, vi } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { publicPages } from "@/lib/seo/public-pages";
import { findResource, knowledgePage, resourcePages, resourceMetadata } from "./pages";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

it("includes every published resource in crawl inventory and resolves related links", () => {
  for (const page of [...resourcePages, knowledgePage]) {
    expect(publicPages.find((entry) => entry.path === page.path)?.locales).toEqual(["vi"]);
    for (const path of page.related)
      expect(path === "/huong-dan" || Boolean(findResource(path))).toBe(true);
    const metadata = resourceMetadata(page);
    expect(metadata.alternates?.canonical).toBe(`https://piggyback.vn${page.path}`);
    expect(metadata.alternates?.languages).not.toHaveProperty("en");
  }
});

it("keeps every new page noindex until launch, including legal and knowledge pages", async () => {
  vi.stubEnv("SEO_INDEXABLE", "false");
  const { resourceMetadata, resourcePages, knowledgePage } = await import("./pages");
  for (const page of [...resourcePages, knowledgePage])
    expect(resourceMetadata(page).robots).toMatchObject({ index: false });
});

it("references existing local images with accessible descriptions", () => {
  for (const page of [...resourcePages, knowledgePage]) {
    for (const image of [page.image, ...page.sections.map((section) => section.image)]) {
      if (!image) continue;
      expect(existsSync(join(process.cwd(), "public", image.src.slice(1)))).toBe(true);
      expect(image.alt.trim()).not.toBe("");
      expect(image.caption.trim()).not.toBe("");
      expect(image.width).toBeGreaterThan(0);
      expect(image.height).toBeGreaterThan(0);
    }
  }
});
