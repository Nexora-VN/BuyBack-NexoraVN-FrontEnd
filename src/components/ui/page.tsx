"use client";
import { usePathname,useRouter } from "@/i18n/navigation";
import { useCopy } from "@/i18n/use-copy";
import { cn } from "@/lib/utils";
import { ArrowLeft,Inbox } from "lucide-react";
import { Button } from "./button";
export function Page({ title, description, actions, badge, children, className, taskForm = false }: { title: string; description?: string; actions?: React.ReactNode; badge?: React.ReactNode; children: React.ReactNode; className?: string; taskForm?: boolean }) {
  const t = useCopy(); const path = usePathname(); const router = useRouter();
  const detail = /\/(new|[0-9a-f-]{20,})$/.test(path);
  function back() { if (window.history.state?.idx > 0 || window.history.length > 1) router.back(); else router.replace(path.slice(0, path.lastIndexOf('/')) || '/app'); }
  return <div data-task-form={taskForm || undefined} className={cn("app-page", className)}><header className="page-heading"><div className="flex min-w-0 items-start gap-2">
    {detail && <Button size="icon" variant="ghost" onClick={back} aria-label={t("Quay lại")}><ArrowLeft /></Button>}
    <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h1 className="text-xl font-bold tracking-tight lg:text-3xl">{t(title)}</h1>{badge}</div>{description && <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t(description)}</p>}</div>
  </div>{actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}</header>{children}</div>;
}
export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
 const t = useCopy();
 return <div className="rounded-2xl border bg-card px-5 py-10 text-center"><Inbox aria-hidden className="mx-auto mb-4 size-8 text-primary"/><h3 className="font-semibold">{t(title)}</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{t(description)}</p>{action && <div className="mt-5">{action}</div>}</div>;
}
