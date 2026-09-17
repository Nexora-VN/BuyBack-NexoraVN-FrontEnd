"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { LoaderCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import LanguageSwitcher from "@/components/locale/language-switcher";
import { Button } from "@/components/ui/button";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useCopy } from "@/i18n/use-copy";
import { useAuth } from "@/modules/auth/components/auth-provider";
import { LoginBenefits, LoginForm } from "@/modules/auth/components/login-form";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="20" height="20">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function LoginContent() {
  const t = useCopy();
  const router = useRouter();
  const searchParams = useSearchParams();
  const clerk = useClerk();
  const { isSignedIn, isLoaded: isUserLoaded } = useUser();
  const { user: appUser, refetch } = useAuth();

  const locale = useLocale();
  const localePrefix = locale === "en" ? "/en" : "";
  const syncRedirectUrl = `${localePrefix}/login?sync=clerk`;

  const [loadingStrategy, setLoadingStrategy] = useState<string | null>(null);
  const [syncFailed, setSyncFailed] = useState(false);
  const syncStartedRef = useRef(false);

  const isExplicitSync = searchParams?.get("sync") === "clerk";
  const isSyncing = isUserLoaded && isSignedIn && isExplicitSync && !syncFailed;

  // Automatically detect Clerk session and sync with backend
  useEffect(() => {
    if (!isUserLoaded) return;

    const needsSync = isSignedIn && isExplicitSync;

    if (needsSync && !syncStartedRef.current) {
      syncStartedRef.current = true;
      fetch("/api/auth/clerk-sync", { method: "POST" })
        .then(async (res) => {
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.message || "Đồng bộ tài khoản thất bại");
          }
          return res.json();
        })
        .then(async (data) => {
          await refetch();
          toast.success(t("Đăng nhập thành công"));
          router.replace(data.user?.role === "USER" ? "/app" : "/admin");
        })
        .catch((err) => {
          setSyncFailed(true);
          toast.error(err.message || "Không thể đồng bộ phiên đăng nhập");
        });
    }
  }, [isSignedIn, isUserLoaded, isExplicitSync, refetch, router, t]);

  // Auto redirect if already logged into the app
  useEffect(() => {
    if (appUser && !isSyncing && searchParams?.get("sync") !== "clerk") {
      router.replace(appUser.role === "USER" ? "/app" : "/admin");
    }
  }, [appUser, isSyncing, searchParams, router]);

  const handleOAuth = async (strategy: "oauth_google" | "oauth_facebook") => {
    if (!clerk.loaded || !clerk.client?.signIn) return;
    setLoadingStrategy(strategy);
    try {
      await clerk.client.signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: `${localePrefix}/sso-callback`,
        redirectUrlComplete: syncRedirectUrl,
        continueSignUp: true,
      });
    } catch (err: unknown) {
      setLoadingStrategy(null);
      const message = err instanceof Error ? err.message : "Không thể kết nối với dịch vụ xác thực";
      toast.error(message);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
      <header className="mb-7">
        <h1 className="text-2xl font-bold lg:text-3xl">{t("Chào mừng trở lại")}</h1>
        <p className="text-muted-foreground mt-2.5 text-sm leading-6">
          {t("Đăng nhập để mua sắm hoàn tiền cùng Piggy nhé")}
        </p>
      </header>

      {/* Syncing State Indicator */}
      {isSyncing ? (
        <div className="border-primary/20 bg-primary/5 text-primary mb-6 flex items-center justify-center gap-3 rounded-2xl border p-4 text-sm font-medium">
          <LoaderCircle className="size-5 animate-spin" />
          <span>Sắp tới rồi, bạn chờ Piggy tí nhé .....</span>
        </div>
      ) : (
        <>
          {/* Social Logins via Clerk */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={loadingStrategy !== null || isSyncing}
              onClick={() => handleOAuth("oauth_google")}
              className="border-border bg-card hover:bg-muted flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border py-2.5 font-medium transition-all"
            >
              {loadingStrategy === "oauth_google" ? (
                <LoaderCircle className="text-primary size-4 animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              <span>Đăng nhập với Google</span>
            </Button>

            {/* <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={loadingStrategy !== null || isSyncing}
              onClick={() => handleOAuth("oauth_facebook")}
              className="border-border bg-card hover:bg-muted flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border py-2.5 font-medium text-[#1877F2] transition-all"
            >
              {loadingStrategy === "oauth_facebook" ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <FacebookIcon className="text-[#1877F2]" />
              )}
              <span className="text-foreground">Đăng nhập với Facebook</span>
            </Button> */}
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="border-border w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card text-muted-foreground px-3 font-medium">
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
        </>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="bg-card grid min-h-dvh lg:grid-cols-2">
      <LoginBenefits />
      <section className="flex flex-col px-5 py-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between gap-4">
          <p className="text-primary font-semibold lg:invisible">Piggy Buy Back</p>
          <LanguageSwitcher />
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
