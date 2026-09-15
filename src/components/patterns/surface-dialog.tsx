"use client";
import { Button } from '@/components/ui/button';
import { useCopy } from '@/i18n/use-copy';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
const BusyContext=createContext<((busy:boolean)=>void)|null>(null);
export function useDialogBusy(busy:boolean){
 const setBusy=useContext(BusyContext);
 useEffect(()=>{setBusy?.(busy);return()=>setBusy?.(false);},[busy,setBusy]);
}
export function SurfaceDialog({open,onOpenChange,title,children,compact=false,busy=false}:{open:boolean;onOpenChange:(open:boolean)=>void;title:string;children:ReactNode;compact?:boolean;busy?:boolean}){
 const t=useCopy();const [childBusy,setChildBusy]=useState(false);const locked=busy||childBusy;
 return <Dialog.Root open={open} onOpenChange={next=>{if(!locked)onOpenChange(next);}}>
 <Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/35"/>
 <Dialog.Content className={compact?'app-sheet':'app-dialog'} onEscapeKeyDown={event=>{if(locked)event.preventDefault();}} onPointerDownOutside={event=>{if(locked)event.preventDefault();}}>
 <header className="dialog-header"><div><Dialog.Title className="text-lg font-semibold">{t(title)}</Dialog.Title><Dialog.Description className="sr-only">{t('Kiểm tra thông tin và xác nhận thao tác.')}</Dialog.Description></div><Dialog.Close asChild><Button disabled={locked} type="button" size="icon" variant="ghost" aria-label={t('Đóng')}><X/></Button></Dialog.Close></header>
 <div className="dialog-body"><BusyContext.Provider value={setChildBusy}>{children}</BusyContext.Provider></div>
 </Dialog.Content></Dialog.Portal></Dialog.Root>;
}
