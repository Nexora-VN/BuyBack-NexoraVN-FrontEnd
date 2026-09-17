"use client";
import { useCopy } from "@/i18n/use-copy";

import { Card } from "@/components/ui/card";
import { Page } from "@/components/ui/page";
import { StatusBadge } from "@/components/ui/status-badge";
import { Link } from "@/i18n/navigation";
import { formatVnd } from "@/lib/format";
import { useFinance } from "../../hooks/use-finance";
import { structuredReviewSchema, syncSchema } from "../../schemas/finance";
import type { FinanceRow } from "../../types/finance";
import { ActionDialog, Failure, FinanceTable, Loading, MutationForm, text } from ".././finance-ui";
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
    name: "affiliateLinkId",
    label: "Mã AffiliateLink ID (UUID)",
    required: false,
    help: "Chỉ cần khi APPROVE: ID liên kết affiliate của người dùng để gán đơn và cộng ví. Bỏ trống nếu chọn EXCLUDE.",
  },
  {
    name: "acceptedAmountVnd",
    label: "Hoa hồng chấp nhận (VND)",
    required: false,
    help: "Chỉ cần khi APPROVE: Số tiền VND được chấp nhận sau kiểm tra. Bỏ trống nếu chọn EXCLUDE.",
  },
  {
    name: "revision",
    label: "Revision của checkout",
    type: "number" as const,
    required: false,
    help: "Revision của đơn hàng (nhập số 1 nếu là đơn mới đối soát, để trống mặc định là 1).",
  },
  {
    name: "evidence",
    label: "Bằng chứng đối chiếu / Lý do xử lý",
    type: "textarea" as const,
    help: 'Tối thiểu 10 ký tự (ví dụ: "Đã đối chiếu mã đơn Shopee khớp với user" hoặc "Đơn demo không rõ user, loại bỏ")',
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
          ["id", "Batch"],
          ["provider", t("Nguồn")],
          ["accountId", t("Tài khoản")],
          ["startDate", t("Từ ngày")],
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
        ["id", t("Mã")],
        ["type", t("Vấn đề")],
        ["provider", t("Nguồn")],
        ["checkoutId", "Checkout"],
        ["status", t("Trạng thái"), "status"],
        ["resolution", t("Kết quả xử lý")],
        ["createdAt", t("Ngày tạo"), "date"],
      ]}
      actions={(row) =>
        text(row, "status") === "OPEN" &&
        superAdmin && (
          <div className="flex flex-wrap gap-2">
            <ActionDialog label="Review vấn đề">
              <MutationForm
                title={t("Xử lý vấn đề đối soát")}
                path={"admin/reconciliation/issues/" + row.id + "/resolve"}
                fields={reviewFields}
                schema={structuredReviewSchema}
                transform={(input) => ({
                  ...input,
                  revision: Number(input.revision || 1),
                  affiliateLinkId: input.affiliateLinkId ? input.affiliateLinkId : undefined,
                  acceptedAmountVnd: input.acceptedAmountVnd ? input.acceptedAmountVnd : undefined,
                })}
              >
                <p className="text-muted-foreground text-sm">
                  {t(
                    "APPROVE yêu cầu bằng chứng, link affiliate và số hoa hồng hợp lệ. EXCLUDE sẽ loại bỏ khỏi settlement.",
                  )}
                </p>
              </MutationForm>
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
          ["actorId", t("Người thực hiện")],
          ["reference", t("Tham chiếu")],
          ["createdAt", t("Thời gian"), "date"],
        ]}
      />
    </Page>
  );
}
