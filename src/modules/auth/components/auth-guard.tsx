"use client";
import { useCopy } from "@/i18n/use-copy";

import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/modules/auth/components/auth-provider";
import type { UserRole } from "@/modules/auth/types/auth";
import { LoaderCircle } from "lucide-react";
import { useEffect } from "react";

export function AuthGuard({ children, roles }: { children: React.ReactNode; roles?: UserRole[] }) {
  const t = useCopy();

  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    else if (!loading && user && roles && !roles.includes(user.role))
      router.replace(user.role === "USER" ? "/app" : "/admin");
  }, [loading, roles, router, user]);
  if (loading || !user || (roles && !roles.includes(user.role)))
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoaderCircle
          className="text-primary size-7 animate-spin"
          aria-label={t("Đang kiểm tra phiên đăng nhập")}
        />
      </div>
    );
  return children;
}
