"use client";

import { ListPagination, ListSearch } from "@/components/patterns/list-controls";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { EmptyState, Page } from "@/components/ui/page";
import { StatusBadge } from "@/components/ui/status-badge";
import { Link } from "@/i18n/navigation";
import { formatDateTime, formatVnd } from "@/lib/format";
import { useListState } from "@/lib/use-list-state";
import { ArrowRight, Landmark, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFinanceList } from "../../hooks/use-finance";
import type { FinanceRow } from "../../types/finance";
import { Failure } from "../finance-states";
import { UserListSkeleton } from "./user-skeletons";

type WithdrawalRow = FinanceRow & {
  amount: string;
  status: string;
  createdAt: string;
  bank?: { bankName?: string; lastFour?: string; accountHolder?: string };
};

export function WithdrawalHistoryPage() {
  const t = useTranslations("EndUser");
  const list = useListState("withdrawals");
  const query = useFinanceList("me/withdrawals", list.page, list.status, list.query, list.sort);
  const states = [
    { value: "", label: t("withdrawalFilterAll") },
    { value: "PENDING", label: t("withdrawalFilterPending") },
    { value: "PROCESSING", label: t("withdrawalFilterProcessing") },
    { value: "COMPLETED", label: t("withdrawalFilterCompleted") },
    { value: "UNSUCCESSFUL", label: t("withdrawalFilterUnsuccessful") },
  ];
  const rows = (query.data?.data ?? []) as WithdrawalRow[];
  const update = (values: Parameters<typeof list.update>[0]) => list.update({ ...values, page: 1 });

  return (
    <Page
      title={t("withdrawalHistoryTitle")}
      description={t("withdrawalHistoryDescription")}
      className="user-withdrawal-history"
      actions={
        <Button asChild>
          <Link href="/app/withdrawals/new">
            <Plus aria-hidden="true" className="size-4" />
            {t("withdrawalAction")}
          </Link>
        </Button>
      }
    >
      <section className="space-y-5">
        <div
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
          aria-label={t("withdrawalStatusFilter")}
        >
          {states.map((state) => (
            <button
              key={state.value}
              type="button"
              aria-pressed={list.status === state.value}
              className={`min-h-11 shrink-0 rounded-xl px-4 text-sm font-semibold transition-colors ${list.status === state.value ? "bg-primary text-primary-foreground shadow-sm" : "bg-card text-muted-foreground hover:border-primary/40 hover:text-primary border"}`}
              onClick={() => update({ status: state.value })}
            >
              {state.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <ListSearch
            value={list.query}
            label={t("withdrawalSearch")}
            onSearch={(value) => update({ query: value })}
          />
          <label className="text-muted-foreground flex items-center gap-2 text-sm">
            <span>{t("withdrawalSort")}</span>
            <Select
              className="w-auto min-w-32"
              value={list.sort}
              onChange={(event) => update({ sort: event.target.value })}
            >
              <option value="desc">{t("withdrawalNewest")}</option>
              <option value="asc">{t("withdrawalOldest")}</option>
            </Select>
          </label>
        </div>

        {query.isLoading ? (
          <UserListSkeleton mobileRows={4} />
        ) : query.isError ? (
          <Failure message={query.error.message} retry={() => void query.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState
            title={
              list.query || list.status ? t("withdrawalNoResults") : t("withdrawalsEmptyTitle")
            }
            description={
              list.query || list.status
                ? t("withdrawalTryFilters")
                : t("withdrawalsEmptyDescription")
            }
            action={
              !list.query && !list.status ? (
                <Button asChild>
                  <Link href="/app/withdrawals/new">{t("withdrawalAction")}</Link>
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="bg-card overflow-hidden rounded-2xl border shadow-sm">
            <div className="text-muted-foreground bg-muted/35 hidden grid-cols-[1.15fr_1.45fr_1fr_1fr_1.25rem] gap-4 border-b px-5 py-3 text-xs font-semibold tracking-wide uppercase lg:grid">
              <span>{t("withdrawalAmount")}</span>
              <span>{t("withdrawalRecipient")}</span>
              <span>{t("withdrawalTime")}</span>
              <span>{t("withdrawalStatusFilter")}</span>
              <span />
            </div>
            <div className="divide-y">
              {rows.map((row) => {
                const href = `/app/withdrawals/${encodeURIComponent(row.id)}`;
                return (
                  <Link
                    key={row.id}
                    href={href}
                    className="hover:bg-primary/[0.035] focus-visible:ring-primary grid min-w-0 gap-3 p-4 transition-colors focus-visible:ring-2 focus-visible:outline-none sm:p-5 lg:grid-cols-[1.15fr_1.45fr_1fr_1fr_1.25rem] lg:items-center lg:gap-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 lg:block">
                      <strong className="text-foreground text-lg font-bold tabular-nums">
                        {formatVnd(row.amount)}
                      </strong>
                      <span className="lg:hidden">
                        <StatusBadge domain="withdrawal" status={row.status} />
                      </span>
                      <p className="text-muted-foreground mt-1 hidden text-xs lg:block">
                        {t("withdrawalRequestShort")}: {row.id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="bg-primary/10 text-primary grid size-10 shrink-0 place-items-center rounded-xl">
                        <Landmark className="size-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">
                          {row.bank?.bankName || "—"} · •••• {row.bank?.lastFour || "—"}
                        </span>
                        {row.bank?.accountHolder && (
                          <span className="text-muted-foreground block truncate text-xs">
                            {row.bank.accountHolder}
                          </span>
                        )}
                      </span>
                    </div>
                    <time
                      className="text-muted-foreground text-xs sm:text-sm"
                      dateTime={row.createdAt}
                    >
                      {formatDateTime(row.createdAt)}
                    </time>
                    <span className="hidden lg:block">
                      <StatusBadge domain="withdrawal" status={row.status} />
                    </span>
                    <ArrowRight
                      className="text-muted-foreground hidden size-4 lg:block"
                      aria-hidden="true"
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
        {query.data && query.data.meta.total > 0 && (
          <ListPagination
            page={list.page}
            total={query.data.meta.total}
            totalPages={query.data.meta.totalPages}
            pending={query.isFetching}
            onPage={(page) => list.update({ page })}
          />
        )}
      </section>
    </Page>
  );
}
