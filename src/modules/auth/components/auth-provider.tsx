"use client";

import { authService } from "@/modules/auth/services/auth.service";
import type { AuthUser, LoginInput } from "@/modules/auth/types/auth";
import { useClerk } from "@clerk/nextjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext } from "react";
import { toast } from "sonner";
import { useCopy } from "@/i18n/use-copy";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<AuthUser>;
  logout: () => Promise<boolean>;
  refetch: () => Promise<unknown>;
};
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const t = useCopy();
  const queryClient = useQueryClient();
  const clerk = useClerk();
  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authService.me,
    retry: false,
    staleTime: 60_000,
  });
  const login = async (input: LoginInput) => {
    const response = await authService.login(input);
    queryClient.setQueryData(["auth", "me"], response.user);
    return response.user;
  };
  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      toast.error(t("Không thể đăng xuất. Vui lòng thử lại."));
      return false;
    }
    queryClient.setQueryData(["auth", "me"], null);
    queryClient.removeQueries();
    try {
      if (clerk.loaded) await clerk.signOut();
    } catch {
      toast.error(t("Không thể hoàn tất đăng xuất. Vui lòng thử lại."));
      return true;
    }
    toast.success(t("Đã đăng xuất"));
    return true;
  };
  return (
    <AuthContext.Provider
      value={{
        user: query.data ?? null,
        loading: query.isLoading,
        login,
        logout,
        refetch: query.refetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
