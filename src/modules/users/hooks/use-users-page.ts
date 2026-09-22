"use client";
import { useCopy } from "@/i18n/use-copy";

import { useConfirm } from "@/components/patterns/confirm-provider";
import { useListState } from "@/lib/use-list-state";

import { useUserMutations, useUsers } from "@/modules/users/hooks/use-users";
import type { User, UserInput } from "@/modules/users/types/user";
import { useRef, useState } from "react";
import { toast } from "sonner";

const empty: UserInput & { password: string } = {
  email: "",
  phoneNumber: "+84",
  password: "",
  displayName: "",
  fullName: "",
  role: "USER",
  status: "ACTIVE",
};
export function useUsersPage() {
  const t = useCopy();

  const confirm = useConfirm();
  const list = useListState("users");
  const page = list.page,
    query = list.query;
  const saveLock = useRef(false);
  const [saveError, setSaveError] = useState<unknown>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState(empty);

  const users = useUsers({
    page,
    limit: 20,
    sort: list.sort,
    ...(["ACTIVE", "DISABLED"].includes(list.status)
      ? { status: list.status as "ACTIVE" | "DISABLED" }
      : {}),
    ...(query ? { search: query } : {}),
  });
  const mutations = useUserMutations();
  const showForm = (user?: User) => {
    setEditing(user ?? null);
    setForm(
      user
        ? {
            email: user.email,
            phoneNumber: user.phoneNumber,
            password: "",
            displayName: user.displayName ?? "",
            fullName: user.fullName ?? "",
            role: user.role,
            status: user.status,
          }
        : empty,
    );
    setSaveError(null);
    setOpen(true);
  };
  const save = async () => {
    try {
      if (editing) {
        const { password, ...rest } = form;
        await mutations.update.mutateAsync({
          id: editing.id,
          input: { ...rest, ...(password ? { password } : {}) },
        });
      } else {
        await mutations.create.mutateAsync(form);
      }
      toast.success(editing ? t("Đã cập nhật người dùng") : t("Đã tạo người dùng"));
      setOpen(false);
    } catch (error) {
      setSaveError(error);
    } finally {
      saveLock.current = false;
    }
  };
  const remove = async (id: string) => {
    if (mutations.remove.isPending) return;
    if (!(await confirm(t("Xóa người dùng này? Hành động cần được xác nhận.")))) return;
    try {
      await mutations.remove.mutateAsync(id);
      toast.success(t("Đã xóa người dùng"));
    } catch (error) {
      toast.error(t.error(error instanceof Error ? error.message : t("Không thể xóa")));
    }
  };
  return {
    t,
    list,
    page,
    users,
    mutations,
    showForm,
    save,
    remove,
    saveError,
    open,
    setOpen,
    editing,
    form,
    setForm,
  };
}
export type UsersPageState = ReturnType<typeof useUsersPage>;
