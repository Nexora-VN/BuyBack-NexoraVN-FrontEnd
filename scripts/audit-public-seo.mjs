import http from "node:http";
import https from "node:https";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { JSDOM } from "jsdom";

// HTTP/source checks only: not browser rendering, field CWV or Google indexing.
const definitions = JSON.parse(
  await readFile(new URL("../src/lib/seo/public-routes.json", import.meta.url), "utf8"),
);
const base = new URL(process.argv[2] || "http://localhost:3100");
const indexable = process.argv.includes("--indexable");
const origin = "https://piggyback.vn";
const localPath = (path, locale) => (locale === "vi" ? path : `/en${path === "/" ? "" : path}`);
const publicPaths = definitions.flatMap((page) =>
  page.locales.map((locale) => localPath(page.path, locale)),
);
const policies = new Map(
  definitions.flatMap((page) =>
    page.locales.map((locale) => [
      localPath(page.path, locale),
      {
        lang: locale,
        alternates: Object.fromEntries([
          ...page.locales.map((l) => [l, origin + localPath(page.path, l)]),
          ["x-default", origin + page.path],
        ]),
      },
    ]),
  ),
);
const failures = [];
const results = [];
const check = (ok, detail) => {
  if (!ok) failures.push(detail);
};
const routes = [
  ...publicPaths,
  "/vi",
  "/en",
  "/en/",
  "/en/huong-dan",
  "/login",
  "/en/login",
  "/sign-up",
  "/forgot-password",
  "/app",
  "/admin",
  "/seo-audit-missing-page",
  "/en/kien-thuc",
  "/kien-thuc/cashback-la-gi",
  "/robots.txt",
  "/sitemap.xml",
  "/opengraph-image",
];
const special = new Set([
  "/vi",
  "/en",
  "/en/",
  "/en/huong-dan",
  "/en/login",
  "/app",
  "/admin",
  "/seo-audit-missing-page",
  "/en/kien-thuc",
  "/kien-thuc/cashback-la-gi",
]);
const documents = new Map();
const titles = new Set();
const descriptions = new Set();
const get = (url, options = {}) =>
  fetch(url, { redirect: "manual", signal: AbortSignal.timeout(15000), ...options });
const normalize = (text) => (text || "").replace(/\s+/g, " ").trim();
for (const path of routes) {
  try {
    const response = await get(new URL(path, base));
    const buffer = Buffer.from(await response.arrayBuffer());
    const type = response.headers.get("content-type") || "";
    const row = {
      path,
      status: response.status,
      location: response.headers.get("location"),
      xRobotsTag: response.headers.get("x-robots-tag"),
      bytes: buffer.length,
    };
    check(response.status < 500, `${path}: server error`);
    if (!special.has(path)) check(response.status === 200, `${path}: expected HTTP 200`);
    if (type.includes("text/html") && response.status === 200) {
      const document = new JSDOM(buffer.toString()).window.document;
      documents.set(path, document);
      Object.assign(row, {
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content,
        canonical: document.querySelector('link[rel="canonical"]')?.href,
        robots: [...document.querySelectorAll('meta[name="robots"]')]
          .map((tag) => tag.content)
          .join("; "),
        lang: document.documentElement.lang,
        h1Count: document.querySelectorAll("h1").length,
      });
      check(row.h1Count === 1, `${path}: expected one H1`);
      check(Boolean(row.title), `${path}: missing title`);
      if (policies.has(path)) {
        const publicCopy = [
          row.title,
          row.description,
          document.querySelector("main")?.textContent,
        ].join(" ");
        check(
          !/\b(cashback|refund|affiliate|voucher|link)\b/i.test(publicCopy),
          `${path}: public copy contains untranslated terminology`,
        );
        check(
          !document.querySelector('link[hreflang="en"]'),
          `${path}: English alternate is still advertised`,
        );
        check(row.canonical === origin + path, `${path}: incorrect canonical`);
        check(
          row.robots === (indexable ? "index, follow" : "noindex, follow"),
          `${path}: unexpected indexing mode`,
        );
        if (indexable)
          check(
            !/noindex|none/i.test(row.xRobotsTag || ""),
            `${path}: HTTP header prevents indexing`,
          );
        check(row.lang === policies.get(path).lang, `${path}: incorrect language`);
        check(!titles.has(row.title), `${path}: duplicate public title`);
        check(
          Boolean(row.description) && !descriptions.has(row.description),
          `${path}: missing/duplicate description`,
        );
        titles.add(row.title);
        descriptions.add(row.description);
        const scripts = [...document.querySelectorAll('script[type="application/ld+json"]')];
        check(scripts.length === 1, `${path}: expected one server schema graph`);
        const graph = JSON.parse(scripts[0]?.textContent || '{"@graph":[]}')["@graph"];
        row.schemaTypes = graph.map((entry) => entry["@type"]);
        for (const entry of graph)
          check(entry["@id"]?.startsWith(origin), `${path}: incorrect schema identity`);
        const faq = graph.find((entry) => entry["@type"] === "FAQPage");
        for (const question of faq?.mainEntity || []) {
          const visible = normalize(document.querySelector("main")?.textContent);
          check(
            visible.includes(normalize(question.name)),
            `${path}: schema question missing from HTML`,
          );
          check(
            visible.includes(normalize(question.acceptedAnswer.text)),
            `${path}: schema answer missing from HTML`,
          );
        }
        const actual = Object.fromEntries(
          [...document.querySelectorAll("link[hreflang]")].map((link) => [
            link.hreflang,
            link.href,
          ]),
        );
        const expected = policies.get(path).alternates;
        check(
          Object.keys(actual).length === Object.keys(expected).length,
          `${path}: extra/missing hreflang`,
        );
        for (const [lang, href] of Object.entries(expected))
          check(actual[lang] === href, `${path}: incorrect ${lang} alternate`);
        for (const img of document.images)
          check(
            img.hasAttribute("alt") && img.hasAttribute("width") && img.hasAttribute("height"),
            `${path}: image lacks alt/dimensions`,
          );
        for (const a of document.querySelectorAll('a[href^="#"]'))
          check(document.getElementById(a.hash.slice(1)), `${path}: broken anchor ${a.hash}`);
        check(
          !document.querySelector('script[src*="googletagmanager.com"]'),
          `${path}: Analytics loaded before consent`,
        );
      } else check(row.robots.includes("noindex"), `${path}: account page must remain noindex`);
    }
    if (path === "/robots.txt") {
      check(
        buffer.toString().includes(`Sitemap: ${origin}/sitemap.xml`),
        "robots: incorrect sitemap origin",
      );
      check(
        !/^Disallow: \/app$/m.test(buffer.toString()),
        "robots: prefix rule blocks apple-icon.png",
      );
    }
    if (path === "/sitemap.xml") {
      const xml = new JSDOM(buffer.toString(), { contentType: "text/xml" }).window.document;
      row.urls = [...xml.querySelectorAll("loc")].map((loc) => loc.textContent);
      check(
        JSON.stringify(row.urls) ===
          JSON.stringify(indexable ? publicPaths.map((path) => origin + path) : []),
        "sitemap: unexpected indexable URLs",
      );
      for (const node of xml.querySelectorAll("url")) {
        const path = new URL(node.querySelector("loc").textContent).pathname;
        const actual = Object.fromEntries(
          [...node.getElementsByTagNameNS("http://www.w3.org/1999/xhtml", "link")].map((link) => [
            link.getAttribute("hreflang"),
            link.getAttribute("href"),
          ]),
        );
        const expected = policies.get(path)?.alternates || {};
        for (const [lang, href] of Object.entries(expected))
          check(actual[lang] === href, `${path}: sitemap ${lang} alternate mismatch`);
      }
    }
    if (path === "/vi")
      check(
        row.status === 308 && row.location === "/",
        "Vietnamese alias must redirect permanently",
      );
    if (path === "/en/")
      check(
        row.status === 308 && row.location === "/en",
        "Trailing slash must redirect permanently",
      );
    for (const [oldPath, newPath] of [
      ["/en", "/"],
      ["/en/huong-dan", "/huong-dan"],
      ["/en/login", "/login"],
      ["/en/kien-thuc", "/kien-thuc"],
      ["/kien-thuc/cashback-la-gi", "/kien-thuc/tien-hoan-la-gi"],
    ])
      if (path === oldPath)
        check(row.status === 308 && row.location === newPath, `${path}: missing Vietnamese redirect`);
    if (["/app", "/admin"].includes(path))
      check(
        row.status === 307 && row.location === "/login",
        `${path}: authentication redirect changed`,
      );
    if (path === "/seo-audit-missing-page")
      check(row.status === 404, `${path}: missing page must return 404`);
    if (path === "/opengraph-image")
      check(row.status === 200 && type.includes("image/png"), "OG image unavailable");
    results.push(row);
  } catch (error) {
    failures.push(`${path}: ${error.message}`);
  }
}
// Node fetch does not preserve a custom Host header; use the native request API.
try {
  const url = new URL("/huong-dan?utm_source=seo-audit", base);
  const transport = url.protocol === "https:" ? https : http;
  const result = await new Promise((resolve, reject) => {
    const request = transport.get(url, { headers: { host: "www.piggyback.vn" } }, (response) => {
      response.resume();
      response.on("end", () => resolve({ status: response.statusCode, location: response.headers.location }));
    });
    request.setTimeout(15000, () => request.destroy(new Error("www redirect timed out")));
    request.on("error", reject);
  });
  check(result.status === 308 && result.location === "https://piggyback.vn/huong-dan?utm_source=seo-audit", "www redirect must preserve path and query");
} catch (error) { failures.push(`www redirect: ${error.message}`); }
const links = new Set();
const incoming = new Set();
for (const [source, document] of documents) {
  for (const a of document.querySelectorAll("a[href]")) {
    const url = new URL(a.getAttribute("href"), base);
    if (url.origin === base.origin && !a.getAttribute("href").startsWith("#")) {
      links.add(url.pathname);
      if (source !== url.pathname && publicPaths.includes(source)) incoming.add(url.pathname);
    }
  }
}
for (const path of publicPaths) check(incoming.has(path), `${path}: orphan public page`);
for (const path of links) {
  if (documents.has(path)) continue;
  try {
    const response = await fetch(new URL(path, base), { signal: AbortSignal.timeout(15000) });
    check(response.status === 200, `${path}: linked page returned ${response.status}`);
    await response.body?.cancel();
  } catch (error) {
    failures.push(`${path}: ${error.message}`);
  }
}
for (const path of [
  "/piggy-back-logo.webp",
  "/piggy-back-shopping-cashback.webp",
  "/apple-icon.png",
]) {
  try {
    const r = await get(new URL(path, base));
    check(r.ok, `${path}: brand asset unavailable`);
    await r.body?.cancel();
  } catch (error) {
    failures.push(`${path}: ${error.message}`);
  }
}
const report = {
  mode: indexable ? "launch-candidate" : "prelaunch",
  base: base.origin,
  results,
  checkedLinks: [...links],
  failures,
  limitations: [
    "HTTP server HTML only; no browser JavaScript",
    "Not full Schema.org or Google rich-result validation",
    "No field CWV or Search Console indexing data",
  ],
};
await mkdir("artifacts/seo", { recursive: true });
await writeFile(`artifacts/seo/${report.mode}.json`, JSON.stringify(report, null, 2));
console.log(
  JSON.stringify(
    {
      mode: report.mode,
      routes: results.length,
      publicPages: publicPaths.length,
      links: links.size,
      failures,
    },
    null,
    2,
  ),
);
if (failures.length) process.exitCode = 1;
