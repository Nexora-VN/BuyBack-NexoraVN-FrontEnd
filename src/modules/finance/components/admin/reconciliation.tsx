"use client";
import { useCopy } from "@/i18n/use-copy";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Page } from "@/components/ui/page";
import { ProductThumbnail } from "@/components/patterns/product-thumbnail";
import { StatusBadge, statusLabel } from "@/components/ui/status-badge";
import { Link } from "@/i18n/navigation";
import { formatDateTime, formatVnd } from "@/lib/format";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { financeService } from "../../services/finance";
import { useFinance } from "../../hooks/use-finance";
import { structuredReviewSchema, syncSchema } from "../../schemas/finance";
import type { FinanceRow } from "../../types/finance";
import { ActionDialog, Failure, FinanceTable, Loading, MutationForm, text } from ".././finance-ui";
import { issueLabel } from "../finance-columns";
import { useSuperAdmin } from "./shared";
export const syncFields = [
  { name: "startDate", label: "Từ ngày (giờ Việt Nam)", type: "date" as const },
  { name: "endDate", label: "Đến ngày (giờ Việt Nam)", type: "date" as const },
];

export const reviewFields = [
  {
    name: "action",
    label: "Hành động",
    type: "select" as const,
    options: [
      { value: "APPROVE", label: "APPROVE — Duyệt hoa hồng có bằng chứng" },
      { value: "EXCLUDE", label: "EXCLUDE — Loại bỏ khỏi thanh toán" },
    ],
  },
  {
    name: "acceptedAmountVnd",
    label: "Hoa hồng chấp nhận (VND)",
    type: "money" as const,
    required: false,
    help: "Chỉ cần khi APPROVE: Số tiền VND được chấp nhận sau kiểm tra. Bỏ trống nếu chọn EXCLUDE.",
  },
  {
    name: "evidence",
    label: "Bằng chứng đối chiếu / Lý do xử lý",
    type: "textarea" as const,
    help: 'Tối thiểu 10 ký tự (ví dụ: "Đã đối chiếu Mã đơn Shopee, TikTok khớp với user" hoặc "Đơn demo không rõ user, loại bỏ")',
  },
];

export function ReconciliationPage() {
  const t = useCopy();

  return (
    <Page
      title={t("Đối soát chuyển đổi AddLiveTag")}
      description="Đồng bộ báo cáo AddLiveTag, kiểm tra attribution và các trường hợp cần xử lý."
    >
      <MutationForm
        title={t("Đồng bộ AddLiveTag")}
        path="admin/reconciliation/sync"
        fields={syncFields}
        schema={syncSchema}
      />
      <FinanceTable
        path="admin/reconciliation/batches"
        searchLabel="Mã lỗi"
        states={["QUEUED", "RUNNING", "COMPLETED", "FAILED"]}
        specs={[
          ["startDate", "Kỳ từ ngày"],
          ["provider", t("Nguồn")],
          ["accountId", t("Tài khoản")],
          ["endDate", t("Đến ngày")],
          ["status", t("Trạng thái"), "status"],
          ["records", t("Đã lưu")],
          ["failedRecords", t("Lỗi")],
        ]}
        actions={(row) => (
          <Link className="text-primary underline" href={"/admin/reconciliation/" + row.id}>
            {t("Chi tiết")}
          </Link>
        )}
      />
    </Page>
  );
}

export function ReconciliationDetailPage({ id }: { id: string }) {
  const t = useCopy();

  const batch = useFinance<FinanceRow>("admin/reconciliation/batches/" + id);
  return (
    <Page title={t("Chi tiết đối soát")}>
      {batch.isLoading ? (
        <Loading />
      ) : batch.isError ? (
        <Failure message={batch.error.message} retry={() => void batch.refetch()} />
      ) : (
        batch.data && (
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <StatusBadge status={text(batch.data, "status")} />
              <span className="text-muted-foreground text-sm">
                {t("Nguồn:")}
                {text(batch.data, "provider")} {t("· Account:")}
                {text(batch.data, "accountId")}
              </span>
            </div>
            <p className="mt-3 font-semibold">
              {text(batch.data, "startDate")} — {text(batch.data, "endDate")}
            </p>
            <p className="mt-1">
              {t("Đã lưu:")}
              <strong>{text(batch.data, "records")}</strong> {t("dòng · Lỗi:")}
              <strong>{text(batch.data, "failedRecords")}</strong>
            </p>
            {text(batch.data, "summary.estimated_total_commission") !== "—" && (
              <p className="text-muted-foreground mt-1 text-sm">
                {t("Hoa hồng ước tính (Summary):")}
                {formatVnd(text(batch.data, "summary.estimated_total_commission"))}
              </p>
            )}
            <p className="text-danger mt-2">
              {text(batch.data, "errorCode") === "—" ? "" : text(batch.data, "errorCode")}
            </p>
            {text(batch.data, "status") === "FAILED" && (
              <MutationForm
                title={t("Chạy lại batch")}
                path={"admin/reconciliation/batches/" + id + "/retry"}
                fields={[]}
              />
            )}
          </Card>
        )
      )}
      <Issues path={"admin/reconciliation/batches/" + id + "/issues"} />
      <BatchItems id={id} />
    </Page>
  );
}

export function Issues({ path = "admin/reconciliation/issues" }: { path?: string }) {
  const t = useCopy();

  const superAdmin = useSuperAdmin();
  return (
    <FinanceTable
      path={path}
      searchLabel="Loại vấn đề"
      states={["OPEN", "RESOLVED"]}
      specs={[
        ["productSummary.name", "Sản phẩm"],
        ["type", t("Vấn đề")],
        ["provider", t("Nguồn")],
        ["checkoutId", "Checkout"],
        ["user", "Người dùng"],
        ["status", t("Trạng thái"), "status"],
        ["resolution", t("Kết quả xử lý")],
        ["createdAt", t("Ngày tạo"), "date"],
      ]}
      actions={(row) =>
        text(row, "status") === "OPEN" &&
        superAdmin && (
          <div className="flex flex-wrap gap-2">
            <ActionDialog label="Xem và xử lý">
              <IssueReview id={row.id} />
            </ActionDialog>
          </div>
        )
      }
    />
  );
}

export function IssuesPage() {
  const t = useCopy();
  return (
    <Page title={t("Vấn đề đối soát")}>
      <Issues />
    </Page>
  );
}

export function AuditLogPage() {
  const t = useCopy();
  return (
    <Page title={t("Nhật ký vận hành")}>
      <FinanceTable
        path="admin/audit-logs"
        searchLabel="Tên thao tác"
        specs={[
          ["action", t("Thao tác")],
          ["actor", t("Người thực hiện")],
          ["reference", t("Tham chiếu")],
          ["createdAt", t("Thời gian"), "date"],
        ]}
      />
    </Page>
  );
}

type Snapshot = {
  id: string;
  checkoutId: string;
  orderSn: string;
  order_sn?: string;
  item_name?: string;
  image?: string;
  qty?: number;
  order_value?: string;
  commission?: string;
  purchase_time?: number;
  status?: string;
  commission_status?: string;
  affiliate?: string;
  conversionState?: string | null;
  user?: { displayName: string | null; email: string } | null;
};
type PaginatedSnapshots = {
  data: Snapshot[];
  meta: { page: number; total: number; totalPages: number };
};

function BatchItems({ id }: { id: string }) {
  const [page, setPage] = useState(1);
  const query = useFinance<PaginatedSnapshots>(
    `admin/reconciliation/batches/${id}/items?page=${page}`,
  );
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Dòng chuyển đổi từ đối tác</h2>
      {query.isLoading ? (
        <Loading />
      ) : query.isError ? (
        <Failure message={query.error.message} retry={() => void query.refetch()} />
      ) : !query.data?.data.length ? (
        <Card>Batch này chưa có dòng chuyển đổi được lưu.</Card>
      ) : (
        <>
          <p className="text-muted-foreground text-sm">
            {query.data.meta.total} dòng · Trang {page}/{query.data.meta.totalPages}
          </p>
          <div className="grid gap-3">
            {query.data.data.map((item) => (
              <Card key={item.id} className="flex gap-4">
                <ProductThumbnail
                  src={item.image}
                  name={item.item_name || item.orderSn}
                  className="size-16"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <h3 className="font-semibold break-words">
                    {item.item_name || "Chưa có tên sản phẩm"}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Đơn {item.orderSn} · {item.qty ?? "—"} sản phẩm ·{" "}
                    {item.purchase_time ? formatDateTime(new Date(item.purchase_time * 1000)) : "—"}
                  </p>
                  <p className="text-sm">
                    Giá trị {formatVnd(item.order_value ?? "")} · Hoa hồng{" "}
                    {formatVnd(item.commission ?? "")}
                  </p>
                  <p className="text-sm">
                    Trạng thái: {statusLabel(item.conversionState || item.status || "—", "order")} ·
                    Hoa hồng đối tác: {statusLabel(item.commission_status || "—", "commission")}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Người dùng: {item.user?.displayName || item.user?.email || "Chưa xác định"}
                  </p>
                  <details className="text-muted-foreground text-xs">
                    <summary className="cursor-pointer">Mã kỹ thuật</summary>
                    <p>Checkout: {item.checkoutId}</p>
                    <p>Bản ghi: {item.id}</p>
                  </details>
                </div>
              </Card>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Trước
            </Button>
            <Button
              variant="outline"
              disabled={page >= query.data.meta.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Sau
            </Button>
          </div>
        </>
      )}
    </section>
  );
}

type IssueContext = {
  issue: {
    id: string;
    type: string;
    status: string;
    resolution: string | null;
    checkoutId: string | null;
  };
  checkout: null | {
    revision: number;
    rawStatus: string;
    conversionState: string;
    netRaw: string;
    items: Snapshot[];
    commission: null | {
      state: string;
      estimatedVnd: string;
      affiliateLinkId: string | null;
      user: { displayName: string | null; email: string } | null;
    };
  };
  currentLink: Candidate | null;
};
type Candidate = {
  id: string;
  user: { email: string; displayName: string | null };
  product: { productName: string; imageUrl: string };
};

function IssueReview({ id }: { id: string }) {
  const context = useFinance<IssueContext>(`admin/reconciliation/issues/${id}/context`);
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");
  const [selected, setSelected] = useState<Candidate | null>(null);
  const candidates = useQuery({
    queryKey: ["finance", "issue-links", id, term],
    queryFn: () =>
      financeService.get<{ data: Candidate[] }>(
        `admin/reconciliation/issues/${id}/affiliate-links?search=${encodeURIComponent(term)}`,
      ),
    enabled: term.length >= 2,
  });
  if (context.isLoading) return <Loading />;
  if (context.isError)
    return <Failure message={context.error.message} retry={() => void context.refetch()} />;
  if (!context.data) return null;
  const { issue, checkout, currentLink } = context.data;
  return (
    <div className="space-y-4">
      <Card className="space-y-2">
        <h3 className="font-semibold">Đơn {issue.checkoutId || "Chưa có mã đơn"}</h3>
        <p className="text-sm">
          Vấn đề: {issueLabel(issue.type)} · Trạng thái nguồn:{" "}
          {statusLabel(checkout?.rawStatus || "—", "order")}
        </p>
        <p className="text-sm">
          Người dùng:{" "}
          {checkout?.commission?.user?.displayName ||
            checkout?.commission?.user?.email ||
            "Chưa xác định"}
        </p>
        <p className="text-sm">
          Hoa hồng đã ghi nhận: {formatVnd(checkout?.commission?.estimatedVnd ?? "")}
        </p>
        {checkout?.items.map((item, index) => (
          <div key={`${item.orderSn}-${index}`} className="flex gap-3 border-t pt-3">
            <ProductThumbnail src={item.image} name={item.item_name || item.orderSn} />
            <div className="min-w-0 text-sm">
              <p className="font-medium break-words">{item.item_name || "Chưa có tên sản phẩm"}</p>
              <p>
                Đơn {item.orderSn || item.order_sn || "—"} · {item.qty ?? "—"} sản phẩm ·{" "}
                {formatVnd(item.order_value ?? "")} · Hoa hồng {formatVnd(item.commission ?? "")}
              </p>
              <p className="text-muted-foreground">
                Trạng thái: {statusLabel(item.status || "—", "order")} · Hoa hồng đối tác:{" "}
                {statusLabel(item.commission_status || "—", "commission")} · Affiliate:{" "}
                {item.affiliate || "—"}
              </p>
            </div>
          </div>
        ))}
        <details className="text-muted-foreground text-xs">
          <summary className="cursor-pointer">Mã kỹ thuật và dữ liệu đối chiếu</summary>
          <p>Issue: {issue.id}</p>
          <p>Revision: {checkout?.revision ?? "—"}</p>
        </details>
      </Card>
      {issue.status === "OPEN" &&
        checkout &&
        ["PAID", "REVERSED"].includes(checkout.commission?.state || "") && (
          <Card className="text-sm">
            Hoa hồng đã thanh toán hoặc thu hồi. Trường hợp này cần xử lý qua điều chỉnh ví có ghi
            nhật ký; không thể duyệt lại tại đây.
          </Card>
        )}
      {issue.status === "OPEN" &&
        checkout &&
        !["PAID", "REVERSED"].includes(checkout.commission?.state || "") && (
          <>
            <div className="space-y-2">
              {currentLink && (
                <button
                  type="button"
                  onClick={() => setSelected(currentLink)}
                  className="flex w-full items-center gap-3 rounded-xl border p-2 text-left"
                >
                  <ProductThumbnail
                    src={currentLink.product.imageUrl}
                    name={currentLink.product.productName}
                  />
                  <span className="text-sm">
                    <strong className="block">
                      Liên kết đang gắn: {currentLink.product.productName}
                    </strong>
                    {currentLink.user.displayName || currentLink.user.email} · Chọn liên kết này
                  </span>
                </button>
              )}
              <label className="text-sm font-medium" htmlFor={`link-search-${id}`}>
                Tìm liên kết affiliate theo email, tên người dùng hoặc sản phẩm
              </label>
              <div className="flex gap-2">
                <Input
                  id={`link-search-${id}`}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <Button type="button" variant="outline" onClick={() => setTerm(search.trim())}>
                  Tìm
                </Button>
              </div>
              {candidates.data?.data.map((candidate) => (
                <button
                  type="button"
                  key={candidate.id}
                  onClick={() => setSelected(candidate)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-2 text-left ${selected?.id === candidate.id ? "border-primary bg-secondary" : ""}`}
                >
                  <ProductThumbnail
                    src={candidate.product.imageUrl}
                    name={candidate.product.productName}
                  />
                  <span className="min-w-0 text-sm">
                    <strong className="block break-words">{candidate.product.productName}</strong>
                    <span>
                      {candidate.user.displayName || candidate.user.email} · {candidate.user.email}
                    </span>
                  </span>
                </button>
              ))}
              {term && !candidates.isLoading && !candidates.data?.data.length && (
                <p className="text-muted-foreground text-sm">Không tìm thấy liên kết phù hợp.</p>
              )}
              {selected && (
                <p className="text-sm">
                  Đã chọn: {selected.user.displayName || selected.user.email} ·{" "}
                  {selected.product.productName}
                </p>
              )}
            </div>
            <MutationForm
              key={`${checkout.revision}-${selected?.id || "none"}`}
              title="Xử lý vấn đề đối soát"
              path={`admin/reconciliation/issues/${id}/resolve`}
              fields={reviewFields}
              schema={structuredReviewSchema}
              initialValues={{
                revision: String(checkout.revision),
                affiliateLinkId: selected?.id || "",
              }}
              transform={(input) => ({
                action: input.action,
                evidence: input.evidence,
                revision: checkout.revision,
                affiliateLinkId: input.action === "APPROVE" ? selected?.id : undefined,
                acceptedAmountVnd: input.action === "APPROVE" ? input.acceptedAmountVnd : undefined,
              })}
            >
              <p className="text-muted-foreground text-sm">
                Duyệt chỉ khi đã đối chiếu đúng người dùng, sản phẩm và hoa hồng. Loại bỏ sẽ không
                cộng tiền vào ví.
              </p>
            </MutationForm>
          </>
        )}
    </div>
  );
}
