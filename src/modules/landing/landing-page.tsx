import Image from "next/image";
import {
  ArrowDown,
  ArrowDownLeft,
  ArrowRight,
  Check,
  ChevronDown,
  CircleCheck,
  Link2,
  MousePointer2,
  ScanEye,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
} from "lucide-react";

import type { Locale } from "@/i18n/config";
import { landingContent } from "./content";
import { DevicePreview } from "./device-preview";
import styles from "./landing.module.css";

const sections = ["how-it-works", "why-piggy", "faq"];

function Brand() {
  return (
    <span className={styles.brand}>
      <Image src="/logo.png" alt="" width={42} height={42} />
      <span>
        Piggy<span>Back</span>
        <span className={styles.brandDot}>.</span>
      </span>
    </span>
  );
}

export function LandingPage({ locale }: { locale: Locale }) {
  const t = landingContent[locale];
  const login = locale === "en" ? "/en/login" : "/login";
  const home = locale === "en" ? "/en" : "/";
  const stepIcons = [Link2, MousePointer2, CircleCheck];
  const benefitIcons = [ScanEye, Smartphone, ShieldCheck];

  return (
    <div className={styles.landing}>
      <a className={styles.skip} href="#main-content">
        {t.skip}
      </a>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.headerInner}`}>
          <a href={home} aria-label="Piggy Back" className={styles.brandLink}>
            <Brand />
          </a>
          <nav
            className={styles.nav}
            aria-label={locale === "vi" ? "Điều hướng chính" : "Main navigation"}
          >
            {t.nav.map((label, i) => (
              <a key={label} href={`#${sections[i]}`}>
                {label}
              </a>
            ))}
          </nav>
          <div className={styles.headerActions}>
            <a
              className={styles.language}
              href={locale === "vi" ? "/en" : "/"}
              hrefLang={locale === "vi" ? "en" : "vi"}
              lang={locale === "vi" ? "en" : "vi"}
              aria-label={locale === "vi" ? "English" : "Tiếng Việt"}
            >
              {locale === "vi" ? "EN" : "VI"}
            </a>
            <a href={login} className={styles.headerLogin}>
              {t.login}
              <ArrowUpRightIcon />
            </a>
          </div>
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        <section className={`${styles.container} ${styles.hero}`} aria-labelledby="hero-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <span className={styles.liveDot} />
              {t.eyebrow}
            </p>
            <h1 id="hero-title">
              {t.headline[0]}
              <span>{t.headline[1]}</span>
            </h1>
            <p className={styles.heroDescription}>{t.intro}</p>
            <div className={styles.heroActions}>
              <a className={styles.primaryButton} href={login}>
                {t.start}
                <ArrowRight aria-hidden="true" size={19} />
              </a>
              <a className={styles.textButton} href="#how-it-works">
                {t.howLink}
                <ArrowDown aria-hidden="true" size={17} />
              </a>
            </div>
            <p className={styles.heroNote}>
              <ShieldCheck aria-hidden="true" size={17} />
              {t.heroNote}
            </p>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.heroHalo} />
            <div className={styles.orbit} aria-hidden="true" />
            <Sparkles className={styles.sparkle} aria-hidden="true" strokeWidth={1.5} />
            <div className={styles.littleNote}>
              {t.little[0]}
              <br />
              <strong>{t.little[1]}</strong>
              <ArrowDownLeft aria-hidden="true" size={28} />
            </div>
            <Image
              className={styles.mascot}
              src="/logo_full.png"
              alt={t.mascotAlt}
              width={560}
              height={560}
              sizes="(max-width: 767px) 90vw, 520px"
              preload
            />
            <div className={styles.previewCard}>
              <span className={styles.previewLabel}>{t.preview}</span>
              <div className={styles.previewTitle}>
                <span className={styles.linkIcon}>
                  <Link2 size={19} aria-hidden="true" />
                </span>
                <strong>{t.paste}</strong>
                <span className={styles.roundArrow}>
                  <ArrowRight size={17} aria-hidden="true" />
                </span>
              </div>
              <div className={styles.previewInput}>
                <ShoppingBag size={16} aria-hidden="true" />
                <span>{t.previewLink}</span>
                <Check size={15} aria-hidden="true" />
              </div>
              <p>
                <CircleCheck size={14} aria-hidden="true" />
                {t.previewResult}
              </p>
            </div>
            <span className={styles.flower} aria-hidden="true">
              ✳
            </span>
          </div>
        </section>

        <div className={`${styles.container} ${styles.marketplace}`}>
          <div>
            <p className={styles.smallLabel}>{t.platformLabel}</p>
            <div className={styles.shopee}>
              <ShoppingBag aria-hidden="true" size={27} strokeWidth={1.5} />
              Shopee
            </div>
          </div>
          <div className={styles.platformCopy}>
            <p>{t.platformNote}</p>
            <span>{t.platformSub}</span>
          </div>
          <ArrowDown className={styles.platformArrow} aria-hidden="true" size={22} />
        </div>

        <DevicePreview locale={locale} />

        <section
          id="how-it-works"
          className={`${styles.container} ${styles.section}`}
          aria-labelledby="steps-title"
        >
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>{t.stepsLabel}</p>
              <h2 id="steps-title">{t.stepsTitle}</h2>
            </div>
            <p className={styles.sectionIntro}>{t.stepsIntro}</p>
          </div>
          <ol className={styles.steps}>
            {t.steps.map((step, i) => {
              const Icon = stepIcons[i];
              return (
                <li key={step.title} className={styles.step}>
                  <div className={styles.stepTop}>
                    <span className={styles.stepNumber}>0{i + 1}</span>
                    <Icon aria-hidden="true" size={25} strokeWidth={1.5} />
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                  <span className={styles.stepTag}>
                    {step.tag}
                    <ArrowRight size={14} aria-hidden="true" />
                  </span>
                </li>
              );
            })}
          </ol>
        </section>

        <section id="why-piggy" className={styles.benefitSection} aria-labelledby="benefits-title">
          <div className={`${styles.container} ${styles.benefitGrid}`}>
            <div className={styles.transparency}>
              <p className={styles.smallLabel}>{t.transparencyLabel}</p>
              <h3>{t.transparencyTitle}</h3>
              <p className={styles.transparencyText}>{t.transparencyText}</p>
              <ol className={styles.flow}>
                {t.flow.map((item, i) => (
                  <li key={item}>
                    <span>{i === 2 ? <Check aria-hidden="true" size={16} /> : i + 1}</span>
                    {item}
                  </li>
                ))}
              </ol>
              <p className={styles.transparencyNote}>{t.transparencyNote}</p>
            </div>
            <div className={styles.benefitCopy}>
              <p className={styles.eyebrow}>{t.benefitsLabel}</p>
              <h2 id="benefits-title">{t.benefitsTitle}</h2>
              <p className={styles.sectionIntro}>{t.benefitsIntro}</p>
              <div className={styles.benefitList}>
                {t.benefits.map((benefit, i) => {
                  const Icon = benefitIcons[i];
                  return (
                    <div key={benefit.title} className={styles.benefit}>
                      <span className={styles.benefitIcon}>
                        <Icon size={23} aria-hidden="true" strokeWidth={1.5} />
                      </span>
                      <div>
                        <h3>{benefit.title}</h3>
                        <p>{benefit.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section
          id="faq"
          className={`${styles.container} ${styles.section} ${styles.faq}`}
          aria-labelledby="faq-title"
        >
          <div className={styles.faqHeading}>
            <p className={styles.eyebrow}>{t.faqLabel}</p>
            <h2 id="faq-title">{t.faqTitle}</h2>
            <p className={styles.sectionIntro}>{t.faqIntro}</p>
            <span className={styles.faqMark} aria-hidden="true">
              ?
            </span>
          </div>
          <div className={styles.questions}>
            {t.faqs.map((faq, i) => (
              <details key={faq.question} className={styles.question} open={i === 0}>
                <summary>
                  {faq.question}
                  <ChevronDown size={20} aria-hidden="true" />
                </summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className={`${styles.container} ${styles.cta}`} aria-labelledby="cta-title">
          <div className={styles.ctaCopy}>
            <p className={styles.eyebrow}>{t.ctaLabel}</p>
            <h2 id="cta-title">{t.ctaTitle}</h2>
            <p>{t.ctaText}</p>
            <a href={login} className={styles.creamButton}>
              {t.start}
              <ArrowRight size={20} aria-hidden="true" />
            </a>
          </div>
          <div className={styles.ctaArt} aria-hidden="true">
            <div />
            <Image
              src="/logo_full.png"
              alt=""
              width={380}
              height={380}
              sizes="(max-width: 767px) 200px, 380px"
            />
          </div>
        </section>
      </main>

      <footer className={`${styles.container} ${styles.footer}`}>
        <div className={styles.footerTop}>
          <div>
            <a href={home} aria-label="Piggy Back">
              <Brand />
            </a>
            <p>{t.footerText}</p>
          </div>
          <nav aria-label={locale === "vi" ? "Liên kết cuối trang" : "Footer navigation"}>
            {t.nav.map((label, i) => (
              <a key={label} href={`#${sections[i]}`}>
                {label}
              </a>
            ))}
            <a href={login}>
              {t.login}
              <ArrowRight size={14} aria-hidden="true" />
            </a>
          </nav>
        </div>
        <div className={styles.footerBottom}>
          <p>{t.footerNote}</p>
          <span>
            © {new Date().getFullYear()} {t.footerCopyright}
          </span>
        </div>
      </footer>
    </div>
  );
}

function ArrowUpRightIcon() {
  return <ArrowRight size={15} aria-hidden="true" className={styles.diagonalArrow} />;
}
