"use client";

import { Button } from "@/components/ui/button";
import { Page } from "@/components/ui/page";
import { StatusBadge } from "@/components/ui/status-badge";
import { Link } from "@/i18n/navigation";
import { formatDateTime, formatVnd } from "@/lib/format";
import { Check, CircleCheck, CircleX, Clock3, Copy, Landmark } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useFinance } from "../../hooks/use-finance";
import { Failure, Loading } from "../finance-states";

type WithdrawalDetail = {
  id: string;
  amount: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "REJECTED" | "FAILED";
  createdAt: string;
  transferReference: string | null;
  bank: { bankCode: string; bankName: string; accountHolder: string; lastFour: string };
  timeline: { status: WithdrawalDetail["status"]; at: string }[];
};

function Copyable({ label, value }: { label: string; value: string }) {
  const t = useTranslations("EndUser");
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 py-3">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className="flex min-w-0 items-center gap-1 font-mono text-sm font-semibold break-all">
        {value}
        <button
          type="button"
          onClick={() => void copy()}
          className="hover:bg-muted grid size-9 shrink-0 place-items-center rounded-lg"
          aria-label={`${t("withdrawalCopy")} ${label}`}
        >
          {copied ? (
            <Check className="text-success size-4" aria-hidden="true" />
          ) : (
            <Copy className="text-muted-foreground size-4" aria-hidden="true" />
          )}
        </button>
      </dd>
    </div>
  );
}

export function WithdrawalDetailPage({ id }: { id: string }) {
  const t = useTranslations("EndUser");
  const query = useFinance<WithdrawalDetail>(`me/withdrawals/${id}`);
  if (query.isLoading)
    return (
      <Page title={t("withdrawalDetailTitle")}>
        <Loading />
      </Page>
    );
  if (query.isError)
    return (
      <Page title={t("withdrawalDetailTitle")}>
        <Failure message={query.error.message} retry={() => void query.refetch()} />
      </Page>
    );
  if (!query.data) return null;

  const item = query.data;
  const isSuccess = item.status === "COMPLETED";
  const isFailure = item.status === "FAILED" || item.status === "REJECTED";
  const currentEvent = item.timeline.at(-1);
  const tone = isSuccess
    ? "bg-success-soft text-success"
    : isFailure
      ? "bg-danger-soft text-danger"
      : "bg-primary/5 text-primary";
  const eventLabel = (status: WithdrawalDetail["status"]) => {
    switch (status) {
      case "PENDING":
        return t("withdrawalTimelinePending");
      case "PROCESSING":
        return t("withdrawalTimelineProcessing");
      case "COMPLETED":
        return t("withdrawalTimelineCompleted");
      case "FAILED":
        return t("withdrawalTimelineFailed");
      case "REJECTED":
        return t("withdrawalTimelineRejected");
    }
  };

  return (
    <Page
      title={t("withdrawalDetailTitle")}
      description={t("withdrawalDetailDescription")}
      className="user-withdrawal-detail"
    >
      <article className="bg-card mx-auto max-w-3xl overflow-hidden rounded-2xl border shadow-sm">
        <div className={`flex flex-wrap items-center gap-4 px-5 py-7 sm:px-8 ${tone}`}>
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-white/60">
            {isSuccess ? (
              <CircleCheck className="size-9" aria-hidden="true" />
            ) : isFailure ? (
              <CircleX className="size-9" aria-hidden="true" />
            ) : (
              <Clock3 className="size-9" aria-hidden="true" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <StatusBadge domain="withdrawal" status={item.status} />
            <p className="mt-1 text-sm">
              {isSuccess
                ? t("withdrawalCompletedHint")
                : isFailure
                  ? t("withdrawalFailureHint")
                  : t("withdrawalInProgressHint")}
            </p>
          </div>
          <div className="w-full text-left sm:w-auto sm:text-right">
            <p className="text-foreground text-3xl font-bold tracking-tight tabular-nums sm:text-4xl">
              {formatVnd(item.amount)}
            </p>
            {currentEvent && (
              <time className="mt-1 block text-xs" dateTime={currentEvent.at}>
                {formatDateTime(currentEvent.at)}
              </time>
            )}
          </div>
        </div>

        {isFailure && (
          <div
            role="status"
            className="bg-danger-soft text-danger mx-5 mt-5 rounded-xl px-4 py-3 text-sm leading-6 sm:mx-8"
          >
            {t("withdrawalFundsReturned")}
          </div>
        )}

        <div className="space-y-8 px-5 py-7 sm:px-8 sm:py-9">
          <section aria-labelledby="withdrawal-transaction-heading">
            <h2 id="withdrawal-transaction-heading" className="text-base font-bold">
              {t("withdrawalTransactionInfo")}
            </h2>
            <dl className="mt-3 divide-y border-y">
              <Copyable label={t("withdrawalRequestCode")} value={item.id} />
              {item.transferReference && (
                <Copyable label={t("withdrawalTransferCode")} value={item.transferReference} />
              )}
              <div className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <dt className="text-muted-foreground">{t("withdrawalRequestedAt")}</dt>
                <dd>
                  <time dateTime={item.createdAt}>{formatDateTime(item.createdAt)}</time>
                </dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="withdrawal-destination-heading">
            <h2 id="withdrawal-destination-heading" className="text-base font-bold">
              {t("withdrawalDestinationInfo")}
            </h2>
            <div className="mt-4 flex items-start gap-3">
              <span className="bg-primary/10 text-primary grid size-11 shrink-0 place-items-center rounded-xl">
                <Landmark className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 space-y-1 text-sm">
                <p className="font-semibold">{item.bank.bankName}</p>
                <p className="text-muted-foreground">•••• {item.bank.lastFour}</p>
                <p className="text-muted-foreground">{item.bank.accountHolder}</p>
              </div>
            </div>
          </section>

          <section aria-labelledby="withdrawal-timeline-heading">
            <h2 id="withdrawal-timeline-heading" className="text-base font-bold">
              {t("withdrawalTimelineTitle")}
            </h2>
            <ol aria-label={t("withdrawalTimelineTitle")} className="mt-5 space-y-0">
              {item.timeline.map((event, index) => (
                <li
                  key={`${event.status}-${event.at}`}
                  className="relative flex gap-4 pb-6 last:pb-0"
                >
                  {index < item.timeline.length - 1 && (
                    <span
                      className="bg-border absolute top-7 bottom-0 left-[15px] w-px"
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={`relative z-10 grid size-8 shrink-0 place-items-center rounded-full ${event.status === "COMPLETED" ? "bg-success text-white" : ["FAILED", "REJECTED"].includes(event.status) ? "bg-danger text-white" : "bg-primary text-white"}`}
                  >
                    {["FAILED", "REJECTED"].includes(event.status) ? (
                      <CircleX className="size-4" aria-hidden="true" />
                    ) : (
                      <Check className="size-4" aria-hidden="true" />
                    )}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-wrap justify-between gap-1 pt-1">
                    <span className="font-semibold">{eventLabel(event.status)}</span>
                    <time className="text-muted-foreground text-xs" dateTime={event.at}>
                      {formatDateTime(event.at)}
                    </time>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </article>
      <div className="mx-auto mt-5 max-w-3xl">
        <Button asChild variant="outline">
          <Link href="/app/withdrawals">{t("withdrawalBackToHistory")}</Link>
        </Button>
      </div>
    </Page>
  );
}
