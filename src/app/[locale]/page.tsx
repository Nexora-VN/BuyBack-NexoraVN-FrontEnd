import { ArrowRight, Braces, Languages, Network } from "lucide-react";
import { setRequestLocale, getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { isLocale } from "@/i18n/config";
import PageContainer from "@/layouts/page-container";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  if (isLocale(locale)) {
    setRequestLocale(locale);
  }

  const t = await getTranslations("Home");
  const features = [
    {
      icon: Languages,
      title: t("featureI18nTitle"),
      description: t("featureI18nDescription"),
    },
    {
      icon: Network,
      title: t("featureApiTitle"),
      description: t("featureApiDescription"),
    },
    {
      icon: Braces,
      title: t("featureUiTitle"),
      description: t("featureUiDescription"),
    },
  ];

  return (
    <>
      <section className="starter-grid overflow-hidden border-b border-border">
        <PageContainer className="grid min-h-[620px] items-center gap-12 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
              {t("eyebrow")}
            </div>
            <h1 className="text-balance text-5xl font-semibold tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              {t("title")}
            </h1>
            <p className="mt-7 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground sm:text-xl">
              {t("description")}
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href="#architecture">
                  {t("primaryAction")}
                  <ArrowRight aria-hidden="true" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="/api/health" target="_blank" rel="noreferrer">
                  {t("secondaryAction")}
                </a>
              </Button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-8 -z-10 rounded-full bg-primary/10 blur-3xl" />
            <div className="rounded-3xl border border-border bg-card p-3 shadow-2xl shadow-primary/10">
              <div className="rounded-2xl border border-border bg-neutral-950 p-5 text-neutral-100">
                <div className="mb-5 flex gap-2">
                  <span className="size-2.5 rounded-full bg-red-400" />
                  <span className="size-2.5 rounded-full bg-amber-400" />
                  <span className="size-2.5 rounded-full bg-emerald-400" />
                </div>
                <pre className="overflow-x-auto text-sm leading-7 text-neutral-300">
                  <code>{`src/
├── app/[locale]
├── components
├── modules
├── services
├── providers
└── lib/api`}</code>
                </pre>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      <section id="features" className="border-b border-border py-20 sm:py-24">
        <PageContainer>
          <p className="mb-8 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            {t("featuresLabel")}
          </p>
          <div className="grid gap-5 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-2xl border border-border bg-card p-7 transition-transform duration-200 hover:-translate-y-1"
              >
                <div className="mb-8 flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Icon aria-hidden="true" className="size-5" />
                </div>
                <h2 className="text-xl font-semibold">{title}</h2>
                <p className="mt-3 leading-7 text-muted-foreground">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section id="architecture" className="py-20 sm:py-28">
        <PageContainer>
          <div className="rounded-3xl bg-primary px-7 py-14 text-primary-foreground sm:px-12 lg:px-16">
            <h2 className="max-w-3xl text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
              {t("architectureTitle")}
            </h2>
            <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-primary-foreground/75">
              {t("architectureDescription")}
            </p>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
