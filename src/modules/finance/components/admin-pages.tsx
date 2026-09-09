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
import { settlementSchema, syncSchema } from '../schemas/finance';
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
    <FinanceTable path="admin/commissions" searchLabel="Mã checkout Shopee" states={['ESTIMATED','VALIDATED','PAID','REJECTED','REVERSED','MANUAL_REVIEW']} specs={[['id','Mã commission'],['userId','Người dùng'],['checkout.checkoutId','Checkout'],['estimatedVnd','Đối soát','money'],['settledVnd','Thực nhận','money'],['cashback.userAmount','Cashback','money'],['state','Trạng thái','status']]} />
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
export function ReconciliationPage() {
  return <Page title="Đối soát chuyển đổi" description="Đồng bộ báo cáo Saffi, kiểm tra attribution và các trường hợp cần xử lý.">
    <MutationForm title="Đồng bộ Saffi" path="admin/reconciliation/sync" fields={syncFields} schema={syncSchema} />
    <FinanceTable path="admin/reconciliation/batches" searchLabel="Mã lỗi" states={['QUEUED','RUNNING','COMPLETED','FAILED']} specs={[['id','Batch'],['startDate','Từ ngày'],['endDate','Đến ngày'],['status','Trạng thái','status'],['records','Đã lưu'],['failedRecords','Lỗi']]}
      actions={row => <Link className="text-primary underline" href={'/admin/reconciliation/' + row.id}>Chi tiết</Link>} />
  </Page>;
}
export function ReconciliationDetailPage({ id }: { id: string }) {
  const batch = useFinance<FinanceRow>('admin/reconciliation/batches/' + id);
  return <Page title="Chi tiết đối soát">{batch.isLoading ? <Loading /> : batch.isError ? <Failure message={batch.error.message} retry={() => void batch.refetch()} /> : batch.data && <Card><StatusBadge status={text(batch.data,'status')} /><p className="mt-3">{text(batch.data,'startDate')} — {text(batch.data,'endDate')}</p><p>Đã lưu {text(batch.data,'records')} · Lỗi {text(batch.data,'failedRecords')}</p><p className="text-danger">{text(batch.data,'errorCode') === '—' ? '' : text(batch.data,'errorCode')}</p>
    {text(batch.data,'status') === 'FAILED' && <MutationForm title="Chạy lại batch" path={'admin/reconciliation/batches/' + id + '/retry'} fields={[]} />}
  </Card>}<Issues path={'admin/reconciliation/batches/' + id + '/issues'} /></Page>;
}
function Issues({ path = 'admin/reconciliation/issues' }: { path?: string }) {
  return <FinanceTable path={path} searchLabel="Loại vấn đề" states={['OPEN','RESOLVED']} specs={[['type','Vấn đề'],['checkoutId','Checkout'],['status','Trạng thái','status'],['resolution','Kết quả xử lý'],['createdAt','Ngày tạo','date']]}
    actions={row => text(row,'status') === 'OPEN' && <ActionDialog label="Ghi nhận xử lý"><MutationForm title="Đóng vấn đề" path={'admin/reconciliation/issues/' + row.id + '/resolve'} fields={reasonFields} schema={reasonSchema}><p className="text-sm text-muted-foreground">Ghi nhận kết quả kiểm tra. Commission chỉ được xác thực lại qua lần đồng bộ provider tiếp theo.</p></MutationForm></ActionDialog>} />;
}
export function IssuesPage() { return <Page title="Vấn đề đối soát"><Issues /></Page>; }
export function AuditLogPage() { return <Page title="Nhật ký vận hành"><FinanceTable path="admin/audit-logs" searchLabel="Tên thao tác" specs={[['action','Thao tác'],['actorId','Người thực hiện'],['reference','Tham chiếu'],['createdAt','Thời gian','date']]} /></Page>; }
function ProviderHealth() {
  const query = useFinance<FinanceRow>('admin/provider-health');
  if (query.isLoading) return <Loading />;
  if (query.isError) return <Failure message={query.error.message} retry={() => void query.refetch()} />;
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <StatCard label="Phiên Shopee" value={<StatusBadge status={text(query.data,'credential.status')} />} />
    <StatCard label="Batch đang chờ/chạy" value={text(query.data,'queuedOrRunning')} />
    <StatCard label="Vấn đề chưa xử lý" value={text(query.data,'openIssues')} helper={<Link href="/admin/reconciliation/issues" className="text-primary underline">Xem danh sách</Link>} />
    <StatCard label="Ledger" value={text(query.data,'ledgerBalanced') === 'true' ? 'Cân bằng' : 'Cần kiểm tra'} helper={'Sync gần nhất cách ' + text(query.data,'syncLagSeconds') + ' giây'} />
  </div>;
}
export function ProviderSyncPage() {
  const superAdmin = useSuperAdmin();
  return <Page title="Kết nối Saffi"><ProviderHealth />{superAdmin && <MutationForm title="Cập nhật phiên Shopee" path="admin/provider-credential" method="put" fields={[{ name:'cookie',label:'Cookie Shopee Affiliate',type:'password',help:'Chỉ được gửi đến backend để mã hóa. Sau khi lưu không hiển thị lại.' }]} schema={z.object({cookie:z.string().min(10)})} />}
    <MutationForm title="Đồng bộ thủ công" path="admin/reconciliation/sync" fields={syncFields} schema={syncSchema} />
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
  const expected = Object.values(selected).reduce((s,v)=>s+BigInt(v),0n)/100000n;
  return <Page title="Kỳ thanh toán Shopee" description="Chọn commission đã xác thực, nhập khấu trừ và số tiền thực nhận theo chứng từ Shopee.">
    {superAdmin && <><FinanceTable path="admin/commissions" states={['VALIDATED']} searchLabel="Mã checkout" specs={[['id','Commission'],['estimatedVnd','Ước tính','money'],['state','Trạng thái','status']]}
      extraColumns={[{key:'select',label:'Chọn',render:row=><input aria-label={'Chọn commission ' + row.id} type="checkbox" disabled={text(row,'state')!=='VALIDATED'} checked={row.id in selected} onChange={e=>setSelected(previous=>{ const next={...previous}; if(e.target.checked)next[row.id]=text(row,'rawAmount');else delete next[row.id]; return next; })} />}]} />
      <MutationForm title="Tạo kỳ thanh toán" path="admin/settlements" schema={settlementSchema.refine(()=>Object.keys(selected).length>0,'Chọn ít nhất một commission')}
        fields={[{name:'reference',label:'Mã chứng từ / kỳ thanh toán'},{name:'grossVnd',label:'Tổng trước khấu trừ (VND)'},{name:'deductionVnd',label:'Khấu trừ (VND)'},{name:'netVnd',label:'Thực nhận (VND)'}]}
        transform={v=>({...v,commissionIds:Object.keys(selected)})} onSuccess={()=>setSelected({})}>
        <p>Đã chọn {Object.keys(selected).length} commission · Tổng trước phí: <strong>{formatVnd(expected)}</strong></p>
      </MutationForm></>}
    <FinanceTable path="admin/settlements" searchLabel="Mã chứng từ" states={['DRAFT','CONFIRMED']} specs={[['reference','Tham chiếu'],['grossVnd','Trước phí','money'],['deductionVnd','Khấu trừ','money'],['netVnd','Thực nhận','money'],['status','Trạng thái','status']]} actions={row=><Link className="text-primary underline" href={'/admin/settlements/'+row.id}>Chi tiết</Link>} />
  </Page>;
}
export function SettlementDetailPage({id}:{id:string}) {
  const superAdmin=useSuperAdmin(), query=useFinance<FinanceRow>('admin/settlements/'+id);
  return <Page title="Chi tiết kỳ thanh toán">{query.isLoading?<Loading/>:query.isError?<Failure message={query.error.message} retry={()=>void query.refetch()}/>:query.data&&<>
    <Card><h2 className="font-semibold">{text(query.data,'reference')}</h2><StatusBadge status={text(query.data,'status')}/><dl className="mt-4 grid gap-4 sm:grid-cols-3">{[['grossVnd','Trước phí'],['deductionVnd','Khấu trừ'],['netVnd','Thực nhận']].map(([key,label])=><div key={key}><dt>{label}</dt><dd className="font-semibold">{formatVnd(text(query.data,key!))}</dd></div>)}</dl></Card>
    {superAdmin&&text(query.data,'status')==='DRAFT'&&<><MutationForm title="Xác nhận Shopee đã thanh toán" path={'admin/settlements/'+id+'/confirm'} fields={[]}><p>Xác nhận sẽ chia tiền 85/15 và cộng cashback vào ví khách hàng. Kỳ đã xác nhận không thể sửa.</p></MutationForm>
      <ActionDialog label="Hủy bản nháp"><MutationForm title="Hủy bản nháp thanh toán" path={'admin/settlements/'+id+'/cancel'} fields={reasonFields} schema={reasonSchema} /></ActionDialog></>}
    <Card><h2 className="font-semibold">Phân bổ commission</h2><div className="mt-4 space-y-3">{((query.data.items??[]) as FinanceRow[]).map(item=><div key={item.id} className="flex flex-wrap justify-between gap-2 border-b py-3"><span className="break-all">{text(item,'commissionId')}</span><strong>{formatVnd(text(item,'netVnd'))}</strong></div>)}</div></Card>
  </>}</Page>;
}
