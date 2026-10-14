import Link from "next/link";
import Image from "next/image";
import { siteIndexable } from "@/lib/seo/site";
import { findResource, type ResourcePage } from "./pages";
import { PublicLinks } from "./public-links";
import { AnalyticsPreference } from "@/components/analytics-preference";
import type { ResourceImage } from "./pages";
import styles from "@/modules/landing/guide.module.css";

function ContentImage({ image, compact = false }: { image: ResourceImage; compact?: boolean }) {
  const brandIllustration = image.src === "/piggy-back-shopping-cashback.webp";
  return (
    <figure
      className={
        compact
          ? styles.brandFigure
          : brandIllustration
            ? styles.illustrationFigure
            : styles.contentFigure
      }
    >
      <a
        href={image.src}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Mở ảnh gốc: ${image.alt}`}
      >
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes={
            compact
              ? "(max-width: 640px) 120px, 160px"
              : brandIllustration
                ? "320px"
                : "(max-width: 800px) 100vw, 720px"
          }
          className={styles.contentImage}
        />
      </a>
      <figcaption>{image.caption}</figcaption>
    </figure>
  );
}

export function ResourceView({ page }: { page: ResourcePage }) {
  return (
    <div className={styles.page}>
      <a className={styles.skip} href="#main-content">
        Đến nội dung chính
      </a>
      <header className={styles.header}>
        <Link prefetch={false} href="/" className={styles.brand}>
          <Image src="/piggy-back-logo.webp" alt="" width={38} height={38} />
          Piggy Back
        </Link>
        <Link prefetch={false} href="/huong-dan">
          Hướng dẫn mua sắm
        </Link>
      </header>
      <main id="main-content" className={styles.main}>
        <nav aria-label="Đường dẫn" className={styles.breadcrumb}>
          <Link prefetch={false} href="/">
            Trang chủ
          </Link>
          <span aria-hidden="true">/</span>
          {page.kind === "article" && (
            <>
              <Link prefetch={false} href="/kien-thuc">
                Kiến thức
              </Link>
              <span aria-hidden="true">/</span>
            </>
          )}
          <span aria-current="page">{page.heading}</span>
        </nav>
        <article>
          <h1>{page.heading}</h1>
          <p className={styles.intro}>{page.intro}</p>
          {page.image && (
            <ContentImage
              image={page.image}
              compact={page.path === "/dieu-khoan" || page.path === "/bao-mat"}
            />
          )}
          {!siteIndexable && (
            <p className={styles.notice}>
              Piggy Back đang hoàn thiện, chưa ra mắt chính thức. Thông tin và hướng dẫn được chuẩn
              bị cho dịch vụ khi ra mắt.
            </p>
          )}
          {page.sections.length > 0 && (
            <nav aria-label="Mục lục" className={styles.contents}>
              <strong>Trong trang này</strong>
              {page.sections.map((section) => (
                <a key={section.id} href={`#${section.id}`}>
                  {section.title}
                </a>
              ))}
            </nav>
          )}
          {page.sections.map((section) => (
            <section key={section.id} aria-labelledby={section.id}>
              <h2 id={section.id}>{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.items.length > 0 && (
                <ul>
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {section.image && <ContentImage image={section.image} />}
              {page.path === "/bao-mat" && section.id === "phan-3" && (
                <AnalyticsPreference
                  measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? ""}
                />
              )}
            </section>
          ))}
          {page.kind === "contact" && (
            <p>
              <a href="mailto:theanh.nguyen2039@gmail.com">Gửi email hỗ trợ</a>
            </p>
          )}
          <section className={styles.next} aria-labelledby="read-next">
            <h2 id="read-next">
              {page.kind === "collection" ? "Hướng dẫn và giải đáp" : "Đọc tiếp"}
            </h2>
            {page.related.map((path) => (
              <a key={path} href={path}>
                {findResource(path)?.heading ?? "Hướng dẫn tạo liên kết hoàn tiền Shopee"}
              </a>
            ))}
            <Link prefetch={false} href="/login">
              Đăng nhập Piggy Back
            </Link>
          </section>
        </article>
      </main>
      <footer className={styles.footer}>
        <PublicLinks locale="vi" />
      </footer>
    </div>
  );
}
