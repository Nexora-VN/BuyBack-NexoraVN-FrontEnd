"use client";
import { useCopy } from "@/i18n/use-copy";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "@/i18n/navigation";
import { ApiError } from "@/lib/api/errors";
import { useAuth } from "@/modules/auth/components/auth-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  remember: z.boolean(),
});
type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const t = useCopy();

  const [submitError, setSubmitError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: true },
  });
  const submit = form.handleSubmit(async (values) => {
    setSubmitError("");
    try {
      const user = await login(values);
      toast.success(t("Đăng nhập thành công"));
      router.replace(user.role === "USER" ? "/app" : "/admin");
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : "Không thể đăng nhập");
    }
  });
  return (
    <form className="space-y-5" onSubmit={submit} noValidate>
      <div>
        <label className="mb-2 block text-sm font-medium" htmlFor="email">
          Email
        </label>
        <div className="relative">
          <Mail className="text-muted-foreground absolute top-3.5 left-3 size-4" />
          <Input
            id="email"
            aria-invalid={!!form.formState.errors.email}
            aria-describedby="email-error"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="pl-10"
            {...form.register("email")}
          />
        </div>
        {form.formState.errors.email && (
          <p id="email-error" role="alert" className="text-danger mt-1.5 text-xs">
            {t(form.formState.errors.email.message ?? "")}
          </p>
        )}
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium" htmlFor="password">
          {t("Mật khẩu")}
        </label>
        <div className="relative">
          <LockKeyhole className="text-muted-foreground absolute top-3.5 left-3 size-4" />
          <Input
            id="password"
            aria-invalid={!!form.formState.errors.password}
            aria-describedby="password-error"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className="px-10"
            {...form.register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? t("Ẩn mật khẩu") : t("Hiện mật khẩu")}
            className="text-muted-foreground hover:bg-muted absolute top-0 right-0 grid size-11 place-items-center rounded-lg"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {form.formState.errors.password && (
          <p id="password-error" role="alert" className="text-danger mt-1.5 text-xs">
            {t(form.formState.errors.password.message ?? "")}
          </p>
        )}
      </div>
      <label className="text-muted-foreground flex items-center gap-2 text-sm">
        <input type="checkbox" className="accent-primary size-4" {...form.register("remember")} />
        {t("Duy trì đăng nhập trên thiết bị này")}
      </label>
      {submitError && (
        <p role="alert" className="text-danger text-sm">
          {t.error(submitError)}
        </p>
      )}
      <Button size="lg" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? (
          <>
            <LoaderCircle className="animate-spin" />
            {t("Đang đăng nhập")}
          </>
        ) : (
          t("Đăng nhập")
        )}
      </Button>
    </form>
  );
}

export function LoginBenefits() {
  const t = useCopy();
  return (
    <section className="bg-background hidden flex-col justify-center border-r p-12 lg:flex xl:p-20">
      <div className="text-primary flex items-center gap-3 text-xl font-bold">
        <ShieldCheck className="size-8" />
        BuyBack NexoraVN
      </div>
      <div className="mt-14 max-w-md">
        <p className="text-primary text-sm font-semibold">{t("Cashback minh bạch")}</p>
        <h2 className="mt-4 text-3xl leading-snug font-bold">
          {t("Mua sắm như thường lệ.")}
          <br />
          {t("Nhận lại giá trị xứng đáng.")}
        </h2>
        <p className="text-muted-foreground mt-6 text-base leading-7">
          {t(
            "Tạo liên kết Shopee, theo dõi đối soát và quản lý dòng tiền hoàn lại trong một trải nghiệm đơn giản, rõ ràng.",
          )}
        </p>
      </div>
    </section>
  );
}
