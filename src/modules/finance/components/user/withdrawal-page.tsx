"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { MoneyInput } from "@/components/patterns/money-input";
import { ApiErrorNotice } from "@/components/errors/api-error-notice";
import { Page } from "@/components/ui/page";
import { Link } from "@/i18n/navigation";
import { useCopy } from "@/i18n/use-copy";
import { formatVnd } from "@/lib/format";
import { ApiError } from "@/lib/api/errors";
import { generateUUID } from "@/lib/observability/request-id";
import { ArrowDownToLine, CheckCircle2, Clock3, Landmark, WalletCards } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { useFinance, useRefreshFinance } from "../../hooks/use-finance";
import { withdrawalSchema } from "../../schemas/finance";
import { financeService } from "../../services/finance";
import type { FinanceList } from "../../types/finance";
import { withdrawalOptions } from "../../withdrawal-options";
import { Failure, Loading, text } from "../finance-ui";
export function NewWithdrawalPage() {
  const t = useCopy();
  const endUser = useTranslations("EndUser");
  const banks = useFinance<FinanceList>("me/bank-accounts?status=APPROVED&limit=100");
  const wallet = useFinance<{ available: string }>("me/wallet");
  const policy = useFinance<{ minWithdrawal: string; withdrawalsEnabled?: boolean }>(
    "me/withdrawal-policy",
  );
  const [amount, setAmount] = useState(""),
    [bankId, setBank] = useState(""),
    [step, setStep] = useState<"edit" | "review" | "done">("edit");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<unknown>(null);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const key = useRef<string | null>(null);
  const lock = useRef(false);
  const refresh = useRefreshFinance();
  const bank = banks.data?.data.find((row) => row.id === bankId);
  const available = wallet.data?.available ?? "0";
  const suggestions = withdrawalOptions(available, policy.data?.minWithdrawal ?? "0");
  const remaining =
    /^\d+$/.test(amount) && BigInt(amount) <= BigInt(available)
      ? (BigInt(available) - BigInt(amount)).toString()
      : null;
  function validate() {
    if (!policy.data) return;
    const result = withdrawalSchema(policy.data.minWithdrawal).safeParse({ amount, bankId });
    if (!result.success) {
      setErrors(Object.fromEntries(result.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    if (!wallet.data || BigInt(amount) > BigInt(wallet.data.available)) {
      setErrors({ amount: t("Số dư khả dụng không đủ") });
      return;
    }
    setErrors({});
    setStep("review");
  }
  async function send() {
    if (lock.current) return;
    lock.current = true;
    setPending(true);
    setError(null);
    key.current ??= generateUUID();
    try {
      const created = (await financeService.mutate("me/withdrawals", {
        amount,
        bankId,
        idempotencyKey: key.current,
      })) as { id: string };
      await refresh();
      setReceiptId(created.id);
      key.current = null;
      setStep("done");
    } catch (e) {
      if (e instanceof ApiError && e.message === "MINIMUM_WITHDRAWAL_NOT_MET") {
        const minimum = (e.data as { minWithdrawal?: unknown } | undefined)?.minWithdrawal;
        setErrors({
          amount: `Tối thiểu ${formatVnd(typeof minimum === "string" ? minimum : (policy.data?.minWithdrawal ?? ""))}`,
        });
        setStep("edit");
        void policy.refetch();
      } else {
        if (e instanceof ApiError && e.message === "WITHDRAWALS_DISABLED") {
          setStep("edit");
          void policy.refetch();
        }
        setError(e);
      }
    } finally {
      lock.current = false;
      setPending(false);
    }
  }
  return (
    <Page taskForm title={t("Yêu cầu rút tiền")} description={endUser("withdrawalDescription")}>
      {banks.isLoading || wallet.isLoading || policy.isLoading ? (
        <Loading />
      ) : banks.isError || wallet.isError || policy.isError ? (
        <Failure
          message={
            (banks.error || wallet.error || policy.error)?.message || t("Không thể tải dữ liệu")
          }
          retry={() => {
            void banks.refetch();
            void wallet.refetch();
            void policy.refetch();
          }}
        />
      ) : (
        <Card className="border-border/70 w-full max-w-2xl overflow-hidden p-0 shadow-sm">
          {step === "done" ? (
            <div className="space-y-6 px-5 py-10 text-center sm:px-10 sm:py-12">
              <span className="bg-success-soft mx-auto grid size-20 place-items-center rounded-full">
                <CheckCircle2 className="text-success size-11" aria-hidden="true" />
              </span>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">
                  {t("Đã gửi yêu cầu rút tiền")}
                </h2>
                <p className="text-muted-foreground mx-auto max-w-md text-sm leading-6">
                  {t("Số tiền được giữ để xử lý yêu cầu. Theo dõi tiến độ trong lịch sử rút tiền.")}
                </p>
              </div>
              <div className="bg-primary/5 rounded-2xl px-5 py-5 text-left">
                <p className="text-muted-foreground text-sm">{endUser("withdrawalAmount")}</p>
                <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums">
                  {formatVnd(amount)}
                </p>
                <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800">
                  <Clock3 className="size-4" aria-hidden="true" />
                  {endUser("withdrawalFilterPending")}
                </span>
              </div>
              <Button asChild className="w-full sm:w-auto">
                <Link href={receiptId ? `/app/withdrawals/${receiptId}` : "/app/withdrawals"}>
                  {endUser("withdrawalProgress")}
                </Link>
              </Button>
            </div>
          ) : (
            <form
              className="space-y-0"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                if (step === "edit") validate();
              }}
            >
              <div className="relative overflow-hidden bg-gradient-to-br from-[#fff0f6] via-[#fff8fa] to-white px-5 py-6 sm:px-8 sm:py-8">
                <div className="relative flex items-start justify-between gap-3">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">
                      {endUser("withdrawalAvailableBalance")}
                    </p>
                    <p className="text-foreground mt-2 text-3xl font-bold tracking-tight tabular-nums sm:text-4xl">
                      {formatVnd(available)}
                    </p>
                    <p className="text-muted-foreground mt-2 text-xs sm:text-sm">
                      {endUser("withdrawalMinimumHint", {
                        amount: formatVnd(policy.data!.minWithdrawal),
                      })}
                    </p>
                  </div>
                  <span className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-2xl sm:size-12">
                    <WalletCards className="size-5" aria-hidden="true" />
                  </span>
                </div>
              </div>
              {policy.data?.withdrawalsEnabled === false && (
                <p
                  role="status"
                  className="border-b bg-amber-50 px-5 py-4 text-sm text-amber-900 sm:px-8"
                >
                  {endUser("withdrawalPausedHint")}
                </p>
              )}
              {step === "edit" ? (
                <div className="space-y-7 px-5 py-6 sm:px-8 sm:py-8">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold" htmlFor="withdrawal-amount">
                      {endUser("withdrawalAmountLabel")}
                    </label>
                    <div className="relative">
                      <MoneyInput
                        id="withdrawal-amount"
                        value={amount}
                        placeholder="0"
                        className="h-14 pr-14 text-xl font-semibold tabular-nums sm:text-2xl"
                        aria-invalid={!!errors.amount}
                        aria-describedby={errors.amount ? "amount-error" : "amount-help"}
                        onValueChange={(value) => {
                          setAmount(value);
                          setErrors((current) => ({ ...current, amount: "" }));
                          key.current = null;
                        }}
                      />
                      <span className="text-muted-foreground pointer-events-none absolute inset-y-0 right-4 flex items-center font-semibold">
                        ₫
                      </span>
                    </div>
                    {errors.amount ? (
                      <p id="amount-error" role="alert" className="text-danger text-sm">
                        {t(errors.amount)}
                      </p>
                    ) : (
                      <p id="amount-help" className="text-muted-foreground text-sm">
                        {remaining !== null && amount
                          ? endUser("withdrawalRemainingHint", { amount: formatVnd(remaining) })
                          : endUser("withdrawalRangeHint", {
                              min: formatVnd(policy.data!.minWithdrawal),
                              max: formatVnd(available),
                            })}
                      </p>
                    )}
                    {suggestions.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                          {endUser("withdrawalQuickAmounts")}
                        </p>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {suggestions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              aria-label={
                                option.all
                                  ? endUser("withdrawalAllAria", {
                                      amount: formatVnd(option.value),
                                    })
                                  : undefined
                              }
                              aria-pressed={amount === option.value}
                              className={`min-h-11 rounded-xl border px-3 py-2 text-left text-sm font-semibold transition-colors ${amount === option.value ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40 bg-white hover:bg-[#fff8fa]"}`}
                              onClick={() => {
                                setAmount(option.value);
                                setErrors((current) => ({ ...current, amount: "" }));
                                key.current = null;
                              }}
                            >
                              <span className="block">
                                {option.all ? endUser("withdrawalAll") : option.label}
                              </span>
                              {option.all && (
                                <span className="block text-xs font-normal tabular-nums">
                                  {formatVnd(option.value)}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <label className="block space-y-2 border-t pt-6">
                    <span className="font-semibold">
                      {endUser("withdrawalApprovedDestination")}
                    </span>
                    <Select
                      value={bankId}
                      aria-invalid={!!errors.bankId}
                      onChange={(e) => {
                        setBank(e.target.value);
                        key.current = null;
                      }}
                    >
                      <option value="">{t("Chọn tài khoản")}</option>
                      {banks.data?.data.map((row) => (
                        <option key={row.id} value={row.id}>
                          {text(row, "bankName")} · ****{text(row, "lastFour")}
                        </option>
                      ))}
                    </Select>
                    {bank && (
                      <span className="bg-card flex items-center gap-3 rounded-2xl border p-4 shadow-sm">
                        <span className="bg-primary/10 text-primary grid size-11 shrink-0 place-items-center rounded-xl">
                          <Landmark className="size-5" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <strong className="block truncate text-sm">
                            {text(bank, "bankName")} · •••• {text(bank, "lastFour")}
                          </strong>
                          <span className="text-muted-foreground block truncate text-xs">
                            {text(bank, "accountHolder")}
                          </span>
                        </span>
                      </span>
                    )}
                    {errors.bankId && (
                      <span role="alert" className="text-danger text-sm">
                        {t(errors.bankId)}
                      </span>
                    )}
                  </label>
                  {!banks.data?.data.length && (
                    <Link href="/app/account" className="text-primary block text-sm underline">
                      {endUser("withdrawalAddDestination")}
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-5 px-5 py-6 sm:px-8 sm:py-8">
                  <h2 className="text-lg font-bold">{t("Kiểm tra yêu cầu rút")}</h2>
                  <div className="bg-primary/5 rounded-2xl px-5 py-5">
                    <p className="text-primary text-sm font-semibold">
                      {endUser("withdrawalAmount")}
                    </p>
                    <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums">
                      {formatVnd(amount)}
                    </p>
                  </div>
                  <div className="rounded-2xl border p-5">
                    <p className="text-muted-foreground text-sm">
                      {endUser("withdrawalRecipient")}
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <span className="bg-primary/10 text-primary grid size-10 shrink-0 place-items-center rounded-xl">
                        <Landmark className="size-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold">
                          {text(bank, "bankName")} · •••• {text(bank, "lastFour")}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {text(bank, "accountHolder")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="bg-muted/60 rounded-xl p-4 text-sm leading-6">
                    {endUser("withdrawalDescription")}
                  </p>
                </div>
              )}
              {error ? (
                <div className="px-5 pb-4 sm:px-8">
                  <ApiErrorNotice error={error} />
                </div>
              ) : null}
              <div className="flex flex-col-reverse gap-3 border-t px-5 py-5 sm:flex-row sm:justify-end sm:px-8">
                {step === "review" ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={pending}
                      onClick={() => setStep("edit")}
                    >
                      {t("Chỉnh sửa")}
                    </Button>
                    <Button
                      type="button"
                      className="w-full sm:w-auto"
                      disabled={pending || policy.data?.withdrawalsEnabled === false}
                      onClick={() => void send()}
                    >
                      {t(pending ? "Đang gửi…" : "Xác nhận rút tiền")}
                    </Button>
                  </>
                ) : (
                  <Button
                    className="w-full sm:w-auto"
                    disabled={!banks.data?.data.length || policy.data?.withdrawalsEnabled === false}
                    type="submit"
                  >
                    <ArrowDownToLine className="mr-2 size-4" aria-hidden="true" />
                    {t("Tiếp tục")}
                  </Button>
                )}
              </div>
            </form>
          )}
        </Card>
      )}
    </Page>
  );
}
