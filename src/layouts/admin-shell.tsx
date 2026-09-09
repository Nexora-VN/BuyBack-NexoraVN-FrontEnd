"use client";

import {
  CircleUserRound,
  Gamepad2,
  GraduationCap,
  LogOut,
  Menu,
  WalletCards,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/modules/auth/components/auth-provider";

const nav = [
  { href: "/admin/notebooks", label: "Notebook LMS", icon: GraduationCap },
  { href: "/admin/games", label: "Game LMS", icon: Gamepad2 },
];

function AdminNav({ close }: { close?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-1 px-3">
      {nav.map(({ href, label, icon: Icon }) => {
        const active =
          pathname === href || (href !== "/admin" && pathname.startsWith(href));
        return (
          <Link
            onClick={close}
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-muted",
              active ? "bg-secondary text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className="size-5 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const signOut = async () => {
    await logout();
    router.replace("/login");
  };
  return (
    <div className="min-h-screen bg-background lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r bg-white lg:flex">
        {/* <Link
          href="/admin"
          className="flex h-20 items-center gap-3 px-6 text-xl font-bold text-primary"
        >
          <span className="grid size-10 place-items-center rounded-2xl bg-primary text-white">
            <WalletCards />
          </span>
          <span>
            BuyBack
            <br />
            <small className="text-xs font-medium text-muted-foreground">
              Admin · NexoraVN
            </small>
          </span>
        </Link> */}
        <div className="flex-1 overflow-y-auto py-3">
          <AdminNav />
        </div>
        <div className="border-t p-4">
          <p className="truncate text-xs text-muted-foreground">
            {user?.email}
          </p>
          <button
            onClick={signOut}
            className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-danger hover:bg-danger-soft"
          >
            <LogOut className="size-4" />
            Đăng xuất
          </button>
        </div>
      </aside>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/90 px-4 backdrop-blur lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="min-h-11 min-w-11 rounded-xl p-2 hover:bg-muted"
          aria-label="Mở menu quản trị"
        >
          <Menu />
        </button>
        <strong className="text-primary">BuyBack Admin</strong>
        <span className="grid size-9 place-items-center rounded-full bg-secondary text-sm font-bold text-primary">
          <CircleUserRound className="size-5" />
        </span>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-foreground/30"
            aria-label="Đóng menu"
            onClick={() => setOpen(false)}
          />
          <aside className="relative h-full w-[min(84vw,300px)] overflow-y-auto bg-white py-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between px-5">
              <strong className="text-lg text-primary">BuyBack Admin</strong>
              <button
                onClick={() => setOpen(false)}
                aria-label="Đóng menu quản trị"
                className="min-h-11 min-w-11 rounded-lg p-2 hover:bg-muted"
              >
                <X />
              </button>
            </div>
            <AdminNav close={() => setOpen(false)} />
            <div className="mt-4 border-t p-4">
              <p className="truncate text-xs text-muted-foreground">
                {user?.email}
              </p>
              <button
                onClick={signOut}
                className="mt-2 flex min-h-11 w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-danger hover:bg-danger-soft"
              >
                <LogOut className="size-4" />
                Đăng xuất
              </button>
            </div>
          </aside>
        </div>
      )}
      <main>{children}</main>
    </div>
  );
}
