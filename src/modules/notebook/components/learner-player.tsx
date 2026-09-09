"use client";

import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Menu,
  Play,
  Volume2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { notebookService } from "../notebook.service";
import type { NotebookCourse, NotebookPage, PageInteraction } from "../types";
import { ActivityRenderer } from "./activity-renderer";
import { toast } from "sonner";

function pageLabel(course: NotebookCourse, page: NotebookPage) {
  if (page.sourcePageId === course.outline.rootPageId) return "Theme overview";
  return (
    course.outline.lessons.find((item) => item.pageId === page.sourcePageId)
      ?.label ??
    page.navigation[0]?.label ??
    page.sourcePageId.replace(/^page/, "Page ")
  );
}

export function LearnerPlayer({ slug }: { slug: string }) {
  const [course, setCourse] = useState<NotebookCourse | null>(null);
  const [activeId, setActiveId] = useState("");
  const [viewed, setViewed] = useState<string[]>([]);
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [error, setError] = useState("");
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  useEffect(() => {
    notebookService
      .course(slug)
      .then((next) => {
        setCourse(next);
        setViewed(next.learnerProgress?.viewedPageIds ?? []);
        setActiveId(
          next.learnerProgress?.lastPageId ||
            next.outline.rootPageId ||
            next.pages[0]?.sourcePageId ||
            "",
        );
      })
      .catch((error: Error) => setError(error.message));
  }, [slug]);
  const page = useMemo(
    () =>
      course?.pages.find((item) => item.sourcePageId === activeId) ??
      course?.pages[0],
    [activeId, course],
  );
  if (!course || !page)
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50">
        <p className="text-muted-foreground">{error || "Đang tải course…"}</p>
      </main>
    );
  const index = course.pages.findIndex((item) => item.id === page.id);
  const progress = Math.round(
    (viewed.length / Math.max(course.pages.length, 1)) * 100,
  );
  const select = (sourcePageId: string) => {
    if (!course.pages.some((item) => item.sourcePageId === sourcePageId))
      return;
    setActiveId(sourcePageId);
    setOutlineOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setViewed((current) =>
      current.includes(sourcePageId) ? current : [...current, sourcePageId],
    );
    void notebookService
      .markViewed(slug, sourcePageId)
      .catch(() =>
        toast.error("Chưa lưu được tiến độ. Kiểm tra kết nối và thử lại."),
      );
  };
  const completeActivity = (
    activityId: string,
    result: Record<string, unknown>,
    score: number,
  ) => {
    setViewed((current) =>
      current.includes(page.sourcePageId)
        ? current
        : [...current, page.sourcePageId],
    );
    void notebookService
      .submitAttempt(activityId, result, score, true)
      .then(() => toast.success("Đã lưu kết quả"))
      .catch(() => toast.error("Chưa lưu được kết quả. Hãy thử lại."));
    void notebookService
      .markViewed(slug, page.sourcePageId)
      .catch(() => toast.error("Chưa lưu được tiến độ"));
  };
  const invoke = (interaction: PageInteraction) => {
    if (interaction.type === "navigate" && interaction.targetPageId)
      select(interaction.targetPageId);
    if (interaction.type === "play-audio" && interaction.audioUrl) {
      setPlayingAudioId(interaction.id);
      const audio = new Audio(interaction.audioUrl);
      audio.onended = () => setPlayingAudioId(null);
      audio.onerror = () => {
        setPlayingAudioId(null);
        toast.error("Không phát được âm thanh");
      };
      void audio.play().catch(() => {
        setPlayingAudioId(null);
        toast.error("Không phát được âm thanh");
      });
    }
  };
  const outline = (
    <aside className="flex h-full w-72 flex-col border-r bg-white">
      <div className="border-b p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Course
        </p>
        <h2 className="mt-1 font-bold">{course.title}</h2>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{progress}% đã xem</p>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {course.pages.map((item) => (
          <button
            key={item.id}
            onClick={() => select(item.sourcePageId)}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm",
              item.sourcePageId === page.sourcePageId
                ? "bg-secondary font-semibold text-primary"
                : "hover:bg-muted",
            )}
          >
            <span
              className={cn(
                "size-2 rounded-full",
                viewed.includes(item.sourcePageId)
                  ? "bg-success"
                  : "bg-muted-foreground/30",
              )}
            />
            <span className="truncate">{pageLabel(course, item)}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/95 px-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOutlineOpen(true)}
            aria-label="Mở danh sách bài học"
          >
            <Menu />
          </Button>
          <BookOpen className="size-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">{course.title}</p>
            <p className="text-sm font-semibold">{pageLabel(course, page)}</p>
          </div>
        </div>
        <span className="text-sm font-semibold text-primary">{progress}%</span>
      </header>
      <div className="mx-auto flex max-w-[1600px]">
        <div className="sticky top-16 hidden h-[calc(100vh-4rem)] lg:block">
          {outline}
        </div>
        <section className="min-w-0 flex-1 p-4 sm:p-6">
          <div className="mx-auto max-w-5xl">
            <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
              <div
                className="relative mx-auto max-w-full"
                style={{ aspectRatio: `${page.width}/${page.height}` }}
              >
                <object
                  data={page.contentUrl}
                  type="image/svg+xml"
                  aria-label={`Nội dung ${pageLabel(course, page)}`}
                  className="pointer-events-none absolute inset-0 size-full"
                />
                {(page.interactions ?? []).map((interaction) => {
                  const isPlaying = playingAudioId === interaction.id;
                  return (
                    <button
                      key={interaction.id}
                      aria-label={
                        interaction.type === "navigate"
                          ? `Đi tới ${interaction.label}`
                          : `Phát âm thanh ${interaction.label}`
                      }
                      onClick={() => invoke(interaction)}
                      className={cn(
                        "absolute z-20 rounded-md transition-all focus-visible:outline focus-visible:outline-4 focus-visible:outline-primary",
                        interaction.type === "play-audio"
                          ? isPlaying
                            ? "grid place-items-center bg-primary/20 text-primary ring-2 ring-primary ring-offset-1 animate-pulse"
                            : "grid place-items-center bg-transparent text-primary hover:bg-primary/10 hover:scale-105"
                          : "bg-transparent hover:bg-primary/10 focus:bg-primary/10",
                      )}
                      style={{
                        left: `${(interaction.x / page.width) * 100}%`,
                        top: `${(interaction.y / page.height) * 100}%`,
                        width: `${(interaction.width / page.width) * 100}%`,
                        height: `${(interaction.height / page.height) * 100}%`,
                      }}
                    >
                      {interaction.type === "play-audio" ? (
                        isPlaying ? (
                          <Volume2 className="size-4 animate-bounce fill-current" />
                        ) : (
                          <Play className="size-3.5 fill-current" />
                        )
                      ) : (
                        <span className="sr-only">{interaction.label}</span>
                      )}
                    </button>
                  );
                })}
                {page.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="absolute z-20 overflow-hidden"
                    style={{
                      left: `${(activity.bounds.x / page.width) * 100}%`,
                      top: `${(activity.bounds.y / page.height) * 100}%`,
                      width: `${(activity.bounds.width / page.width) * 100}%`,
                      height: `${(activity.bounds.height / page.height) * 100}%`,
                    }}
                  >
                    <ActivityRenderer
                      key={`${activity.id}:${activity.definition?.version}`}
                      activity={activity}
                      onComplete={(result, score) =>
                        completeActivity(activity.id, result, score)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                disabled={index <= 0}
                onClick={() =>
                  select(
                    course.pages[index - 1]?.sourcePageId ?? page.sourcePageId,
                  )
                }
              >
                <ChevronLeft />
                Trước
              </Button>
              <p className="text-sm text-muted-foreground">
                Trang {index + 1}/{course.pages.length}
              </p>
              <Button
                disabled={index >= course.pages.length - 1}
                onClick={() =>
                  select(
                    course.pages[index + 1]?.sourcePageId ?? page.sourcePageId,
                  )
                }
              >
                Tiếp
                <ChevronRight />
              </Button>
            </div>
          </div>
        </section>
      </div>
      {outlineOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Đóng danh sách"
            className="absolute inset-0 bg-black/30"
            onClick={() => setOutlineOpen(false)}
          />
          <div className="relative h-full w-80 max-w-[88vw]">
            {outline}
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={() => setOutlineOpen(false)}
            >
              <X />
            </Button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
