"use client";

import { ApiErrorNotice } from "@/components/errors/api-error-notice";
import { SurfaceDialog } from "@/components/patterns/surface-dialog";

import { Button } from "@/components/ui/button";
import { Input,Select } from "@/components/ui/input";
import type { UserInput } from "@/modules/users/types/user";
import { LoaderCircle } from "lucide-react";

import type { UsersPageState } from "../hooks/use-users-page";
export function UserFormDialog({state}: {state: UsersPageState}) { const { t, page, users, mutations, save, saveError, open, setOpen, editing, form, setForm } = state; return (      <SurfaceDialog
        busy={mutations.create.isPending || mutations.update.isPending}
        open={open}
        onOpenChange={setOpen}
        title={editing ? t("Cập nhật người dùng") : t("Tạo người dùng")}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              ["email", "Email", "email"],
              ["phoneNumber", t("Số điện thoại"), "tel"],
              ["displayName", t("Tên hiển thị"), "text"],
              ["fullName", t("Họ và tên"), "text"],
              [
                "password",
                editing ? t("Mật khẩu mới (không bắt buộc)") : t("Mật khẩu"),
                "password",
              ],
            ].map(([key, label, type]) => (
              <label key={key} className={key === "password" ? "sm:col-span-2" : ""}>
                <span className="mb-1.5 block text-sm font-medium">{t(label)}</span>
                <Input
                  required={!editing || key !== "password"}
                  type={type}
                  value={String(form[key as keyof typeof form] ?? "")}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </label>
            ))}
            <label>
              <span className="mb-1.5 block text-sm font-medium">{t("Vai trò")}</span>
              <Select
                value={form.role}
                onChange={(e) =>
                  setForm({
                    ...form,
                    role: e.target.value as UserInput["role"],
                  })
                }
              >
                <option>USER</option>
                <option>ADMIN</option>
                <option>SUPER_ADMIN</option>
              </Select>
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium">{t("Trạng thái")}</span>
              <Select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as UserInput["status"],
                  })
                }
              >
                <option>ACTIVE</option>
                <option>DISABLED</option>
                <option>DELETED</option>
              </Select>
            </label>
          </div>
          {Boolean(saveError) && (
            <div className="mt-4">
              <ApiErrorNotice error={saveError} />
            </div>
          )}
          <div className="form-actions">
            <Button
              type="button"
              variant="outline"
              disabled={mutations.create.isPending || mutations.update.isPending}
              onClick={() => setOpen(false)}
            >
              {t("Hủy")}
            </Button>
            <Button
              type="submit"
              disabled={mutations.create.isPending || mutations.update.isPending}
            >
              {(mutations.create.isPending || mutations.update.isPending) && (
                <LoaderCircle className="animate-spin" />
              )}
              {t("Lưu")}
            </Button>
          </div>
        </form>
      </SurfaceDialog>); }
