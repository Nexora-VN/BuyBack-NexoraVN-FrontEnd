"use client";

import { useEffect, useState } from "react";
import { BellRing, ShieldCheck, Wallet, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SurfaceDialog } from "@/components/patterns/surface-dialog";
import { useCopy } from "@/i18n/use-copy";
import { useAuth } from "@/modules/auth/components/auth-provider";
import {
  isPushNotificationSupported,
  requestNotificationPermissionAndRegisterToken,
} from "@/lib/firebase/messaging";
import { toast } from "sonner";

const PROMPT_DISMISSED_KEY = "piggy_push_prompt_dismissed_at";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function NotificationPermissionPrompt() {
  const t = useCopy();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only run for authenticated users
    if (!user) return;

    // Check support and current permission
    void (async () => {
      const supported = await isPushNotificationSupported();
      if (!supported) return;

      // If already granted, ensure token is registered silently
      if (Notification.permission === "granted") {
        void requestNotificationPermissionAndRegisterToken();
        return;
      }

      // If already denied, browser won't allow prompting
      if (Notification.permission !== "default") {
        return;
      }

      // Check dismiss cooldown
      try {
        const lastDismissed = localStorage.getItem(PROMPT_DISMISSED_KEY);
        if (lastDismissed) {
          const timestamp = parseInt(lastDismissed, 10);
          if (Date.now() - timestamp < SEVEN_DAYS_MS) {
            return;
          }
        }
      } catch {
        // Ignore localStorage error
      }

      // Show prompt slightly after load for smooth UX
      const timer = setTimeout(() => {
        setOpen(true);
      }, 1000);

      return () => clearTimeout(timer);
    })();
  }, [user]);

  const handleDismiss = () => {
    setOpen(false);
    try {
      localStorage.setItem(PROMPT_DISMISSED_KEY, Date.now().toString());
    } catch {
      // Ignore
    }
  };

  const handleEnable = async () => {
    setLoading(true);
    try {
      const token = await requestNotificationPermissionAndRegisterToken();
      if (token) {
        toast.success(t("Đã bật thông báo thành công!"));
        setOpen(false);
      } else if (Notification.permission === "denied") {
        toast.error(
          t("Bạn đã từ chối quyền thông báo. Vui lòng mở cài đặt trình duyệt để cấp lại."),
        );
        setOpen(false);
      } else {
        setOpen(false);
      }
    } catch {
      toast.error(t("Không thể kích hoạt thông báo. Vui lòng thử lại."));
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <SurfaceDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) handleDismiss();
      }}
      title="Bật thông báo đẩy"
      busy={loading}
    >
      <div className="flex flex-col gap-4 text-center sm:text-left">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
          <div className="bg-primary/10 text-primary flex size-14 shrink-0 items-center justify-center rounded-2xl">
            <BellRing className="size-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold">
              {t("Đừng bỏ lỡ cập nhật hoàn tiền & số dư")}
            </h3>
            <p className="text-muted-foreground text-sm">
              {t("Nhận thông báo tức thì ngay trên thiết bị của bạn khi có biến động giao dịch.")}
            </p>
          </div>
        </div>

        <div className="bg-muted/50 space-y-2.5 rounded-xl p-3.5 text-left text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="size-4 shrink-0 text-emerald-600" />
            <span>{t("Khớp đơn hàng và ghi nhận hoàn tiền tự động")}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Wallet className="size-4 shrink-0 text-blue-600" />
            <span>{t("Cập nhật khi tiền về ví và tiến độ rút tiền thành công")}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="size-4 shrink-0 text-amber-600" />
            <span>{t("Thông báo chính sách, khuyến mại và điều chỉnh từ Admin")}</span>
          </div>
        </div>

        <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" disabled={loading} onClick={handleDismiss}>
            {t("Để sau")}
          </Button>
          <Button
            type="button"
            variant="default"
            disabled={loading}
            onClick={handleEnable}
            className="font-medium"
          >
            {loading ? t("Đang kích hoạt...") : t("Bật thông báo ngay")}
          </Button>
        </div>
      </div>
    </SurfaceDialog>
  );
}
