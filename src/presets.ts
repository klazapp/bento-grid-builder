import type {
  PresetLayout,
  PresetLayoutName,
  BentoLayoutConfig,
  PresetSlotMapping,
} from "./types.js";

/**
 * Preset layout definitions
 * Users can use these by name instead of defining custom layouts
 */
export const PRESET_LAYOUTS: Record<PresetLayoutName, PresetLayout> = {
  "2x2": {
    name: "2x2",
    columns: 2,
    rows: 2,
    slots: [
      { name: "top-left", col: 1, row: 1 },
      { name: "top-right", col: 2, row: 1 },
      { name: "bottom-left", col: 1, row: 2 },
      { name: "bottom-right", col: 2, row: 2 },
    ],
  },
  "3x2": {
    name: "3x2",
    columns: 3,
    rows: 2,
    slots: [
      { name: "top-1", col: 1, row: 1 },
      { name: "top-2", col: 2, row: 1 },
      { name: "top-3", col: 3, row: 1 },
      { name: "bottom-1", col: 1, row: 2 },
      { name: "bottom-2", col: 2, row: 2 },
      { name: "bottom-3", col: 3, row: 2 },
    ],
  },
  "3x3": {
    name: "3x3",
    columns: 3,
    rows: 3,
    slots: [
      { name: "r1-c1", col: 1, row: 1 },
      { name: "r1-c2", col: 2, row: 1 },
      { name: "r1-c3", col: 3, row: 1 },
      { name: "r2-c1", col: 1, row: 2 },
      { name: "r2-c2", col: 2, row: 2 },
      { name: "r2-c3", col: 3, row: 2 },
      { name: "r3-c1", col: 1, row: 3 },
      { name: "r3-c2", col: 2, row: 3 },
      { name: "r3-c3", col: 3, row: 3 },
    ],
  },
  "4x2": {
    name: "4x2",
    columns: 4,
    rows: 2,
    slots: [
      { name: "top-1", col: 1, row: 1 },
      { name: "top-2", col: 2, row: 1 },
      { name: "top-3", col: 3, row: 1 },
      { name: "top-4", col: 4, row: 1 },
      { name: "bottom-1", col: 1, row: 2 },
      { name: "bottom-2", col: 2, row: 2 },
      { name: "bottom-3", col: 3, row: 2 },
      { name: "bottom-4", col: 4, row: 2 },
    ],
  },
  "2x1-hero-left": {
    name: "2x1-hero-left",
    columns: 3,
    rows: 2,
    slots: [
      { name: "hero", col: 1, row: 1, colSpan: 2, rowSpan: 2 },
      { name: "side-top", col: 3, row: 1 },
      { name: "side-bottom", col: 3, row: 2 },
    ],
  },
  "2x1-hero-right": {
    name: "2x1-hero-right",
    columns: 3,
    rows: 2,
    slots: [
      { name: "side-top", col: 1, row: 1 },
      { name: "side-bottom", col: 1, row: 2 },
      { name: "hero", col: 2, row: 1, colSpan: 2, rowSpan: 2 },
    ],
  },
  "dashboard-9": {
    name: "dashboard-9",
    columns: 3,
    rows: 4,
    slots: [
      { name: "header-wide", col: 1, row: 1, colSpan: 2 },
      { name: "header-right", col: 3, row: 1 },
      { name: "hero", col: 1, row: 2, rowSpan: 2 },
      { name: "mid-center", col: 2, row: 2 },
      { name: "mid-right", col: 3, row: 2 },
      { name: "lower-center", col: 2, row: 3 },
      { name: "lower-right", col: 3, row: 3 },
      { name: "footer-left", col: 1, row: 4 },
      { name: "footer-wide", col: 2, row: 4, colSpan: 2 },
    ],
  },
};

/**
 * Convert a preset name to a full layout config with card IDs
 * Supports both legacy array-based assignment and explicit slot mapping
 */
export function presetToLayout(
  presetName: PresetLayoutName,
  cardIdsOrMapping: string[] | PresetSlotMapping[],
): BentoLayoutConfig {
  const preset = PRESET_LAYOUTS[presetName];
  if (!preset) {
    throw new Error(`Unknown preset layout: ${presetName}`);
  }

  let placements;

  // Check if it's explicit slot mapping or legacy array
  if (
    cardIdsOrMapping.length > 0 &&
    typeof cardIdsOrMapping[0] === "object" &&
    "slot" in cardIdsOrMapping[0]
  ) {
    // Explicit slot mapping
    const slotMapping = cardIdsOrMapping as PresetSlotMapping[];
    placements = slotMapping
      .map((mapping) => {
        const slotIndex =
          typeof mapping.slot === "number"
            ? mapping.slot
            : preset.slots.findIndex((s) => s.name === mapping.slot);

        if (slotIndex === -1 || slotIndex >= preset.slots.length) {
          console.warn(
            `Preset "${presetName}": slot "${mapping.slot}" not found`,
          );
          return null;
        }

        const slot = preset.slots[slotIndex];
        return {
          cardId: mapping.cardId,
          col: slot.col,
          row: slot.row,
          colSpan: slot.colSpan,
          rowSpan: slot.rowSpan,
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);
  } else {
    // Legacy array-based assignment
    const cardIds = cardIdsOrMapping as string[];
    placements = preset.slots.map((slot, index) => ({
      cardId: cardIds[index] ?? `card-${index}`,
      col: slot.col,
      row: slot.row,
      colSpan: slot.colSpan,
      rowSpan: slot.rowSpan,
    }));
  }

  return {
    columns: preset.columns,
    rows: preset.rows,
    placements,
  };
}

/**
 * Get available slot names for a preset layout
 * Useful for discovering what slots are available
 */
export function getPresetSlotNames(presetName: PresetLayoutName): string[] {
  const preset = PRESET_LAYOUTS[presetName];
  if (!preset) {
    throw new Error(`Unknown preset layout: ${presetName}`);
  }
  return preset.slots.map((s, i) => s.name ?? `slot-${i}`);
}

/**
 * Check if a value is a preset layout name
 */
export function isPresetName(value: unknown): value is PresetLayoutName {
  return typeof value === "string" && value in PRESET_LAYOUTS;
}
