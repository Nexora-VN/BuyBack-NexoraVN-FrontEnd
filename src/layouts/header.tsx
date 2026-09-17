"use client";

import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import { useTranslations } from "next-intl";

import LanguageSwitcher from "@/components/locale/language-switcher";
import { Link } from "@/i18n/navigation";
import PageContainer from "@/layouts/page-container";

export default function Header() {
  const t = useTranslations("Navigation");

  return (
    <header className="border-border/80 bg-background/90 sticky top-0 z-50 border-b backdrop-blur-xl">
      <PageContainer className="flex h-16 items-center justify-between gap-6">
        <Link className="text-lg font-bold tracking-tight" href="/">
          Piggy<span className="text-primary">Back</span>
        </Link>

        <nav className="text-muted-foreground hidden items-center gap-7 text-sm md:flex">
          <Link className="hover:text-foreground transition-colors" href="/">
            {t("home")}
          </Link>
          <a className="hover:text-foreground transition-colors" href="#features">
            {t("features")}
          </a>
          <a className="hover:text-foreground transition-colors" href="#architecture">
            {t("architecture")}
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="border-border hover:bg-muted rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="bg-primary rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90">
                Sign Up
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </PageContainer>
    </header>
  );
}
