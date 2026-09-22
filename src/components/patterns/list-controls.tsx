"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCopy } from "@/i18n/use-copy";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
export function ListSearch({
  value,
  onSearch,
  label,
}: {
  value: string;
  onSearch: (value: string) => void;
  label: string;
}) {
  return <SearchForm key={value} value={value} onSearch={onSearch} label={label} />;
}
function SearchForm({
  value,
  onSearch,
  label,
}: {
  value: string;
  onSearch: (value: string) => void;
  label: string;
}) {
  const t = useCopy();
  const [draft, setDraft] = useState(value);
  const searchRef = useRef(onSearch);
  useEffect(() => {
    searchRef.current = onSearch;
  }, [onSearch]);
  useEffect(() => {
    if (draft.trim() === value) return;
    const timer = setTimeout(() => searchRef.current(draft.trim()), 300);
    return () => clearTimeout(timer);
  }, [draft, value]);
  return (
    <form
      className="flex min-w-0 flex-1 gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(draft.trim());
      }}
    >
      <Input
        aria-label={t(label)}
        placeholder={t(label)}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
      />
      <Button type="submit" variant="outline" size="icon" aria-label={t("Tìm kiếm")}>
        <Search />
      </Button>
    </form>
  );
}
export function ListPagination({
  page,
  total,
  totalPages,
  pending,
  onPage,
}: {
  page: number;
  total: number;
  totalPages: number;
  pending: boolean;
  onPage: (page: number) => void;
}) {
  const t = useCopy();
  return (
    <nav
      aria-label={t("Phân trang")}
      className="text-muted-foreground flex flex-wrap items-center justify-between gap-3 text-sm"
    >
      <span>
        {total} {t("bản ghi")} · {t("Trang")} {page}/{Math.max(1, totalPages)}
      </span>
      <div className="flex gap-2">
        <Button variant="outline" disabled={page <= 1 || pending} onClick={() => onPage(page - 1)}>
          {t("Trước")}
        </Button>
        <Button
          variant="outline"
          disabled={page >= totalPages || pending}
          onClick={() => onPage(page + 1)}
        >
          {t("Sau")}
        </Button>
      </div>
    </nav>
  );
}
