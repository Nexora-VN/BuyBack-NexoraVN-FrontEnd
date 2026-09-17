import { act, renderHook, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useListState } from "./use-list-state";
beforeEach(() => window.history.replaceState(null, "", "/app/orders"));
afterEach(cleanup);
describe("URL list state", () => {
  it("keeps unrelated filters and resets page only when requested", () => {
    window.history.replaceState(
      null,
      "",
      "/admin/settlements?eligible-page=2&settlements-status=DRAFT",
    );
    const hook = renderHook(() => useListState("eligible"));
    expect(hook.result.current.page).toBe(2);
    act(() => hook.result.current.update({ query: "abc", page: 1 }));
    expect(hook.result.current.query).toBe("abc");
    expect(hook.result.current.page).toBe(1);
    expect(window.location.search).toContain("settlements-status=DRAFT");
    act(() => hook.result.current.update({ page: 3 }));
    expect(hook.result.current.query).toBe("abc");
  });
  it("restores filters on Back events and distinguishes all statuses from a default", () => {
    const hook = renderHook(() => useListState("orders"));
    act(() => hook.result.current.update({ status: "" }));
    expect(hook.result.current.hasStatus).toBe(true);
    act(() => {
      window.history.replaceState(
        null,
        "",
        "/app/orders?orders-q=previous&orders-page=2&orders-status=REJECTED",
      );
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(hook.result.current.query).toBe("previous");
    expect(hook.result.current.page).toBe(2);
    expect(hook.result.current.status).toBe("REJECTED");
  });
  it("rejects invalid page values", () => {
    window.history.replaceState(null, "", "/app/orders?orders-page=-7");
    expect(renderHook(() => useListState("orders")).result.current.page).toBe(1);
  });
  it("handles asc and desc sort values correctly", () => {
    window.history.replaceState(null, "", "/admin/products?products-sort=asc");
    const hook = renderHook(() => useListState("products"));
    expect(hook.result.current.sort).toBe("asc");
    act(() => hook.result.current.update({ sort: "desc" }));
    expect(hook.result.current.sort).toBe("desc");
  });
});
