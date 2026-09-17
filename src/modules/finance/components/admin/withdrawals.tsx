"use client";
import { useCopy } from "@/i18n/use-copy";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Page } from "@/components/ui/page";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatVnd } from "@/lib/format";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { financeService } from "../../services/finance";
import { ActionDialog, FinanceTable, MutationForm, text } from ".././finance-ui";
import { reasonFields, reasonSchema } from "./shared";
export function PaymentDetails({ id }: { id: string }) {
  const t = useCopy();

  const [details, setDetails] = useState<{
      bankName: string;
      accountHolder: string;
      accountNumber: string;
    } | null>(null),
    [pending, setPending] = useState(false);
  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-sm">
        {t("Xem thông tin chuyển khoản được ghi vào nhật ký truy cập.")}
      </p>
      <Button
        variant="outline"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          try {
            const response = await financeService.mutate(
              "admin/withdrawals/" + id + "/payment-details",
              {},
            );
            setDetails(response as typeof details);
          } catch (e) {
            toast.error(t.error(e instanceof Error ? e.message : t("Không thể xem")));
          } finally {
            setPending(false);
          }
        }}
      >
        {t("Xem tài khoản chuyển tiền")}
      </Button>
      {details && (
        <Card>
          <p>{details.bankName}</p>
          <p className="font-semibold">{details.accountHolder}</p>
          <p className="font-mono break-all">{details.accountNumber}</p>
        </Card>
      )}
    </div>
  );
}

export function WithdrawalsAdminPage() {
  const t = useCopy();

  return (
    <Page
      title={t("Yêu cầu rút tiền")}
      description="Đánh dấu đang xử lý trước khi chuyển khoản. Chỉ xác nhận hoàn thành sau khi đã chuyển thành công."
    >
      <FinanceTable
        path="admin/withdrawals"
        searchLabel="Mã chuyển khoản"
        states={["PENDING", "PROCESSING", "COMPLETED", "REJECTED", "FAILED"]}
        specs={[
          ["id", t("Yêu cầu")],
          ["amount", t("Số tiền"), "money"],
          ["bank.bankName", t("Ngân hàng")],
          ["bank.accountHolder", t("Chủ tài khoản")],
          ["bank.lastFour", t("4 số cuối")],
          ["status", t("Trạng thái"), "status"],
        ]}
        actions={(row) => (
          <div className="flex gap-2">
            {(text(row, "status") === "PENDING"
              ? ["PROCESSING", "REJECTED"]
              : text(row, "status") === "PROCESSING"
                ? ["COMPLETED", "FAILED"]
                : []
            ).map((status) => (
              <ActionDialog
                key={status}
                label={
                  {
                    PROCESSING: t("Nhận xử lý"),
                    REJECTED: t("Từ chối"),
                    COMPLETED: t("Đã chuyển tiền"),
                    FAILED: t("Chuyển thất bại"),
                  }[status] ?? status
                }
              >
                {status === "COMPLETED" && <PaymentDetails id={row.id} />}
                <div className="mb-4 space-y-2">
                  <p className="break-all">
                    {text(row, "bank.accountHolder")} · {row.id}
                  </p>
                  <strong>{formatVnd(text(row, "amount"))}</strong>
                  <div className="flex gap-2">
                    <StatusBadge domain="withdrawal" status={text(row, "status")} />
                    <span>→</span>
                    <StatusBadge domain="withdrawal" status={status} />
                  </div>
                </div>
                <MutationForm
                  title={t("Cập nhật yêu cầu")}
                  path={"admin/withdrawals/" + row.id + "/status"}
                  method="patch"
                  fields={[
                    ...reasonFields,
                    ...(status === "COMPLETED"
                      ? [{ name: "transferReference", label: t("Mã giao dịch ngân hàng") }]
                      : []),
                  ]}
                  schema={
                    status === "COMPLETED"
                      ? reasonSchema.extend({ transferReference: z.string().min(3) })
                      : reasonSchema
                  }
                  transform={(input) => ({ ...input, status })}
                />
              </ActionDialog>
            ))}
          </div>
        )}
      />
    </Page>
  );
}

export function BankApprovalPage() {
  const t = useCopy();

  return (
    <Page title={t("Duyệt tài khoản ngân hàng")}>
      <FinanceTable
        path="admin/bank-accounts"
        searchLabel="Tên chủ tài khoản"
        states={["PENDING", "APPROVED", "REJECTED"]}
        specs={[
          ["userId", t("Người dùng")],
          ["bankName", t("Ngân hàng")],
          ["accountHolder", t("Chủ tài khoản")],
          ["lastFour", t("4 số cuối")],
          ["version", t("Phiên bản")],
          ["status", t("Trạng thái"), "status"],
        ]}
        actions={(row) =>
          text(row, "status") === "PENDING" && (
            <div className="flex gap-2">
              {["approve", "reject"].map((action) => (
                <ActionDialog key={action} label={action === "approve" ? t("Duyệt") : t("Từ chối")}>
                  <div className="mb-4 space-y-2">
                    <p>
                      {text(row, "bankName")} · ****{text(row, "lastFour")}
                    </p>
                    <p className="font-semibold">{text(row, "accountHolder")}</p>
                    <div className="flex gap-2">
                      <StatusBadge domain="bank" status="PENDING" />
                      <span>→</span>
                      <StatusBadge
                        domain="bank"
                        status={action === "approve" ? "APPROVED" : "REJECTED"}
                      />
                    </div>
                  </div>
                  <MutationForm
                    title={t("Lưu kết quả duyệt")}
                    path={"admin/bank-accounts/" + row.id + "/" + action}
                    fields={reasonFields}
                    schema={reasonSchema}
                  />
                </ActionDialog>
              ))}
            </div>
          )
        }
      />
    </Page>
  );
}
