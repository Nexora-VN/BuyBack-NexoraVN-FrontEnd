"use client";

import { useTranslations } from "next-intl";

import { BrandLogo } from "@/components/patterns/brand-logo";
import PageContainer from "@/layouts/page-container";

export default function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="border-border bg-card border-t py-10">
      <PageContainer className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <div>
            <BrandLogo className="w-[150px]" />
            <p className="text-muted-foreground mt-1 text-sm">{t("description")}</p>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">
          © {new Date().getFullYear()} {t("copyright")}
        </p>
      </PageContainer>
    </footer>
  );
}
