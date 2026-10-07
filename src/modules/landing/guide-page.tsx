import Image from "next/image";
import type { Locale } from "@/i18n/config";
import { guideContent } from "./guide-content";
import { siteIndexable } from "@/lib/seo/site";
import styles from "./guide.module.css";

export function GuidePage({ locale }: { locale: Locale }) {
  const t = guideContent[locale];
  const home = locale === "vi" ? "/" : "/en";
  const login = locale === "vi" ? "/login" : "/en/login";
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a href={home} className={styles.brand}>
          <Image src="/piggy-back-logo.webp" alt="" width={38} height={38} />
          Piggy Back
        </a>
        <a
          href={locale === "vi" ? "/en/huong-dan" : "/huong-dan"}
          hrefLang={locale === "vi" ? "en" : "vi"}
        >
          {locale === "vi" ? "English" : "Tiếng Việt"}
        </a>
      </header>
      <main className={styles.main}>
        <nav
          aria-label={locale === "vi" ? "Đường dẫn" : "Breadcrumb"}
          className={styles.breadcrumb}
        >
          <a href={home}>{t.home}</a>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{t.label}</span>
        </nav>
        <article>
          <h1>{t.heading}</h1>
          <p className={styles.intro}>{t.intro}</p>
          {!siteIndexable && <p className={styles.notice}>{t.notice}</p>}
          <nav aria-label={t.contents} className={styles.contents}>
            <strong>{t.contents}</strong>
            <a href="#create-link">{t.stepsHeading}</a>
            <a href="#estimated-cashback">{t.estimateHeading}</a>
            <a href="#check-order">{t.troubleshootingHeading}</a>
          </nav>
          <section aria-labelledby="create-link">
            <h2 id="create-link">{t.stepsHeading}</h2>
            {t.steps.map((step) => (
              <section key={step.title} className={styles.step}>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
                <p className={styles.note}>{step.note}</p>
              </section>
            ))}
          </section>
          <section aria-labelledby="estimated-cashback">
            <h2 id="estimated-cashback">{t.estimateHeading}</h2>
            <p>{t.estimate}</p>
            <p>{t.estimateNote}</p>
          </section>
          <section aria-labelledby="check-order">
            <h2 id="check-order">{t.troubleshootingHeading}</h2>
            <ul>
              {t.checks.map((check) => (
                <li key={check}>{check}</li>
              ))}
            </ul>
            <p>{t.checksNote}</p>
          </section>
          <section className={styles.next}>
            <h2>{t.nextHeading}</h2>
            <p>{t.next}</p>
            <a href={`${home}#faq`}>{t.faqLink}</a>
            <a href={login}>{t.login}</a>
          </section>
        </article>
      </main>
      <footer className={styles.footer}>
        <a href={home}>{t.back}</a>
      </footer>
    </div>
  );
}
