"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  analyticsPath,
  consentEvent,
  initializeAnalytics,
  readAnalyticsChoice,
  saveAnalyticsChoice,
  suspendAnalytics,
  trackPage,
} from "@/lib/analytics";

function subscribe(callback: () => void) {
  window.addEventListener(consentEvent, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(consentEvent, callback);
    window.removeEventListener("storage", callback);
  };
}
export function AnalyticsConsent({
  measurementId,
  locale,
}: {
  measurementId: string;
  locale: string;
}) {
  const pathname = usePathname();
  const choice = useSyncExternalStore(subscribe, readAnalyticsChoice, () => null);
  const [editing, setEditing] = useState(false);
  const enabled = /^G-[A-Z0-9]+$/.test(measurementId);
  const vi = locale === "vi";
  useEffect(() => {
    if (enabled && choice === "granted" && analyticsPath(pathname)) {
      initializeAnalytics(measurementId);
      trackPage(pathname);
    } else {
      suspendAnalytics(choice === "denied");
    }
  }, [enabled, choice, measurementId, pathname]);
  if (!enabled || !analyticsPath(pathname)) return null;
  const choose = (value: "granted" | "denied") => {
    saveAnalyticsChoice(value);
    setEditing(false);
  };
  if (choice && !editing)
    return (
      <button
        type="button"
        className="fixed right-3 bottom-3 z-40 rounded-full border bg-white px-3 py-2 text-xs shadow-sm"
        onClick={() => setEditing(true)}
      >
        {vi ? "Cài đặt đo lường" : "Analytics settings"}
      </button>
    );
  return (
    <section
      aria-label={vi ? "Lựa chọn đo lường" : "Analytics choice"}
      className="fixed right-3 bottom-3 left-3 z-50 mx-auto max-w-lg rounded-2xl border bg-white p-5 shadow-lg"
    >
      <p className="text-sm leading-6">
        {vi
          ? "Cho phép Piggy Back dùng công cụ đo lường của Google để hiểu cách trang mạng được sử dụng? Bạn vẫn dùng dịch vụ bình thường nếu từ chối."
          : "Allow Piggy Back to use Google Analytics to understand website usage? You can use the service normally if you decline."}
      </p>
      <Link
        prefetch={false}
        className="text-primary mt-2 inline-block text-sm underline"
        href="/bao-mat"
        hrefLang="vi"
      >
        {vi ? "Thông tin quyền riêng tư" : "Privacy information (Vietnamese)"}
      </Link>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-lg border px-4 py-2 text-sm"
          onClick={() => choose("denied")}
        >
          {vi ? "Từ chối" : "Decline"}
        </button>
        <button
          type="button"
          className="bg-primary rounded-lg px-4 py-2 text-sm text-white"
          onClick={() => choose("granted")}
        >
          {vi ? "Đồng ý" : "Allow"}
        </button>
      </div>
    </section>
  );
}
