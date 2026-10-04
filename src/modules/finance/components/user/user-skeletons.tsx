"use client";

import { Card } from "@/components/ui/card";
import { Page } from "@/components/ui/page";
import { SkeletonBlock } from "@/components/ui/skeleton";
import { useCopy } from "@/i18n/use-copy";

export function UserWalletSkeleton({ showAction = true }: { showAction?: boolean }) {
  const t = useCopy();
  return (
    <Card role="status" aria-label={t("Đang tải")} className="user-wallet-card">
      <div className="flex items-center gap-3">
        <SkeletonBlock className="size-12 shrink-0 rounded-2xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonBlock className="h-3 w-28" />
          <SkeletonBlock className="h-7 w-36 max-w-full" />
        </div>
        {showAction && <SkeletonBlock className="h-11 w-20" />}
      </div>
      <div className="mt-5 border-t border-[#f6e9ee] pt-4">
        <SkeletonBlock className="h-3.5 w-52 max-w-full" />
        {!showAction && <SkeletonBlock className="mt-3 h-3.5 w-44 max-w-full" />}
      </div>
    </Card>
  );
}

export function UserRecentOrdersSkeleton() {
  const t = useCopy();
  return (
    <div role="status" aria-label={t("Đang tải")} className="user-recent-list">
      <div className="user-recent-head">
        <SkeletonBlock className="h-3 w-24" />
        <SkeletonBlock className="h-3 w-16" />
        <SkeletonBlock className="h-3 w-20" />
        <SkeletonBlock className="h-3 w-20" />
      </div>
      {[0, 1].map((row) => (
        <div
          key={row}
          className="user-recent-row flex items-center gap-3 border-b p-4 last:border-0 sm:px-6"
        >
          <div className="flex min-w-0 items-center gap-3">
            <SkeletonBlock className="size-14 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className="h-3.5 w-3/4" />
              <SkeletonBlock className="h-3 w-1/2" />
            </div>
          </div>
          <SkeletonBlock className="user-recent-price h-3 w-20" />
          <SkeletonBlock className="user-recent-cashback h-3 w-20" />
          <SkeletonBlock className="h-6 w-20 shrink-0 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function UserListSkeleton({ mobileRows = 3 }: { mobileRows?: number }) {
  const t = useCopy();
  return (
    <div role="status" aria-label={t("Đang tải")}>
      <div className="space-y-3 lg:hidden">
        {Array.from({ length: mobileRows }, (_, row) => (
          <Card key={row} className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <SkeletonBlock className="h-5 w-20" />
              <SkeletonBlock className="h-5 w-24 rounded-full" />
            </div>
            <div className="flex items-center gap-3">
              <SkeletonBlock className="size-14 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <SkeletonBlock className="h-3 w-3/4" />
                <SkeletonBlock className="h-3 w-1/2" />
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div className="bg-card hidden overflow-hidden rounded-2xl border lg:block">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 border-b bg-[#fff8fa] p-4">
          {[0, 1, 2, 3].map((column) => (
            <SkeletonBlock key={column} className="h-3 w-20" />
          ))}
        </div>
        {[0, 1, 2].map((row) => (
          <div
            key={row}
            className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center gap-4 border-b p-4 last:border-0"
          >
            <SkeletonBlock className="h-4 w-3/4" />
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="h-6 w-24 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function UserOrderDetailSkeleton() {
  const t = useCopy();
  return (
    <Page title="Chi tiết đơn hàng" className="user-order-detail">
      <div role="status" aria-label={t("Đang tải")} className="space-y-4">
        <Card className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <SkeletonBlock className="h-6 w-20" />
            <SkeletonBlock className="h-6 w-28 rounded-full" />
          </div>
          <div className="space-y-2">
            <SkeletonBlock className="h-3 w-36" />
            <SkeletonBlock className="h-8 w-44" />
          </div>
          <div className="border-t pt-4">
            <SkeletonBlock className="h-3 w-52 max-w-full" />
          </div>
        </Card>
        <Card className="space-y-5">
          <SkeletonBlock className="h-3.5 w-52" />
          <div className="user-order-progress grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((step) => (
              <div key={step} className="user-order-step relative flex items-center gap-3">
                <SkeletonBlock className="size-7 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <SkeletonBlock className="h-3 w-3/4" />
                  <SkeletonBlock className="h-2.5 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="space-y-5">
          <SkeletonBlock className="h-3.5 w-44" />
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex items-center justify-between gap-4">
              <SkeletonBlock className="h-3 w-36" />
              <SkeletonBlock className="h-4 w-24" />
            </div>
          ))}
        </Card>
        <Card className="space-y-5">
          <SkeletonBlock className="h-3.5 w-44" />
          <div className="flex items-center gap-3">
            <SkeletonBlock className="size-14 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className="h-3 w-full max-w-72" />
              <SkeletonBlock className="h-3 w-36" />
            </div>
          </div>
        </Card>
      </div>
    </Page>
  );
}
