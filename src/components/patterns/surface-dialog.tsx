"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useCopy } from "@/i18n/use-copy";

export function SurfaceDialog({ open, onOpenChange, title, children, compact = false }: {
  open: boolean; onOpenChange: (open: boolean) => void; title: string; children: ReactNode; compact?: boolean;
}) {
  const t = useCopy();
  return <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/35" />
      <Dialog.Content className={compact ? "app-sheet" : "app-dialog"}>
        <header className="dialog-header"><div><Dialog.Title className="text-lg font-semibold">{t(title)}</Dialog.Title><Dialog.Description className="sr-only">{t("Kiểm tra thông tin và xác nhận thao tác.")}</Dialog.Description></div>
          <Dialog.Close asChild><Button type="button" size="icon" variant="ghost" aria-label={t("Đóng")}><X /></Button></Dialog.Close>
        </header><div className="dialog-body">{children}</div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
