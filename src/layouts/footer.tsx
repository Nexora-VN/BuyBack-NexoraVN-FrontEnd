"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

import PageContainer from "@/layouts/page-container";

export default function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="border-border bg-card border-t py-10">
      <PageContainer className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <Image
            src="/logo.png"
            alt="Piggy Back"
            width={36}
            height={36}
            className="size-9 object-contain"
          />
          <div>
            <p className="font-bold tracking-tight">
              Piggy<span className="text-primary">Back</span>
            </p>
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
