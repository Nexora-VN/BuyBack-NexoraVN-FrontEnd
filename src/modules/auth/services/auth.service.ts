import { apiClient } from "@/lib/api/client";
import type { AuthUser, LoginInput, LoginResponse } from "@/modules/auth/types/auth";

export const authService = {
  login: (input: LoginInput) =>
    apiClient.post<LoginResponse>("/api/auth/login", input, { skipAuthRefresh: true }),
  loginWithGoogle: (idToken: string) =>
    apiClient.post<LoginResponse>("/api/auth/google", { idToken }, { skipAuthRefresh: true }),
  me: () => apiClient.get<AuthUser>("/api/backend/auth/me"),
  logout: () => apiClient.post<void>("/api/auth/logout", undefined, { skipAuthRefresh: true }),
};
