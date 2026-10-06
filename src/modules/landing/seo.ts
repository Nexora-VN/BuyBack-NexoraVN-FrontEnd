import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { landingContent } from "./content";

export const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").origin;
export const languageUrls = { vi: `${siteUrl}/`, en: `${siteUrl}/en`, "x-default": `${siteUrl}/` };

export function landingMetadata(locale: Locale): Metadata {
  const t = landingContent[locale];
  const url = languageUrls[locale];
  return {
    title: { absolute: t.title },
    description: t.description,
    alternates: { canonical: url, languages: languageUrls },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      siteName: "Piggy Back",
      title: t.title,
      description: t.description,
      url,
      locale: locale === "vi" ? "vi_VN" : "en_US",
      alternateLocale: locale === "vi" ? "en_US" : "vi_VN",
      images: [
        {
          url: `${siteUrl}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: "Piggy Back — Shopee cashback",
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
  const url = languageUrls[locale];
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Piggy Back",
        url: `${siteUrl}/`,
        logo: `${siteUrl}/logo.png`,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: "Piggy Back",
        url: `${siteUrl}/`,
        inLanguage: ["vi", "en"],
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
