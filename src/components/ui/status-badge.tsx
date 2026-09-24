"use client";
import { Badge } from "@/components/ui/badge";
import { useCopy } from "@/i18n/use-copy";
import { ArrowDownToLine, CircleCheck, CircleX, Clock3, LoaderCircle } from "lucide-react";

export type StatusDomain =
  | "general"
  | "order"
  | "commission"
  | "cashback"
  | "withdrawal"
  | "bank"
  | "batch"
  | "issue"
  | "settlement";

const labels: Record<string, string> = {
  ACTIVE: "Hoạt động",
  WORKING: "Hoạt động",
  COMPLETED: "Hoàn thành",
  AVAILABLE: "Có thể rút",
  VALIDATED: "Hoàn thành",
  PENDING: "Chờ xử lý",
  PROCESSING: "Đang xử lý",
  REJECTED: "Từ chối",
  FAILED: "Thất bại",
  DISABLED: "Đã khóa",
  DELETED: "Đã xóa",
  ESTIMATED: "Hoa hồng dự kiến",
  MANUAL_REVIEW: "Cần đối chiếu",
  PARTIALLY_VALIDATED: "Hoàn thành một phần",
  PAID: "Đã rút tiền",
  REVERSED: "Đã thu hồi",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
  APPROVED: "Đã duyệt",
  QUEUED: "Chờ đồng bộ",
  RUNNING: "Đang đồng bộ",
  OPEN: "Chưa xử lý",
  RESOLVED: "Đã xử lý",
  DRAFT: "Bản nháp",
  CONFIRMED: "Đã xác nhận",
  CANCELLED: "Đã hủy",
  EXPIRED: "Hết hạn",
  UNVERIFIED: "Chưa xác thực",
  WITHDRAWN: "Đã rút tiền",
  "Chờ trả hoa hồng": "Chờ trả hoa hồng",
  "Chưa chốt": "Chưa chốt hoa hồng",
};

const contextual: Partial<Record<StatusDomain, Record<string, string>>> = {
  order: {
    VALIDATED: "Hoàn thành",
    COMPLETED: "Hoàn thành",
    completed: "Hoàn thành",
    PENDING: "Đang xử lý",
    PROCESSING: "Đang xử lý",
    REJECTED: "Đã hủy",
    cancelled: "Đã hủy",
  },
  commission: {
    ESTIMATED: "Hoa hồng dự kiến",
    VALIDATED: "Hoa hồng đã xác thực",
    PAID: "Đã quyết toán",
    REJECTED: "Đã hủy",
  },
  cashback: {
    PENDING: "Chờ xác nhận",
    VALIDATED: "Chờ đối soát",
    AVAILABLE: "Có thể rút",
    PAID: "Đã rút tiền",
    WITHDRAWN: "Đã rút tiền",
  },
  withdrawal: {
    PENDING: "Chờ xử lý",
    PROCESSING: "Đang chuyển tiền",
    COMPLETED: "Đã chuyển tiền",
    FAILED: "Chuyển thất bại",
    REJECTED: "Từ chối rút",
  },
  bank: {
    PENDING: "Chờ duyệt",
    APPROVED: "Đã duyệt",
    REJECTED: "Từ chối",
  },
};

export function statusLabel(status: string, domain: StatusDomain = "general") {
  return contextual[domain]?.[status] ?? labels[status] ?? status;
}

export function StatusBadge({
  status,
  domain = "general",
  className,
}: {
  status: string;
  domain?: StatusDomain;
  className?: string;
}) {
  const t = useCopy();
  const label = statusLabel(status, domain);

  // 1. Blue (info): Withdrawn / Paid / Transferred
  const isWithdrawn =
    ["PAID", "WITHDRAWN", "paid", "withdrawn"].includes(status) ||
    label === "Đã rút tiền" ||
    label === "Đã chuyển tiền" ||
    label === "Đã quyết toán" ||
    (domain === "withdrawal" && ["COMPLETED", "completed"].includes(status));

  // 2. Red (danger): Failed / Rejected / Cancelled
  const isFailed =
    [
      "REJECTED",
      "FAILED",
      "REVERSED",
      "CANCELLED",
      "cancelled",
      "DISABLED",
      "EXPIRED",
      "rejected",
      "failed",
    ].includes(status) ||
    label === "Đã hủy" ||
    label === "Thất bại" ||
    label === "Từ chối" ||
    label === "Chuyển thất bại" ||
    label.includes("Không hợp lệ");

  // 3. Green (success): Validated / Completed / Available / Active / Approved
  const isSuccess =
    !isWithdrawn &&
    ([
      "ACTIVE",
      "WORKING",
      "AVAILABLE",
      "COMPLETED",
      "completed",
      "VALIDATED",
      "validated",
      "CONFIRMED",
      "APPROVED",
      "RESOLVED",
    ].includes(status) ||
      label === "Hoàn thành" ||
      label === "Có thể rút" ||
      label === "Đã duyệt" ||
      label === "Hoa hồng đã xác thực");

  // 4. Running
  const isRunning = ["RUNNING", "PROCESSING"].includes(status) && !isWithdrawn;

  // 5. Variant selection: info (blue) for withdrawn, danger (red) for failed, success (green) for completed, warning (yellow) for pending
  const variant = isWithdrawn
    ? "info"
    : isFailed
      ? "danger"
      : isSuccess
        ? "success"
        : isRunning
          ? "info"
          : "warning";

  const Icon = isWithdrawn
    ? ArrowDownToLine
    : isFailed
      ? CircleX
      : isSuccess
        ? CircleCheck
        : isRunning
          ? LoaderCircle
          : Clock3;

  return (
    <Badge variant={variant} className={className}>
      <Icon aria-hidden className={`size-3.5 shrink-0 ${isRunning ? "animate-spin" : ""}`} />
      <span className="whitespace-normal">{t(label)}</span>
    </Badge>
  );
}
