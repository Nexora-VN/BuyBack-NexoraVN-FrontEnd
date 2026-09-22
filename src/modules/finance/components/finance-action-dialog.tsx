"use client";
import { SurfaceDialog } from "@/components/patterns/surface-dialog";
import { Button } from "@/components/ui/button";
import { useCopy } from "@/i18n/use-copy";
import { useState,type ReactNode } from "react";
import { ActionContext } from "./finance-action-context";
export function ActionDialog({ label, children }: { label: string; children: ReactNode }) {
  const t = useCopy();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        {t(label)}
      </Button>
      <SurfaceDialog open={open} onOpenChange={setOpen} title={t(label)}>
        <ActionContext.Provider value={() => setOpen(false)}>{children}</ActionContext.Provider>
      </SurfaceDialog>
    </>
  );
}
