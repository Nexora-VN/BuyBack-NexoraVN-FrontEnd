import { describe, expect, it } from "vitest";
import {
  normalizeVietnamPhone,
  updateUserPayload,
  validateUserForm,
  type UserFormValues,
} from "./user-form";
import type { User } from "./types/user";
import { ApiError } from "@/lib/api/errors";
import { explainUserSaveError } from "./user-form";

const user: User = {
  id: "1",
  email: "user@example.com",
  phoneNumber: null,
  displayName: "Old",
  fullName: null,
  role: "USER",
  status: "ACTIVE",
  createdAt: "",
  updatedAt: "",
};
const form: UserFormValues = {
  email: user.email,
  phoneNumber: "",
  password: "",
  displayName: "New",
  fullName: "",
  role: "USER",
  status: "ACTIVE",
};

describe("admin user form", () => {
  it("accepts an empty phone while editing and only sends changed fields", () => {
    expect(validateUserForm(form, true)).toEqual({});
    expect(updateUserPayload(form, user)).toEqual({ displayName: "New" });
    expect(updateUserPayload({ ...form, displayName: "Old" }, user)).toEqual({});
  });
  it("clears a phone explicitly and normalizes Vietnamese numbers", () => {
    expect(updateUserPayload(form, { ...user, phoneNumber: "+84901234567" })).toEqual({
      phoneNumber: null,
      displayName: "New",
    });
    expect(normalizeVietnamPhone("090 123 4567")).toBe("+84901234567");
    expect(normalizeVietnamPhone("+84 90 123 4567")).toBe("+84901234567");
    expect(normalizeVietnamPhone("123")).toBe("");
    expect(validateUserForm({ ...form, phoneNumber: "123" }, true).phoneNumber).toBeTruthy();
  });
  it("gives actionable API errors for duplicates and missing permission", () => {
    const email = explainUserSaveError(new ApiError("Email is already in use", 409));
    expect(email.fieldErrors.email).toBe("Email này đã được sử dụng.");
    const phone = explainUserSaveError(new ApiError("Phone number is already in use", 409));
    expect(phone.fieldErrors.phoneNumber).toBe("Số điện thoại này đã được sử dụng.");
    const forbidden = explainUserSaveError(new ApiError("Forbidden", 403));
    expect((forbidden.error as Error).message).toContain("không có quyền");
  });
});
