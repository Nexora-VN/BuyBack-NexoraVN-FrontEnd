// Canonical brand identity is independent of the host serving a preview build.
export const siteUrl = "https://piggyback.vn";

// Set at build AND runtime; sitemap metadata routes are generated at build time.
// A launch must explicitly opt in after the release checklist has been completed.
export const siteIndexable = process.env.SEO_INDEXABLE === "true";
