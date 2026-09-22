"use client";
import { useCopy } from "@/i18n/use-copy";

import { Card } from "@/components/ui/card";
import {
ShoppingCart
} from "lucide-react";

export function GenerateLinkNotes() { const t = useCopy(); return (      <Card>
        <div className="flex items-center gap-3">
          <span className="bg-secondary text-primary grid size-10 shrink-0 place-items-center rounded-xl">
            <ShoppingCart />
          </span>
          <h2 className="font-semibold">{t("Vài lưu ý Piggy gửi tới bạn")}</h2>
        </div>
        <ol className="text-muted-foreground mt-5 space-y-4 text-sm leading-6">
          {[
            t("Nếu sản phẩm có trong giỏ hàng, bạn nhớ xóa ra khỏi giỏ nhe"),
            t("Nhấn “Mua ngay” trên trang này."),
            t("Thêm lại sản phẩm và tiến hành đặt hàng."),
            t("3 Điều trên giúp bạn hoàn tiền chính xác hơn đó!"),
          ].map((item, index) => (
            <li key={t(item)} className="flex gap-3">
              <span className="bg-secondary text-primary grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold">
                {index + 1}
              </span>
              {item}
            </li>
          ))}
        </ol>
        <p className="bg-muted text-muted-foreground mt-6 rounded-xl p-3 text-xs leading-5">
          {t(
            "Đây là các bước giúp bạn thuận lợi hơn trong việc được hoàn tiền nè. Tuy nhiên vẫn sẽ dựa vào trạng thái đơn hàng Shopee, TikTok nếu có dấu hiệu gian lận đó nhen.",
          )}
        </p>
      </Card>); }
