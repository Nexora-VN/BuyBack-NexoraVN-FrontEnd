import type { Locale } from "@/i18n/config";

export function PublicLinks({ locale }: { locale: Locale }) {
  const english = locale === "en";
  const links = [
    ["/kien-thuc", "Kiến thức hoàn tiền", "Cashback guides"],
    ["/gioi-thieu", "Về Piggy Back", "About Piggy Back"],
    ["/lien-he", "Liên hệ hỗ trợ", "Contact support"],
    ["/chinh-sach-hoan-tien", "Chính sách hoàn tiền", "Cashback policy"],
    ["/dieu-khoan", "Điều khoản", "Terms"],
    ["/bao-mat", "Quyền riêng tư", "Privacy"],
  ];
  return (
    <nav
      aria-label={english ? "Information and support" : "Thông tin và hỗ trợ"}
      style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px 24px" }}
    >
      {links.map(([href, vi, en]) => (
        <a key={href} href={href} hrefLang="vi">
          {english ? `${en} (Vietnamese)` : vi}
        </a>
      ))}
    </nav>
  );
}
