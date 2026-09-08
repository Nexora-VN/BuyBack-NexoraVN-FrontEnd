export type NotebookStatus = "QUEUED" | "EXTRACTING" | "ANALYZING" | "PUBLISHING" | "COMPLETED" | "REQUIRES_REVIEW" | "FAILED";

export type NotebookReport = { pages?: number; images?: number; audioHotspots?: number; flashReferences?: number; uniqueFlash?: number };

export type NotebookImport = {
  id: string; sourceFileName: string; status: NotebookStatus; progress: number; currentStep?: string | null; error?: string | null;
  report?: NotebookReport | null; createdAt: string; completedAt?: string | null; course?: { slug: string; title: string } | null;
};

export type RendererMode = "AUTO" | "RUFFLE" | "HTML" | "DISABLED";
export type FlashRuntimeProfile = { sourceHash: string; status: "UNTESTED" | "LOADED" | "PARTIAL" | "FAILED"; swfVersion: number; ruffleVersion: string; error?: string | null; testedAt?: string | null; errorCount?: number };
export type ActivityDefinition = { id: string; type: string; version: number; config: unknown; status?: "DRAFT" | "PUBLISHED"; rendererMode?: RendererMode };
export type ActivityBounds = { x: number; y: number; width: number; height: number };
export type PageInteraction = ActivityBounds & { id: string; type: "navigate" | "play-audio"; label: string; targetPageId?: string; audioUrl?: string };
export type NotebookActivity = { id: string; sourceHash: string; sourcePath: string; candidateType?: string | null; confidence: number; status: string; bounds: ActivityBounds; definition?: ActivityDefinition | null; rendererMode?: RendererMode; runtimeProfile?: FlashRuntimeProfile | null; latestAttempt?: {id:string; result:Record<string,unknown>; score:number; completedAt?:string|null} | null };
export type NotebookPage = {
  id: string; sourcePageId: string; sortOrder: number; width: number; height: number; contentUrl: string;
  navigation: { targetPageId: string; label: string }[]; audioHotspots: (ActivityBounds & { audioUrl: string; label: string })[]; interactions?: PageInteraction[] | null; activities: NotebookActivity[];
};
export type LearnerProgress = { lastPageId?: string | null; viewedPageIds: string[] };
export type NotebookCourse = { id: string; title: string; slug: string; outline: { rootPageId: string; lessons: { pageId: string; label: string; children: string[] }[] }; pages: NotebookPage[]; learnerProgress: LearnerProgress };
export type ReviewActivity = NotebookActivity & { page: { sourcePageId: string; contentUrl: string; width: number; height: number; course: { title: string; slug: string } } };
