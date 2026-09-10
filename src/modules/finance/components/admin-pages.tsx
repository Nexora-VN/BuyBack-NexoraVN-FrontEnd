'use client';
import { useRef, useState } from 'react';
import { z } from 'zod';
import { toast } from 'sonner';
import { Page } from '@/components/ui/page';
import { Card, StatCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/modules/auth/components/auth-provider';
import { formatVnd } from '@/lib/format';
import { StatusBadge } from '@/components/ui/status-badge';
import { useFinance } from '../hooks/use-finance';
import { financeService } from '../services/finance';
import { settlementSchema, syncSchema, providerCredentialSchema, providerVerificationSchema, structuredReviewSchema } from '../schemas/finance';
import type { FinanceRow } from '../types/finance';
import { ActionDialog, Failure, FinanceTable, Loading, MutationForm, text } from './finance-ui';
import { DashboardContent, orderSpecs, UserOrderDetailPage } from './user-pages';

const reasonFields = [{ name: 'reason', label: 'Lý do / ghi chú', type: 'textarea' as const }];
const reasonSchema = z.object({ reason: z.string().trim().min(5, 'Nhập lý do ít nhất 5 ký tự') });
function useSuperAdmin() { return useAuth().user?.role === 'SUPER_ADMIN'; }
export function AdminDashboardPage() { return <Page title="Tổng quan vận hành"><DashboardContent admin /><ProviderHealth /></Page>; }
export function AdminOrdersPage() { return <Page title="Đơn hàng"><FinanceTable path="admin/orders" searchLabel="Mã đơn Shopee" states={['1','2','3','4']} specs={orderSpecs} actions={row => <Link className="text-primary underline" href={'/admin/orders/' + row.id}>Chi tiết</Link>} /></Page>; }
export function AdminOrderDetailPage({ id }: { id: string }) { return <UserOrderDetailPage id={id} admin />; }
export function CommissionAdminPage() {
  return <Page title="Hoa hồng" description="Chỉ commission VALIDATED và có attribution hợp lệ mới được chọn vào kỳ thanh toán." actions={<Button asChild><Link href="/admin/settlements">Kỳ thanh toán</Link></Button>}>
    <FinanceTable path="admin/commissions" searchLabel="Mã checkout" states={['ESTIMATED','VALIDATED','PAID','REJECTED','REVERSED','MANUAL_REVIEW']} specs={[['id','Mã commission'],['userId','Người dùng'],['checkout.checkoutId','Checkout'],['checkout.provider','Nguồn'],['estimatedVnd','Hoa hồng VND','money'],['settledVnd','Thực nhận','money'],['cashback.userAmount','Cashback','money'],['state','Trạng thái','status']]} />
  </Page>;
}
export function LedgerAdminPage() { return <Page title="Ví & Ledger" description="Nhật ký thay đổi số dư. Giao dịch đã ghi chỉ được bù trừ bằng giao dịch mới."><FinanceTable path="admin/wallet/transactions" searchLabel="Mã tham chiếu" specs={[['walletId','Ví'],['type','Loại'],['availableDelta','Khả dụng +/-','money'],['reservedDelta','Đang giữ +/-','money'],['availableAfter','Khả dụng sau','money'],['reference','Tham chiếu'],['createdAt','Thời gian','date']]} /></Page>; }
function PaymentDetails({ id }: { id: string }) {
  const [details, setDetails] = useState<{ bankName: string; accountHolder: string; accountNumber: string } | null>(null), [pending, setPending] = useState(false);
  return <div className="space-y-3"><p className="text-sm text-muted-foreground">Xem thông tin chuyển khoản được ghi vào nhật ký truy cập.</p>
    <Button variant="outline" disabled={pending} onClick={async () => { setPending(true); try {
      const response = await financeService.mutate('admin/withdrawals/' + id + '/payment-details', {});
      setDetails(response as typeof details);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Không thể xem'); } finally { setPending(false); } }}>Xem tài khoản chuyển tiền</Button>
    {details && <Card><p>{details.bankName}</p><p className="font-semibold">{details.accountHolder}</p><p className="break-all font-mono">{details.accountNumber}</p></Card>}
  </div>;
}
export function WithdrawalsAdminPage() {
  return <Page title="Yêu cầu rút tiền" description="Đánh dấu đang xử lý trước khi chuyển khoản. Chỉ xác nhận hoàn thành sau khi đã chuyển thành công.">
    <FinanceTable path="admin/withdrawals" searchLabel="Mã chuyển khoản" states={['PENDING','PROCESSING','COMPLETED','REJECTED','FAILED']} specs={[['id','Yêu cầu'],['amount','Số tiền','money'],['bank.bankName','Ngân hàng'],['bank.accountHolder','Chủ tài khoản'],['bank.lastFour','4 số cuối'],['status','Trạng thái','status']]} actions={row => <div className="flex gap-2">
      {(text(row,'status') === 'PENDING' ? ['PROCESSING','REJECTED'] : text(row,'status') === 'PROCESSING' ? ['COMPLETED','FAILED'] : []).map(status => <ActionDialog key={status} label={({ PROCESSING:'Nhận xử lý', REJECTED:'Từ chối', COMPLETED:'Đã chuyển tiền', FAILED:'Chuyển thất bại' })[status] ?? status}>
        {status === 'COMPLETED' && <PaymentDetails id={row.id} />}
        <MutationForm title="Cập nhật yêu cầu" path={'admin/withdrawals/' + row.id + '/status'} method="patch"
          fields={[...reasonFields, ...(status === 'COMPLETED' ? [{ name:'transferReference',label:'Mã giao dịch ngân hàng' }] : [])]}
          schema={status === 'COMPLETED' ? reasonSchema.extend({ transferReference:z.string().min(3) }) : reasonSchema}
          transform={input => ({ ...input, status })} />
      </ActionDialog>)}</div>} />
  </Page>;
}
const syncFields = [{ name:'startDate', label:'Từ ngày (giờ Việt Nam)', type:'date' as const },{ name:'endDate',label:'Đến ngày (giờ Việt Nam)',type:'date' as const }];
const credentialFields = [
  { name: 'accountId', label: 'Mã tài khoản AddLiveTag (Account ID)', help: 'Ví dụ: 420' },
  { name: 'expectedAffiliate', label: 'Tên Affiliate kỳ vọng', help: 'Tên affiliate xuất hiện trong báo cáo API AddLiveTag' },
];
const verificationFields = [
  { name: 'version', label: 'Phiên bản Credential (Version)', type: 'number' as const, help: 'Nhập số phiên bản credential hiện tại' },
  { name: 'evidence', label: 'Bằng chứng đối chiếu thực tế', type: 'textarea' as const, help: 'Ghi rõ nguồn chứng từ đối chiếu thực tế (tối thiểu 10 ký tự) để mở khóa settlement' },
];
const reviewFields = [
  {
    name: 'action',
    label: 'Hành động',
    type: 'select' as const,
    options: [
      { value: 'APPROVE', label: 'APPROVE — Duyệt hoa hồng có bằng chứng' },
      { value: 'EXCLUDE', label: 'EXCLUDE — Loại bỏ khỏi thanh toán' },
    ],
  },
  {
    name: 'affiliateLinkId',
    label: 'Mã AffiliateLink ID (UUID)',
    required: false,
    help: 'Chỉ cần khi APPROVE: ID liên kết affiliate của người dùng để gán đơn và cộng ví. Bỏ trống nếu chọn EXCLUDE.',
  },
  {
    name: 'acceptedAmountVnd',
    label: 'Hoa hồng chấp nhận (VND)',
    required: false,
    help: 'Chỉ cần khi APPROVE: Số tiền VND được chấp nhận sau kiểm tra. Bỏ trống nếu chọn EXCLUDE.',
  },
  {
    name: 'revision',
    label: 'Revision của checkout',
    type: 'number' as const,
    required: false,
    help: 'Revision của đơn hàng (nhập số 1 nếu là đơn mới đối soát, để trống mặc định là 1).',
  },
  {
    name: 'evidence',
    label: 'Bằng chứng đối chiếu / Lý do xử lý',
    type: 'textarea' as const,
    help: 'Tối thiểu 10 ký tự (ví dụ: "Đã đối chiếu mã đơn Shopee khớp với user" hoặc "Đơn demo không rõ user, loại bỏ")',
  },
];

export function ReconciliationPage() {
  return <Page title="Đối soát chuyển đổi AddLiveTag" description="Đồng bộ báo cáo AddLiveTag, kiểm tra attribution và các trường hợp cần xử lý.">
    <MutationForm title="Đồng bộ AddLiveTag" path="admin/reconciliation/sync" fields={syncFields} schema={syncSchema} />
    <FinanceTable path="admin/reconciliation/batches" searchLabel="Mã lỗi" states={['QUEUED','RUNNING','COMPLETED','FAILED']} specs={[['id','Batch'],['provider','Nguồn'],['accountId','Tài khoản'],['startDate','Từ ngày'],['endDate','Đến ngày'],['status','Trạng thái','status'],['records','Đã lưu'],['failedRecords','Lỗi']]}
      actions={row => <Link className="text-primary underline" href={'/admin/reconciliation/' + row.id}>Chi tiết</Link>} />
  </Page>;
}
export function ReconciliationDetailPage({ id }: { id: string }) {
  const batch = useFinance<FinanceRow>('admin/reconciliation/batches/' + id);
  return <Page title="Chi tiết đối soát">{batch.isLoading ? <Loading /> : batch.isError ? <Failure message={batch.error.message} retry={() => void batch.refetch()} /> : batch.data && <Card>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <StatusBadge status={text(batch.data,'status')} />
      <span className="text-sm text-muted-foreground">Nguồn: {text(batch.data,'provider')} · Account: {text(batch.data,'accountId')}</span>
    </div>
    <p className="mt-3 font-semibold">{text(batch.data,'startDate')} — {text(batch.data,'endDate')}</p>
    <p className="mt-1">Đã lưu: <strong>{text(batch.data,'records')}</strong> dòng · Lỗi: <strong>{text(batch.data,'failedRecords')}</strong></p>
    {text(batch.data,'summary.estimated_total_commission') !== '—' && (
      <p className="mt-1 text-sm text-muted-foreground">
        Hoa hồng ước tính (Summary): {formatVnd(text(batch.data,'summary.estimated_total_commission'))}
      </p>
    )}
    <p className="text-danger mt-2">{text(batch.data,'errorCode') === '—' ? '' : text(batch.data,'errorCode')}</p>
    {text(batch.data,'status') === 'FAILED' && <MutationForm title="Chạy lại batch" path={'admin/reconciliation/batches/' + id + '/retry'} fields={[]} />}
  </Card>}<Issues path={'admin/reconciliation/batches/' + id + '/issues'} /></Page>;
}
function Issues({ path = 'admin/reconciliation/issues' }: { path?: string }) {
  const superAdmin = useSuperAdmin();
  return <FinanceTable path={path} searchLabel="Loại vấn đề" states={['OPEN','RESOLVED']} specs={[['id','Mã'],['type','Vấn đề'],['provider','Nguồn'],['checkoutId','Checkout'],['status','Trạng thái','status'],['resolution','Kết quả xử lý'],['createdAt','Ngày tạo','date']]}
    actions={row => text(row,'status') === 'OPEN' && superAdmin && <div className="flex flex-wrap gap-2">
      <ActionDialog label="Review vấn đề">
        <MutationForm
          title="Xử lý vấn đề đối soát"
          path={'admin/reconciliation/issues/' + row.id + '/resolve'}
          fields={reviewFields}
          schema={structuredReviewSchema}
          transform={input => ({
            ...input,
            revision: Number(input.revision || 1),
            affiliateLinkId: input.affiliateLinkId ? input.affiliateLinkId : undefined,
            acceptedAmountVnd: input.acceptedAmountVnd ? input.acceptedAmountVnd : undefined,
          })}
        >
          <p className="text-sm text-muted-foreground">APPROVE yêu cầu bằng chứng, link affiliate và số hoa hồng hợp lệ. EXCLUDE sẽ loại bỏ khỏi settlement.</p>
        </MutationForm>
      </ActionDialog>
      {text(row, 'type') === 'CROSS_PROVIDER_DUPLICATE' && (
        <ActionDialog label="Loại trừ Saffi cũ">
          <MutationForm title="Loại trừ commission Saffi cũ" path={'admin/reconciliation/legacy-commissions/' + row.id + '/exclude'} fields={reasonFields} schema={reasonSchema}>
            <p className="text-sm text-muted-foreground">Loại bỏ commission trùng lịch sử Saffi chưa settlement có ghi audit log.</p>
          </MutationForm>
        </ActionDialog>
      )}
    </div>} />;
}
export function IssuesPage() { return <Page title="Vấn đề đối soát"><Issues /></Page>; }
export function AuditLogPage() { return <Page title="Nhật ký vận hành"><FinanceTable path="admin/audit-logs" searchLabel="Tên thao tác" specs={[['action','Thao tác'],['actorId','Người thực hiện'],['reference','Tham chiếu'],['createdAt','Thời gian','date']]} /></Page>; }
function ProviderHealth() {
  const query = useFinance<FinanceRow>('admin/provider-health');
  if (query.isLoading) return <Loading />;
  if (query.isError) return <Failure message={query.error.message} retry={() => void query.refetch()} />;
  const cred = query.data?.credential as FinanceRow | undefined;
  const isVerified = Boolean(cred?.verifiedAt);
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <StatCard label="Nguồn đối soát" value={text(query.data,'provider') || 'ADDLIVETAG'} helper={`Account: ${text(cred,'accountId')} · Affiliate: ${text(cred,'expectedAffiliate')}`} />
    <StatCard label="Xác thực VND & Account" value={isVerified ? <span className="font-semibold text-success">Đã xác thực</span> : <span className="font-semibold text-warning">Chưa xác thực</span>} helper={isVerified ? 'Đã mở khóa settlement' : 'Khóa settlement tới khi SUPER_ADMIN xác nhận'} />
    <StatCard label="Batch & Vấn đề" value={`${text(query.data,'openIssues')} vấn đề mở`} helper={`Chờ/chạy: ${text(query.data,'queuedOrRunning')} · Lỗi: ${text(query.data,'failedBatches') || '0'}`} />
    <StatCard label="Ledger & Đồng bộ" value={text(query.data,'ledgerBalanced') === 'true' ? 'Cân bằng' : 'Cần kiểm tra'} helper={text(query.data,'syncLagSeconds') === '—' ? 'Chưa đồng bộ' : `Sync cách ${text(query.data,'syncLagSeconds')}s`} />
  </div>;
}
export function ProviderSyncPage() {
  const superAdmin = useSuperAdmin();
  return <Page title="Kết nối AddLiveTag">
    <ProviderHealth />
    {superAdmin && <>
      <MutationForm title="Cập nhật kết nối AddLiveTag" path="admin/provider-credential" method="put" fields={credentialFields} schema={providerCredentialSchema}>
        <p className="text-sm text-muted-foreground">API key chỉ cấu hình qua biến môi trường ADDLIVETAG_API_KEY của backend. Đổi key cần khởi động lại backend; không nhập hoặc lưu key trên web/database. Form này chỉ cập nhật thông tin tài khoản.</p>
      </MutationForm>
      <MutationForm title="Xác thực tài khoản & đơn vị tiền VND" path="admin/provider-credential/verify" method="post" fields={verificationFields} schema={providerVerificationSchema}>
        <p className="text-sm text-muted-foreground">SUPER_ADMIN xác nhận account ID và đơn vị tiền integer VND bằng đối chiếu thực tế kèm bằng chứng để mở khóa settlement.</p>
      </MutationForm>
      <MutationForm title="Dọn dẹp toàn bộ dữ liệu Saffi cũ (Reset)" path="admin/reconciliation/purge-saffi" method="post" fields={[]}>
        <p className="text-sm text-danger font-medium">
          CẢNH BÁO (SUPER_ADMIN): Xóa vĩnh viễn toàn bộ dữ liệu đối soát Saffi cũ (batches, checkouts, orders, commissions, allocations, issues, test ledger) để AddLiveTag trở thành nguồn chân lý duy nhất.
        </p>
      </MutationForm>
    </>}
    <MutationForm title="Đồng bộ thủ công" path="admin/reconciliation/sync" fields={syncFields} schema={syncSchema}>
      <p className="text-sm text-muted-foreground">Khoảng ngày dài hơn 90 ngày sẽ được hệ thống tự động chia thành các batch độc lập không chồng lấn.</p>
    </MutationForm>
  </Page>;
}
export function ManualAdjustmentsPage() {
  const superAdmin = useSuperAdmin(), key = useRef<string | null>(null);
  return <Page title="Điều chỉnh ví">{superAdmin ? <MutationForm title="Ghi điều chỉnh ví" path="admin/wallet-adjustments" fields={[{ name:'userId',label:'User ID' },{ name:'amount',label:'Số tiền (+ cộng / - trừ), VND' },...reasonFields]}
    schema={reasonSchema.extend({userId:z.uuid(),amount:z.string().regex(/^-?\d{1,18}$/).refine(v=>BigInt(v)!==0n)})}
    transform={v => { key.current ??= crypto.randomUUID(); return {...v,idempotencyKey:key.current}; }} onSuccess={()=>{key.current=null;}}><p className="text-sm text-muted-foreground">Điều chỉnh tạo một giao dịch ledger mới và bắt buộc ghi lý do.</p></MutationForm> : <Card>Chỉ SUPER_ADMIN có quyền điều chỉnh số dư.</Card>}</Page>;
}
export function SystemConfigPage() {
  const policy = useFinance<FinanceRow>('admin/policy');
  return <Page title="Chính sách hệ thống"><ProviderHealth />{policy.data && <div className="grid gap-4 sm:grid-cols-2"><StatCard label="Cashback khách hàng" value={Number(text(policy.data,'userBps')) / 100 + '%'} helper="Trên tiền thực nhận sau khấu trừ" /><StatCard label="Rút tối thiểu" value={formatVnd(text(policy.data,'minWithdrawal'))} /></div>}
    <Card>Thay đổi chính sách cần phát hành phiên bản mới để bảo toàn lịch sử phân bổ tiền. Cấu hình bật settlement/rút tiền do backend quản lý.</Card></Page>;
}
export function BankApprovalPage() {
  return <Page title="Duyệt tài khoản ngân hàng"><FinanceTable path="admin/bank-accounts" searchLabel="Tên chủ tài khoản" states={['PENDING','APPROVED','REJECTED']} specs={[['userId','Người dùng'],['bankName','Ngân hàng'],['accountHolder','Chủ tài khoản'],['lastFour','4 số cuối'],['version','Phiên bản'],['status','Trạng thái','status']]} actions={row => text(row,'status') === 'PENDING' && <div className="flex gap-2">{['approve','reject'].map(action => <ActionDialog key={action} label={action === 'approve' ? 'Duyệt' : 'Từ chối'}><MutationForm title="Lưu kết quả duyệt" path={'admin/bank-accounts/' + row.id + '/' + action} fields={reasonFields} schema={reasonSchema} /></ActionDialog>)}</div>} /></Page>;
}
export function SettlementsPage() {
  const superAdmin = useSuperAdmin();
  const [selected, setSelected] = useState<Record<string,string>>({});
  const expected = Object.values(selected).reduce((s,v)=>s+BigInt(v),0n);
  return <Page title="Kỳ thanh toán AddLiveTag" description="Chọn commission đã xác thực, nhập khấu trừ và số tiền thực nhận theo chứng từ.">
    {superAdmin && <><FinanceTable path="admin/commissions" states={['VALIDATED']} searchLabel="Mã checkout" specs={[['id','Commission'],['checkout.checkoutId','Checkout'],['estimatedVnd','Hoa hồng VND','money'],['state','Trạng thái','status']]}
      extraColumns={[{key:'select',label:'Chọn',render:row=><input aria-label={'Chọn commission ' + row.id} type="checkbox" disabled={text(row,'state')!=='VALIDATED'} checked={row.id in selected} onChange={e=>setSelected(previous=>{ const next={...previous}; if(e.target.checked)next[row.id]=text(row,'estimatedVnd');else delete next[row.id]; return next; })} />}]} />
      <MutationForm title="Tạo kỳ thanh toán" path="admin/settlements" schema={settlementSchema.refine(()=>Object.keys(selected).length>0,'Chọn ít nhất một commission')}
        fields={[{name:'reference',label:'Mã chứng từ / kỳ thanh toán'},{name:'grossVnd',label:'Tổng trước khấu trừ (VND)'},{name:'deductionVnd',label:'Khấu trừ (VND)'},{name:'netVnd',label:'Thực nhận (VND)'}]}
        transform={v=>({...v,commissionIds:Object.keys(selected)})} onSuccess={()=>setSelected({})}>
        <p>Đã chọn {Object.keys(selected).length} commission · Tổng trước phí: <strong>{formatVnd(expected)}</strong></p>
      </MutationForm></>}
    <FinanceTable path="admin/settlements" searchLabel="Mã chứng từ" states={['DRAFT','CONFIRMED','CANCELLED']} specs={[['reference','Tham chiếu'],['grossVnd','Trước phí','money'],['deductionVnd','Khấu trừ','money'],['netVnd','Thực nhận','money'],['status','Trạng thái','status']]} actions={row=><Link className="text-primary underline" href={'/admin/settlements/'+row.id}>Chi tiết</Link>} />
  </Page>;
}
export function SettlementDetailPage({id}:{id:string}) {
  const superAdmin=useSuperAdmin(), query=useFinance<FinanceRow>('admin/settlements/'+id);
  return <Page title="Chi tiết kỳ thanh toán AddLiveTag">{query.isLoading?<Loading/>:query.isError?<Failure message={query.error.message} retry={()=>void query.refetch()}/>:query.data&&<>
    <Card><h2 className="font-semibold">{text(query.data,'reference')}</h2><StatusBadge status={text(query.data,'status')}/><dl className="mt-4 grid gap-4 sm:grid-cols-3">{[['grossVnd','Trước phí'],['deductionVnd','Khấu trừ'],['netVnd','Thực nhận']].map(([key,label])=><div key={key}><dt>{label}</dt><dd className="font-semibold">{formatVnd(text(query.data,key!))}</dd></div>)}</dl></Card>
    {superAdmin&&text(query.data,'status')==='DRAFT'&&<><MutationForm title="Xác nhận đối tác đã thanh toán" path={'admin/settlements/'+id+'/confirm'} fields={[]}><p>Xác nhận sẽ chia 85% cashback vào ví khách hàng và 15% nền tảng. Kỳ đã xác nhận không thể sửa.</p></MutationForm>
      <ActionDialog label="Hủy bản nháp"><MutationForm title="Hủy bản nháp thanh toán" path={'admin/settlements/'+id+'/cancel'} fields={reasonFields} schema={reasonSchema} /></ActionDialog></>}
    <Card><h2 className="font-semibold">Phân bổ commission</h2><div className="mt-4 space-y-3">{((query.data.items??[]) as FinanceRow[]).map(item=><div key={item.id} className="flex flex-wrap justify-between gap-2 border-b py-3"><span className="break-all">{text(item,'commissionId')}</span><strong>{formatVnd(text(item,'netVnd'))}</strong></div>)}</div></Card>
  </>}</Page>;
}
