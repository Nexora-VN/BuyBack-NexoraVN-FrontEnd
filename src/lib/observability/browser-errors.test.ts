import { describe, it, vi, expect, afterEach } from 'vitest';
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
describe('browser telemetry', () => {
  it('deduplicates, limits events and does not transmit error messages or report its own failure', async () => {
    vi.resetModules(); vi.useFakeTimers(); vi.setSystemTime(new Date('2026-09-22T00:00:00Z'));
    const fetch = vi.fn().mockRejectedValue(new Error('telemetry offline'));
    vi.stubGlobal('fetch', fetch);
    const { reportBrowserError } = await import('./browser-errors');
    const error = new Error('password=secret email@example.com');
    for (let i=0;i<10;i++) reportBrowserError(error, 'error');
    await Promise.resolve();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][1].body).not.toContain('secret');
    expect(fetch.mock.calls[0][1].body).not.toContain('email');
    vi.advanceTimersByTime(60001);
    reportBrowserError(error, 'error'); await Promise.resolve();
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
