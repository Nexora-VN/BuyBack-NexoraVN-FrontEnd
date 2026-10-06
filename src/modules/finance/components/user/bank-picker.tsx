"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

export type ReceivingInstitution = {
  code: string;
  name: string;
  fullName: string;
  logo: string | null;
  kind: "bank" | "wallet";
};

function matches(bank: ReceivingInstitution, search: string) {
  const normalize = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const term = normalize(search.trim());
  return !term || normalize(`${bank.name} ${bank.fullName} ${bank.code}`).includes(term);
}

export function BankIcon({ bank }: { bank: ReceivingInstitution }) {
  if (bank.code === "MOMO") {
    return (
      <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#a50064] text-[11px] font-black text-white shadow-xs">
        MoMo
      </span>
    );
  }
  return (
    <span className="bg-muted/60 border-border/50 flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border p-1 text-[10px] font-bold text-foreground">
      {bank.logo ? (
        <Image
          src={bank.logo}
          alt=""
          width={28}
          height={28}
          unoptimized
          className="max-h-7 max-w-7 object-contain"
        />
      ) : (
        bank.code.slice(0, 3)
      )}
    </span>
  );
}

export function BankPicker({
  banks,
  value,
  onChange,
}: {
  banks: ReceivingInstitution[];
  value: string;
  onChange: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const selected = banks.find((bank) => bank.code === value);
  const filtered = banks.filter((bank) => matches(bank, search));

  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    const onOutside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onOutside);
    return () => document.removeEventListener("pointerdown", onOutside);
  }, [open]);

  function choose(code: string) {
    onChange(code);
    setSearch("");
    setActive(0);
    setOpen(false);
  }

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Chọn ngân hàng hoặc MoMo"
        onClick={() => setOpen(!open)}
        className="focus:border-ring focus:ring-ring/15 flex min-h-13 w-full items-center gap-3 rounded-xl border border-input bg-white px-3.5 text-left transition-colors focus:ring-2 focus:outline-none"
      >
        {selected ? (
          <>
            <BankIcon bank={selected} />
            <div className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-foreground">{selected.name}</span>
              <span className="text-muted-foreground block truncate text-xs">
                {selected.kind === "wallet" ? "Ví điện tử MoMo" : selected.fullName}
              </span>
            </div>
          </>
        ) : (
          <span className="text-muted-foreground flex-1 text-sm font-normal">Chọn ngân hàng hoặc MoMo</span>
        )}
        <ChevronDown className="text-muted-foreground ml-auto size-4 shrink-0 transition-transform duration-200" />
      </button>
      {open && (
        <div className="bg-card border-border/80 absolute z-50 mt-2 w-full rounded-2xl border p-2 shadow-xl animate-in fade-in-0 zoom-in-95">
          <div className="relative mb-2">
            <Search className="text-muted-foreground absolute top-3 left-3 size-4" />
            <input
              ref={input}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setActive(0);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setOpen(false);
                  return;
                }
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setActive(Math.min(active + 1, filtered.length - 1));
                }
                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setActive(Math.max(active - 1, 0));
                }
                if (event.key === "Enter" && filtered[active]) {
                  event.preventDefault();
                  choose(filtered[active].code);
                }
              }}
              placeholder="Tìm tên hoặc mã ngân hàng…"
              aria-label="Tìm ngân hàng"
              className="focus:ring-ring/15 h-10 w-full rounded-xl border bg-white pr-3 pl-9 text-sm outline-none focus:ring-2"
            />
          </div>
          <div
            role="listbox"
            aria-label="Ngân hàng và ví điện tử"
            className="max-h-64 overflow-y-auto space-y-0.5"
          >
            {filtered.map((bank, index) => (
              <button
                key={bank.code}
                role="option"
                aria-selected={bank.code === value}
                type="button"
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(bank.code)}
                className={`hover:bg-muted/70 flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors ${
                  active === index ? "bg-muted/80" : ""
                } ${bank.code === value ? "ring-primary/20 ring-1" : ""}`}
              >
                <BankIcon bank={bank} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground">{bank.name}</span>
                  <span className="text-muted-foreground block truncate text-xs">
                    {bank.kind === "wallet" ? "Ví điện tử MoMo" : bank.fullName}
                  </span>
                </span>
              </button>
            ))}
            {!filtered.length && (
              <p className="text-muted-foreground p-3 text-center text-sm">Không tìm thấy ngân hàng</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
