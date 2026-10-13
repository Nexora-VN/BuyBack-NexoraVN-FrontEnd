import type { User, UserInput, UserUpdateInput } from "./types/user";
import { ApiError } from "@/lib/api/errors";

export type UserFormValues = Omit<UserInput, "phoneNumber"> & {
  phoneNumber: string;
  password: string;
};
export type UserFormErrors = Partial<Record<keyof UserFormValues, string>>;

export function normalizeVietnamPhone(value: string): string | null {
  const compact = value.trim().replace(/[\s().-]/g, "");
  if (!compact) return null;
  const international = compact.startsWith("0")
    ? `+84${compact.slice(1)}`
    : compact.startsWith("84")
      ? `+${compact}`
      : compact;
  return /^\+84[35789]\d{8}$/.test(international) ? international : "";
}

export function validateUserForm(form: UserFormValues, editing: boolean): UserFormErrors {
  const errors: UserFormErrors = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = "Nhập email hợp lệ.";
  const phone = normalizeVietnamPhone(form.phoneNumber);
  if (!editing && !phone) errors.phoneNumber = "Nhập số điện thoại Việt Nam hợp lệ.";
  if (editing && phone === "") errors.phoneNumber = "Nhập số điện thoại Việt Nam hợp lệ.";
  if (!editing && form.password.length < 8) errors.password = "Mật khẩu cần ít nhất 8 ký tự.";
  if (editing && form.password && form.password.length < 8)
    errors.password = "Mật khẩu mới cần ít nhất 8 ký tự.";
  if (form.displayName && form.displayName.trim().length > 120)
    errors.displayName = "Tên hiển thị tối đa 120 ký tự.";
  if (form.fullName && form.fullName.trim().length > 50)
    errors.fullName = "Họ và tên tối đa 50 ký tự.";
  return errors;
}

export function createUserPayload(form: UserFormValues): UserInput & { password: string } {
  return {
    email: form.email.trim().toLowerCase(),
    phoneNumber: normalizeVietnamPhone(form.phoneNumber),
    password: form.password,
    displayName: form.displayName?.trim(),
    fullName: form.fullName?.trim(),
    role: form.role,
    status: form.status,
  };
}

export function updateUserPayload(form: UserFormValues, user: User): UserUpdateInput {
  const next: UserUpdateInput = {};
  const email = form.email.trim().toLowerCase();
  if (email !== user.email) next.email = email;
  if (form.phoneNumber.trim() !== (user.phoneNumber ?? ""))
    next.phoneNumber = normalizeVietnamPhone(form.phoneNumber);
  if (form.displayName?.trim() !== (user.displayName ?? ""))
    next.displayName = form.displayName?.trim();
  if (form.fullName?.trim() !== (user.fullName ?? "")) next.fullName = form.fullName?.trim();
  if (form.role !== user.role) next.role = form.role;
  if (form.status !== user.status) next.status = form.status;
  if (form.password) next.password = form.password;
  return next;
}

export function explainUserSaveError(error: unknown): {
  error: unknown;
  fieldErrors: UserFormErrors;
} {
  if (!(error instanceof ApiError)) return { error, fieldErrors: {} };
  const message = error.message.toLowerCase();
  let friendly: string | null = null;
  let fieldErrors: UserFormErrors = {};
  if (message.includes("email")) {
    friendly = error.status === 409 ? "Email này đã được sử dụng." : "Email không hợp lệ.";
    fieldErrors = { email: friendly };
  } else if (message.includes("phone")) {
    friendly =
      error.status === 409 ? "Số điện thoại này đã được sử dụng." : "Số điện thoại không hợp lệ.";
    fieldErrors = { phoneNumber: friendly };
  } else if (error.status === 403) {
    friendly = "Tài khoản của bạn không có quyền sửa người dùng này.";
  }
  return {
    error: friendly ? new ApiError(friendly, error.status, error.data, error.requestId) : error,
    fieldErrors,
  };
}
