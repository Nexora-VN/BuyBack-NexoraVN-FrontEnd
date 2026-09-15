"use client";
import { useCopy } from "@/i18n/use-copy";
import { EmptyState } from "./page";
export interface Column<T> { key: string; label: string; className?: string; render: (row: T) => React.ReactNode; mobilePrimary?: boolean }
export function DataTable<T>({columns,rows,rowKey,mobileRender}:{columns:Column<T>[];rows:T[];rowKey:(row:T)=>string;mobileRender?:(row:T)=>React.ReactNode}) {
 const t=useCopy();
 if (!rows.length) return <EmptyState title={t("Chưa có dữ liệu")} description="Dữ liệu sẽ xuất hiện sau khi được ghi nhận."/>;
 const primary=columns.find(c=>c.mobilePrimary)||columns.find(c=>['product','user','orderSn','reference','item','name','title'].includes(c.key))||columns.find(c=>c.key!=='select');
 const selection=columns.find(c=>c.key==='select');
 const actions=columns.filter(c=>['actions','action'].includes(c.key));
 const secondary=columns.filter(c=>c!==primary&&c!==selection&&!actions.includes(c));
 return <><div className="hidden overflow-hidden rounded-2xl border bg-card lg:block"><div className="overflow-x-auto"><table className="w-full border-collapse text-left text-sm"><thead className="border-b bg-muted/60"><tr>{columns.map(c=><th key={c.key} scope="col" className={`px-4 py-3 text-xs font-semibold text-muted-foreground ${c.className??''}`}>{t(c.label)}</th>)}</tr></thead><tbody>{rows.map(row=><tr key={rowKey(row)} className="border-b last:border-0 hover:bg-muted/35">{columns.map(c=><td key={c.key} className={`px-4 py-4 align-top ${c.className??''}`}>{c.render(row)}</td>)}</tr>)}</tbody></table></div></div>
 <div className="space-y-3 lg:hidden">{rows.map(row=><article key={rowKey(row)} className="min-w-0 rounded-2xl border bg-card p-4">{mobileRender?mobileRender(row):<>
  <div className="flex items-start gap-3">{selection&&<div className="grid min-h-11 min-w-11 place-items-center">{selection.render(row)}</div>}<div className="min-w-0 flex-1 break-words font-semibold">{primary?.render(row)}</div></div>
  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">{secondary.slice(0,4).map(c=><div className="min-w-0" key={c.key}><dt className="mb-1 text-xs text-muted-foreground">{t(c.label)}</dt><dd className="break-words text-sm [&>*]:max-w-full">{c.render(row)}</dd></div>)}</dl>
  {secondary.length>4&&<details className="mt-3 border-t pt-3"><summary className="min-h-11 cursor-pointer text-sm font-medium text-primary">{t('Thông tin thêm')}</summary><dl className="space-y-3">{secondary.slice(4).map(c=><div className="min-w-0" key={c.key}><dt className="text-xs text-muted-foreground">{t(c.label)}</dt><dd className="break-words text-sm">{c.render(row)}</dd></div>)}</dl></details>}
  {!!actions.length&&<div className="mt-4 flex flex-wrap gap-2 border-t pt-3 [&>div]:flex-wrap">{actions.map(c=><div key={c.key}>{c.render(row)}</div>)}</div>}
 </>}</article>)}</div></>;
}
