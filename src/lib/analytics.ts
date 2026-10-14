import baseRoutes from "@/lib/seo/public-routes.json";

export const consentKey = "piggy.analytics-consent.v1";
export const consentEvent = "piggy:analytics-consent";
export type AnalyticsChoice = "granted" | "denied" | null;
type AnalyticsEvent = "sign_up" | "generate_cashback_link" | "outbound_shopee_click";
type Source = "email" | "link_form" | "product_page";
type Gtag = (...args: unknown[]) => void;
type AnalyticsWindow = Window & { dataLayer?: unknown[]; gtag?: Gtag };
let initializedId = "";
let lastPage = "";
let memoryChoice: AnalyticsChoice = null;

export function readAnalyticsChoice(): AnalyticsChoice {
  if (typeof window === "undefined") return null;
  try {
    const value = localStorage.getItem(consentKey);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return memoryChoice;
  }
}
export function saveAnalyticsChoice(choice: Exclude<AnalyticsChoice, null>) {
  memoryChoice = choice;
  try {
    localStorage.setItem(consentKey, choice);
  } catch {
    /* Keep this tab's choice when storage is unavailable. */
  }
  if (choice === "denied") suspendAnalytics(true);
  window.dispatchEvent(new Event(consentEvent));
}

export function suspendAnalytics(clearCookies = false) {
  if (initializedId) {
    (window as unknown as Record<string, unknown>)[`ga-disable-${initializedId}`] = true;
    lastPage = "";
  }
  if (clearCookies) {
    // Remove first-party Analytics cookies, including parent-domain cookies.
    for (const item of document.cookie.split(";")) {
      const name = item.trim().split("=")[0];
      if (name !== "_ga" && !name.startsWith("_ga_")) continue;
      for (const domain of ["", location.hostname, ".piggyback.vn"]) {
        document.cookie = `${name}=; Max-Age=0; Path=/;${domain ? ` Domain=${domain};` : ""} SameSite=Lax`;
      }
    }
  }
}

// Only send known routes: never raw search/hash, product/order IDs or reset tokens.
export function analyticsPath(pathname: string): string | null {
  const clean = pathname.replace(/^\/en(?=\/|$)/, "") || "/";
  if (clean === "/admin" || clean.startsWith("/admin/")) return null;
  const publicPage = baseRoutes.find((page) => page.path === clean);
  if (publicPage) {
    const locale = pathname === "/en" || pathname.startsWith("/en/") ? "en" : "vi";
    return publicPage.locales.includes(locale) ? pathname : null;
  }
  if (
    [
      "/login",
      "/sign-up",
      "/forgot-password",
      "/app",
      "/app/links",
      "/app/links/new",
      "/app/orders",
      "/app/wallet",
      "/app/account",
      "/app/withdrawals",
      "/app/withdrawals/new",
    ].includes(clean)
  )
    return clean;
  if (/^\/app\/products\/[^/]+$/.test(clean)) return "/app/products/detail";
  if (/^\/app\/orders\/[^/]+$/.test(clean)) return "/app/orders/detail";
  return null;
}
function safeReferrer() {
  try {
    return new URL(document.referrer).origin + "/";
  } catch {
    return "";
  }
}
function gtag() {
  return (window as AnalyticsWindow).gtag;
}

export function initializeAnalytics(id: string) {
  if (!/^G-[A-Z0-9]+$/.test(id) || readAnalyticsChoice() !== "granted") return;
  (window as unknown as Record<string, unknown>)[`ga-disable-${id}`] = false;
  if (initializedId) return;
  const target = window as AnalyticsWindow;
  target.dataLayer = target.dataLayer || [];
  target.gtag = function () {
    // Google gtag commands use an Arguments object in the dataLayer queue.
    // eslint-disable-next-line prefer-rest-params
    target.dataLayer!.push(arguments);
  };
  target.gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  target.gtag("js", new Date());
  const path = analyticsPath(location.pathname) || "/";
  target.gtag("config", id, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    page_location: `https://piggyback.vn${path}`,
    page_referrer: safeReferrer(),
    page_title: "Piggy Back",
  });
  initializedId = id;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  script.id = "piggy-google-analytics";
  document.head.appendChild(script);
}
export function trackPage(pathname: string) {
  const path = analyticsPath(pathname);
  if (!path || path === lastPage || !initializedId || readAnalyticsChoice() !== "granted") return;
  lastPage = path;
  const page = {
    page_location: `https://piggyback.vn${path}`,
    page_title: "Piggy Back",
    page_referrer: safeReferrer(),
  };
  gtag()?.("set", page);
  gtag()?.("event", "page_view", page);
}
export function trackConversion(name: AnalyticsEvent, source: Source) {
  if (
    typeof window === "undefined" ||
    !initializedId ||
    readAnalyticsChoice() !== "granted" ||
    !analyticsPath(location.pathname)
  )
    return;
  const page_location = `https://piggyback.vn${analyticsPath(location.pathname)}`;
  gtag()?.("event", name, {
    ...(name === "sign_up" ? { method: source } : { source }),
    page_location,
    page_title: "Piggy Back",
  });
}
