"use client";
import { useCopy } from "@/i18n/use-copy";

import { Card } from "@/components/ui/card";
import { Page } from "@/components/ui/page";
import { useRef } from "react";
import { z } from "zod";
import { MutationForm } from ".././finance-ui";
import { reasonFields, reasonSchema, useSuperAdmin } from "./shared";
export function ManualAdjustmentsPage() {
  const t = useCopy();

  const superAdmin = useSuperAdmin(),
    key = useRef<{ payload: string; id: string } | null>(null);
  return (
    <Page title={t("Điều chỉnh ví")}>
      {superAdmin ? (
        <MutationForm
          title={t("Ghi điều chỉnh ví")}
          path="admin/wallet-adjustments"
          fields={[
            { name: "userId", label: "User ID" },
            { name: "amount", label: t("Số tiền (+ cộng / - trừ), VND") },
            ...reasonFields,
          ]}
          schema={reasonSchema.extend({
            userId: z.uuid("Mã người dùng không hợp lệ"),
            amount: z
              .string()
              .regex(/^-?\d{1,18}$/, "Nhập số nguyên VND")
              .refine((v) => /^-?\d+$/.test(v) && BigInt(v) !== 0n, "Số tiền phải khác 0"),
          })}
          transform={(v) => {
            const payload = JSON.stringify(v);
            if (key.current?.payload !== payload)
              key.current = { payload, id: crypto.randomUUID() };
            return { ...v, idempotencyKey: key.current.id };
          }}
          onSuccess={() => {
            key.current = null;
          }}
        >
          <p className="text-muted-foreground text-sm">
            {t("Điều chỉnh tạo một giao dịch ledger mới và bắt buộc ghi lý do.")}
          </p>
        </MutationForm>
      ) : (
        <Card>{t("Chỉ SUPER_ADMIN có quyền điều chỉnh số dư.")}</Card>
      )}
    </Page>
  );
}
