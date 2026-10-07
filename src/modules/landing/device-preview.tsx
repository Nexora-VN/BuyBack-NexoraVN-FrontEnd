import Image from "next/image";
import {
  ArrowRight,
  BatteryFull,
  Bell,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Copy,
  Headphones,
  Home,
  Link2,
  LockKeyhole,
  ShoppingBag,
  Signal,
  UserRound,
  WalletCards,
  Wifi,
} from "lucide-react";

import type { Locale } from "@/i18n/config";
import styles from "./device-preview.module.css";

const copy = {
  vi: {
    eyebrow: "KHÁM PHÁ PIGGY BACK",
    title: "Từ món đồ bạn thích\nđến khoản hoàn trong ví.",
    description:
      "Tạo link mua sắm, theo dõi từng đơn hàng và quản lý tiền hoàn — có Piggy đồng hành ở mỗi bước.",
    caption: "Giao diện minh họa, sử dụng dữ liệu mẫu.",
    phoneAlt: "Minh họa tạo liên kết mua sắm và xem tiền hoàn dự kiến cùng Piggy Back",
    laptopAlt: "Minh họa theo dõi đơn hàng và quản lý tiền hoàn cùng Piggy Back",
    sample: "Dữ liệu minh họa",
    navigation: ["Trang chủ", "Đơn hàng", "Ví", "Tài khoản"],
    welcome: "Chào bạn,",
    heading: "Tiền hoàn của bạn",
    subtitle: "Theo dõi từng đơn, rõ ràng từng khoản.",
    shoppingHeading: "Món này hoàn bao nhiêu?",
    shoppingSubtitle: "Dán link, xem trước rồi mua sắm nhé.",
    estimate: "Tiền hoàn dự kiến",
    estimatedNote: "Mức hoàn minh họa cho sản phẩm mẫu",
    linkTitle: "Dán link sản phẩm Shopee",
    paste: "Dán link món bạn thích vào đây",
    create: "Mua sắm ngay",
    linkNote: "Tạo link trước khi mua để ghi nhận hoàn tiền.",
    available: "Bạn có thể rút",
    pending: "Chờ xác nhận",
    reserved: "Đang giữ cho yêu cầu rút",
    withdraw: "Rút tiền",
    orders: "Đơn hàng gần đây",
    all: "Xem tất cả",
    products: ["Túi tote canvas", "Tai nghe không dây"],
    confirmed: "Đã xác nhận",
    greeting: "Theo dõi từng bước hoàn tiền",
    features: ["Tạo link mua sắm", "Theo dõi đơn hàng", "Quản lý tiền hoàn"],
  },
  en: {
    eyebrow: "EXPLORE PIGGY BACK",
    title: "From your favourite finds\nto cashback in your wallet.",
    description:
      "Create shopping links, follow your orders and manage your cashback — with Piggy at every step.",
    caption: "Illustrative interface with sample data.",
    phoneAlt: "Preview of creating a shopping link and checking estimated cashback with Piggy Back",
    laptopAlt: "Preview of tracking orders and managing cashback with Piggy Back",
    sample: "Sample data",
    navigation: ["Home", "Orders", "Wallet", "Account"],
    welcome: "Hello there,",
    heading: "Your cashback at a glance",
    subtitle: "Follow every order. Understand every amount.",
    shoppingHeading: "A little back on this find?",
    shoppingSubtitle: "Paste a link, take a look, then shop.",
    estimate: "Estimated cashback",
    estimatedNote: "Illustrative cashback for a sample product",
    linkTitle: "Paste a Shopee product link",
    paste: "Paste a link to something you love",
    create: "Shop now",
    linkNote: "Create your link before shopping to track cashback.",
    available: "Available to withdraw",
    pending: "Awaiting confirmation",
    reserved: "Reserved for withdrawal",
    withdraw: "Withdraw",
    orders: "Recent orders",
    all: "View all",
    products: ["Canvas tote bag", "Wireless headphones"],
    confirmed: "Confirmed",
    greeting: "Follow every step of your cashback",
    features: ["Create shopping links", "Track orders", "Manage cashback"],
  },
};

const navigationIcons = [Home, ClipboardList, WalletCards, UserRound];

// Static presentation only: no session, financial API calls or pretend form controls.
function AppPreview({ locale, mobile = false }: { locale: Locale; mobile?: boolean }) {
  const t = copy[locale];
  return (
    <div className={`${styles.app} ${mobile ? styles.mobileApp : styles.desktopApp}`}>
      <div className={styles.appHeader}>
        <div className={styles.appBrand}>
          <Image src="/piggy-back-logo.webp" alt="" width={28} height={28} />
          <b>
            Piggy<span>Back</span>
          </b>
        </div>
        {!mobile && (
          <div className={styles.appNav}>
            {t.navigation.map((label, i) => {
              const Icon = navigationIcons[i];
              return (
                <span key={label} className={i === 0 ? styles.selected : undefined}>
                  <Icon />
                  {label}
                </span>
              );
            })}
          </div>
        )}
        <span className={styles.avatar}>
          <UserRound />
        </span>
      </div>
      <div className={styles.appBody}>
        <div className={styles.greeting}>
          <div>
            <span>{t.welcome}</span>
            <strong>{mobile ? t.shoppingHeading : t.heading}</strong>
            <p>{mobile ? t.shoppingSubtitle : t.subtitle}</p>
          </div>
          <span className={styles.sample}>{t.sample}</span>
        </div>
        {mobile ? (
          <>
            <div className={styles.linkPanel}>
              <div className={styles.linkHeading}>
                <span>
                  <Link2 />
                </span>
                <strong>{t.linkTitle}</strong>
              </div>
              <div className={styles.linkForm}>
                <div className={styles.linkInput}>
                  <span>{t.paste}</span>
                  <Copy />
                </div>
              </div>
              <p>{t.linkNote}</p>
            </div>
            <div className={styles.productResult}>
              <div className={styles.productVisual}>
                <ShoppingBag />
                <span>SHOPEE</span>
              </div>
              <div className={styles.productDetails}>
                <strong>{t.products[0]}</strong>
                <span className={styles.productPrice}>199.000đ</span>
                <div className={styles.estimate}>
                  <span>{t.estimate}</span>
                  <strong>12.000đ</strong>
                </div>
                <p>{t.estimatedNote}</p>
                <span className={styles.mockButton}>
                  {t.create}
                  <ArrowRight />
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className={styles.balances}>
              <div className={styles.available}>
                <span>{t.available}</span>
                <strong>
                  128.000<span>đ</span>
                </strong>
                <span className={styles.withdraw}>
                  {t.withdraw}
                  <ArrowRight />
                </span>
              </div>
              <div className={styles.pending}>
                <span>{t.pending}</span>
                <strong>
                  32.500<span>đ</span>
                </strong>
                <span className={styles.balanceNote}>Cashback</span>
              </div>
              {!mobile && (
                <div>
                  <span>{t.reserved}</span>
                  <strong>
                    0<span>đ</span>
                  </strong>
                  <span className={styles.balanceNote}>Piggy Back</span>
                </div>
              )}
            </div>
            <div className={styles.orderHeading}>
              <strong>{t.orders}</strong>
              <span>
                {t.all}
                <ArrowRight />
              </span>
            </div>
            <div className={styles.orders}>
              {t.products.map((product, i) => {
                const Icon = i === 0 ? ShoppingBag : Headphones;
                return (
                  <div key={product} className={styles.order}>
                    <span className={styles.productIcon}>
                      <Icon />
                    </span>
                    <div>
                      <span className={styles.platform}>SHOPEE</span>
                      <strong>{product}</strong>
                      <span className={styles.orderMeta}>#{i === 0 ? "PG00128" : "PG00127"}</span>
                    </div>
                    <div className={styles.orderStatus}>
                      <strong>+{i === 0 ? "12.000" : "8.500"}đ</strong>
                      <span>{t.confirmed}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
      {mobile && (
        <div className={styles.bottomNav}>
          {t.navigation.map((label, i) => {
            const Icon = navigationIcons[i];
            return (
              <span key={label} className={i === 0 ? styles.selected : undefined}>
                <Icon />
                {label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DevicePreview({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return (
    <section id="product-preview" className={styles.preview} aria-labelledby="device-preview-title">
      <div className={styles.heading}>
        <p>{t.eyebrow}</p>
        <h2 id="device-preview-title">{t.title}</h2>
        <p>{t.description}</p>
      </div>
      <figure className={styles.figure}>
        <div className={styles.stage}>
          <div className={styles.backdrop} aria-hidden="true" />
          <div className={styles.laptop} role="img" aria-label={t.laptopAlt}>
            <div aria-hidden="true">
              <div className={styles.laptopLid}>
                <span className={styles.camera} />
                <div className={styles.laptopScreen}>
                  <div className={styles.browserBar}>
                    <span className={styles.windowDots}>
                      <i />
                      <i />
                      <i />
                    </span>
                    <span className={styles.browserArrows}>
                      <ChevronLeft />
                      <ChevronRight />
                    </span>
                    <span className={styles.addressBar}>
                      <LockKeyhole />
                      Piggy Back
                    </span>
                    <span className={styles.browserAdd}>+</span>
                  </div>
                  <AppPreview locale={locale} />
                </div>
              </div>
              <div className={styles.laptopBase}>
                <span />
              </div>
              <div className={styles.laptopFoot} />
            </div>
          </div>
          <div className={styles.phone} role="img" aria-label={t.phoneAlt}>
            <div aria-hidden="true" className={styles.phoneFrame}>
              <div className={styles.phoneScreen}>
                <div className={styles.statusBar}>
                  <span>9:41</span>
                  <span className={styles.island} />
                  <span className={styles.statusIcons}>
                    <Signal />
                    <Wifi />
                    <BatteryFull />
                  </span>
                </div>
                <AppPreview locale={locale} mobile />
                <div className={styles.homeIndicator} />
              </div>
            </div>
          </div>
          <div className={styles.deviceNote} aria-hidden="true">
            <span>
              <Bell />
            </span>
            <div>
              <strong>Piggy Back</strong>
              <span>{t.greeting}</span>
            </div>
          </div>
        </div>
        <figcaption className={styles.caption}>
          <span className={styles.featureLabels}>
            {t.features.map((feature) => (
              <span key={feature}>{feature}</span>
            ))}
          </span>
          <p>{t.caption}</p>
        </figcaption>
      </figure>
    </section>
  );
}
