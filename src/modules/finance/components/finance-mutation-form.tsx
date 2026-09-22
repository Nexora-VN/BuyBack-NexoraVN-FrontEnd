"use client";
import { ApiErrorNotice } from "@/components/errors/api-error-notice";
import { useDialogBusy } from "@/components/patterns/surface-dialog";
import { Button } from "@/components/ui/button";
import { Input,Select,Textarea } from "@/components/ui/input";
import { useCopy } from "@/i18n/use-copy";
import { useContext,useId,useRef,useState,type ReactNode } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useRefreshFinance } from "../hooks/use-finance";
import { financeService } from "../services/finance";
import type { Field } from "../types/finance";
import { ActionContext } from "./finance-action-context";
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
  const [error, setError] = useState<unknown>(null);
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
      setError(e);
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
        {(!!error || errors._form) && (
          <p role="alert" className="text-danger text-sm">
            {error ? <ApiErrorNotice error={error} /> : t(errors._form)}
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
