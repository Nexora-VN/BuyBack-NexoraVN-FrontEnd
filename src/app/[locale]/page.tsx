import { defaultLocale } from "@/i18n/config";
import { redirect } from "@/i18n/navigation";

export default function HomePage() {
  redirect({ href: "/login", locale: defaultLocale });
}
