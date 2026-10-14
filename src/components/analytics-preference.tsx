"use client";

import { saveAnalyticsChoice } from "@/lib/analytics";
import { useAnalyticsChoice } from "@/lib/use-analytics-choice";

export function AnalyticsPreference({ measurementId }: { measurementId: string }) {
  const choice = useAnalyticsChoice();
  if (!/^G-[A-Z0-9]+$/.test(measurementId) || choice === undefined) return null;

  return (
    <div className="mt-5 border-t border-current/15 pt-4">
      <p className="font-semibold">
        Trạng thái hiện tại:{" "}
        {choice === "granted" ? "Đã đồng ý" : choice === "denied" ? "Đã từ chối" : "Chưa chọn"}
      </p>
      <div className="mt-3 flex flex-wrap gap-3" role="group" aria-label="Lựa chọn đo lường">
        <button
          type="button"
          aria-pressed={choice === "granted"}
          className="rounded-md border border-current/30 px-4 py-2 text-sm aria-pressed:bg-[#a8245e] aria-pressed:text-white"
          onClick={() => saveAnalyticsChoice("granted")}
        >
          Đồng ý
        </button>
        <button
          type="button"
          aria-pressed={choice === "denied"}
          className="rounded-md border border-current/30 px-4 py-2 text-sm aria-pressed:bg-[#a8245e] aria-pressed:text-white"
          onClick={() => saveAnalyticsChoice("denied")}
        >
          Từ chối
        </button>
      </div>
    </div>
  );
}
