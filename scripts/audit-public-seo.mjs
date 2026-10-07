import { mkdir, writeFile } from "node:fs/promises";
import { JSDOM } from "jsdom";

// HTTP/source audit: this does not execute page JavaScript or measure field CWV.
const base = new URL(process.argv[2] || "http://localhost:3100");
const indexable = process.argv.includes("--indexable");
const origin = "https://piggyback.vn";
const failures = [];
const results = [];
const check = (condition, detail) => {
  if (!condition) failures.push(detail);
};
const publicPaths = ["/", "/en", "/huong-dan", "/en/huong-dan"];
const routes = [
  ...publicPaths,
  "/vi",
  "/en/",
  "/login",
  "/en/login",
  "/sign-up",
  "/en/sign-up",
  "/forgot-password",
  "/en/forgot-password",
  "/app",
  "/admin",
  "/seo-audit-missing-page",
  "/robots.txt",
  "/sitemap.xml",
  "/opengraph-image",
];
const documents = new Map();
const normalize = (value) => value.replace(/\s+/g, " ").trim();
for (const path of routes) {
  const response = await fetch(new URL(path, base), {
    redirect: "manual",
    signal: AbortSignal.timeout(15000),
  });
  const buffer = Buffer.from(await response.arrayBuffer());
  const type = response.headers.get("content-type") || "";
  const row = {
    path,
    status: response.status,
    location: response.headers.get("location"),
    bytes: buffer.length,
    cache: response.headers.get("cache-control"),
  };
  check(response.status < 500, `${path}: server error`);
  if (!["/vi", "/en/", "/app", "/admin", "/seo-audit-missing-page"].includes(path)) {
    check(response.status === 200, `${path}: expected HTTP 200`);
  }
  if (type.includes("text/html") && response.status === 200) {
    const document = new JSDOM(buffer.toString()).window.document;
    documents.set(path, document);
    Object.assign(row, {
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content,
      canonical: document.querySelector('link[rel="canonical"]')?.href,
      robots: document.querySelector('meta[name="robots"]')?.content,
      lang: document.documentElement.lang,
      h1Count: document.querySelectorAll("h1").length,
    });
    check(row.h1Count === 1, `${path}: expected one H1`);
    check(Boolean(row.title), `${path}: missing title`);
    if (publicPaths.includes(path)) {
      check(row.canonical === origin + path, `${path}: incorrect canonical`);
      check(
        row.robots === (indexable ? "index, follow" : "noindex, follow"),
        `${path}: unexpected indexing mode`,
      );
      check(row.lang === (path.startsWith("/en") ? "en" : "vi"), `${path}: incorrect language`);
      check(
        document.querySelectorAll('script[type="application/ld+json"]').length === 1,
        `${path}: expected one schema graph`,
      );
      const graph = JSON.parse(
        document.querySelector('script[type="application/ld+json"]').textContent,
      )["@graph"];
      row.schemaTypes = graph.map((entry) => entry["@type"]);
      for (const entry of graph)
        check(entry["@id"]?.startsWith(origin), `${path}: incorrect schema identity`);
      const faq = graph.find((entry) => entry["@type"] === "FAQPage");
      for (const question of faq?.mainEntity || []) {
        check(
          normalize(document.querySelector("main").textContent).includes(normalize(question.name)),
          `${path}: schema question is not in HTML`,
        );
        check(
          normalize(document.querySelector("main").textContent).includes(
            normalize(question.acceptedAnswer.text),
          ),
          `${path}: schema answer is not in HTML`,
        );
      }
      const alternates = path.endsWith("/huong-dan")
        ? {
            vi: origin + "/huong-dan",
            en: origin + "/en/huong-dan",
            "x-default": origin + "/huong-dan",
          }
        : { vi: origin + "/", en: origin + "/en", "x-default": origin + "/" };
      for (const [language, href] of Object.entries(alternates)) {
        check(
          document.querySelector(`link[hreflang="${language}"]`)?.href === href,
          `${path}: incorrect ${language} alternate`,
        );
      }
      check(
        !buffer.toString().includes('\\"EndUser\\"'),
        `${path}: application translations leaked into public payload`,
      );
      for (const img of document.images)
        check(
          img.hasAttribute("alt") && img.hasAttribute("width") && img.hasAttribute("height"),
          `${path}: image lacks alt/dimensions`,
        );
      for (const a of document.querySelectorAll('a[href^="#"]'))
        check(document.getElementById(a.hash.slice(1)), `${path}: broken anchor ${a.hash}`);
      row.scriptUrls = [...document.querySelectorAll("script[src]")].map((script) =>
        script.getAttribute("src"),
      );
    } else check(row.robots?.includes("noindex"), `${path}: account page must remain noindex`);
  }
  if (path === "/robots.txt") {
    const rules = buffer.toString();
    check(rules.includes(`Sitemap: ${origin}/sitemap.xml`), "robots: incorrect sitemap origin");
    check(!/^Disallow: \/app$/m.test(rules), "robots: prefix rule blocks apple-icon.png");
  }
  if (path === "/sitemap.xml") {
    const xml = new JSDOM(buffer.toString(), { contentType: "text/xml" }).window.document;
    row.urls = [...xml.querySelectorAll("loc")].map((loc) => loc.textContent);
    check(
      JSON.stringify(row.urls) ===
        JSON.stringify(indexable ? publicPaths.map((path) => origin + path) : []),
      "sitemap: unexpected indexable URLs",
    );
  }
  if (path === "/vi")
    check(
      row.status === 308 && row.location === "/",
      "Vietnamese alias must redirect permanently to /",
    );
  if (path === "/en/")
    check(row.status === 308 && row.location === "/en", "Trailing slash must redirect permanently");
  if (["/app", "/admin"].includes(path))
    check(
      row.status === 307 && row.location === "/login",
      `${path}: authentication redirect changed`,
    );
  if (path === "/seo-audit-missing-page") check(row.status === 404, "Missing URL must return 404");
  if (path === "/opengraph-image")
    check(row.status === 200 && type.includes("image/png"), "OG image unavailable");
  results.push(row);
}

// Check actual public links and redirect chains, without crawling authenticated data.
const links = new Set();
for (const document of documents.values()) {
  for (const a of document.querySelectorAll("a[href]")) {
    const url = new URL(a.getAttribute("href"), base);
    if (url.origin === base.origin && !a.getAttribute("href").startsWith("#"))
      links.add(url.pathname);
  }
}
for (const path of links) {
  let url = new URL(path, base);
  const visited = new Set();
  for (let hop = 0; hop < 6; hop++) {
    if (visited.has(url.href)) {
      failures.push(`${path}: redirect loop`);
      break;
    }
    visited.add(url.href);
    const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(15000) });
    await response.body?.cancel();
    const target = response.headers.get("location");
    if (response.status >= 300 && response.status < 400 && target) {
      url = new URL(target, url);
      if (url.origin !== base.origin) break;
      if (hop === 5) failures.push(`${path}: more than five redirects`);
    } else {
      check(response.status === 200, `${path}: linked page returned ${response.status}`);
      break;
    }
  }
}
const jsUrls = results.find((row) => row.path === "/").scriptUrls;
let javascriptBytes = 0;
for (const path of jsUrls) {
  const response = await fetch(new URL(path, base));
  check(response.ok, `JavaScript asset unavailable: ${path}`);
  javascriptBytes += (await response.arrayBuffer()).byteLength;
}
for (const path of [
  "/piggy-back-logo.webp",
  "/piggy-back-shopping-cashback.webp",
  "/apple-icon.png",
]) {
  const response = await fetch(new URL(path, base));
  check(response.ok, `Brand asset unavailable: ${path}`);
  await response.body?.cancel();
}
const report = {
  mode: indexable ? "launch-candidate" : "prelaunch",
  base: base.origin,
  results,
  checkedLinks: [...links],
  javascriptBytes,
  failures,
  limitations: [
    "HTTP HTML only; no browser execution",
    "Not Google Rich Results Test or full Schema.org validation",
    "No field LCP/INP/CLS, Google indexing, or live DNS/TLS verification",
  ],
};
await mkdir("artifacts/seo", { recursive: true });
await writeFile(`artifacts/seo/${report.mode}.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
