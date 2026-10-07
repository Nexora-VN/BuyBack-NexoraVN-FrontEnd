"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
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

type RegistrationInput = { name: string; email: string; password: string };

export function SignUpPageContent() {
  const t = useTranslations("Registration");
  const router = useRouter();
  const [step, setStep] = useState<"details" | "otp">("details");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submittingCode, setSubmittingCode] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const schema = z.object({
    name: z.string().trim().min(2, t("nameError")).max(120, t("nameError")),
    email: z.string().trim().email(t("emailError")).max(320, t("emailError")),
    password: z.string().min(8, t("passwordError")).max(128, t("passwordError")),
  });
  const form = useForm<RegistrationInput>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setNow(new Date().getTime());
      const pending = sessionStorage.getItem("registration.pendingEmail");
      if (pending) {
        setEmail(pending);
        setStep("otp");
        const savedResendAt = Number(sessionStorage.getItem("registration.resendAt"));
        if (Number.isFinite(savedResendAt)) setResendAt(savedResendAt);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (step !== "otp") return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [step]);

  const remaining = Math.max(0, Math.ceil((resendAt - now) / 1000));
  const describeError = (reason: unknown) => {
    if (!isApiError(reason)) return t("genericError");
    switch (reason.code) {
      case "EMAIL_ALREADY_EXISTS":
        return t("emailExists");
      case "OTP_INVALID":
        return t("invalidCode");
      case "OTP_EXPIRED":
      case "REGISTRATION_NOT_STARTED":
        return t("expiredCode");
      case "OTP_ATTEMPTS_EXCEEDED":
        return t("tooManyAttempts");
      case "REGISTRATION_RATE_LIMITED":
      case "TOO_MANY_REQUESTS":
        return t("rateLimited");
      case "REGISTRATION_MAIL_NOT_CONFIGURED":
      case "REGISTRATION_MAIL_SEND_FAILED":
      case "SERVICE_UNAVAILABLE":
        return t("mailUnavailable");
      default:
        return t("genericError");
    }
  };

  const start = form.handleSubmit(async (values) => {
    setError("");
    try {
      const normalizedEmail = values.email.trim().toLowerCase();
      const result = await authService.registerStart({
        name: values.name.trim(),
        email: normalizedEmail,
        password: values.password,
      });
      setEmail(normalizedEmail);
      setCode("");
      setStep("otp");
      const nextResendAt = new Date().getTime() + result.resendAfterSeconds * 1000;
      setNow(new Date().getTime());
      setResendAt(nextResendAt);
      sessionStorage.setItem("registration.pendingEmail", normalizedEmail);
      sessionStorage.setItem("registration.resendAt", String(nextResendAt));
      form.reset({ ...values, password: "" });
    } catch (reason) {
      setError(describeError(reason));
    }
  });

  const verify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (code.length !== 6 || submittingCode) return;
    setSubmittingCode(true);
    setError("");
    try {
      await authService.registerVerify(email, code);
      sessionStorage.removeItem("registration.pendingEmail");
      sessionStorage.removeItem("registration.resendAt");
      sessionStorage.setItem("auth.loginEmail", email);
      toast.success(t("success"));
      router.replace("/login");
    } catch (reason) {
      setError(describeError(reason));
      setCode("");
    } finally {
      setSubmittingCode(false);
    }
  };

  const resend = async () => {
    if (remaining > 0 || resending) return;
    setResending(true);
    setError("");
    try {
      const result = await authService.registerResend(email);
      const nextResendAt = Date.now() + result.resendAfterSeconds * 1000;
      setNow(new Date().getTime());
      setResendAt(nextResendAt);
      sessionStorage.setItem("registration.resendAt", String(nextResendAt));
      setCode("");
    } catch (reason) {
      setError(describeError(reason));
    } finally {
      setResending(false);
    }
  };

  const changeEmail = () => {
    sessionStorage.removeItem("registration.pendingEmail");
    sessionStorage.removeItem("registration.resendAt");
    form.setValue("email", email);
    setError("");
    setCode("");
    setStep("details");
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
              {step === "details" ? t("title") : t("otpTitle")}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              {step === "details" ? t("subtitle") : t("otpDescription")}
            </p>
          </header>

          <div className="bg-card soft-shadow min-w-0 rounded-2xl border p-5 sm:p-7">
            {step === "details" ? (
              <form className="space-y-4" onSubmit={start} noValidate>
                <div>
                  <label htmlFor="register-name" className="mb-2 block text-sm font-medium">
                    {t("name")}
                  </label>
                  <div className="relative">
                    <UserRound className="text-muted-foreground absolute top-3.5 left-3 size-4" />
                    <Input
                      id="register-name"
                      autoComplete="name"
                      placeholder={t("namePlaceholder")}
                      className="pl-10"
                      aria-invalid={!!form.formState.errors.name}
                      {...form.register("name")}
                    />
                  </div>
                  {form.formState.errors.name && (
                    <p className="text-danger mt-1 text-xs" role="alert">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="register-email" className="mb-2 block text-sm font-medium">
                    {t("email")}
                  </label>
                  <div className="relative">
                    <Mail className="text-muted-foreground absolute top-3.5 left-3 size-4" />
                    <Input
                      id="register-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="pl-10"
                      aria-invalid={!!form.formState.errors.email}
                      {...form.register("email")}
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="text-danger mt-1 text-xs" role="alert">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="register-password" className="mb-2 block text-sm font-medium">
                    {t("password")}
                  </label>
                  <div className="relative">
                    <LockKeyhole className="text-muted-foreground absolute top-3.5 left-3 size-4" />
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className="px-10"
                      aria-invalid={!!form.formState.errors.password}
                      {...form.register("password")}
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
                  <p className="text-muted-foreground mt-1 text-xs">{t("passwordHint")}</p>
                  {form.formState.errors.password && (
                    <p className="text-danger mt-1 text-xs" role="alert">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>
                {error && (
                  <p className="text-danger text-sm" role="alert">
                    {error}
                  </p>
                )}
                <Button size="lg" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? t("sending") : t("sendCode")}
                </Button>
                <p className="text-muted-foreground text-center text-sm">
                  {t("haveAccount")}{" "}
                  <Link href="/login" className="text-primary font-semibold hover:underline">
                    {t("signIn")}
                  </Link>
                </p>
              </form>
            ) : (
              <form className="space-y-5" onSubmit={verify}>
                <div className="flex min-w-0 items-center justify-between gap-2 text-sm">
                  <strong className="min-w-0 truncate font-semibold">{email}</strong>
                  <button
                    type="button"
                    onClick={changeEmail}
                    className="text-primary shrink-0 font-medium hover:underline"
                  >
                    {t("changeEmail")}
                  </button>
                </div>
                <div>
                  <label htmlFor="registration-code" className="mb-3 block text-sm font-medium">
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
                      id="registration-code"
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
                {error && (
                  <p className="text-danger text-sm" role="alert">
                    {error}
                  </p>
                )}
                <Button size="lg" className="w-full" disabled={code.length !== 6 || submittingCode}>
                  {submittingCode ? t("verifying") : t("verify")}
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
                      {resending ? t("resending") : t("resend")}
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
