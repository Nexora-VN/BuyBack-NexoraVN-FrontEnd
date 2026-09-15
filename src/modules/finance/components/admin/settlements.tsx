'use client';
import { useCopy } from "@/i18n/use-copy";

import { SurfaceDialog } from '@/components/patterns/surface-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Page } from '@/components/ui/page';
import { StatusBadge } from '@/components/ui/status-badge';
import { Link } from '@/i18n/navigation';
import { formatVnd } from '@/lib/format';
import { useListState } from '@/lib/use-list-state';
import { useState } from 'react';
import { useFinance } from '../../hooks/use-finance';
import { settlementSchema } from '../../schemas/finance';
import type { FinanceRow } from '../../types/finance';
import { ActionDialog,Failure,FinanceTable,Loading,MutationForm,text } from '.././finance-ui';
import { SettlementEligibility } from '.././settlement-eligibility';
import { reasonFields,reasonSchema,useSuperAdmin } from './shared';
export function SettlementsPage() {
 const t=useCopy();

 const superAdmin=useSuperAdmin();const list=useListState('eligible');
 return <Page title={t("Kỳ thanh toán AddLiveTag")} description="Chọn commission đã xác thực, nhập khấu trừ và số tiền thực nhận theo chứng từ.">
 {superAdmin&&<SettlementSelection key={[list.query,list.status,list.sort].join('|')}/>}
 <FinanceTable path="admin/settlements" searchLabel="Mã chứng từ" states={['DRAFT','CONFIRMED','CANCELLED']} specs={[["reference",t("Tham chiếu")],["grossVnd",t("Trước phí"),"money"],["deductionVnd",t("Khấu trừ"),"money"],["netVnd",t("Thực nhận"),"money"],["status",t("Trạng thái"),"status"]]} actions={row=><Link className="inline-flex min-h-11 items-center text-primary underline" href={'/admin/settlements/'+row.id}>{t("Chi tiết")}</Link>}/>
 </Page>;
}

export function SettlementSelection(){
 const t=useCopy();

 const [selected,setSelected]=useState<Record<string,string>>({});const [open,setOpen]=useState(false);
 const expected=Object.values(selected).reduce((sum,value)=>sum+BigInt(value),0n);const count=Object.keys(selected).length;
 return <section className="space-y-4">
 <FinanceTable scope="eligible" path="admin/commissions" initialStatus="VALIDATED" states={['VALIDATED']} searchLabel="Mã checkout" specs={[["checkout.checkoutId","Checkout"],["estimatedVnd",t("Hoa hồng VND"),"money"],["state",t("Trạng thái"),"status"]]}
 extraColumns={[{key:'select',label:t("Chọn"),render:row=><input aria-label={t("Chọn commission ")+row.id} type="checkbox" disabled={!(row.settlementEligibility as {eligible?:boolean}|undefined)?.eligible||(!selected[row.id]&&count>=500)} checked={row.id in selected} onChange={event=>setSelected(previous=>{const next={...previous};if(event.target.checked)next[row.id]=text(row,'estimatedVnd');else delete next[row.id];return next;})}/>},{key:'eligibility',label:t("Điều kiện quyết toán"),render:row=><SettlementEligibility value={row.settlementEligibility}/>}]}/>
 <div className="selection-actions"><p><span>{t("Đã chọn")}</span> {count}/500 · <strong>{formatVnd(expected)}</strong></p><div className="flex flex-wrap gap-2"><Button variant="outline" disabled={!count} onClick={()=>setSelected({})}>{t("Bỏ chọn tất cả")}</Button><Button disabled={!count} onClick={()=>setOpen(true)}>{t("Tạo kỳ thanh toán")}</Button></div></div>
 <SurfaceDialog open={open} onOpenChange={setOpen} title={t("Tạo kỳ thanh toán")}>
 <MutationForm title={t("Tạo kỳ thanh toán")} path="admin/settlements" schema={settlementSchema.refine(v=>BigInt(v.grossVnd)===expected,t("Tổng phải khớp hoa hồng đã chọn"))} initialValues={{grossVnd:String(expected),deductionVnd:'0',netVnd:String(expected)}}
 fields={[{name:'reference',label:t("Mã chứng từ / kỳ thanh toán")},{name:'grossVnd',label:t("Tổng trước khấu trừ (VND)")},{name:'deductionVnd',label:t("Khấu trừ (VND)")},{name:'netVnd',label:t("Thực nhận (VND)")}]}
 transform={values=>({...values,commissionIds:Object.keys(selected)})} onSuccess={()=>{setOpen(false);setSelected({});}}><p>{t("Đã chọn")}{count} {t("commission · Tổng trước phí:")}<strong>{formatVnd(expected)}</strong></p></MutationForm>
 </SurfaceDialog></section>;
}

export function SettlementDetailPage({id}:{id:string}) {
 const t=useCopy();

  const superAdmin=useSuperAdmin(), query=useFinance<FinanceRow>('admin/settlements/'+id);
  return <Page title={t("Chi tiết kỳ thanh toán AddLiveTag")}>{query.isLoading?<Loading/>:query.isError?<Failure message={query.error.message} retry={()=>void query.refetch()}/>:query.data&&<>
    <Card><h2 className="font-semibold">{text(query.data,'reference')}</h2><StatusBadge status={text(query.data,'status')}/><dl className="mt-4 grid gap-4 sm:grid-cols-3">{[['grossVnd',t("Trước phí")],['deductionVnd',t("Khấu trừ")],['netVnd',t("Thực nhận")]].map(([key,label])=><div key={key}><dt>{t(label)}</dt><dd className="font-semibold">{formatVnd(text(query.data,key!))}</dd></div>)}</dl></Card>
    {superAdmin&&text(query.data,'status')==='DRAFT'&&<><MutationForm title={t("Xác nhận đối tác đã thanh toán")} path={'admin/settlements/'+id+'/confirm'} fields={[]}><p>{t("Xác nhận sẽ chia 85% cashback vào ví khách hàng và 15% nền tảng. Kỳ đã xác nhận không thể sửa.")}</p></MutationForm>
      <ActionDialog label="Hủy bản nháp"><MutationForm title={t("Hủy bản nháp thanh toán")} path={'admin/settlements/'+id+'/cancel'} fields={reasonFields} schema={reasonSchema} /></ActionDialog></>}
    <Card><h2 className="font-semibold">{t("Phân bổ commission")}</h2><div className="mt-4 space-y-3">{((query.data.items??[]) as FinanceRow[]).map(item=><div key={item.id} className="flex flex-wrap justify-between gap-2 border-b py-3"><span className="break-all">{text(item,'commissionId')}</span><strong>{formatVnd(text(item,'netVnd'))}</strong></div>)}</div></Card>
  </>}</Page>;
}
