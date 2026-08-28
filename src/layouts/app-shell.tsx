"use client";

import {
  ClipboardList,
  Home,
  Link2,
  LogOut,
  Menu,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/modules/auth/components/auth-provider";

const nav = [
  { href: "/app", label: "Tổng quan", icon: Home },
  { href: "/app/links/new", label: "Tạo link", icon: Link2 },
  { href: "/app/orders", label: "Đơn hàng", icon: ClipboardList },
  { href: "/app/wallet", label: "Ví", icon: WalletCards },
  { href: "/app/account", label: "Tài khoản", icon: UserRound },
];

export function UserShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const signOut = async () => {
    await logout();
    router.replace("/login");
  };
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4">
          <Link
            href="/app"
            className="flex items-center gap-2 font-bold text-primary"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-white">
              <WalletCards className="size-5" />
            </span>
            <span>
              BuyBack{" "}
              <span className="hidden text-foreground sm:inline">NexoraVN</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition hover:bg-muted",
                  pathname === href ||
                    (href !== "/app" && pathname.startsWith(href))
                    ? "bg-secondary text-primary"
                    : "text-muted-foreground",
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <span className="hidden max-w-40 truncate text-xs text-muted-foreground lg:block">
              {user?.email}
            </span>
            <button
              onClick={signOut}
              className="hidden rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-primary md:block"
              aria-label="Đăng xuất"
            >
              <LogOut className="size-5" />
            </button>
            <button
              onClick={() => setOpen(!open)}
              className="rounded-xl p-2 hover:bg-muted md:hidden"
              aria-label="Mở menu"
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {open && (
          <div className="border-t bg-white p-3 md:hidden">
            {nav.map(({ href, label, icon: Icon }) => (
              <Link
                onClick={() => setOpen(false)}
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-muted"
              >
                <Icon className="size-5 text-primary" />
                {label}
              </Link>
            ))}
            <button
              onClick={signOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-danger hover:bg-danger-soft"
            >
              <LogOut className="size-5" />
              Đăng xuất
            </button>
          </div>
        )}
      </header>
      <main>{children}</main>
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t bg-white/95 px-1 pt-2 backdrop-blur md:hidden">
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || (href !== "/app" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-0 flex-col items-center gap-1 rounded-lg py-1 text-[10px] font-medium",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" />
              <span className="max-w-full truncate">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
