import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import {
  useCardDefinitions,
  useDataMapping,
  useLayout,
  useResponsiveLayout,
  useWindowWidth,
  isResponsiveConfig,
} from "../hooks";

describe("useCardDefinitions", () => {
  it("converts object map to array", () => {
    const TestComponent = () => React.createElement("div", null, "test");

    const { result } = renderHook(() =>
      useCardDefinitions({
        stats: { component: TestComponent, colSpan: 2 },
        chart: { component: TestComponent },
      }),
    );

    expect(result.current).toHaveLength(2);
    expect(result.current[0].id).toBe("stats");
    expect(result.current[0].colSpan).toBe(2);
    expect(result.current[1].id).toBe("chart");
  });

  it("maintains stable reference for same input", () => {
    const TestComponent = () => React.createElement("div", null, "test");
    const definitions = {
      stats: { component: TestComponent },
    };

    const { result, rerender } = renderHook(() =>
      useCardDefinitions(definitions),
    );

    const firstResult = result.current;
    rerender();
    expect(result.current).toBe(firstResult);
  });
});

describe("useDataMapping", () => {
  it("converts object map to array", () => {
    const { result } = renderHook(() =>
      useDataMapping({
        stats: (d: any) => ({ count: d.total }),
        chart: (d: any) => ({ data: d.chartData }),
      }),
    );

    expect(result.current).toHaveLength(2);
    expect(result.current[0].cardId).toBe("stats");
    expect(result.current[0].propsSelector({ total: 100 })).toEqual({
      count: 100,
    });
  });
});

describe("useLayout", () => {
  it("returns custom config as-is", () => {
    const customLayout = {
      columns: 3,
      placements: [{ cardId: "a", col: 1, row: 1 }],
    };

    const { result } = renderHook(() => useLayout(customLayout));
    expect(result.current).toEqual(customLayout);
  });

  it("converts preset name to layout", () => {
    const { result } = renderHook(() => useLayout("2x2", ["a", "b", "c", "d"]));

    expect(result.current.columns).toBe(2);
    expect(result.current.placements).toHaveLength(4);
  });

  it("throws when preset used without cardIds", () => {
    expect(() => {
      renderHook(() => useLayout("2x2"));
    }).toThrow("cardIds required");
  });
});

describe("isResponsiveConfig", () => {
  it("returns true for responsive config", () => {
    expect(
      isResponsiveConfig({
        default: "2x2",
        breakpoints: [{ minWidth: 768, layout: "3x2" }],
      }),
    ).toBe(true);
  });

  it("returns false for preset name", () => {
    expect(isResponsiveConfig("2x2")).toBe(false);
  });

  it("returns false for layout config", () => {
    expect(
      isResponsiveConfig({
        columns: 3,
        placements: [],
      }),
    ).toBe(false);
  });
});

describe("useResponsiveLayout", () => {
  beforeEach(() => {
    vi.stubGlobal("innerWidth", 1024);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns non-responsive layout as-is", () => {
    const { result } = renderHook(() => useResponsiveLayout("3x3"));
    expect(result.current).toBe("3x3");
  });

  it("returns matching breakpoint layout", () => {
    vi.stubGlobal("innerWidth", 800);

    const { result } = renderHook(() =>
      useResponsiveLayout({
        default: "2x2",
        breakpoints: [
          { minWidth: 768, layout: "3x2" },
          { minWidth: 1024, layout: "4x2" },
        ],
      }),
    );

    expect(result.current).toBe("3x2");
  });

  it("returns default when no breakpoint matches", () => {
    vi.stubGlobal("innerWidth", 400);

    const { result } = renderHook(() =>
      useResponsiveLayout({
        default: "2x2",
        breakpoints: [{ minWidth: 768, layout: "3x2" }],
      }),
    );

    expect(result.current).toBe("2x2");
  });

  it("responds to window resize", async () => {
    vi.stubGlobal("innerWidth", 400);

    const { result } = renderHook(() =>
      useResponsiveLayout({
        default: "2x2",
        breakpoints: [{ minWidth: 768, layout: "3x2" }],
      }),
    );

    expect(result.current).toBe("2x2");

    await act(async () => {
      vi.stubGlobal("innerWidth", 800);
      window.dispatchEvent(new Event("resize"));
    });

    expect(result.current).toBe("3x2");
  });
});

describe("useWindowWidth", () => {
  beforeEach(() => {
    vi.stubGlobal("innerWidth", 1024);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("returns current window width", () => {
    const { result } = renderHook(() => useWindowWidth());
    expect(result.current).toBe(1024);
  });

  it("debounces resize events", async () => {
    const { result } = renderHook(() => useWindowWidth(100));

    await act(async () => {
      vi.stubGlobal("innerWidth", 800);
      window.dispatchEvent(new Event("resize"));
    });

    // Should still be old value before debounce
    expect(result.current).toBe(1024);

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe(800);
  });
});
