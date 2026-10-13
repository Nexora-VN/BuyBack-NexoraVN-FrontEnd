"use client";
import { useCopy } from "@/i18n/use-copy";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Page } from "@/components/ui/page";
import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usersService } from "@/modules/users/services/users.service";
import { z } from "zod";
import { generateUUID } from "@/lib/observability/request-id";
import { MutationForm } from ".././finance-ui";
import { reasonFields, reasonSchema, useSuperAdmin } from "./shared";
export function ManualAdjustmentsPage() {
  const t = useCopy();
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");
  const users = useQuery({
    queryKey: ["adjustment-users", term],
    queryFn: () => usersService.list({ page: 1, limit: 20, search: term }),
    enabled: term.length >= 2,
  });

  const superAdmin = useSuperAdmin(),
    key = useRef<{ payload: string; id: string } | null>(null);
  return (
    <Page title={t("Điều chỉnh ví")}>
      {superAdmin ? (
        <MutationForm
          title={t("Ghi điều chỉnh ví")}
          path="admin/wallet-adjustments"
          fields={[
            {
              name: "userId",
              label: "Người nhận điều chỉnh",
              type: "select",
              options: (users.data?.data ?? []).map((user) => ({
                value: user.id,
                label: `${user.displayName || user.fullName || user.email} · ${user.email}`,
              })),
            },
            { name: "amount", label: t("Số tiền (+ cộng / - trừ), VND"), type: "money" },
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
            if (key.current?.payload !== payload) key.current = { payload, id: generateUUID() };
            return { ...v, idempotencyKey: key.current.id };
          }}
          onSuccess={() => {
            key.current = null;
          }}
        >
          <div className="flex gap-2">
            <Input
              aria-label="Tìm người dùng theo tên hoặc email"
              placeholder="Tìm người dùng theo tên hoặc email"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Button type="button" variant="outline" onClick={() => setTerm(search.trim())}>
              Tìm
            </Button>
          </div>
          {term && !users.isLoading && !users.data?.data.length && (
            <p className="text-muted-foreground text-sm">Không tìm thấy người dùng.</p>
          )}
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
