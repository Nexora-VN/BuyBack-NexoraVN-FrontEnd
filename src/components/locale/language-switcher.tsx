"use client";

import { Globe2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { languages, type Locale } from "@/i18n/config";
import { Link, usePathname } from "@/i18n/navigation";

export default function LanguageSwitcher() {
  const activeLocale = useLocale() as Locale;
  const pathname = usePathname();
  const t = useTranslations("Language");

  return (
    <div
      aria-label={t("label")}
      className="flex items-center gap-1 rounded-lg border border-border bg-background p-1"
    >
      <Globe2 aria-hidden="true" className="mx-1 size-4 text-muted-foreground" />
      {languages.map((language) => (
        <Button
          asChild
          key={language.locale}
          size="sm"
          variant={language.locale === activeLocale ? "default" : "ghost"}
        >
          <Link
            aria-current={
              language.locale === activeLocale ? "page" : undefined
            }
            href={pathname}
            hrefLang={language.locale}
            locale={language.locale}
            title={language.label}
          >
            {language.shortLabel}
          </Link>
        </Button>
      ))}
    </div>
  );
}
