"use client";

import { Check, Compass, Download, Ellipsis, Share, SquarePlus, X } from "lucide-react";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<{ outcome: "accepted" | "dismissed" }>;
}

type MobilePlatform = "ios" | "android";

function GuideStep({
  number,
  title,
  detail,
  children,
}: {
  number: number;
  title: string;
  detail: string;
  children: ReactNode;
}) {
  return (
    <li className="border-border bg-background flex items-center gap-3 rounded-xl border p-3">
      <div
        aria-hidden="true"
        className="bg-card border-border flex h-16 w-24 shrink-0 items-center justify-center rounded-lg border shadow-sm"
      >
        {children}
      </div>
      <div className="min-w-0">
        <p className="text-primary text-xs font-bold uppercase">Bước {number}</p>
        <p className="text-foreground mt-0.5 text-sm font-semibold">{title}</p>
        <p className="text-muted-foreground mt-0.5 text-xs leading-5">{detail}</p>
      </div>
    </li>
  );
}

const subscribeToBrowser = () => () => {};

function getMobilePlatform(): MobilePlatform | null {
  const userAgent = navigator.userAgent;
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  if (
    /iPhone|iPad|iPod/i.test(userAgent) ||
    typeof navigatorWithStandalone.standalone === "boolean" ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  )
    return "ios";
  if (/Android/i.test(userAgent)) return "android";

  const touch = navigator.maxTouchPoints > 0 || window.matchMedia("(pointer: coarse)").matches;
  if (!touch) return null;
  return /Apple/i.test(navigator.vendor) || /Safari/i.test(userAgent) ? "ios" : "android";
}

function isStandalone() {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigatorWithStandalone.standalone === true
  );
}

function isSafariBrowser() {
  return /Safari/i.test(navigator.userAgent) && !/CriOS|FxiOS|EdgiOS/i.test(navigator.userAgent);
}

export function InstallHomeButton() {
  const platform = useSyncExternalStore(subscribeToBrowser, getMobilePlatform, () => null);
  const standalone = useSyncExternalStore(subscribeToBrowser, isStandalone, () => false);
  const isSafari = useSyncExternalStore(subscribeToBrowser, isSafariBrowser, () => false);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
      setShowInstructions(false);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!platform || standalone || installed) return null;

  const onInstall = async () => {
    if (!installPrompt) {
      setShowInstructions(true);
      return;
    }
    setInstallPrompt(null);
    try {
      const result = await installPrompt.prompt();
      if (result.outcome === "accepted") setInstalled(true);
    } catch {
      setShowInstructions(true);
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label="Thêm vào màn hình chính"
        title="Thêm vào màn hình chính"
        className="install-home-button bg-primary text-primary-foreground fixed bottom-[calc(16px+env(safe-area-inset-bottom))] left-4 z-40 grid size-12 place-items-center rounded-full shadow-lg shadow-black/15"
        onClick={() => void onInstall()}
      >
        <Download aria-hidden="true" className="size-5" />
      </button>

      {showInstructions && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 pb-[max(16px,env(safe-area-inset-bottom))]"
          onClick={() => setShowInstructions(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-home-title"
            className="bg-card text-foreground max-h-[calc(100dvh-32px)] w-full max-w-md overflow-y-auto rounded-2xl p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 id="install-home-title" className="text-lg font-bold">
                Thêm Piggy Back vào màn hình chính
              </h2>
              <button
                type="button"
                aria-label="Đóng hướng dẫn"
                className="hover:bg-muted grid size-10 shrink-0 place-items-center rounded-full"
                onClick={() => setShowInstructions(false)}
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>
            {platform === "ios" ? (
              <ol className="mt-4 space-y-2">
                {!isSafari && (
                  <GuideStep
                    number={1}
                    title="Mở bằng Safari"
                    detail="Sao chép địa chỉ trang này rồi mở trong Safari."
                  >
                    <Compass className="text-primary size-9" strokeWidth={1.5} />
                  </GuideStep>
                )}
                <GuideStep
                  number={isSafari ? 1 : 2}
                  title="Chạm Chia sẻ"
                  detail="Trong Safari, mở menu trang rồi chọn Chia sẻ."
                >
                  <div className="border-border bg-muted flex items-center gap-2 rounded-lg border px-2 py-1.5">
                    <Ellipsis className="text-muted-foreground size-5" />
                    <span className="bg-primary/15 grid size-8 place-items-center rounded-md">
                      <Share className="text-primary size-5" />
                    </span>
                  </div>
                </GuideStep>
                <GuideStep
                  number={isSafari ? 2 : 3}
                  title="Thêm vào Màn hình chính"
                  detail="Cuộn trong bảng Chia sẻ và chọn mục này."
                >
                  <div className="border-primary/30 bg-primary/5 flex items-center gap-2 rounded-lg border px-2 py-2">
                    <SquarePlus className="text-primary size-6" />
                    <span className="bg-primary/20 h-1.5 w-9 rounded-full" />
                  </div>
                </GuideStep>
                <GuideStep
                  number={isSafari ? 3 : 4}
                  title="Chạm Thêm"
                  detail="Bật Mở như ứng dụng web nếu có, rồi xác nhận Thêm."
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="bg-primary/20 flex h-4 w-8 items-center justify-end rounded-full p-0.5">
                      <span className="bg-primary size-3 rounded-full" />
                    </span>
                    <span className="bg-primary text-primary-foreground flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold">
                      <Check className="size-3" /> Thêm
                    </span>
                  </div>
                </GuideStep>
              </ol>
            ) : (
              <ol className="mt-4 space-y-2">
                <GuideStep
                  number={1}
                  title="Mở menu Chrome"
                  detail="Chạm biểu tượng ba chấm ⋮ ở góc trình duyệt."
                >
                  <Ellipsis className="text-primary size-8 rotate-90" />
                </GuideStep>
                <GuideStep
                  number={2}
                  title="Chọn cài đặt"
                  detail="Chạm Thêm vào màn hình chính hoặc Cài đặt ứng dụng."
                >
                  <SquarePlus className="text-primary size-8" />
                </GuideStep>
              </ol>
            )}
          </div>
        </div>
      )}
    </>
  );
}
