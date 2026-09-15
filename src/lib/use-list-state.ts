"use client";
import { useSyncExternalStore } from "react";
const subscribe=(callback:()=>void)=>{window.addEventListener('popstate',callback);window.addEventListener('list-query-change',callback);return()=>{window.removeEventListener('popstate',callback);window.removeEventListener('list-query-change',callback);};};
const snapshot=()=>window.location.search;
/** Native history preserves list state across refresh/back without triggering duplicate requests. */
export function useListState(scope:string) {
 const search=useSyncExternalStore(subscribe,snapshot,()=>'');
 const params=new URLSearchParams(search); const prefix=scope+'-';
 const raw=Number(params.get(prefix+'page')||1);
 const page=Number.isSafeInteger(raw)&&raw>0?raw:1;
 const status=params.get(prefix+'status')||'';const query=params.get(prefix+'q')||'';
 const sort=params.get(prefix+'sort')==='asc'?'asc':'desc';
 function update(values:Partial<{page:number;status:string;query:string;sort:string}>) {
  const url=new URL(window.location.href);
  for(const [key,value] of Object.entries(values)){const name=prefix+(key==='query'?'q':key);if(value===''||value===1||key==='sort'&&value==='desc')url.searchParams.delete(name);else url.searchParams.set(name,String(value));}
  window.history.pushState(null,'',url.pathname+url.search+url.hash);window.dispatchEvent(new Event('list-query-change'));
 }
 return {page,status,query,sort,update};
}
