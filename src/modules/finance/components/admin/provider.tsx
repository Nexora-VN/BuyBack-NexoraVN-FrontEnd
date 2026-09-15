'use client';
import { useCopy } from "@/i18n/use-copy";

import { Card,StatCard } from '@/components/ui/card';
import { Page } from '@/components/ui/page';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatVnd } from '@/lib/format';
import { useFinance } from '../../hooks/use-finance';
import { providerCredentialSchema,providerVerificationSchema,shopeeCookieSchema,syncSchema } from '../../schemas/finance';
import type { FinanceRow } from '../../types/finance';
import { Failure,Loading,MutationForm,text } from '.././finance-ui';
import { syncFields } from './reconciliation';
import { useSuperAdmin } from './shared';
export const shopeeCookieFields = [
  {
    name: 'cookie',
    label: 'Cookie Shopee Affiliate',
    type: 'password' as const,
    help: 'Chỉ được gửi đến backend để mã hóa. Sau khi lưu không hiển thị lại.',
  },
];

export const credentialFields = [
  { name: 'accountId', label: 'Mã tài khoản AddLiveTag (Account ID)', help: 'Ví dụ: 420' },
  { name: 'expectedAffiliate', label: 'Tên Affiliate kỳ vọng', help: 'Tên affiliate xuất hiện trong báo cáo API AddLiveTag' },
];

export const verificationFields = [
  { name: 'version', label: 'Phiên bản Credential (Version)', type: 'number' as const, help: 'Nhập số phiên bản credential hiện tại' },
  { name: 'evidence', label: 'Bằng chứng đối chiếu thực tế', type: 'textarea' as const, help: 'Ghi rõ nguồn chứng từ đối chiếu thực tế (tối thiểu 10 ký tự) để mở khóa settlement' },
];

export function ProviderHealth() {
 const t=useCopy();

  const query = useFinance<FinanceRow>('admin/provider-health');
  if (query.isLoading) return <Loading />;
  if (query.isError) return <Failure message={query.error.message} retry={() => void query.refetch()} />;
  const cred = query.data?.credential as FinanceRow | undefined;
  const shopeeCred = query.data?.shopeeCredential as FinanceRow | undefined;
  const isVerified = Boolean(cred?.verifiedAt);
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
    <StatCard
      label="Phiên Shopee"
      value={<StatusBadge status={typeof shopeeCred?.status==='string'?shopeeCred.status:'UNVERIFIED'} />}
      helper={shopeeCred?.lastValidatedAt ? t("Đã cập nhật phiên") : t("Chưa thiết lập cookie")}
    />
    <StatCard label="Nguồn đối soát" value={text(query.data,'provider') || 'ADDLIVETAG'} helper={`Account: ${text(cred,'accountId')} · Affiliate: ${text(cred,'expectedAffiliate')}`} />
    <StatCard label="Xác thực VND & Account" value={isVerified ? <span className="font-semibold text-success">{t("Đã xác thực")}</span> : <span className="font-semibold text-warning">{t("Chưa xác thực")}</span>} helper={isVerified ? t("Đã mở khóa settlement") : t("Khóa settlement tới khi SUPER_ADMIN xác nhận")} />
    <StatCard label="Batch & Vấn đề" value={t("{value0} vấn đề mở", {value0: text(query.data,'openIssues')})} helper={t("Chờ/chạy: {value0} · Lỗi: {value1}", {value0: text(query.data,'queuedOrRunning'), value1: text(query.data,'failedBatches') || '0'})} />
    <StatCard label="Ledger & Đồng bộ" value={text(query.data,'ledgerBalanced') === 'true' ? t("Cân bằng") : t("Cần kiểm tra")} helper={text(query.data,'syncLagSeconds') === '—' ? t("Chưa đồng bộ") : t("Sync cách {value0}s", {value0: text(query.data,'syncLagSeconds')})} />
  </div>;
}

export function ProviderSyncPage() {
 const t=useCopy();

  const superAdmin = useSuperAdmin();
  return <Page title={t("Kết nối Đối tác & Shopee")}>
    <ProviderHealth />
    {superAdmin && <>
      <MutationForm
        title={t("Cập nhật phiên Shopee")}
        path="admin/provider-credential/shopee"
        method="put"
        fields={shopeeCookieFields}
        schema={shopeeCookieSchema}
      >
        <p className="text-sm text-muted-foreground">
          {t("Cookie Shopee Affiliate được gửi đến backend để mã hóa an toàn (AES-256-GCM). Sau khi lưu không hiển thị lại trên giao diện web.")}</p>
      </MutationForm>
      <MutationForm title={t("Cập nhật kết nối AddLiveTag")} path="admin/provider-credential" method="put" fields={credentialFields} schema={providerCredentialSchema}>
        <p className="text-sm text-muted-foreground">{t("API key chỉ cấu hình qua biến môi trường ADDLIVETAG_API_KEY của backend. Đổi key cần khởi động lại backend; không nhập hoặc lưu key trên web/database. Form này chỉ cập nhật thông tin tài khoản.")}</p>
      </MutationForm>
      <MutationForm title={t("Xác thực tài khoản & đơn vị tiền VND")} path="admin/provider-credential/verify" method="post" fields={verificationFields} schema={providerVerificationSchema}>
        <p className="text-sm text-muted-foreground">{t("SUPER_ADMIN xác nhận account ID và đơn vị tiền integer VND bằng đối chiếu thực tế kèm bằng chứng để mở khóa settlement.")}</p>
      </MutationForm>
    </>}
    <MutationForm title={t("Đồng bộ thủ công")} path="admin/reconciliation/sync" fields={syncFields} schema={syncSchema}>
      <p className="text-sm text-muted-foreground">{t("Khoảng ngày dài hơn 90 ngày sẽ được hệ thống tự động chia thành các batch độc lập không chồng lấn.")}</p>
    </MutationForm>
  </Page>;
}

export function SystemConfigPage() {
 const t=useCopy();

  const policy = useFinance<FinanceRow>('admin/policy');
  return <Page title={t("Chính sách hệ thống")}><ProviderHealth />{policy.data && <div className="grid gap-4 sm:grid-cols-2"><StatCard label="Cashback khách hàng" value={Number(text(policy.data,'userBps')) / 100 + '%'} helper="Trên tiền thực nhận sau khấu trừ" /><StatCard label="Rút tối thiểu" value={formatVnd(text(policy.data,'minWithdrawal'))} /></div>}
    {policy.isLoading?<Loading/>:policy.isError?<Failure message={policy.error.message} retry={()=>void policy.refetch()}/>:null}<Card>{t("Thay đổi chính sách cần phát hành phiên bản mới để bảo toàn lịch sử phân bổ tiền. Cấu hình bật settlement/rút tiền do backend quản lý.")}</Card></Page>;
}
