"use client";
import LanguageSwitcher from "@/components/locale/language-switcher";
import { ConfirmProvider } from "@/components/patterns/confirm-provider";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useCopy } from "@/i18n/use-copy";
import { cn } from "@/lib/utils";
import { useAuth } from "@/modules/auth/components/auth-provider";
import { ClipboardList, Home, Link2, LogOut, UserRound, WalletCards } from "lucide-react";
const nav = [
  { href: "/app", label: "Trang chủ", icon: Home },
  { href: "/app/orders", label: "Đơn hàng", icon: ClipboardList },
  { href: "/app/wallet", label: "Ví", icon: WalletCards },
  { href: "/app/account", label: "Tài khoản", icon: UserRound },
];
export function userNavActive(path: string, href: string) {
  if (href === "/app") return path === "/app" || path.startsWith("/app/links");
  if (href === "/app/wallet")
    return ["/app/wallet", "/app/cashback", "/app/withdrawals"].some((route) =>
      path.startsWith(route),
    );
  return path.startsWith(href);
}
export function UserShell({ children }: { children: React.ReactNode }) {
  const t = useCopy();
  const path = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  return (
    <ConfirmProvider>
      <div className="bg-background min-h-dvh">
        <header className="bg-card sticky top-0 z-30 border-b">
          <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-4 lg:px-8">
            <Link href="/app" className="flex shrink-0 items-center gap-2 font-bold">
              <span className="bg-primary grid size-9 place-items-center rounded-xl text-white">
                <WalletCards className="size-5" />
              </span>
              <span className="text-primary">
                BuyBack <span className="text-foreground hidden sm:inline">NexoraVN</span>
              </span>
            </Link>
            <nav aria-label={t("Điều hướng chính")} className="hidden items-center gap-1 lg:flex">
              {nav.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={userNavActive(path, href) ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium",
                    userNavActive(path, href)
                      ? "bg-secondary text-primary"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="size-4" />
                  {t(label)}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <Link
                href="/app/links/new"
                aria-label={t("Tạo link")}
                className="bg-secondary text-primary grid size-11 place-items-center rounded-xl"
              >
                <Link2 className="size-5" />
              </Link>
              <span className="text-muted-foreground hidden max-w-36 truncate text-xs xl:block">
                {user?.email}
              </span>
              <div className="hidden lg:block">
                <LanguageSwitcher />
              </div>
              <button
                className="hover:bg-muted hidden size-11 place-items-center rounded-xl lg:grid"
                aria-label={t("Đăng xuất")}
                onClick={async () => {
                  await logout();
                  router.replace("/login");
                }}
              >
                <LogOut className="size-5" />
              </button>
            </div>
          </div>
        </header>
        <main id="main-content">{children}</main>
        <nav className="app-bottom-nav grid grid-cols-4" aria-label={t("Điều hướng chính")}>
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={userNavActive(path, href) ? "page" : undefined}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-xs font-medium",
                userNavActive(path, href) ? "bg-secondary text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" />
              {t(label)}
            </Link>
          ))}
        </nav>
      </div>
    </ConfirmProvider>
  );
}
