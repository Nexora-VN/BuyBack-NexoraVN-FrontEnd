"use client";
import { ApiErrorNotice } from "@/components/errors/api-error-notice";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCopy } from "@/i18n/use-copy";
export function Loading() {
  const t = useCopy();
  return (
    <div role="status" aria-label={t("Đang tải")} className="space-y-3">
      <div className="skeleton h-12 w-2/3 rounded-xl" />
      <div className="skeleton h-28 rounded-2xl" />
      <div className="skeleton h-28 rounded-2xl" />
    </div>
  );
}
export function Failure({
  message,
  retry,
  error,
}: {
  message: string;
  retry: () => void;
  error?: unknown;
}) {
  const t = useCopy();
  return (
    <Card role="alert">
      {error ? <ApiErrorNotice error={error} /> : <p className="text-danger">{t.error(message)}</p>}
      <Button variant="outline" className="mt-3" onClick={retry}>
        {t("Thử lại")}
      </Button>
    </Card>
  );
}
