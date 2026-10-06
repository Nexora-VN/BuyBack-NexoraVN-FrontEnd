# Piggy Back public landing page

## Scope

The public homepage is available in Vietnamese at `/` and English at `/en`.
It introduces the existing Shopee affiliate link workflow and directs visitors
to `/login` or `/en/login`. Existing application and admin routes remain protected.

The design extends Piggy Back's existing berry palette, Be Vietnam Pro font and
mascot assets. Matumi was used as a reference for the kind of information a
cashback landing page should explain, not as a source of product claims or brand assets.

## Editing

- `src/modules/landing/content.ts`: all Vietnamese and English landing copy,
  including the FAQ content used by the page and JSON-LD.
- `src/modules/landing/landing-page.tsx`: server-rendered sections and native
  keyboard-accessible FAQ disclosure controls.
- `src/modules/landing/landing.module.css`: scoped responsive landing styles.
- `src/modules/landing/device-preview.tsx` and `device-preview.module.css`:
  static feature previews placed before the three-step section. The phone frame
  illustrates link creation and estimated cashback; the laptop frame illustrates
  order tracking and wallet management. Device frames are visual presentation,
  not the marketing message. All displayed financial amounts are labeled sample data.
- `src/modules/landing/seo.ts`: localized metadata and structured data.
- `src/app/opengraph-image.tsx`: generated social image using existing brand art.

Public landing routes omit the session-fetching application provider. The sign-in
and application routes retain their current provider behavior. No new package is required.

## SEO / GEO

- Content, headings and FAQs are present in the server response.
- Each locale has its own title, description, canonical and reciprocal hreflang
  links; Vietnamese is the x-default.
- Open Graph and Twitter metadata include a 1200 × 630 brand image.
- Organization, WebSite, WebPage and FAQPage JSON-LD describe visible content.
  FAQ schema does not imply eligibility for a Google FAQ rich result.
- `/sitemap.xml` lists only the two public homepages.
- `/robots.txt` allows public crawling and excludes API and private app paths.
- Root metadata defaults to noindex; the landing page explicitly opts into indexing.
  Authentication continues to enforce private access; robots directives are not access control.

## Before publishing

1. Set `NEXT_PUBLIC_SITE_URL` to the final public origin (including HTTPS) before
   building. Local development defaults to `http://localhost:3000`; do not publish
   that value as the canonical production domain.
2. Review the public product copy against actual launch capabilities. The landing
   intentionally makes no numerical cashback, payout-time, user-count or app-store
   claims. The current finance modules are described as mock/future modules in the
   repository README; confirm their readiness before advertising a live service.
3. Add verified support/contact details and reviewed legal policies when available.
   No fictional company identity, support channel or legal-policy link is included.
4. After deployment, submit the sitemap to Search Console and validate live pages
   with URL Inspection and PageSpeed Insights. Local checks cannot establish search
   indexing, field Core Web Vitals or inclusion in AI answers.

GEO here means crawlable, clearly structured, factual content that can be understood
and cited. It does not guarantee ranking or inclusion in an AI response.

References: https://developers.google.com/search/docs/appearance/ai-features
and https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data.

## Verification

Run `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build`.
The homepage regression tests verify public access, locale-preserving CTAs and
agreement between FAQ JSON-LD and visible text. Provider tests verify that public
landing visits do not request a backend session while login still does.

Check `/`, `/en`, `/login`, `/en/login`, `/robots.txt`, `/sitemap.xml`, and
`/opengraph-image` over HTTP. Inspect responsive layout, navigation, FAQ keyboard
interaction and language switching in a browser.
