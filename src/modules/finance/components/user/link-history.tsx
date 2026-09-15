'use client';
import { useCopy } from "@/i18n/use-copy";

import { Button } from '@/components/ui/button';
import { Page } from '@/components/ui/page';
import { Link } from '@/i18n/navigation';
import { toast } from 'sonner';
import { FinanceTable,text } from '.././finance-ui';

export function LinkHistoryPage() {
 const t=useCopy();

  return <Page title={t("Link của tôi")} actions={<Button asChild><Link href="/app/links/new">{t("Tạo link mới")}</Link></Button>}><FinanceTable path="me/affiliate-links" searchLabel="Tìm URL gốc" specs={[['product.productName', t("Sản phẩm")], ['affiliateLinkStatus', t("Trạng thái"), 'status'], ['createdAt', t("Ngày tạo"), 'date']]}
    actions={row => <Button variant="outline" size="sm" onClick={() => void navigator.clipboard.writeText(text(row, 'fullLinkSystem')).then(() => toast.success(t("Đã sao chép"))).catch(() => toast.error(t.error("Không thể sao chép")))}>{t("Sao chép link")}</Button>} /></Page>;
}
