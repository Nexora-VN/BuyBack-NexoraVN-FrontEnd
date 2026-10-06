"use client";
import { useTranslations } from "next-intl";

import { CircleHelp, ChevronDown } from "lucide-react";

export function GenerateLinkNotes() {
  const t = useTranslations("EndUser");
  return (
    <details className="user-help-card group p-4 sm:p-5">
      <summary className="focus-visible:outline-primary flex min-h-11 cursor-pointer list-none items-center gap-3 font-semibold focus-visible:outline-2">
        <span className="text-primary grid size-10 shrink-0 place-items-center rounded-xl">
          <CircleHelp aria-hidden="true" className="size-6" />
        </span>
        {t("helpTitle")}
        <ChevronDown
          aria-hidden="true"
          className="text-muted-foreground ml-auto size-5 transition-transform group-open:rotate-180"
        />
      </summary>
      <ol className="text-muted-foreground mt-5 space-y-4 text-sm leading-6">
        {[t("helpStepOne"), t("helpStepTwo"), t("helpStepThree")].map((item, index) => (
          <li key={index} className="flex gap-3">
            <span className="bg-secondary text-primary grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold">
              {index + 1}
            </span>
            {item}
          </li>
        ))}
      </ol>
      <p className="bg-muted text-muted-foreground mt-6 rounded-xl p-3 text-xs leading-5">
        {t("helpNote")}
      </p>
    </details>
  );
}
