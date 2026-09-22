"use client";
import { useCopy } from "@/i18n/use-copy";

import { Card } from "@/components/ui/card";
import { Page } from "@/components/ui/page";
import {
Link2
} from "lucide-react";

import { useGenerateLink } from '../hooks/use-generate-link';
import { GenerateLinkForm } from './generate-link-form';
import { GenerateLinkNotes } from './generate-link-notes';
import { GenerateLinkResult } from './generate-link-result';
export function GenerateLinkPanel() {
  const state = useGenerateLink();
  return <div className="grid items-start gap-5 lg:grid-cols-[1.2fr_.8fr]">
    <Card className="min-w-0">
      <div className="bg-secondary text-primary mb-5 flex size-12 items-center justify-center rounded-2xl"><Link2 /></div>
      <GenerateLinkForm state={state} />
      <GenerateLinkResult state={state} />
    </Card>
    <GenerateLinkNotes />
  </div>;
}
export function GenerateLinkPage() {
  const t = useCopy();
  return (
    <Page
      title={t("Tạo link cashback")}
      description="Dán link sản phẩm Shopee để xem hoa hồng dự kiến và bắt đầu mua sắm."
    >
      <GenerateLinkPanel />
    </Page>
  );
}
