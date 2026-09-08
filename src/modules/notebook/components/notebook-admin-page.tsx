"use client";

import {
  BookOpen,
  CheckCircle2,
  FileUp,
  LoaderCircle,
  Play,
  Puzzle,
  UploadCloud,
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, StatCard } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Page } from "@/components/ui/page";
import { StatusBadge } from "@/components/ui/status-badge";
import { Link } from "@/i18n/navigation";
import { notebookService } from "../notebook.service";
import type { NotebookImport, RendererMode, ReviewActivity } from "../types";
import { ActivityConfigForm, templateDefaults } from "./activity-config-form";
import { ActivityRenderer } from "./activity-renderer";

function ImportRow({ item }: { item: NotebookImport }) {
  const report = item.report ?? {};
  return (
    <div className="grid gap-3 rounded-xl border p-4 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center">
      <div className="min-w-0">
        <p className="truncate font-semibold">{item.sourceFileName}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {item.currentStep || "Đang chờ worker"}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {report.pages ?? 0} pages · {report.images ?? 0} ảnh ·{" "}
          {report.uniqueFlash ?? 0} Flash unique
        </p>
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge
          status={item.status === "REQUIRES_REVIEW" ? "PENDING" : item.status}
        />
        <span className="text-sm font-semibold tabular">{item.progress}%</span>
      </div>
      {item.course && item.progress === 100 ? (
        <Button asChild size="sm">
          <Link href={`/learn/${item.course.slug}`}>
            <Play />
            Mở course
          </Link>
        </Button>
      ) : null}
      {item.error ? (
        <p className="text-sm text-danger md:col-span-3">{item.error}</p>
      ) : null}
    </div>
  );
}

function ReviewCard({
  item,
  onApproved,
}: {
  item: ReviewActivity;
  onApproved: () => void;
}) {
  const [type, setType] = useState(
    item.definition?.type || item.candidateType || "matching-select",
  );
  const [rendererMode, setRendererMode] = useState<RendererMode>(item.definition?.rendererMode ?? "AUTO");
  const [config, setConfig] = useState(
    JSON.stringify(item.definition?.config ?? templateDefaults[type] ?? {}, null, 2),
  );
  const [saving, setSaving] = useState(false);
  const [bounds, setBounds] = useState(item.bounds);
  const [preview, setPreview] = useState(false);
  const approve = async () => {
    try {
      const parsed = JSON.parse(config) as Record<string, unknown>;
      setSaving(true);
      await notebookService.approve(item.sourceHash, type, parsed, rendererMode);
      toast.success("Đã duyệt activity mapping");
      onApproved();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể lưu cấu hình",
      );
    } finally {
      setSaving(false);
    }
  };
  const saveBounds = async () => {
    try {
      await notebookService.updateBounds(item.id, bounds);
      toast.success("Đã lưu vùng activity");
      onApproved();
    } catch {
      toast.error("Không thể lưu bounds");
    }
  };
  return (
    <Card className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <div style={{aspectRatio: `${item.page.width}/${item.page.height}`}} className="relative self-start overflow-hidden rounded-xl border bg-muted">
        <object
          data={item.page.contentUrl}
          type="image/svg+xml"
          aria-label={`Preview ${item.page.sourcePageId}`}
          className="pointer-events-none absolute inset-0 size-full"
        />
        <div
          aria-label="Vùng activity được phát hiện"
          className="pointer-events-none absolute border-2 border-primary bg-primary/15"
          style={{
            left: `${(bounds.x / item.page.width) * 100}%`,
            top: `${(bounds.y / item.page.height) * 100}%`,
            width: `${(bounds.width / item.page.width) * 100}%`,
            height: `${(bounds.height / item.page.height) * 100}%`,
          }}
        />
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Puzzle className="size-5 text-primary" />
          <strong>{item.sourcePath.split("/").at(-1)}</strong>
          <span className="text-xs">{item.definition?.status ?? "Chưa chuyển đổi"}</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {item.page.course.title} · {item.page.sourcePageId} · confidence{" "}
          {Math.round(item.confidence * 100)}%
        </p>
        <div className="mt-4 space-y-3">
          <Select
            aria-label="Activity template"
            value={type}
            onChange={(event) => {
              setType(event.target.value);
              setConfig(
                JSON.stringify(templateDefaults[event.target.value], null, 2),
              );
              setPreview(false);
            }}
          >
            <option value="matching-select">Matching</option>
            <option value="fill-blank">Fill blank</option>
            <option value="multiple-choice">Multiple choice</option>
            <option value="drag-drop">Drag & drop</option>
            <option value="sort-order">Sort order</option>
            <option value="reveal">Reveal</option>
            <option value="flash-card">Flash card</option>
          </Select>
          <Select aria-label="Renderer mode" value={rendererMode} onChange={(event) => setRendererMode(event.target.value as RendererMode)}>
            <option value="AUTO">Auto: chạy Ruffle trước</option>
            <option value="RUFFLE">Ép chạy Ruffle</option>
            <option value="HTML">HTML activity template</option>
            <option value="DISABLED">Tắt activity</option>
          </Select>
          {item.runtimeProfile ? <p className="text-sm text-muted-foreground">Ruffle: {item.runtimeProfile.status} · SWF v{item.runtimeProfile.swfVersion}{item.runtimeProfile.error ? ` · ${item.runtimeProfile.error}` : ""}</p> : null}
          {rendererMode === "HTML" ? <ActivityConfigForm type={type} value={config} onChange={(value) => {setPreview(false); setConfig(value);}} /> : null}
          <details>
            <summary>Advanced JSON</summary>
            <Textarea
              value={config}
              onChange={(event) => {setPreview(false); setConfig(event.target.value);}}
              className="min-h-32 font-mono text-xs"
              aria-label="Activity JSON config"
            />
          </details>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {(["x", "y", "width", "height"] as const).map((key) => (
            <Input
              key={key}
              type="number"
              min="0"
              aria-label={`Activity ${key}`}
              value={bounds[key]}
              onChange={(event) =>
                setBounds((current) => ({
                  ...current,
                  [key]: Number(event.target.value),
                }))
              }
            />
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <Button variant="outline" onClick={() => void saveBounds()}>
            Lưu vùng
          </Button>
          <Button onClick={approve} disabled={saving}>
            {saving ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <CheckCircle2 />
            )}
            Publish renderer
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              try {
                JSON.parse(config);
                setPreview(!preview);
              } catch {
                toast.error("JSON chưa hợp lệ");
              }
            }}
          >
            {preview ? "Đóng thử hoạt động" : "Thử hoạt động"}
          </Button>
          {item.runtimeProfile ? (
            <Button
              variant="outline"
              onClick={() => {
                setRendererMode("RUFFLE");
                setPreview(true);
              }}
            >
              <Play className="size-4" />
              Chạy Flash (Ruffle)
            </Button>
          ) : null}
          {item.definition?.status !== "PUBLISHED" ? (
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await notebookService.saveDraft(
                    item.sourceHash,
                    type,
                    JSON.parse(config),
                    rendererMode,
                  );
                  toast.success("Đã lưu nháp");
                  onApproved();
                } catch (error) {
                  toast.error(
                    error instanceof Error ? error.message : "Không lưu được",
                  );
                }
              }}
            >
              Lưu nháp
            </Button>
          ) : null}
        </div>
        {preview ? (
          <div className="mt-4">
            <ActivityRenderer
              key={`${type}:${rendererMode}:${config}`}
              activity={{
                ...item,
                rendererMode,
                latestAttempt: null,
                status: "READY",
                definition: {
                  id: "preview",
                  type,
                  version: 1,
                  status: "PUBLISHED",
                  rendererMode,
                  config: JSON.parse(config),
                },
              }}
              onComplete={(_, score) => toast.success(`Preview: ${score}%`)}
            />
          </div>
        ) : null}
      </div>
    </Card>
  );
}

export function NotebookAdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState("");
  const [catalogPage, setCatalogPage] = useState(0);
  const importsQuery = useQuery({
    queryKey: ["notebook-imports"],
    queryFn: notebookService.listImports,
    refetchInterval: (query) => query.state.data?.some((item) => ["QUEUED", "EXTRACTING", "ANALYZING", "PUBLISHING"].includes(item.status)) ? 3000 : false,
  });
  const reviewQuery = useQuery({
    queryKey: ["notebook-review"],
    queryFn: notebookService.listReview,
  });
  const imports = importsQuery.data ?? [];
  const review = reviewQuery.data ?? [];
  const filtered = review.filter((item) => `${item.sourceHash} ${item.sourcePath} ${item.definition?.type ?? ""} ${item.definition?.status ?? "pending"}`.toLowerCase().includes(filter.toLowerCase()));
  const refresh = async () => {
    await Promise.all([importsQuery.refetch(), reviewQuery.refetch()]);
  };
  const active = imports.some((item) =>
    ["QUEUED", "EXTRACTING", "ANALYZING", "PUBLISHING"].includes(item.status),
  );
  const upload = async () => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".notebook"))
      return toast.error("Chọn đúng file .notebook");
    if (file.size > 100 * 1024 * 1024)
      return toast.error("Notebook tối đa 100 MB");
    try {
      setUploading(true);
      await notebookService.upload(file);
      toast.success("Đã đưa notebook vào hàng chờ import");
      setFile(null);
      await refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể upload notebook",
      );
    } finally {
      setUploading(false);
    }
  };
  return (
    <Page
      title="Notebook LMS"
      description="Upload SMART Notebook, theo dõi migration và mở course để học thử."
      actions={
        <Button variant="outline" onClick={() => void refresh()}>
          Làm mới
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Notebook imports"
          value={imports.length}
          icon={<BookOpen />}
        />
        <StatCard
          label="Đang xử lý"
          value={active ? "Có" : "Không"}
          icon={<LoaderCircle className={active ? "animate-spin" : ""} />}
        />
        <StatCard
          label="Activity catalog"
          value={review.length}
          icon={<Puzzle />}
        />
      </div>
      <Card>
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/30 bg-secondary/30 px-5 text-center hover:bg-secondary/50">
            <UploadCloud className="size-8 text-primary" />
            <span className="mt-2 font-medium">
              {file ? `${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)` : "Chọn file .notebook"}
            </span>
            <span className="mt-1 text-sm text-muted-foreground">
              Tối đa 100 MB, ZIP package SMART Notebook
            </span>
            <Input
              type="file"
              accept=".notebook,application/zip"
              className="sr-only"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>
          <Button size="lg" onClick={upload} disabled={!file || uploading}>
            {uploading ? <LoaderCircle className="animate-spin" /> : <FileUp />}
            Upload & import
          </Button>
        </div>
      </Card>
      <section className="space-y-3">
        <h2 className="text-lg font-bold">Imports gần đây</h2>
        {imports.length ? (
          imports.map((item) => <ImportRow key={item.id} item={item} />)
        ) : (
          <Card>
            <p className="text-muted-foreground">
              Chưa có notebook nào được import.
            </p>
          </Card>
        )}
      </section>
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-bold">Activity catalog</h2>
          <p className="text-sm text-muted-foreground">
            Liệt kê mọi SWF hash để chủ động cấu hình; mapping publish sẽ được
            tái dùng giữa các notebook.
          </p>
        </div>
        <Input aria-label="Lọc activity" placeholder="Tìm hash, tên file, template hoặc trạng thái" value={filter} onChange={(event) => {setFilter(event.target.value); setCatalogPage(0);}} />
        <div className="flex items-center gap-3">
          <Button variant="outline" disabled={catalogPage === 0} onClick={() => setCatalogPage(catalogPage - 1)}>Trang trước</Button>
          <span>{filtered.length} activity · trang {catalogPage + 1}</span>
          <Button variant="outline" disabled={(catalogPage + 1) * 4 >= filtered.length} onClick={() => setCatalogPage(catalogPage + 1)}>Trang sau</Button>
        </div>
        {review.length ? (
          filtered.slice(catalogPage * 4, (catalogPage + 1) * 4).map((item) => (
            <ReviewCard
              key={item.sourceHash}
              item={item}
              onApproved={() => void refresh()}
            />
          ))
        ) : (
          <Card>
            <p className="text-muted-foreground">
              Chưa phát hiện activity nào.
            </p>
          </Card>
        )}
      </section>
    </Page>
  );
}
