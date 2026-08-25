"use client";

import { useTranslations } from "next-intl";

import PageContainer from "@/layouts/page-container";

export default function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="border-t border-border bg-card py-10">
      <PageContainer className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-bold tracking-tight">
            Nexora<span className="text-primary">VN</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {t("copyright")}
        </p>
      </PageContainer>
    </footer>
  );
}
