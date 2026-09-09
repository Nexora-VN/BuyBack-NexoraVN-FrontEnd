import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { useFinanceList } from './use-finance';
describe('Finance API hooks', () => {
  afterEach(()=>vi.unstubAllGlobals());
  it('loads server pages and forwards filters instead of filtering cached data', async () => {
    const fetcher=vi.fn(async(input: string | URL | Request)=>{ void input; return new Response(JSON.stringify({data:[{id:'1',amount:'9007199254740993'}],meta:{page:2,limit:20,total:21,totalPages:2}}),{headers:{'content-type':'application/json'}}); });
    vi.stubGlobal('fetch',fetcher);
    const client=new QueryClient({defaultOptions:{queries:{retry:false}}});
    const wrapper=({children}:{children:ReactNode})=><QueryClientProvider client={client}>{children}</QueryClientProvider>;
    const hook=renderHook(()=>useFinanceList('me/withdrawals',2,'PENDING','ref','asc'),{wrapper});
    await waitFor(()=>expect(hook.result.current.isSuccess).toBe(true));
    expect(String(fetcher.mock.calls[0]?.[0])).toContain('page=2');
    expect(hook.result.current.data?.data[0]?.amount).toBe('9007199254740993');
    hook.unmount();client.clear();
  });
});
