import { describe, it, expect } from "vitest";
import {
  PRESET_LAYOUTS,
  presetToLayout,
  isPresetName,
  getPresetSlotNames,
} from "../presets";

describe("PRESET_LAYOUTS", () => {
  it("has all expected presets", () => {
    expect(Object.keys(PRESET_LAYOUTS)).toEqual([
      "2x2",
      "3x2",
      "3x3",
      "4x2",
      "2x1-hero-left",
      "2x1-hero-right",
      "dashboard-9",
    ]);
  });

  it("2x2 has 4 slots", () => {
    expect(PRESET_LAYOUTS["2x2"].slots).toHaveLength(4);
  });

  it("dashboard-9 has 9 slots", () => {
    expect(PRESET_LAYOUTS["dashboard-9"].slots).toHaveLength(9);
  });

  it("all presets have named slots", () => {
    for (const preset of Object.values(PRESET_LAYOUTS)) {
      for (const slot of preset.slots) {
        expect(slot.name).toBeDefined();
      }
    }
  });
});

describe("presetToLayout", () => {
  it("converts preset with card IDs array", () => {
    const layout = presetToLayout("2x2", ["a", "b", "c", "d"]);

    expect(layout.columns).toBe(2);
    expect(layout.rows).toBe(2);
    expect(layout.placements).toHaveLength(4);
    expect(layout.placements[0].cardId).toBe("a");
  });

  it("uses fallback card IDs when array is short", () => {
    const layout = presetToLayout("2x2", ["a"]);

    expect(layout.placements[0].cardId).toBe("a");
    expect(layout.placements[1].cardId).toBe("card-1");
  });

  it("supports explicit slot mapping by index", () => {
    const layout = presetToLayout("2x2", [
      { slot: 0, cardId: "first" },
      { slot: 2, cardId: "third" },
    ]);

    expect(layout.placements).toHaveLength(2);
    expect(layout.placements[0].cardId).toBe("first");
    expect(layout.placements[1].cardId).toBe("third");
  });

  it("supports explicit slot mapping by name", () => {
    const layout = presetToLayout("2x1-hero-left", [
      { slot: "hero", cardId: "main-chart" },
      { slot: "side-top", cardId: "stats" },
    ]);

    expect(layout.placements).toHaveLength(2);
    expect(layout.placements[0].cardId).toBe("main-chart");
    expect(layout.placements[0].colSpan).toBe(2);
    expect(layout.placements[0].rowSpan).toBe(2);
  });

  it("throws for unknown preset", () => {
    expect(() => presetToLayout("unknown" as any, [])).toThrow(
      "Unknown preset layout",
    );
  });
});

describe("isPresetName", () => {
  it("returns true for valid preset names", () => {
    expect(isPresetName("2x2")).toBe(true);
    expect(isPresetName("dashboard-9")).toBe(true);
  });

  it("returns false for invalid values", () => {
    expect(isPresetName("invalid")).toBe(false);
    expect(isPresetName(123)).toBe(false);
    expect(isPresetName(null)).toBe(false);
  });
});

describe("getPresetSlotNames", () => {
  it("returns slot names for a preset", () => {
    const names = getPresetSlotNames("2x2");
    expect(names).toEqual([
      "top-left",
      "top-right",
      "bottom-left",
      "bottom-right",
    ]);
  });

  it("returns hero slot names", () => {
    const names = getPresetSlotNames("2x1-hero-left");
    expect(names).toContain("hero");
    expect(names).toContain("side-top");
  });

  it("throws for unknown preset", () => {
    expect(() => getPresetSlotNames("unknown" as any)).toThrow();
  });
});
