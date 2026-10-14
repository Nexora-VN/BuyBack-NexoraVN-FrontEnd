import type { Metadata } from "next";
import content from "./content.json";
import { landingMetadata, landingStructuredData } from "@/modules/landing/seo";
import { siteUrl } from "@/lib/seo/site";

export type ResourcePage = (typeof content)[number];
export const resourcePages = content;
export const knowledgePage: ResourcePage = {
  path: "/kien-thuc",
  kind: "collection",
  title: "Kiến thức mua sắm hoàn tiền Shopee | Piggy Back",
  heading: "Hiểu tiền hoàn trước khi mua sắm",
  description:
    "Hướng dẫn mua sắm hoàn tiền Shopee: tạo liên kết, kiểm tra đơn chưa ghi nhận, hiểu tiền hoàn dự kiến và rút số dư khả dụng cùng Piggy Back.",
  intro:
    "Bắt đầu từ cách tạo liên kết, sau đó tìm hiểu điều kiện ghi nhận và các bước từ tiền hoàn dự kiến đến số dư có thể rút.",
  sections: [],
  related: content.filter((page) => page.kind === "article").map((page) => page.path),
};
export function findResource(path: string) {
  return path === knowledgePage.path ? knowledgePage : content.find((page) => page.path === path);
}
export function resourceMetadata(page: ResourcePage): Metadata {
  const base = landingMetadata("vi");
  const url = siteUrl + page.path;
  return {
    ...base,
    title: { absolute: page.title },
    description: page.description,
    alternates: { canonical: url, languages: { vi: url, "x-default": url } },
    openGraph: {
      ...base.openGraph,
      title: page.title,
      description: page.description,
      url,
      type: page.kind === "article" ? "article" : "website",
      alternateLocale: [],
    },
    twitter: { ...base.twitter, title: page.title, description: page.description },
  };
}
export function resourceStructuredData(page: ResourcePage) {
  const url = siteUrl + page.path;
  const article = page.kind === "article";
  const crumbs = [
    { "@type": "ListItem", position: 1, name: "Trang chủ", item: siteUrl + "/" },
    ...(article
      ? [{ "@type": "ListItem", position: 2, name: "Kiến thức", item: siteUrl + "/kien-thuc" }]
      : []),
    { "@type": "ListItem", position: article ? 3 : 2, name: page.heading, item: url },
  ];
  return {
    "@context": "https://schema.org",
    "@graph": [
      ...landingStructuredData("vi")["@graph"].filter((node) =>
        ["Organization", "WebSite"].includes(node["@type"]),
      ),
      {
        "@type":
          page.kind === "collection"
            ? "CollectionPage"
            : page.kind === "about"
              ? "AboutPage"
              : page.kind === "contact"
                ? "ContactPage"
                : "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: page.title,
        description: page.description,
        inLanguage: "vi",
        isPartOf: { "@id": `${siteUrl}/#website` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      { "@type": "BreadcrumbList", "@id": `${url}#breadcrumb`, itemListElement: crumbs },
      ...(article
        ? [
            {
              "@type": "Article",
              "@id": `${url}#article`,
              headline: page.heading,
              description: page.description,
              inLanguage: "vi",
              mainEntityOfPage: { "@id": `${url}#webpage` },
              publisher: { "@id": `${siteUrl}/#organization` },
            },
          ]
        : []),
    ],
  };
}
