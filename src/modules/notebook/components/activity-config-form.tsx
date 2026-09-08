"use client";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const templateDefaults: Record<string, Record<string, unknown>> = {
  'matching-select': {pairs:[{id:'1',left:'',right:''}]},
  'multiple-choice': {question:'',options:[{id:'1',label:'',correct:true},{id:'2',label:'',correct:false}]},
  'fill-blank': {prompt:'',answer:''},
  'drag-drop': {items:[{id:'1',label:'',targetId:'group1'}],targets:[{id:'group1',label:''}]},
  'sort-order': {items:[{id:'1',label:''},{id:'2',label:''}],order:['1','2']},
  'reveal': {title:'',prompt:'',answer:''},
  'flash-card': {title:'',front:'',back:''},
};
export function ActivityConfigForm({type,value,onChange}:{type:string;value:string;onChange:(value:string)=>void}) {
  let data:Record<string,unknown>;
  try { data=JSON.parse(value) as Record<string,unknown>; if (!data || Array.isArray(data)) return null; } catch {return <p>Sửa JSON hợp lệ để dùng form.</p>;}
  const save=(next:Record<string,unknown>)=>onChange(JSON.stringify(next,null,2));
  const fields=templateDefaults[type] ?? {};
  return <div className="space-y-3">{Object.entries(fields).map(([key,defaultValue])=> {
    if (key==='order') return <label key={key} className="block text-sm">Thứ tự đáp án (ID, cách nhau dấu phẩy)<Input value={Array.isArray(data.order)?data.order.join(','):''} onChange={e=>save({...data,order:e.target.value.split(',').map(v=>v.trim()).filter(Boolean)})}/></label>;
    if (!Array.isArray(defaultValue)) return <label key={key} className="block text-sm">{key}<Input value={String(data[key] ?? '')} onChange={e=>save({...data,[key]:e.target.value})}/></label>;
    const rows=(Array.isArray(data[key])?data[key]:[]) as Record<string,unknown>[];
    const rowFields=Object.keys(defaultValue[0] as Record<string,unknown>);
    return <fieldset key={key} className="space-y-2 rounded border p-3"><legend>{key}</legend>{rows.map((row,index)=><div key={index} className="flex flex-wrap gap-2">{rowFields.map(field=><label key={field} className="text-xs">{field}{field==='correct'?<input aria-label={`${key} ${index+1} ${field}`} type="checkbox" checked={row[field]===true} onChange={e=>save({...data,[key]:rows.map((r,i)=>i===index?{...r,[field]:e.target.checked}:r)})}/>:<Input aria-label={`${key} ${index+1} ${field}`} value={String(row[field]??'')} onChange={e=>save({...data,[key]:rows.map((r,i)=>i===index?{...r,[field]:e.target.value}:r)})}/>}</label>)}<Button variant="ghost" onClick={()=>save({...data,[key]:rows.filter((_,i)=>i!==index)})}>Bỏ mục</Button></div>)}<Button variant="outline" onClick={()=>save({...data,[key]:[...rows,{...defaultValue[0],id:crypto.randomUUID()}]})}>Thêm mục</Button></fieldset>;
  })}</div>;
}
