"use client";

import { useContext, useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCopy } from "@/i18n/use-copy";
import { useDialogBusy } from "@/components/patterns/surface-dialog";
import { useRefreshFinance } from "../../hooks/use-finance";
import { financeService } from "../../services/finance";
import { ActionContext } from "../finance-action-context";
import { BankIcon, BankPicker, type ReceivingInstitution } from "./bank-picker";

export function BankAccountForm({
  id,
  initialBankCode = "",
  initialBankName = "",
}: {
  id?: string;
  initialBankCode?: string;
  initialBankName?: string;
}) {
  const t = useCopy();
  const close = useContext(ActionContext);
  const refresh = useRefreshFinance();
  const [banks, setBanks] = useState<ReceivingInstitution[]>([]);
  const [bankCode, setBankCode] = useState(initialBankCode);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [review, setReview] = useState(false);
  useDialogBusy(saving);
  const selected = banks.find((bank) => bank.code === bankCode);
  const isMomo = selected?.kind === "wallet";

  useEffect(() => {
    let active = true;
    fetch("/bank-directory.json")
      .then((response) => {
        if (!response.ok) throw new Error("directory");
        return response.json();
      })
      .then((payload: { banks: ReceivingInstitution[] }) => {
        if (active) {
          const items = payload.banks;
          if (initialBankCode && !items.some((item) => item.code === initialBankCode)) {
            items.push({
              code: initialBankCode,
              name: initialBankName || initialBankCode,
              fullName: initialBankName || initialBankCode,
              logo: null,
              kind: initialBankCode === "MOMO" ? "wallet" : "bank",
            });
          }
          setBanks(items);
        }
      })
      .catch(() => {
        if (active) setError("Không tải được danh sách ngân hàng. Vui lòng thử lại.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [initialBankCode, initialBankName]);

  function validate() {
    if (!selected) return "Vui lòng chọn ngân hàng hoặc MoMo";
    if (isMomo ? !/^0\d{9}$/.test(accountNumber) : !/^\d{6,30}$/.test(accountNumber))
      return isMomo
        ? "Số điện thoại MoMo phải gồm 10 chữ số và bắt đầu bằng 0"
        : "Số tài khoản phải gồm 6–30 chữ số";
    if (accountHolder.trim().length < 2 || accountHolder.trim().length > 120)
      return "Vui lòng nhập tên chủ tài khoản";
    return "";
  }

  function next(event: FormEvent) {
    event.preventDefault();
    const message = validate();
    setError(message);
    if (!message) setReview(true);
  }

  async function save() {
    if (saving || !selected) return;
    const message = validate();
    if (message) {
      setError(message);
      setReview(false);
      return;
    }
    setSaving(true);
    setError("");
    try {
      await financeService.mutate(
        id ? `me/bank-accounts/${id}` : "me/bank-accounts",
        {
          bankCode: selected.code,
          bankName: selected.name,
          accountNumber,
          accountHolder: accountHolder.trim().toUpperCase(),
        },
        id ? "patch" : "post",
      );
      await refresh();
      close?.();
      toast.success(id ? "Đã cập nhật nơi nhận tiền" : "Đã thêm nơi nhận tiền");
    } catch (reason) {
      setError(t.error(reason instanceof Error ? reason.message : "Không lưu được tài khoản"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {review && selected ? (
        <div className="space-y-4">
          <div className="rounded-2xl border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-3">
                <BankIcon bank={selected} />
                <div>
                  <p className="font-semibold text-sm leading-tight text-foreground">{selected.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selected.kind === "wallet" ? "Ví điện tử MoMo" : selected.fullName}
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                {isMomo ? "Ví điện tử" : "Ngân hàng"}
              </span>
            </div>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm pt-1">
              <div>
                <dt className="text-xs font-medium text-muted-foreground">
                  {isMomo ? "Số điện thoại ví MoMo" : "Số tài khoản"}
                </dt>
                <dd className="font-mono font-bold text-base mt-0.5 text-foreground">{accountNumber}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground">
                  {isMomo ? "Tên chủ ví" : "Tên chủ tài khoản"}
                </dt>
                <dd className="font-bold text-sm mt-0.5 text-foreground">{accountHolder.trim().toUpperCase()}</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-900 dark:text-amber-200">
            <p className="font-semibold text-xs">Kiểm tra thông tin nhận tiền</p>
            <p className="mt-0.5 text-muted-foreground">
              Vui lòng kiểm tra kỹ thông tin. Tên chủ tài khoản do bạn tự khai và sẽ được duyệt trước khi rút tiền.
            </p>
          </div>
          <div className="flex gap-2.5 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11 rounded-xl"
              disabled={saving}
              onClick={() => setReview(false)}
            >
              Chỉnh sửa
            </Button>
            <Button
              type="button"
              className="flex-1 h-11 rounded-xl font-semibold"
              disabled={saving}
              onClick={() => void save()}
            >
              {saving ? "Đang lưu…" : "Xác nhận lưu"}
            </Button>
          </div>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={next}>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Ngân hàng hoặc ví điện tử</label>
            {loading ? (
              <div className="flex h-11 items-center rounded-xl border border-dashed px-3 text-sm text-muted-foreground">
                Đang tải danh sách…
              </div>
            ) : (
              <BankPicker banks={banks} value={bankCode} onChange={setBankCode} />
            )}
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">
              {isMomo ? "Số điện thoại ví MoMo" : "Số tài khoản"}
            </label>
            <Input
              inputMode="numeric"
              autoComplete="off"
              maxLength={isMomo ? 10 : 30}
              value={accountNumber}
              placeholder={
                id
                  ? "Nhập lại đầy đủ thông tin nhận tiền"
                  : isMomo
                    ? "0901234567"
                    : "Nhập số tài khoản"
              }
              onChange={(event) => setAccountNumber(event.target.value.replace(/\D/g, ""))}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">
              {isMomo ? "Tên chủ ví" : "Tên chủ tài khoản"}
            </label>
            <Input
              autoComplete="name"
              maxLength={120}
              className="uppercase font-medium"
              value={accountHolder}
              placeholder="NGUYEN VAN A"
              onChange={(event) => setAccountHolder(event.target.value.toUpperCase())}
              required
            />
            <p className="text-muted-foreground text-xs">
              Nhập tên in hoa không dấu (hoặc có dấu) trùng khớp với tài khoản
            </p>
          </div>
          {id && (
            <p className="text-muted-foreground text-xs">
              Nhập lại số đầy đủ để sửa. Thông tin mới sẽ cần được duyệt lại.
            </p>
          )}
          <div className="pt-2">
            <Button
              type="submit"
              className="w-full h-11 rounded-xl text-sm font-semibold"
              disabled={loading || saving || !banks.length}
            >
              Kiểm tra thông tin
            </Button>
          </div>
        </form>
      )}
      {error && (
        <p role="alert" className="text-danger text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
