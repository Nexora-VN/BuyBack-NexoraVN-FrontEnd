"use client";

import { Card } from "@/components/ui/card";
import { Page } from "@/components/ui/page";
import { Link2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { useGenerateLink } from "../hooks/use-generate-link";
import { GenerateLinkForm } from "./generate-link-form";
import { GenerateLinkNotes } from "./generate-link-notes";
import { GenerateLinkResult } from "./generate-link-result";
export function GenerateLinkPanel({ showNotes = true }: { showNotes?: boolean }) {
  const state = useGenerateLink();
  const t = useTranslations("EndUser");
  return (
    <div className="space-y-4">
      <Card className="user-link-card min-w-0">
        <div className="mb-5 flex items-center gap-3">
          <span className="user-icon-box">
            <Link2 className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-bold">{t("linkCardTitle")}</h2>
            <p className="text-muted-foreground mt-0.5 text-xs leading-5">{t("linkCardHint")}</p>
          </div>
        </div>
        <GenerateLinkForm state={state} />
        <GenerateLinkResult state={state} />
      </Card>
      {showNotes && <GenerateLinkNotes />}
    </div>
  );
}
export function GenerateLinkPage() {
  const t = useTranslations("EndUser");
  return (
    <Page title={t("linkTitle")} description={t("linkDescription")}>
      <GenerateLinkPanel />
    </Page>
  );
}
