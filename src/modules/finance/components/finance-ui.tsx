'use client';
import { useRef, useState, type ReactNode } from 'react';
import { SlidersHorizontal, Search } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Input, Select, Textarea } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/page';
import { StatusBadge, statusLabel, type StatusDomain } from '@/components/ui/status-badge';
import { SurfaceDialog } from '@/components/patterns/surface-dialog';
import { formatVnd, formatDateTime } from '@/lib/format';
import { useListState } from '@/lib/use-list-state';
import { useCopy } from '@/i18n/use-copy';
import { useFinanceList, useRefreshFinance } from '../hooks/use-finance';
import { financeService } from '../services/finance';
import type { Field, FinanceRow } from '../types/finance';
export function read(row:unknown,path:string):unknown{return path.split('.').reduce<unknown>((v,k)=>v&&typeof v==='object'?(v as Record<string,unknown>)[k]:undefined,row);}
export const text=(row:unknown,path:string)=>{const value=read(row,path);return value==null?'—':String(value);};
export type Specs=[string,string,('money'|'status'|'date')?][];
export function columns(specs:Specs,domain:StatusDomain='general'):Column<FinanceRow>[] {
 return specs.map(([key,label,type])=>({key,label,render:row=>{
  const value=text(row,key);if(value==='—')return value;
  if(type==='money')return <span className="tabular-nums font-semibold">{formatVnd(value)}</span>;
  if(type==='status')return <StatusBadge status={value} domain={key.includes('commission')?'commission':domain}/>;
  if(type==='date')return formatDateTime(value);
  return <span className="block max-w-72 break-words">{value}</span>;
 }}));
}
export function Loading(){return <div role="status" aria-label="Đang tải" className="space-y-3"><div className="skeleton h-12 w-2/3 rounded-xl"/><div className="skeleton h-28 rounded-2xl"/><div className="skeleton h-28 rounded-2xl"/></div>;}
export function Failure({message,retry}:{message:string;retry:()=>void}){const t=useCopy();return <Card role="alert"><p className="text-danger">{t(message)}</p><Button variant="outline" className="mt-3" onClick={retry}>{t('Thử lại')}</Button></Card>;}
export function FinanceTable({path,specs,states,actions,searchLabel='Tìm kiếm',extraColumns=[],onFilterChange,initialStatus,scope}:{
 path:string;specs:Specs;states?:string[];actions?:(row:FinanceRow)=>ReactNode;searchLabel?:string;extraColumns?:Column<FinanceRow>[];onFilterChange?:()=>void;initialStatus?:string;scope?:string;
}) {
 const t=useCopy();const list=useListState(scope??path.split('/').at(-1)!);const [draft,setDraft]=useState(list.query);const [filters,setFilters]=useState(false);
 const domain:StatusDomain=path.includes('orders')?'order':path.includes('commissions')?'commission':path.includes('cashbacks')?'cashback':path.includes('withdrawals')?'withdrawal':path.includes('bank-accounts')?'bank':'general';
 const query=useFinanceList(path,list.page,list.status||initialStatus||'',list.query,list.sort);
 const cols=[...extraColumns,...columns(specs,domain),...(actions?[{key:'actions',label:'Thao tác',render:actions}]:[])];
 const filterCount=Number(!!list.status)+Number(list.sort==='asc');
 function apply(values:Parameters<typeof list.update>[0]){list.update({...values,page:1});onFilterChange?.();}
 const filterControls=<>{states&&<label className="block space-y-1 text-sm"><span>{t('Trạng thái')}</span><Select value={list.status} onChange={e=>apply({status:e.target.value})}><option value="">{t('Tất cả trạng thái')}</option>{states.map(s=><option key={s} value={s}>{t(statusLabel(s,domain))}</option>)}</Select></label>}<label className="block space-y-1 text-sm"><span>{t('Sắp xếp')}</span><Select value={list.sort} onChange={e=>apply({sort:e.target.value})}><option value="desc">{t('Mới nhất')}</option><option value="asc">{t('Cũ nhất')}</option></Select></label></>;
 return <section className="min-w-0 space-y-4">
  <div className="flex items-end gap-3"><form className="flex min-w-0 flex-1 gap-2" onSubmit={e=>{e.preventDefault();apply({query:draft.trim()});}}><Input aria-label={t(searchLabel)} placeholder={t(searchLabel)} value={draft} onChange={e=>setDraft(e.target.value)}/><Button type="submit" variant="outline" size="icon" aria-label={t('Tìm kiếm')}><Search/></Button></form><div className="hidden items-end gap-3 lg:flex">{filterControls}</div><Button variant="outline" className="lg:hidden" onClick={()=>setFilters(true)}><SlidersHorizontal/>{t('Lọc')}{filterCount>0&&<span className="rounded-full bg-secondary px-2 text-primary">{filterCount}</span>}</Button></div>
  <SurfaceDialog compact open={filters} onOpenChange={setFilters} title="Bộ lọc"><div className="space-y-4">{filterControls}<div className="flex gap-2"><Button variant="outline" onClick={()=>{setDraft('');apply({query:'',status:'',sort:'desc'});}}>{t('Xóa bộ lọc')}</Button><Button onClick={()=>setFilters(false)}>{t('Xem kết quả')}</Button></div></div></SurfaceDialog>
  {query.isLoading?<Loading/>:query.isError?<Failure message={query.error.message} retry={()=>void query.refetch()}/>:!query.data?.data.length?<EmptyState title={list.query||list.status?'Không tìm thấy kết quả':'Chưa có dữ liệu'} description={list.query||list.status?'Thử thay đổi từ khóa hoặc bộ lọc.':'Dữ liệu sẽ xuất hiện sau khi hệ thống ghi nhận hoặc đồng bộ giao dịch.'}/>:<DataTable columns={cols} rows={query.data.data} rowKey={r=>r.id}/>}
  {query.data&&<div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground"><span>{query.data.meta.total} {t('bản ghi')} · {t('Trang')} {list.page}/{Math.max(1,query.data.meta.totalPages)}</span><div className="flex gap-2"><Button variant="outline" disabled={list.page<=1||query.isFetching} onClick={()=>list.update({page:list.page-1})}>{t('Trước')}</Button><Button variant="outline" disabled={list.page>=query.data.meta.totalPages||query.isFetching} onClick={()=>list.update({page:list.page+1})}>{t('Sau')}</Button></div></div>}
 </section>;
}
export function MutationForm({title,fields,path,method='post',schema,transform,confirmation=true,children,onSuccess,initialValues={}}:{
 title:string;fields:Field[];path:string;method?:'post'|'put'|'patch';schema?:z.ZodType;transform?:(input:Record<string,string>)=>unknown;confirmation?:boolean;children?:ReactNode;onSuccess?:()=>void;initialValues?:Record<string,string>;
}) {
 const t=useCopy();const refresh=useRefreshFinance();const [values,setValues]=useState<Record<string,string>>(initialValues);const [errors,setErrors]=useState<Record<string,string>>({});const [error,setError]=useState('');const [pending,setPending]=useState(false);const [review,setReview]=useState(false);const lock=useRef(false);
 async function send(){if(lock.current)return;lock.current=true;setPending(true);setError('');try{await financeService.mutate(path,transform?transform(values):values,method);setValues(initialValues);setReview(false);await refresh();onSuccess?.();toast.success(t('Đã lưu thay đổi'));}catch(e){setError(e instanceof Error?e.message:'Không thể lưu');}finally{lock.current=false;setPending(false);}}
 function validate(){const result=schema?.safeParse(values);if(result&&!result.success){const next:Record<string,string>={};for(const issue of result.error.issues)next[String(issue.path[0]??'_form')]=issue.message;setErrors(next);return false;}setErrors({});return true;}
 return <div className="min-w-0 rounded-2xl border bg-card p-4 lg:p-5"><form noValidate className="space-y-5" onSubmit={e=>{e.preventDefault();if(!validate())return;if(confirmation)setReview(true);else void send();}}><h2 className="text-lg font-semibold">{review?t('Kiểm tra thông tin'):t(title)}</h2>{children}
  {review?<dl className="divide-y">{fields.map(field=><div key={field.name} className="py-3"><dt className="text-sm text-muted-foreground">{t(field.label)}</dt><dd className="mt-1 break-words font-medium">{field.type==='password'?'••••••••':values[field.name]||'—'}</dd></div>)}</dl>:<div className="grid gap-4 lg:grid-cols-2">{fields.map(field=><label key={field.name} className={field.type==='textarea'?'lg:col-span-2':''}><span className="mb-2 block text-sm font-medium">{t(field.label)}</span>{field.type==='textarea'?<Textarea required={field.required!==false} aria-invalid={!!errors[field.name]} value={values[field.name]??''} onChange={e=>setValues(v=>({...v,[field.name]:e.target.value}))}/>:field.type==='select'?<Select required={field.required!==false} aria-invalid={!!errors[field.name]} value={values[field.name]??''} onChange={e=>setValues(v=>({...v,[field.name]:e.target.value}))}><option value="">{t('Chọn')}</option>{field.options?.map(opt=><option key={opt.value} value={opt.value}>{t(opt.label)}</option>)}</Select>:<Input type={field.type??'text'} required={field.required!==false} autoComplete={field.type==='password'?'off':undefined} aria-invalid={!!errors[field.name]} value={values[field.name]??''} onChange={e=>setValues(v=>({...v,[field.name]:e.target.value}))}/>}<span className="mt-1 block text-xs leading-5 text-muted-foreground">{field.help&&t(field.help)}</span>{errors[field.name]&&<span role="alert" className="mt-1 block text-sm text-danger">{t(errors[field.name])}</span>}</label>)}</div>}
  {(error||errors._form)&&<p role="alert" className="text-sm text-danger">{t(error||errors._form)}</p>}
  <div className="form-actions">{review?<><Button type="button" variant="outline" disabled={pending} onClick={()=>setReview(false)}>{t('Chỉnh sửa')}</Button><Button type="button" disabled={pending} onClick={()=>void send()}>{t(pending?'Đang xử lý…':'Xác nhận')}</Button></>:<Button disabled={pending} type="submit">{t(pending?'Đang xử lý…':confirmation?'Tiếp tục':title)}</Button>}</div>
 </form></div>;
}
export function ActionDialog({label,children}:{label:string;children:ReactNode}){const t=useCopy();const [open,setOpen]=useState(false);return <><Button variant="outline" size="sm" onClick={()=>setOpen(true)}>{t(label)}</Button><SurfaceDialog open={open} onOpenChange={setOpen} title={label}>{children}</SurfaceDialog></>;}
