import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { landingContent } from "./content";
import { guideContent } from "./guide-content";
import { siteIndexable, siteUrl } from "@/lib/seo/site";

export { siteUrl } from "@/lib/seo/site";
export const languageUrls = { vi: `${siteUrl}/`, "x-default": `${siteUrl}/` };
export const guideUrls = {
  vi: `${siteUrl}/huong-dan`,
  "x-default": `${siteUrl}/huong-dan`,
};

export function guideMetadata(locale: Locale): Metadata {
  const base = landingMetadata(locale);
  const t = guideContent[locale];
  return {
    ...base,
    title: { absolute: t.title },
    description: t.description,
    alternates: { canonical: guideUrls.vi, languages: guideUrls },
    openGraph: {
      ...base.openGraph,
      type: "article",
      title: t.title,
      description: t.description,
      url: guideUrls.vi,
    },
    twitter: { ...base.twitter, title: t.title, description: t.description },
  };
}

export function guideStructuredData(locale: Locale) {
  const t = guideContent[locale];
  const url = guideUrls.vi;
  return {
    "@context": "https://schema.org",
    "@graph": [
      ...landingStructuredData(locale)["@graph"].filter((node) =>
        ["Organization", "WebSite"].includes(node["@type"]),
      ),
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: t.title,
        description: t.description,
        inLanguage: locale,
        isPartOf: { "@id": `${siteUrl}/#website` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: t.heading,
        description: t.description,
        inLanguage: locale,
        mainEntityOfPage: { "@id": `${url}#webpage` },
        publisher: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: t.home, item: languageUrls.vi },
          { "@type": "ListItem", position: 2, name: t.label, item: url },
        ],
      },
    ],
  };
}

export function landingMetadata(locale: Locale): Metadata {
  const t = landingContent[locale];
  const url = languageUrls.vi;
  return {
    title: { absolute: t.title },
    description: t.description,
    alternates: { canonical: url, languages: languageUrls },
    robots: { index: siteIndexable, follow: true },
    openGraph: {
      type: "website",
      siteName: "Piggy Back",
      title: t.title,
      description: t.description,
      url,
      locale: locale === "vi" ? "vi_VN" : "en_US",
      alternateLocale: [],
      images: [
        {
          url: `${siteUrl}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: "Piggy Back — mua sắm hoàn tiền Shopee",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t.title,
      description: t.description,
      images: [`${siteUrl}/opengraph-image`],
    },
  };
}

export function landingStructuredData(locale: Locale) {
  const t = landingContent[locale];
  const url = languageUrls.vi;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Piggy Back",
        url: `${siteUrl}/`,
        email: "theanh.nguyen2039@gmail.com",
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "hỗ trợ khách hàng",
          email: "theanh.nguyen2039@gmail.com",
          availableLanguage: "vi",
        },
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/brand-icon-512.png`,
          width: 512,
          height: 512,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: "Piggy Back",
        url: `${siteUrl}/`,
        inLanguage: "vi",
        publisher: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: t.title,
        description: t.description,
        inLanguage: locale,
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        inLanguage: locale,
        isPartOf: { "@id": `${url}#webpage` },
        mainEntity: t.faqs.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
    ],
  };
}
