"use client";

import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "@/i18n/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, ChevronLeft, ChevronRight, CircleHelp } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

const TOUR_VERSION = "v2";
const steps = [
  { id: "welcome", target: null },
  { id: "balance", target: "wallet-overview" },
  { id: "linkInput", target: "link-input" },
  { id: "linkSubmit", target: "link-submit" },
  { id: "orders", target: "recent-orders" },
  { id: "wallet", target: "nav-wallet" },
  { id: "account", target: "nav-account" },
  { id: "replayTip", target: "tour-replay" },
] as const;

type Highlight = { top: number; left: number; right: number; bottom: number };

function storageKey(userId: string): string {
  return `piggyback:onboarding:${TOUR_VERSION}:${userId}`;
}

function visibleTarget(name: string): HTMLElement | undefined {
  return [...document.querySelectorAll<HTMLElement>(`[data-tour="${name}"]`)].find((node) => {
    const rect = node.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && getComputedStyle(node).visibility !== "hidden";
  });
}

function measure(node: HTMLElement): Highlight {
  const rect = node.getBoundingClientRect();
  const padding = 6;
  return {
    top: Math.max(0, rect.top - padding),
    left: Math.max(0, rect.left - padding),
    right: Math.min(window.innerWidth, rect.right + padding),
    bottom: Math.min(window.innerHeight, rect.bottom + padding),
  };
}

export function UserOnboarding({ userId }: { userId: string }) {
  const t = useTranslations("Onboarding");
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [highlight, setHighlight] = useState<Highlight | null>(null);
  const replayPending = useRef(false);

  useEffect(() => {
    if (path !== "/app") return;
    const timer = window.setTimeout(() => {
      if (replayPending.current) {
        replayPending.current = false;
        setStepIndex(0);
        setOpen(true);
        return;
      }
      try {
        setOpen(localStorage.getItem(storageKey(userId)) !== "done");
      } catch {
        setOpen(false);
      }
      setStepIndex(0);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [userId, path]);

  const current = steps[stepIndex];

  useEffect(() => {
    if (!open || !current.target) return;
    let frame = 0;
    const target = visibleTarget(current.target);
    if (!target) return;

    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setHighlight(measure(target)));
    };
    const rect = target.getBoundingClientRect();
    if (rect.top < 80 || rect.bottom > window.innerHeight - 85) {
      const fixed =
        getComputedStyle(target).position === "fixed" ||
        !!target.closest(".app-bottom-nav, .user-topbar");
      if (!fixed) {
        window.scrollTo({
          top: Math.max(0, window.scrollY + rect.top - 92),
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "instant"
            : "smooth",
        });
      }
    }
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    const observer = new ResizeObserver(update);
    observer.observe(target);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, current]);

  function finish() {
    try {
      localStorage.setItem(storageKey(userId), "done");
    } catch {
      // Private browsing may disable storage; the guide remains dismissible.
    }
    setOpen(false);
    setHighlight(null);
  }

  function move(index: number) {
    setHighlight(null);
    setStepIndex(index);
  }

  const activeHighlight = current.target ? highlight : null;
  const lastStep = stepIndex === steps.length - 1;
  const cardWidth = typeof window === "undefined" ? 360 : Math.min(360, window.innerWidth - 32);
  const cardLeft = activeHighlight
    ? Math.max(16, Math.min(activeHighlight.left, window.innerWidth - cardWidth - 16))
    : undefined;
  const bottomNav =
    typeof document === "undefined" ? null : document.querySelector<HTMLElement>(".app-bottom-nav");
  const usableBottom =
    bottomNav && getComputedStyle(bottomNav).display !== "none"
      ? Math.min(window.innerHeight, bottomNav.getBoundingClientRect().top)
      : typeof window === "undefined"
        ? 0
        : window.innerHeight;
  const spaceBelow = activeHighlight ? usableBottom - activeHighlight.bottom - 16 : 0;
  const spaceAbove = activeHighlight ? activeHighlight.top - 16 : 0;
  const placeBelow = spaceBelow >= 280 || spaceBelow >= spaceAbove;
  const cardMaxHeight = activeHighlight
    ? Math.max(80, Math.min(280, (placeBelow ? spaceBelow : spaceAbove) - 12))
    : undefined;
  const cardTop = activeHighlight
    ? placeBelow
      ? activeHighlight.bottom + 12
      : Math.max(16, activeHighlight.top - 12 - (cardMaxHeight ?? 280))
    : undefined;

  return (
    <>
      <button
        type="button"
        data-tour="tour-replay"
        className="text-muted-foreground hover:bg-muted grid size-10 place-items-center rounded-full transition-colors"
        aria-label={t("replay")}
        title={t("replay")}
        onClick={() => {
          move(0);
          if (path !== "/app") {
            replayPending.current = true;
            router.push("/app");
          } else setOpen(true);
        }}
      >
        <CircleHelp className="size-5" aria-hidden="true" />
      </button>
      <Dialog.Root
        open={open}
        onOpenChange={(next) => {
          if (!next) finish();
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50" data-tour-overlay>
            {activeHighlight ? (
              <>
                <span
                  className="tour-shade"
                  style={{ top: 0, left: 0, right: 0, height: activeHighlight.top }}
                />
                <span
                  className="tour-shade"
                  style={{ top: activeHighlight.bottom, left: 0, right: 0, bottom: 0 }}
                />
                <span
                  className="tour-shade"
                  style={{
                    top: activeHighlight.top,
                    left: 0,
                    width: activeHighlight.left,
                    height: activeHighlight.bottom - activeHighlight.top,
                  }}
                />
                <span
                  className="tour-shade"
                  style={{
                    top: activeHighlight.top,
                    left: activeHighlight.right,
                    right: 0,
                    height: activeHighlight.bottom - activeHighlight.top,
                  }}
                />
                <span
                  className="tour-focus-ring"
                  style={{
                    top: activeHighlight.top,
                    left: activeHighlight.left,
                    width: activeHighlight.right - activeHighlight.left,
                    height: activeHighlight.bottom - activeHighlight.top,
                  }}
                />
              </>
            ) : (
              <span className="tour-shade inset-0" />
            )}
          </Dialog.Overlay>
          <Dialog.Content
            data-tour-dialog
            className={`tour-card fixed z-[60] max-h-[calc(100dvh-32px)] w-[min(360px,calc(100vw-32px))] overflow-y-auto rounded-2xl border border-[#f2dce5] bg-white p-5 shadow-[0_24px_70px_rgba(41,21,32,0.26)] ${activeHighlight ? "" : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"}`}
            style={
              activeHighlight
                ? { top: cardTop, left: cardLeft, maxHeight: cardMaxHeight }
                : undefined
            }
            onPointerDownOutside={(event) => event.preventDefault()}
          >
            {stepIndex === 0 && (
              <div className="mb-3 flex justify-center rounded-xl bg-[#fff0f5]">
                <Image
                  src="/logo_full.png"
                  alt=""
                  width={96}
                  height={96}
                  className="size-24 object-contain"
                />
              </div>
            )}
            <p className="text-primary mb-2 text-xs font-bold tracking-wide uppercase">
              {t("progress", { current: stepIndex + 1, total: steps.length })}
            </p>
            <Dialog.Title className="text-foreground text-lg leading-tight font-bold">
              {t(`${current.id}.title`)}
            </Dialog.Title>
            <Dialog.Description className="text-muted-foreground mt-2 text-sm leading-6">
              {t(`${current.id}.description`)}
            </Dialog.Description>
            <div className="mt-4 flex gap-1" aria-hidden="true">
              {steps.map((step, index) => (
                <span
                  key={step.id}
                  className={`h-1 flex-1 rounded-full ${index <= stepIndex ? "bg-primary" : "bg-[#f1dce5]"}`}
                />
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={stepIndex === 0 ? finish : () => move(stepIndex - 1)}
              >
                {stepIndex === 0 ? (
                  t("skip")
                ) : (
                  <>
                    <ChevronLeft aria-hidden="true" />
                    {t("back")}
                  </>
                )}
              </Button>
              <Button type="button" onClick={lastStep ? finish : () => move(stepIndex + 1)}>
                {lastStep ? <Check aria-hidden="true" /> : null}
                {lastStep ? t("done") : t("next")}
                {!lastStep ? <ChevronRight aria-hidden="true" /> : null}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
