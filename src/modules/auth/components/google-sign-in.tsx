"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useCopy } from "@/i18n/use-copy";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export function GoogleSignIn() {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const locale = useLocale();
  const router = useRouter();
  const t = useCopy();
  const { loginWithGoogle } = useAuth();

  const handleCredential = useCallback(
    async (response: GoogleCredentialResponse) => {
      if (!response.credential) return;
      setBusy(true);
      try {
        const user = await loginWithGoogle(response.credential);
        toast.success(t("Đăng nhập thành công"));
        router.replace(user.role === "USER" ? "/app" : "/admin");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Đăng nhập Google thất bại");
        setBusy(false);
      }
    },
    [loginWithGoogle, router, t],
  );

  useEffect(() => {
    if (!scriptReady || !clientId || !buttonRef.current || !window.google) return;
    const container = buttonRef.current;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredential,
      auto_select: false,
    });
    let renderedWidth = 0;
    const render = () => {
      const width = Math.min(400, Math.floor(container.clientWidth));
      if (width === 0 || width === renderedWidth) return;
      renderedWidth = width;
      container.replaceChildren();
      window.google?.accounts.id.renderButton(container, {
        theme: "outline",
        size: "large",
        text: "signin_with",
        width,
        locale,
      });
    };
    const observer = new ResizeObserver(render);
    observer.observe(container);
    render();
    return () => {
      observer.disconnect();
      container.replaceChildren();
    };
  }, [scriptReady, handleCredential, locale]);

  if (!clientId)
    return <p className="text-muted-foreground text-sm">Đăng nhập Google chưa được cấu hình.</p>;

  return (
    <div className="flex min-h-11 justify-center" aria-busy={busy}>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <div ref={buttonRef} className="flex w-full justify-center" />
    </div>
  );
}
