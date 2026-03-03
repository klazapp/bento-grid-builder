import { describe, it, expect } from "vitest";
import { createSimpleLayout, layoutBuilder, validateLayout } from "../utils";
import type { BentoLayoutConfig } from "../types";

describe("createSimpleLayout", () => {
  it("creates a simple grid layout", () => {
    const layout = createSimpleLayout(3, ["a", "b", "c", "d", "e", "f"]);

    expect(layout.columns).toBe(3);
    expect(layout.placements).toHaveLength(6);
    expect(layout.placements[0]).toEqual({ cardId: "a", col: 1, row: 1 });
    expect(layout.placements[3]).toEqual({ cardId: "d", col: 1, row: 2 });
  });

  it("accepts optional gap", () => {
    const layout = createSimpleLayout(2, ["a", "b"], 20);
    expect(layout.gap).toBe(20);
  });
});

describe("layoutBuilder", () => {
  it("builds a layout with fluent API", () => {
    const layout = layoutBuilder(3)
      .gap(16)
      .rows(2)
      .place("hero", 1, 1, { colSpan: 2, rowSpan: 2 })
      .place("stats", 3, 1)
      .build();

    expect(layout.columns).toBe(3);
    expect(layout.gap).toBe(16);
    expect(layout.rows).toBe(2);
    expect(layout.placements).toHaveLength(2);
    expect(layout.placements[0]).toEqual({
      cardId: "hero",
      col: 1,
      row: 1,
      colSpan: 2,
      rowSpan: 2,
    });
  });

  it("supports columnGap and rowGap", () => {
    const layout = layoutBuilder(2).gap(10).columnGap(20).rowGap(15).build();

    expect(layout.gap).toBe(10);
    expect(layout.columnGap).toBe(20);
    expect(layout.rowGap).toBe(15);
  });
});

describe("validateLayout", () => {
  it("returns empty array for valid layout", () => {
    const layout: BentoLayoutConfig = {
      columns: 3,
      placements: [
        { cardId: "a", col: 1, row: 1 },
        { cardId: "b", col: 2, row: 1 },
      ],
    };

    expect(validateLayout(layout)).toEqual([]);
  });

  it("detects invalid column count", () => {
    const layout: BentoLayoutConfig = {
      columns: 0,
      placements: [],
    };

    const errors = validateLayout(layout);
    expect(errors).toContain("columns must be at least 1");
  });

  it("detects negative gap", () => {
    const layout: BentoLayoutConfig = {
      columns: 2,
      gap: -5,
      placements: [],
    };

    const errors = validateLayout(layout);
    expect(errors).toContain("gap cannot be negative");
  });

  it("detects out-of-bounds placements", () => {
    const layout: BentoLayoutConfig = {
      columns: 2,
      placements: [{ cardId: "a", col: 3, row: 1 }],
    };

    const errors = validateLayout(layout);
    expect(errors.some((e) => e.includes("exceeds column bounds"))).toBe(true);
  });

  it("detects overlapping cards", () => {
    const layout: BentoLayoutConfig = {
      columns: 3,
      placements: [
        { cardId: "a", col: 1, row: 1, colSpan: 2 },
        { cardId: "b", col: 2, row: 1 },
      ],
    };

    const errors = validateLayout(layout);
    expect(errors.some((e) => e.includes("overlaps"))).toBe(true);
  });

  it("detects invalid row", () => {
    const layout: BentoLayoutConfig = {
      columns: 2,
      placements: [{ cardId: "a", col: 1, row: 0 }],
    };

    const errors = validateLayout(layout);
    expect(errors.some((e) => e.includes("invalid row"))).toBe(true);
  });
});
