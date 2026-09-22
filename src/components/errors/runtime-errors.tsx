'use client';
import { reportBrowserError } from '@/lib/observability/browser-errors';
import { Component,useEffect,type ErrorInfo,type ReactNode } from 'react';
export function RuntimeErrors() {
  useEffect(() => {
    const error = (event: ErrorEvent) => reportBrowserError(event.error, 'error');
    const rejection = (event: PromiseRejectionEvent) => reportBrowserError(event.reason, 'unhandledrejection');
    window.addEventListener('error', error);
    window.addEventListener('unhandledrejection', rejection);
    return () => { window.removeEventListener('error', error); window.removeEventListener('unhandledrejection', rejection); };
  }, []);
  return null;
}
export class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error) { reportBrowserError(error, 'boundary'); }
  render() {
    return this.state.failed ? <div role="alert" className="p-6"><p>Không thể hiển thị nội dung. Vui lòng thử lại.</p><button onClick={() => window.location.reload()}>Tải lại trang</button></div> : this.props.children;
  }
}
