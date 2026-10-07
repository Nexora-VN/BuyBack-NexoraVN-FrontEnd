"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useRouter } from "@/i18n/navigation";
import { isApiError } from "@/lib/api/errors";
import { authService } from "@/modules/auth/services/auth.service";
import { LoginBenefits, LoginIllustration } from "./login-form";

type PasswordInput = { password: string; confirmPassword: string };

export function ForgotPasswordPageContent() {
  const t = useTranslations("PasswordReset");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(0);
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const emailForm = useForm<{ email: string }>({
    resolver: zodResolver(z.object({ email: z.string().trim().email(t("emailError")).max(320) })),
    defaultValues: { email: "" },
  });
  const passwordForm = useForm<PasswordInput>({
    resolver: zodResolver(
      z
        .object({
          password: z.string().min(8, t("passwordError")).max(128, t("passwordError")),
          confirmPassword: z.string().min(1, t("confirmRequired")),
        })
        .refine((values) => values.password === values.confirmPassword, {
          path: ["confirmPassword"],
          message: t("passwordMismatch"),
        }),
    ),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setNow(new Date().getTime());
      const pending = sessionStorage.getItem("passwordReset.pendingEmail");
      if (pending) {
        setEmail(pending);
        setStep("reset");
        const savedResendAt = Number(sessionStorage.getItem("passwordReset.resendAt"));
        if (Number.isFinite(savedResendAt)) setResendAt(savedResendAt);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (step !== "reset") return;
    const timer = window.setInterval(() => setNow(new Date().getTime()), 1000);
    return () => window.clearInterval(timer);
  }, [step]);

  const remaining = Math.max(0, Math.ceil((resendAt - now) / 1000));
  const describeError = (reason: unknown) => {
    if (!isApiError(reason)) return t("genericError");
    switch (reason.code) {
      case "OTP_INVALID_OR_EXPIRED":
        return t("invalidOrExpiredCode");
      case "OTP_INVALID":
        return t("invalidCode");
      case "OTP_EXPIRED":
        return t("expiredCode");
      case "OTP_ATTEMPTS_EXCEEDED":
        return t("tooManyAttempts");
      case "PASSWORDS_DO_NOT_MATCH":
        return t("passwordMismatch");
      case "RATE_LIMITED":
      case "TOO_MANY_REQUESTS":
        return t("rateLimited");
      case "PASSWORD_RESET_MAIL_NOT_CONFIGURED":
      case "SERVICE_UNAVAILABLE":
        return t("mailUnavailable");
      default:
        return t("genericError");
    }
  };

  const saveResendAt = (seconds: number) => {
    const currentTime = new Date().getTime();
    const next = currentTime + seconds * 1000;
    setNow(currentTime);
    setResendAt(next);
    sessionStorage.setItem("passwordReset.resendAt", String(next));
  };

  const start = emailForm.handleSubmit(async (values) => {
    setError("");
    try {
      const normalizedEmail = values.email.trim().toLowerCase();
      const result = await authService.passwordResetStart(normalizedEmail);
      setEmail(normalizedEmail);
      setCode("");
      saveResendAt(result.resendAfterSeconds);
      sessionStorage.setItem("passwordReset.pendingEmail", normalizedEmail);
      setStep("reset");
    } catch (reason) {
      setError(describeError(reason));
    }
  });

  const confirm = passwordForm.handleSubmit(async (values) => {
    if (code.length !== 6) {
      setError(t("codeRequired"));
      return;
    }
    setError("");
    try {
      await authService.passwordResetConfirm({ email, code, ...values });
      sessionStorage.removeItem("passwordReset.pendingEmail");
      sessionStorage.removeItem("passwordReset.resendAt");
      sessionStorage.setItem("auth.loginEmail", email);
      passwordForm.reset();
      queryClient.setQueryData(["auth", "me"], null);
      toast.success(t("success"));
      router.replace("/login");
    } catch (reason) {
      setError(describeError(reason));
      setCode("");
    }
  });

  const resend = async () => {
    if (remaining > 0 || resending) return;
    setResending(true);
    setError("");
    try {
      const result = await authService.passwordResetStart(email);
      saveResendAt(result.resendAfterSeconds);
      setCode("");
      toast.success(t("resent"));
    } catch (reason) {
      setError(describeError(reason));
    } finally {
      setResending(false);
    }
  };

  const changeEmail = () => {
    sessionStorage.removeItem("passwordReset.pendingEmail");
    sessionStorage.removeItem("passwordReset.resendAt");
    emailForm.setValue("email", email);
    setCode("");
    setError("");
    setStep("email");
  };

  return (
    <main className="bg-background grid min-h-dvh min-w-0 lg:grid-cols-2">
      <LoginBenefits />
      <section className="flex min-w-0 flex-col px-5 py-6 sm:px-8 lg:px-12">
        <div className="mx-auto w-full max-w-md min-w-0 lg:hidden">
          <LoginIllustration compact />
        </div>
        <div className="mx-auto flex w-full max-w-md min-w-0 flex-1 flex-col justify-center py-8">
          <header className="mb-6 text-center lg:text-left">
            <h1 className="text-2xl font-extrabold tracking-tight lg:text-3xl">
              {step === "email" ? t("title") : t("resetTitle")}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              {step === "email" ? t("description") : t("resetDescription")}
            </p>
          </header>
          <div className="bg-card soft-shadow min-w-0 rounded-2xl border p-5 sm:p-7">
            {step === "email" ? (
              <form className="space-y-5" onSubmit={start} noValidate>
                <div>
                  <label htmlFor="reset-email" className="mb-2 block text-sm font-medium">
                    {t("email")}
                  </label>
                  <div className="relative">
                    <Mail
                      className="text-muted-foreground absolute top-3.5 left-3 size-4"
                      aria-hidden="true"
                    />
                    <Input
                      id="reset-email"
                      type="email"
                      autoComplete="email"
                      className="pl-10"
                      placeholder="you@example.com"
                      aria-invalid={!!emailForm.formState.errors.email}
                      {...emailForm.register("email")}
                    />
                  </div>
                  {emailForm.formState.errors.email && (
                    <p role="alert" className="text-danger mt-1 text-xs">
                      {emailForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                {error && (
                  <p role="alert" className="text-danger text-sm">
                    {error}
                  </p>
                )}
                <Button size="lg" className="w-full" disabled={emailForm.formState.isSubmitting}>
                  {emailForm.formState.isSubmitting ? t("sending") : t("sendCode")}
                </Button>
                <p className="text-muted-foreground text-center text-sm">
                  <Link href="/login" className="text-primary font-semibold hover:underline">
                    {t("backToLogin")}
                  </Link>
                </p>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={confirm} noValidate>
                <p className="text-muted-foreground text-sm leading-6">{t("sentHint")}</p>
                <div className="flex min-w-0 items-center justify-between gap-2 text-sm">
                  <strong className="min-w-0 truncate font-semibold">{email}</strong>
                  <button
                    type="button"
                    className="text-primary shrink-0 font-medium hover:underline"
                    onClick={changeEmail}
                  >
                    {t("changeEmail")}
                  </button>
                </div>
                <div>
                  <label htmlFor="reset-code" className="mb-3 block text-sm font-medium">
                    {t("otpLabel")}
                  </label>
                  <div className="focus-within:outline-primary relative grid grid-cols-6 gap-2 rounded-xl focus-within:outline-2 focus-within:outline-offset-2">
                    {Array.from({ length: 6 }, (_, index) => (
                      <span
                        key={index}
                        aria-hidden="true"
                        className={`border-input bg-background grid h-12 min-w-0 place-items-center rounded-xl border text-lg font-bold tabular-nums ${code[index] ? "border-primary text-primary" : ""}`}
                      >
                        {code[index] ?? ""}
                      </span>
                    ))}
                    <input
                      id="reset-code"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={code}
                      onChange={(event) =>
                        setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      aria-label={t("otpLabel")}
                      className="absolute inset-0 h-full w-full cursor-text opacity-0"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="reset-password" className="mb-2 block text-sm font-medium">
                    {t("newPassword")}
                  </label>
                  <div className="relative">
                    <LockKeyhole
                      className="text-muted-foreground absolute top-3.5 left-3 size-4"
                      aria-hidden="true"
                    />
                    <Input
                      id="reset-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className="px-10"
                      aria-invalid={!!passwordForm.formState.errors.password}
                      {...passwordForm.register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="text-muted-foreground absolute top-0 right-0 grid size-11 place-items-center"
                      aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.password && (
                    <p role="alert" className="text-danger mt-1 text-xs">
                      {passwordForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="reset-confirm" className="mb-2 block text-sm font-medium">
                    {t("confirmPassword")}
                  </label>
                  <div className="relative">
                    <LockKeyhole
                      className="text-muted-foreground absolute top-3.5 left-3 size-4"
                      aria-hidden="true"
                    />
                    <Input
                      id="reset-confirm"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className="pl-10"
                      aria-invalid={!!passwordForm.formState.errors.confirmPassword}
                      {...passwordForm.register("confirmPassword")}
                    />
                  </div>
                  {passwordForm.formState.errors.confirmPassword && (
                    <p role="alert" className="text-danger mt-1 text-xs">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                {error && (
                  <p role="alert" className="text-danger text-sm">
                    {error}
                  </p>
                )}
                <Button
                  size="lg"
                  className="w-full"
                  disabled={code.length !== 6 || passwordForm.formState.isSubmitting}
                >
                  {passwordForm.formState.isSubmitting ? t("updating") : t("updatePassword")}
                </Button>
                <p className="text-muted-foreground text-center text-sm">
                  {t("noCode")}{" "}
                  {remaining > 0 ? (
                    <span>{t("resendAfter", { seconds: remaining })}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={resend}
                      disabled={resending}
                      className="text-primary font-semibold hover:underline"
                    >
                      {resending ? t("sending") : t("resend")}
                    </button>
                  )}
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
