"use client";
import { useCopy } from "@/i18n/use-copy";
import { EmptyState } from "./page";
export interface Column<T> {
  key: string;
  label: string;
  className?: string;
  render: (row: T) => React.ReactNode;
  mobilePrimary?: boolean;
}
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  mobileRender,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  mobileRender?: (row: T) => React.ReactNode;
}) {
  const t = useCopy();
  if (!rows.length)
    return (
      <EmptyState
        title={t("Chưa có dữ liệu")}
        description="Dữ liệu sẽ xuất hiện sau khi được ghi nhận."
      />
    );
  const primary =
    columns.find((c) => c.mobilePrimary) ||
    columns.find((c) =>
      ["product", "user", "orderSn", "reference", "item", "name", "title"].includes(c.key),
    ) ||
    columns.find((c) => c.key !== "select");
  const selection = columns.find((c) => c.key === "select");
  const actions = columns.filter((c) => ["actions", "action"].includes(c.key));
  const secondary = columns.filter((c) => c !== primary && c !== selection && !actions.includes(c));
  return (
    <>
      <div className="bg-card hidden overflow-hidden rounded-2xl border lg:block">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-muted/60 border-b">
              <tr>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    scope="col"
                    className={`text-muted-foreground px-4 py-3 text-xs font-semibold ${c.className ?? ""}`}
                  >
                    {t(c.label)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={rowKey(row)} className="hover:bg-muted/35 border-b last:border-0">
                  {columns.map((c) => (
                    <td key={c.key} className={`px-4 py-4 align-top ${c.className ?? ""}`}>
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="space-y-3 lg:hidden">
        {rows.map((row) => (
          <article key={rowKey(row)} className="bg-card min-w-0 rounded-2xl border p-4">
            {mobileRender ? (
              mobileRender(row)
            ) : (
              <>
                <div className="flex items-start gap-3">
                  {selection && (
                    <div className="grid min-h-11 min-w-11 place-items-center">
                      {selection.render(row)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1 font-semibold break-words">
                    {primary?.render(row)}
                  </div>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                  {secondary.slice(0, 4).map((c) => (
                    <div className="min-w-0" key={c.key}>
                      <dt className="text-muted-foreground mb-1 text-xs">{t(c.label)}</dt>
                      <dd className="text-sm break-words [&>*]:max-w-full">{c.render(row)}</dd>
                    </div>
                  ))}
                </dl>
                {secondary.length > 4 && (
                  <details className="mt-3 border-t pt-3">
                    <summary className="text-primary min-h-11 cursor-pointer text-sm font-medium">
                      {t("Thông tin thêm")}
                    </summary>
                    <dl className="space-y-3">
                      {secondary.slice(4).map((c) => (
                        <div className="min-w-0" key={c.key}>
                          <dt className="text-muted-foreground text-xs">{t(c.label)}</dt>
                          <dd className="text-sm break-words">{c.render(row)}</dd>
                        </div>
                      ))}
                    </dl>
                  </details>
                )}
                {!!actions.length && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t pt-3 [&>div]:flex-wrap">
                    {actions.map((c) => (
                      <div key={c.key}>{c.render(row)}</div>
                    ))}
                  </div>
                )}
              </>
            )}
          </article>
        ))}
      </div>
    </>
  );
}
