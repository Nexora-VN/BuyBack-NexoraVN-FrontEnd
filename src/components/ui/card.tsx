"use client";
import { useCopy } from "@/i18n/use-copy";
import { cn } from "@/lib/utils";
import * as React from "react";

export function Card({ className, ...props }: React.ComponentProps<"section">) {
  return <section className={cn("bg-card rounded-2xl border p-4 sm:p-5", className)} {...props} />;
}

export function StatCard({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  helper?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  const t = useCopy();
  return (
    <Card className="min-w-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-sm">{t(label)}</p>
          <div className="tabular mt-2 text-2xl font-bold tracking-tight break-words">{value}</div>
          {helper && (
            <div className="text-muted-foreground mt-2 text-xs">
              {typeof helper === "string" ? t(helper) : helper}
            </div>
          )}
        </div>
        {icon && <div className="bg-secondary text-primary rounded-xl p-2.5">{icon}</div>}
      </div>
    </Card>
  );
}
