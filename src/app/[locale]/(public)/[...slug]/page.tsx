import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { findResource, resourceMetadata, resourceStructuredData } from "@/modules/resources/pages";
import { ResourceView } from "@/modules/resources/resource-page";

type Props = { params: Promise<{ locale: string; slug: string[] }> };
export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const page = locale === "vi" ? findResource(`/${slug.join("/")}`) : undefined;
  return page ? resourceMetadata(page) : {};
}
export default async function PublicResourcePage({ params }: Props) {
  const { locale, slug } = await params;
  const page = locale === "vi" ? findResource(`/${slug.join("/")}`) : undefined;
  if (!page) notFound();
  setRequestLocale("vi");
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(resourceStructuredData(page)).replace(/</g, "\\u003c"),
        }}
      />
      <ResourceView page={page} />
    </>
  );
}
