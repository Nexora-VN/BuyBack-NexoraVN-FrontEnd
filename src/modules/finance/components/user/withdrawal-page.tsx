"use client";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input,Select } from '@/components/ui/input';
import { Page } from '@/components/ui/page';
import { Link } from '@/i18n/navigation';
import { useCopy } from '@/i18n/use-copy';
import { formatVnd } from '@/lib/format';
import { CheckCircle2 } from 'lucide-react';
import { useRef,useState } from 'react';
import { useFinance,useRefreshFinance } from '../../hooks/use-finance';
import { withdrawalSchema } from '../../schemas/finance';
import { financeService } from '../../services/finance';
import type { FinanceList } from '../../types/finance';
import { Failure,Loading,text } from '../finance-ui';
export function NewWithdrawalPage(){
 const t=useCopy();const banks=useFinance<FinanceList>('me/bank-accounts?status=APPROVED&limit=100');const wallet=useFinance<{available:string}>('me/wallet');
 const [amount,setAmount]=useState(''),[bankId,setBank]=useState(''),[step,setStep]=useState<'edit'|'review'|'done'>('edit');const [errors,setErrors]=useState<Record<string,string>>({});const [error,setError]=useState('');const [pending,setPending]=useState(false);const key=useRef<string|null>(null);const lock=useRef(false);const refresh=useRefreshFinance();
 const bank=banks.data?.data.find(row=>row.id===bankId);
 function validate(){const result=withdrawalSchema.safeParse({amount,bankId});if(!result.success){setErrors(Object.fromEntries(result.error.issues.map(i=>[String(i.path[0]),i.message])));return;}if(!wallet.data||BigInt(amount)>BigInt(wallet.data.available)){setErrors({amount:t("Số dư khả dụng không đủ")});return;}setErrors({});setStep('review');}
 async function send(){if(lock.current)return;lock.current=true;setPending(true);setError('');key.current??=crypto.randomUUID();try{await financeService.mutate('me/withdrawals',{amount,bankId,idempotencyKey:key.current});await refresh();key.current=null;setStep('done');}catch(e){setError(e instanceof Error?e.message:t("Không thể tạo yêu cầu"));}finally{lock.current=false;setPending(false);}}
 return <Page taskForm title={t("Yêu cầu rút tiền")} description="Tối thiểu 50.000 VND. Số tiền được giữ ngay khi gửi yêu cầu.">
 {banks.isLoading||wallet.isLoading?<Loading/>:banks.isError||wallet.isError?<Failure message={(banks.error||wallet.error)?.message||t("Không thể tải dữ liệu")} retry={()=>{void banks.refetch();void wallet.refetch();}}/>:<Card className="w-full max-w-2xl">
 {step==='done'?<div className="space-y-5 py-4 text-center"><CheckCircle2 className="mx-auto size-12 text-success"/><h2 className="text-xl font-semibold">{t('Đã gửi yêu cầu rút tiền')}</h2><p className="text-sm leading-6 text-muted-foreground">{t('Số tiền được giữ để xử lý yêu cầu. Theo dõi tiến độ trong lịch sử rút tiền.')}</p><Button asChild><Link href="/app/withdrawals">{t('Xem lịch sử rút tiền')}</Link></Button></div>:<form className="space-y-5" noValidate onSubmit={e=>{e.preventDefault();if(step==='edit')validate();}}>
 <div className="rounded-xl bg-muted p-4"><p className="text-sm text-muted-foreground">{t('Có thể rút')}</p><p className="mt-1 text-2xl font-bold text-primary">{formatVnd(wallet.data!.available)}</p></div>
 {step==='edit'?<><label className="block space-y-2"><span>{t('Số tiền (VND)')}</span><Input inputMode="numeric" value={amount} aria-invalid={!!errors.amount} aria-describedby="amount-error" onChange={e=>{setAmount(e.target.value);key.current=null;}}/>{errors.amount&&<span id="amount-error" role="alert" className="text-sm text-danger">{t(errors.amount)}</span>}</label><label className="block space-y-2"><span>{t('Tài khoản đã duyệt')}</span><Select value={bankId} aria-invalid={!!errors.bankId} onChange={e=>{setBank(e.target.value);key.current=null;}}><option value="">{t('Chọn tài khoản')}</option>{banks.data?.data.map(row=><option key={row.id} value={row.id}>{text(row,'bankName')} · ****{text(row,'lastFour')}</option>)}</Select>{errors.bankId&&<span role="alert" className="text-sm text-danger">{t(errors.bankId)}</span>}</label>{!banks.data?.data.length&&<Link href="/app/account" className="block text-sm text-primary underline">{t('Thêm tài khoản ngân hàng để tiếp tục')}</Link>}</>:<><h2 className="text-lg font-semibold">{t('Kiểm tra yêu cầu rút')}</h2><dl className="space-y-4"><div><dt className="text-sm text-muted-foreground">{t('Số tiền')}</dt><dd className="text-2xl font-bold">{formatVnd(amount)}</dd></div><div><dt className="text-sm text-muted-foreground">{t('Ngân hàng nhận')}</dt><dd>{text(bank,'bankName')} · ****{text(bank,'lastFour')}</dd><dd>{text(bank,'accountHolder')}</dd></div></dl></>}
 {error&&<p role="alert" className="text-sm text-danger">{t.error(error)}</p>}
 <div className="form-actions">{step==='review'?<><Button type="button" variant="outline" disabled={pending} onClick={()=>setStep('edit')}>{t('Chỉnh sửa')}</Button><Button type="button" disabled={pending} onClick={()=>void send()}>{t(pending?'Đang gửi…':'Xác nhận rút tiền')}</Button></>:<Button disabled={!banks.data?.data.length} type="submit">{t('Tiếp tục')}</Button>}</div>
 </form>}</Card>}
 </Page>;
}
