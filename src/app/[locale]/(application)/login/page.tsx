"use client";

import { Suspense, useEffect } from "react";
import { LoaderCircle } from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import { useCopy } from "@/i18n/use-copy";
import { useAuth } from "@/modules/auth/components/auth-provider";
import { LoginBenefits, LoginForm, LoginIllustration } from "@/modules/auth/components/login-form";
import { GoogleSignIn } from "@/modules/auth/components/google-sign-in";

function LoginContent() {
  const t = useCopy();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace(user.role === "USER" ? "/app" : "/admin");
  }, [user, router]);

  return (
    <div className="mx-auto flex w-full max-w-md min-w-0 flex-1 flex-col justify-center py-10">
      <header className="mb-7 text-center lg:text-left">
        <h1 className="text-2xl font-extrabold tracking-tight lg:text-3xl">
          {t("Chào mừng trở lại")}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          {t("Đăng nhập để mua sắm hoàn tiền cùng Piggy nhé")}
        </p>
      </header>

      <div className="bg-card soft-shadow min-w-0 rounded-2xl border p-5 sm:p-7">
        <GoogleSignIn />

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="border-border w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card text-muted-foreground max-w-full px-3 text-center font-medium">
              {t("hoặc tiếp tục với tài khoản hệ thống")}
            </span>
          </div>
        </div>

        {/* Project Email & Password Form */}
        <LoginForm />

        {/* <p className="text-muted-foreground mt-8 text-xs leading-5">
            {t(
              "Bằng việc đăng nhập, bạn đồng ý với điều khoản bảo mật và sử dụng của Piggy Buy Back.",
            )}
          </p> */}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="bg-background grid min-h-dvh min-w-0 lg:grid-cols-2">
      <LoginBenefits />
      <section className="flex min-w-0 flex-col px-5 py-6 sm:px-8 lg:px-12">
        <div className="mx-auto w-full max-w-md min-w-0 lg:hidden">
          <LoginIllustration compact />
        </div>
        <Suspense
          fallback={
            <div className="mx-auto flex w-full max-w-md flex-1 items-center justify-center py-10">
              <LoaderCircle className="text-primary size-6 animate-spin" />
            </div>
          }
        >
          <LoginContent />
        </Suspense>
      </section>
    </main>
  );
}
