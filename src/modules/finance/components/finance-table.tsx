"use client";
import { ListSearch } from "@/components/patterns/list-controls";
import { SurfaceDialog } from "@/components/patterns/surface-dialog";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Select } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/page";
import { statusLabel, type StatusDomain } from "@/components/ui/status-badge";
import { useCopy } from "@/i18n/use-copy";
import { useListState } from "@/lib/use-list-state";
import { SlidersHorizontal } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useFinanceList } from "../hooks/use-finance";
import type { FinanceRow } from "../types/finance";
import { columns, type Specs } from "./finance-columns";
import { Failure, Loading } from "./finance-states";
export function FinanceTable({
  path,
  specs,
  states,
  actions,
  searchLabel = "Tìm kiếm",
  extraColumns = [],
  onFilterChange,
  initialStatus,
  scope,
}: {
  path: string;
  specs: Specs;
  states?: string[];
  actions?: (row: FinanceRow) => ReactNode;
  searchLabel?: string;
  extraColumns?: Column<FinanceRow>[];
  onFilterChange?: () => void;
  initialStatus?: string;
  scope?: string;
}) {
  const t = useCopy();
  const list = useListState(scope ?? path.split("/").at(-1)!);
  const [filters, setFilters] = useState(false);
  const domain: StatusDomain = path.includes("orders")
    ? "order"
    : path.includes("commissions")
      ? "commission"
      : path.includes("cashbacks")
        ? "cashback"
        : path.includes("withdrawals")
          ? "withdrawal"
          : path.includes("bank-accounts")
            ? "bank"
            : path.includes("settlements")
              ? "settlement"
              : path.includes("batches")
                ? "batch"
                : path.includes("issues")
                  ? "issue"
                  : "general";
  const query = useFinanceList(
    path,
    list.page,
    list.hasStatus ? list.status : initialStatus || "",
    list.query,
    list.sort,
  );
  const cols = [
    ...extraColumns,
    ...columns(specs, domain),
    ...(actions ? [{ key: "actions", label: t("Thao tác"), render: actions }] : []),
  ];
  const filterCount =
    Number(!!(list.hasStatus ? list.status : initialStatus)) + Number(list.sort === "asc");
  function apply(values: Parameters<typeof list.update>[0]) {
    list.update({ ...values, page: 1 });
    onFilterChange?.();
  }
  const filterControls = (
    <>
      {states && (
        <label className="block space-y-1 text-sm">
          <span>{t("Trạng thái")}</span>
          <Select
            value={list.hasStatus ? list.status : initialStatus || ""}
            onChange={(e) => apply({ status: e.target.value })}
          >
            <option value="">{t("Tất cả trạng thái")}</option>
            {states.map((s) => (
              <option key={s} value={s}>
                {t(statusLabel(s, domain))}
              </option>
            ))}
          </Select>
        </label>
      )}
      <label className="block space-y-1 text-sm">
        <span>{t("Sắp xếp")}</span>
        <Select value={list.sort} onChange={(e) => apply({ sort: e.target.value })}>
          <option value="desc">{t("Mới nhất")}</option>
          <option value="asc">{t("Cũ nhất")}</option>
        </Select>
      </label>
    </>
  );
  return (
    <section className="min-w-0 space-y-4">
      <div className="flex items-end gap-3">
        <ListSearch value={list.query} label={searchLabel} onSearch={(query) => apply({ query })} />
        <div className="hidden items-end gap-3 lg:flex">{filterControls}</div>
        <Button variant="outline" className="lg:hidden" onClick={() => setFilters(true)}>
          <SlidersHorizontal />
          {t("Lọc")}
          {filterCount > 0 && (
            <span className="bg-secondary text-primary rounded-full px-2">{filterCount}</span>
          )}
        </Button>
      </div>
      <SurfaceDialog compact open={filters} onOpenChange={setFilters} title={t("Bộ lọc")}>
        <div className="space-y-4">
          {filterControls}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                apply({ query: "", status: "", sort: "desc" });
              }}
            >
              {t("Xóa bộ lọc")}
            </Button>
            <Button onClick={() => setFilters(false)}>{t("Xem kết quả")}</Button>
          </div>
        </div>
      </SurfaceDialog>
      {query.isLoading ? (
        <Loading />
      ) : query.isError ? (
        <Failure
          error={query.error}
          message={query.error.message}
          retry={() => void query.refetch()}
        />
      ) : !query.data?.data.length ? (
        <EmptyState
          title={list.query || list.status ? t("Không tìm thấy kết quả") : t("Chưa có dữ liệu")}
          description={
            list.query || list.status
              ? t("Thử thay đổi từ khóa hoặc bộ lọc.")
              : t("Dữ liệu của bạn sẽ xuất hiện sau khi dữ liệu của bạn được đồng bộ")
          }
        />
      ) : (
        <DataTable columns={cols} rows={query.data.data} rowKey={(r) => r.id} />
      )}
      {query.data && (
        <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-3 text-sm">
          <span>
            {query.data.meta.total} {t("bản ghi")} · {t("Trang")} {list.page}/
            {Math.max(1, query.data.meta.totalPages)}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={list.page <= 1 || query.isFetching}
              onClick={() => list.update({ page: list.page - 1 })}
            >
              {t("Trước")}
            </Button>
            <Button
              variant="outline"
              disabled={list.page >= query.data.meta.totalPages || query.isFetching}
              onClick={() => list.update({ page: list.page + 1 })}
            >
              {t("Sau")}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
