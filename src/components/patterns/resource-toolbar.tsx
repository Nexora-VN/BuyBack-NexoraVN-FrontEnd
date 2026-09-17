"use client";
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { statusLabel } from "@/components/ui/status-badge";
import { useCopy } from "@/i18n/use-copy";
import { useListState } from "@/lib/use-list-state";
import { ListSearch } from "./list-controls";
import { SurfaceDialog } from "./surface-dialog";
export function ResourceToolbar({
  scope,
  label,
  states,
}: {
  scope: string;
  label: string;
  states?: string[];
}) {
  const t = useCopy();
  const list = useListState(scope);
  const [open, setOpen] = useState(false);
  const controls = (
    <>
      {states && (
        <label className="block space-y-1 text-sm">
          <span>{t("Trạng thái")}</span>
          <Select
            value={list.status}
            onChange={(event) => list.update({ status: event.target.value, page: 1 })}
          >
            <option value="">{t("Tất cả trạng thái")}</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {t(statusLabel(state))}
              </option>
            ))}
          </Select>
        </label>
      )}
      <label className="block space-y-1 text-sm">
        <span>{t("Sắp xếp")}</span>
        <Select
          value={list.sort}
          onChange={(event) => list.update({ sort: event.target.value, page: 1 })}
        >
          <option value="desc">{t("Mới nhất")}</option>
          <option value="asc">{t("Cũ nhất")}</option>
        </Select>
      </label>
    </>
  );
  const count = Number(!!list.status) + Number(list.sort === "asc");
  return (
    <div className="flex items-end gap-3">
      <ListSearch
        value={list.query}
        onSearch={(query) => list.update({ query, page: 1 })}
        label={label}
      />
      <div className="hidden items-end gap-3 lg:flex">{controls}</div>
      <Button variant="outline" className="lg:hidden" onClick={() => setOpen(true)}>
        <SlidersHorizontal />
        {t("Lọc")}
        {count > 0 && <span>{count}</span>}
      </Button>
      <SurfaceDialog compact open={open} onOpenChange={setOpen} title="Bộ lọc">
        <div className="space-y-4">
          {controls}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => list.update({ status: "", sort: "desc", query: "", page: 1 })}
            >
              {t("Xóa bộ lọc")}
            </Button>
            <Button onClick={() => setOpen(false)}>{t("Xem kết quả")}</Button>
          </div>
        </div>
      </SurfaceDialog>
    </div>
  );
}
