"use client";
import { useCopy } from "@/i18n/use-copy";
import { cn } from "@/lib/utils";
import * as React from "react";

export function Card({ className, ...props }: React.ComponentProps<"section">) {
  return <section className={cn("rounded-2xl border bg-card p-4 sm:p-5", className)} {...props} />;
}

export function StatCard({ label, value, helper, icon }: { label: string; value: React.ReactNode; helper?: React.ReactNode; icon?: React.ReactNode }) {
  const t=useCopy();
  return <Card className="min-w-0"><div className="flex items-start justify-between gap-3"><div><p className="text-sm text-muted-foreground">{t(label)}</p><div className="mt-2 text-2xl font-bold tracking-tight tabular break-words">{value}</div>{helper && <div className="mt-2 text-xs text-muted-foreground">{typeof helper==='string'?t(helper):helper}</div>}</div>{icon && <div className="rounded-xl bg-secondary p-2.5 text-primary">{icon}</div>}</div></Card>;
}
