import { apiClient } from "@/lib/api/client";
import type { AuthUser, LoginInput, LoginResponse } from "@/modules/auth/types/auth";

export const authService = {
  passwordResetStart: (email: string) =>
    apiClient.post<{ expiresInSeconds: number; resendAfterSeconds: number }>(
      "/api/backend/auth/password-reset/start",
      { email },
      { skipAuthRefresh: true },
    ),
  passwordResetConfirm: (input: {
    email: string;
    code: string;
    password: string;
    confirmPassword: string;
  }) =>
    apiClient.post<void>("/api/backend/auth/password-reset/confirm", input, {
      skipAuthRefresh: true,
    }),
  registerStart: (input: { name: string; email: string; password: string }) =>
    apiClient.post<{ expiresInSeconds: number; resendAfterSeconds: number }>(
      "/api/backend/auth/register/start",
      input,
      { skipAuthRefresh: true },
    ),
  registerResend: (email: string) =>
    apiClient.post<{ expiresInSeconds: number; resendAfterSeconds: number }>(
      "/api/backend/auth/register/resend",
      { email },
      { skipAuthRefresh: true },
    ),
  registerVerify: (email: string, code: string) =>
    apiClient.post<void>(
      "/api/backend/auth/register/verify",
      { email, code },
      { skipAuthRefresh: true },
    ),
  login: (input: LoginInput) =>
    apiClient.post<LoginResponse>("/api/auth/login", input, { skipAuthRefresh: true }),
  loginWithGoogle: (idToken: string) =>
    apiClient.post<LoginResponse>("/api/auth/google", { idToken }, { skipAuthRefresh: true }),
  me: () => apiClient.get<AuthUser>("/api/backend/auth/me"),
  logout: () => apiClient.post<void>("/api/auth/logout", undefined, { skipAuthRefresh: true }),
};
