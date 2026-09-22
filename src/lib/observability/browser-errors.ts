import { validRequestId } from './request-id';
const seen = new Map<string, number>();
let windowStart = 0;
let count = 0;
export function reportBrowserError(error: unknown, source: 'boundary' | 'error' | 'unhandledrejection') {
  const now = Date.now();
  if (now - windowStart >= 60_000) { windowStart = now; count = 0; }
  if (count >= 5) return;
  const value = error instanceof Error ? error : new Error('UnknownError');
  // Send no raw message/stack: both can embed tokens, form data and third-party URLs.
  const name = ['Error', 'TypeError', 'RangeError', 'ReferenceError', 'SyntaxError', 'ApiError'].includes(value.name) ? value.name : 'Error';
  const id = 'requestId' in value && validRequestId(value.requestId) ? value.requestId : undefined;
  const path = window.location.pathname;
  const fingerprint = `${name}:${source}:${path}:${id ?? ''}`;
  if (now - (seen.get(fingerprint) ?? 0) < 60_000) return;
  if (seen.size >= 100) seen.clear();
  seen.set(fingerprint, now); count++;
  void fetch('/api/telemetry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, source, path, requestId: id }), keepalive: true, credentials: 'same-origin' }).catch(() => { /* Telemetry must never report its own failure. */ });
}
