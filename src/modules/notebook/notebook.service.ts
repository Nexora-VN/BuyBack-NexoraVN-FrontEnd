import { apiClient } from "@/lib/api/client";
import type { NotebookCourse, NotebookImport, RendererMode, ReviewActivity } from "./types";

const adminBase = "/api/backend";

export const notebookService = {
  listImports: () => apiClient.get<NotebookImport[]>(`${adminBase}/notebook-imports`),
  upload: (file: File) => { const form = new FormData(); form.set("file", file); return apiClient.post<{ id: string }>(`${adminBase}/notebook-imports`, form, { isFormData: true, timeout: 120_000 }); },
  listReview: () => apiClient.get<ReviewActivity[]>(`${adminBase}/notebook-activities/catalog`),
  approve: (hash: string, type: string, config: Record<string, unknown>, rendererMode: RendererMode = "HTML") => apiClient.patch(`${adminBase}/notebook-activities/${hash}`, { type, config, rendererMode }),
  saveDraft: (hash: string, type: string, config: Record<string, unknown>, rendererMode: RendererMode = "HTML") => apiClient.patch(`${adminBase}/notebook-activities/${hash}/draft`, { type, config, rendererMode }),
  updateBounds: (activityId: string, bounds: { x: number; y: number; width: number; height: number }) => apiClient.patch(`${adminBase}/notebook-activities/instances/${activityId}/bounds`, bounds),
  course: (slug: string) => apiClient.get<NotebookCourse>(`${adminBase}/learn/courses/${slug}`),
  markViewed: (slug: string, pageId: string) => apiClient.post(`${adminBase}/learn/courses/${slug}/pages/${pageId}/view`),
  submitAttempt: (activityId: string, result: Record<string, unknown>, score: number, completed: boolean) => apiClient.post(`${adminBase}/learn/activities/${activityId}/attempts`, { result, score, completed }),
  flashSession: (activityId: string) => apiClient.get<{sessionId:string; nonce:string; expiresAt:string; swfUrl:string; profile:{status:string; swfVersion:number; ruffleVersion:string}}>(`${adminBase}/learn/activities/${activityId}/flash-session`),
  flashEvent: (activityId: string, sessionId: string, event: "OPENED" | "LOADED" | "ERROR" | "HEARTBEAT", error?: string) => apiClient.post<{activeSeconds:number;completed:boolean}>(`${adminBase}/learn/activities/${activityId}/runtime-events`, { sessionId, event, error }),
};
