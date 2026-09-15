"use client";
import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { SurfaceDialog } from "./surface-dialog";
import { Button } from "@/components/ui/button";
import { useCopy } from "@/i18n/use-copy";
const ConfirmContext = createContext<(message: string) => Promise<boolean>>(() => Promise.resolve(false));
export const useConfirm = () => useContext(ConfirmContext);
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const t = useCopy();
  const [message, setMessage] = useState<string | null>(null);
  const resolve = useRef<((value: boolean) => void) | null>(null);
  function finish(value: boolean) { resolve.current?.(value); resolve.current = null; setMessage(null); }
  return <ConfirmContext.Provider value={message => new Promise<boolean>(done => { resolve.current?.(false); resolve.current = done; setMessage(message); })}>
    {children}<SurfaceDialog compact open={message !== null} onOpenChange={open => { if (!open) finish(false); }} title="Xác nhận thao tác">
      <p className="text-sm leading-6">{message && t(message)}</p><div className="mt-6 flex justify-end gap-3"><Button variant="outline" onClick={() => finish(false)}>{t("Hủy")}</Button><Button variant="danger" onClick={() => finish(true)}>{t("Xác nhận")}</Button></div>
    </SurfaceDialog>
  </ConfirmContext.Provider>;
}
