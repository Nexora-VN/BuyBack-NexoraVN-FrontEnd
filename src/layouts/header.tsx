"use client";

import { useTranslations } from "next-intl";

import LanguageSwitcher from "@/components/locale/language-switcher";
import { Link } from "@/i18n/navigation";
import PageContainer from "@/layouts/page-container";

export default function Header() {
  const t = useTranslations("Navigation");

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-xl">
      <PageContainer className="flex h-16 items-center justify-between gap-6">
        <Link className="text-lg font-bold tracking-tight" href="/">
          Nexora<span className="text-primary">VN</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <Link className="transition-colors hover:text-foreground" href="/">
            {t("home")}
          </Link>
          <a className="transition-colors hover:text-foreground" href="#features">
            {t("features")}
          </a>
          <a
            className="transition-colors hover:text-foreground"
            href="#architecture"
          >
            {t("architecture")}
          </a>
        </nav>

        <LanguageSwitcher />
      </PageContainer>
    </header>
  );
}
