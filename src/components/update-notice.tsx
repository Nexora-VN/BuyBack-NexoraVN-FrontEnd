"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const CHECK_INTERVAL_MS = 5 * 60 * 1000;
const MIN_CHECK_GAP_MS = 60 * 1000;

type UpdateNoticeProps = {
  currentVersion?: string;
  reload?: () => void;
};

export function UpdateNotice({
  currentVersion = process.env.NEXT_PUBLIC_BUILD_ID,
  reload = () => window.location.reload(),
}: UpdateNoticeProps) {
  const t = useTranslations("UpdateNotice");
  const [availableVersion, setAvailableVersion] = useState<string | null>(null);
  const [dismissedVersion, setDismissedVersion] = useState<string | null>(null);

  useEffect(() => {
    if (!currentVersion) return;

    let disposed = false;
    let checking = false;
    let lastCheckAt = 0;

    const checkVersion = async () => {
      const now = Date.now();
      if (checking || now - lastCheckAt < MIN_CHECK_GAP_MS) return;
      checking = true;
      lastCheckAt = now;

      try {
        const response = await fetch("/api/version", { cache: "no-store" });
        if (!response.ok) return;
        const body: unknown = await response.json();
        if (!body || typeof body !== "object" || !("version" in body)) return;
        const version = body.version;
        if (typeof version !== "string" || !/^[a-f0-9]{40}$/.test(version)) return;
        if (!disposed) setAvailableVersion(version === currentVersion ? null : version);
      } catch {
        // A temporary network failure should not interrupt the current page.
      } finally {
        checking = false;
      }
    };

    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      setDismissedVersion(null);
      void checkVersion();
    };
    const onFocus = () => {
      if (document.visibilityState !== "visible") return;
      setDismissedVersion(null);
      void checkVersion();
    };

    void checkVersion();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void checkVersion();
    }, CHECK_INTERVAL_MS);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);

    return () => {
      disposed = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
    };
  }, [currentVersion]);

  if (!availableVersion || availableVersion === dismissedVersion) return null;

  return (
    <aside
      role="status"
      className="bg-card text-foreground border-border fixed top-[calc(16px+env(safe-area-inset-top))] right-4 left-4 z-50 mx-auto flex max-w-sm flex-wrap items-center gap-3 rounded-xl border p-4 shadow-xl sm:left-auto"
    >
      <p className="min-w-0 flex-1 text-sm font-semibold">{t("available")}</p>
      <button
        type="button"
        className="bg-primary text-primary-foreground rounded-lg px-3 py-2 text-sm font-semibold"
        onClick={reload}
      >
        {t("reload")}
      </button>
      <button
        type="button"
        className="text-muted-foreground px-1 py-2 text-sm"
        onClick={() => setDismissedVersion(availableVersion)}
      >
        {t("later")}
      </button>
    </aside>
  );
}
