import type { BentoLayoutConfig, CardPlacement } from "./types.js";

/**
 * Create a simple grid layout where cards are placed sequentially
 * Useful for quick prototyping
 *
 * @example
 * ```ts
 * const layout = createSimpleLayout(3, ["a", "b", "c", "d", "e", "f"]);
 * // Creates a 3-column grid with cards placed left-to-right, top-to-bottom
 * ```
 */
export function createSimpleLayout(
  columns: number,
  cardIds: string[],
  gap?: number,
): BentoLayoutConfig {
  const placements: CardPlacement[] = cardIds.map((cardId, index) => ({
    cardId,
    col: (index % columns) + 1,
    row: Math.floor(index / columns) + 1,
  }));

  return {
    columns,
    gap,
    placements,
  };
}

/**
 * Layout builder for fluent API
 *
 * @example
 * ```ts
 * const layout = layoutBuilder(3)
 *   .gap(16)
 *   .columnGap(20)
 *   .rowGap(12)
 *   .place("hero", 1, 1, { colSpan: 2, rowSpan: 2 })
 *   .place("stats", 3, 1)
 *   .place("chart", 3, 2)
 *   .build();
 * ```
 */
export function layoutBuilder(columns: number) {
  const config: BentoLayoutConfig = {
    columns,
    placements: [],
  };

  const builder = {
    gap(value: number) {
      config.gap = value;
      return builder;
    },
    columnGap(value: number) {
      config.columnGap = value;
      return builder;
    },
    rowGap(value: number) {
      config.rowGap = value;
      return builder;
    },
    rows(value: number) {
      config.rows = value;
      return builder;
    },
    rowHeights(heights: string[]) {
      config.rowHeights = heights;
      return builder;
    },
    place(
      cardId: string,
      col: number,
      row: number,
      options?: { colSpan?: number; rowSpan?: number },
    ) {
      config.placements.push({
        cardId,
        col,
        row,
        ...options,
      });
      return builder;
    },
    build(): BentoLayoutConfig {
      return config;
    },
  };

  return builder;
}

/**
 * Validate a layout configuration
 * Returns array of validation errors (empty if valid)
 */
export function validateLayout(layout: BentoLayoutConfig): string[] {
  const errors: string[] = [];

  if (layout.columns < 1) {
    errors.push("columns must be at least 1");
  }

  if (layout.rows !== undefined && layout.rows < 1) {
    errors.push("rows must be at least 1");
  }

  if (layout.gap !== undefined && layout.gap < 0) {
    errors.push("gap cannot be negative");
  }

  const occupied = new Set<string>();

  for (const placement of layout.placements) {
    const colSpan = placement.colSpan ?? 1;
    const rowSpan = placement.rowSpan ?? 1;

    // Check bounds
    if (placement.col < 1 || placement.col + colSpan - 1 > layout.columns) {
      errors.push(
        `Card "${placement.cardId}" exceeds column bounds (col: ${placement.col}, span: ${colSpan})`,
      );
    }

    if (placement.row < 1) {
      errors.push(
        `Card "${placement.cardId}" has invalid row: ${placement.row}`,
      );
    }

    // Check overlaps
    for (let c = placement.col; c < placement.col + colSpan; c++) {
      for (let r = placement.row; r < placement.row + rowSpan; r++) {
        const key = `${c},${r}`;
        if (occupied.has(key)) {
          errors.push(
            `Card "${placement.cardId}" overlaps at position (${c}, ${r})`,
          );
        }
        occupied.add(key);
      }
    }
  }

  return errors;
}
