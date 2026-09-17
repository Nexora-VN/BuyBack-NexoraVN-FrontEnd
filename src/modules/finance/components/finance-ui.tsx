"use client";
import { ProductThumbnail } from "@/components/patterns/product-thumbnail";
import { ListSearch } from "@/components/patterns/list-controls";
import { SurfaceDialog, useDialogBusy } from "@/components/patterns/surface-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Input, Select, Textarea } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/page";
import { StatusBadge, statusLabel, type StatusDomain } from "@/components/ui/status-badge";
import { useCopy } from "@/i18n/use-copy";
import { formatDateTime, formatVnd } from "@/lib/format";
import { useListState } from "@/lib/use-list-state";
import { SlidersHorizontal } from "lucide-react";
import { createContext, useContext, useId, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useFinanceList, useRefreshFinance } from "../hooks/use-finance";
import { financeService } from "../services/finance";
import type { Field, FinanceRow } from "../types/finance";
const ActionContext = createContext<(() => void) | undefined>(undefined);
export function read(row: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (v, k) => (v && typeof v === "object" ? (v as Record<string, unknown>)[k] : undefined),
      row,
    );
}
export const text = (row: unknown, path: string) => {
  const value = read(row, path);
  return value == null ? "—" : String(value);
};
export type Specs = [string, string, ("money" | "status" | "date")?][];
export function columns(specs: Specs, domain: StatusDomain = "general"): Column<FinanceRow>[] {
  return specs.map(([key, label, type]) => ({
    key,
    label,
    mobilePrimary: ["productSummary.name", "checkout.checkoutId", "bankName", "orderSn"].includes(
      key,
    ),
    render: (row) => {
      const value = text(row, key);
      if (key === "productSummary.name")
        return (
          <div className="flex min-w-0 items-center gap-3">
            <ProductThumbnail
              src={read(row, "productSummary.imageUrl") as string | null}
              name={value === "—" ? "" : value}
            />
            <div className="min-w-0">
              <span className="line-clamp-2 font-medium break-words">
                {value === "—" ? text(row, "orderSn") : value}
              </span>
              <span className="text-muted-foreground text-xs">
                {text(row, "productSummary.itemCount")} <CopyText value="sản phẩm" />
              </span>
            </div>
          </div>
        );
      if (value === "—") return value;
      if (type === "money")
        return <span className="font-semibold tabular-nums">{formatVnd(value)}</span>;
      if (type === "status")
        return (
          <StatusBadge
            status={value}
            domain={
              key.includes("cashback")
                ? "cashback"
                : key.includes("commission")
                  ? "commission"
                  : domain
            }
          />
        );
      if (type === "date") return formatDateTime(value);
      return (
        <span className="block max-w-72 break-words">
          {key === "type" ? <CopyText value={value} /> : value}
        </span>
      );
    },
  }));
}
function CopyText({ value }: { value: string }) {
  const t = useCopy();
  return t(value);
}
export function Loading() {
  const t = useCopy();
  return (
    <div role="status" aria-label={t("Đang tải")} className="space-y-3">
      <div className="skeleton h-12 w-2/3 rounded-xl" />
      <div className="skeleton h-28 rounded-2xl" />
      <div className="skeleton h-28 rounded-2xl" />
    </div>
  );
}
export function Failure({ message, retry }: { message: string; retry: () => void }) {
  const t = useCopy();
  return (
    <Card role="alert">
      <p className="text-danger">{t.error(message)}</p>
      <Button variant="outline" className="mt-3" onClick={retry}>
        {t("Thử lại")}
      </Button>
    </Card>
  );
}
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
        <Failure message={query.error.message} retry={() => void query.refetch()} />
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
export function MutationForm({
  title,
  fields,
  path,
  method = "post",
  schema,
  transform,
  confirmation = true,
  children,
  onSuccess,
  initialValues = {},
}: {
  title: string;
  fields: Field[];
  path: string;
  method?: "post" | "put" | "patch";
  schema?: z.ZodType;
  transform?: (input: Record<string, string>) => unknown;
  confirmation?: boolean;
  children?: ReactNode;
  onSuccess?: () => void;
  initialValues?: Record<string, string>;
}) {
  const t = useCopy();
  const close = useContext(ActionContext);
  const formId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const refresh = useRefreshFinance();
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [review, setReview] = useState(false);
  const lock = useRef(false);
  useDialogBusy(pending);
  async function send() {
    if (lock.current) return;
    lock.current = true;
    setPending(true);
    setError("");
    try {
      await financeService.mutate(path, transform ? transform(values) : values, method);
      setValues(initialValues);
      setReview(false);
      await refresh();
      onSuccess?.();
      close?.();
      toast.success(t("Đã lưu thay đổi"));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("Không thể lưu"));
    } finally {
      lock.current = false;
      setPending(false);
    }
  }
  function validate() {
    const missing = fields.filter(
      (field) => field.required !== false && !values[field.name]?.trim(),
    );
    if (missing.length) {
      setErrors(
        Object.fromEntries(missing.map((field) => [field.name, t("Vui lòng nhập trường này")])),
      );
      return false;
    }
    const result = schema?.safeParse(values);
    if (result && !result.success) {
      const next: Record<string, string> = {};
      for (const issue of result.error.issues)
        next[String(issue.path[0] ?? "_form")] =
          issue.message.startsWith("Too ") || issue.message.startsWith("Invalid ")
            ? "Thông tin không hợp lệ"
            : issue.message;
      setErrors(next);
      requestAnimationFrame(() =>
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      );
      return false;
    }
    setErrors({});
    return true;
  }
  return (
    <div className="bg-card min-w-0 rounded-2xl border p-4 lg:p-5">
      <form
        ref={formRef}
        noValidate
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!validate()) return;
          if (confirmation) setReview(true);
          else void send();
        }}
      >
        <h2 className="text-lg font-semibold">{review ? t("Kiểm tra thông tin") : t(title)}</h2>
        {children}
        {review ? (
          <dl className="divide-y">
            {fields.map((field) => (
              <div key={field.name} className="py-3">
                <dt className="text-muted-foreground text-sm">{t(field.label)}</dt>
                <dd className="mt-1 font-medium break-words">
                  {field.type === "password"
                    ? "••••••••"
                    : field.type === "select"
                      ? t(
                          field.options?.find((option) => option.value === values[field.name])
                            ?.label ??
                            values[field.name] ??
                            "—",
                        )
                      : values[field.name] || "—"}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {fields.map((field) => (
              <label key={field.name} className={field.type === "textarea" ? "lg:col-span-2" : ""}>
                <span className="mb-2 block text-sm font-medium">{t(field.label)}</span>
                {field.type === "textarea" ? (
                  <Textarea
                    required={field.required !== false}
                    aria-invalid={!!errors[field.name]}
                    aria-describedby={
                      errors[field.name] ? `${formId}-${field.name}-error` : undefined
                    }
                    value={values[field.name] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                  />
                ) : field.type === "select" ? (
                  <Select
                    required={field.required !== false}
                    aria-invalid={!!errors[field.name]}
                    aria-describedby={
                      errors[field.name] ? `${formId}-${field.name}-error` : undefined
                    }
                    value={values[field.name] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                  >
                    <option value="">{t("Chọn")}</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {t(opt.label)}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    type={field.type ?? "text"}
                    required={field.required !== false}
                    autoComplete={field.type === "password" ? "off" : undefined}
                    aria-invalid={!!errors[field.name]}
                    aria-describedby={
                      errors[field.name] ? `${formId}-${field.name}-error` : undefined
                    }
                    value={values[field.name] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                  />
                )}
                <span className="text-muted-foreground mt-1 block text-xs leading-5">
                  {field.help && t(field.help)}
                </span>
                {errors[field.name] && (
                  <span
                    id={`${formId}-${field.name}-error`}
                    role="alert"
                    className="text-danger mt-1 block text-sm"
                  >
                    {t(errors[field.name])}
                  </span>
                )}
              </label>
            ))}
          </div>
        )}
        {(error || errors._form) && (
          <p role="alert" className="text-danger text-sm">
            {error ? t.error(error) : t(errors._form)}
          </p>
        )}
        <div className="form-actions">
          {review ? (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => setReview(false)}
              >
                {t("Chỉnh sửa")}
              </Button>
              <Button type="button" disabled={pending} onClick={() => void send()}>
                {t(pending ? "Đang xử lý…" : "Xác nhận")}
              </Button>
            </>
          ) : (
            <Button disabled={pending} type="submit">
              {t(pending ? "Đang xử lý…" : confirmation ? "Tiếp tục" : title)}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
export function ActionDialog({ label, children }: { label: string; children: ReactNode }) {
  const t = useCopy();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        {t(label)}
      </Button>
      <SurfaceDialog open={open} onOpenChange={setOpen} title={t(label)}>
        <ActionContext.Provider value={() => setOpen(false)}>{children}</ActionContext.Provider>
      </SurfaceDialog>
    </>
  );
}
