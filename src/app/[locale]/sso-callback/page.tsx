"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { LoaderCircle } from "lucide-react";
import { useLocale } from "next-intl";

export default function SSOCallbackPage() {
  const locale = useLocale();
  const localePrefix = locale === "en" ? "/en" : "";
  const syncRedirectUrl = `${localePrefix}/login?sync=clerk`;

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="border-border bg-card flex flex-col items-center gap-4 rounded-2xl border p-8 shadow-sm">
        <LoaderCircle className="text-primary size-10 animate-spin" />
        <div>
          <h1 className="text-foreground text-lg font-semibold">Đang hoàn tất đăng nhập...</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Vui lòng đợi giây lát, hệ thống đang xử lý và đưa bạn về ứng dụng.
          </p>
        </div>
      </div>
      <AuthenticateWithRedirectCallback
        signInForceRedirectUrl={syncRedirectUrl}
        signUpForceRedirectUrl={syncRedirectUrl}
        signInFallbackRedirectUrl={syncRedirectUrl}
        signUpFallbackRedirectUrl={syncRedirectUrl}
        continueSignUpUrl={syncRedirectUrl}
      />
    </div>
  );
}
