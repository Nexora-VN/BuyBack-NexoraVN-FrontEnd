import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { isLocale } from "@/i18n/config";
import { GuidePage } from "@/modules/landing/guide-page";
import { guideMetadata, guideStructuredData } from "@/modules/landing/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return isLocale(locale) ? guideMetadata(locale) : {};
}

export default async function ShoppingGuide({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(guideStructuredData(locale)).replace(/</g, "\\u003c"),
        }}
      />
      <GuidePage locale={locale} />
    </>
  );
}
