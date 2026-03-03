import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import type {
  BentoCardDefinition,
  CardDataMapping,
  BentoLayoutConfig,
  PresetLayoutName,
  ResponsiveLayoutConfig,
  BreakpointConfig,
} from "./types.js";
import { isPresetName, presetToLayout } from "./presets.js";

/**
 * Deep comparison for stable memoization of object inputs
 */
function useStableValue<T>(value: T): T {
  const ref = useRef<T>(value);
  const prevJson = useRef<string>("");

  // Compare by serializing - works for our use case of simple config objects
  // For components, we compare by reference using a custom replacer
  const json = JSON.stringify(value, (key, val) => {
    if (typeof val === "function") {
      return val.toString();
    }
    return val;
  });

  if (json !== prevJson.current) {
    ref.current = value;
    prevJson.current = json;
  }

  return ref.current;
}

/**
 * Check if a layout config is a responsive config
 */
export function isResponsiveConfig(
  layout: BentoLayoutConfig | PresetLayoutName | ResponsiveLayoutConfig,
): layout is ResponsiveLayoutConfig {
  return (
    typeof layout === "object" && "default" in layout && "breakpoints" in layout
  );
}

/**
 * Hook to handle responsive layouts based on viewport width
 * Returns the appropriate layout for the current viewport
 *
 * @example
 * ```tsx
 * const layout = useResponsiveLayout({
 *   default: "2x2",
 *   breakpoints: [
 *     { minWidth: 768, layout: "3x2" },
 *     { minWidth: 1024, layout: "4x2" },
 *   ],
 * });
 * ```
 */
export function useResponsiveLayout(
  config: BentoLayoutConfig | PresetLayoutName | ResponsiveLayoutConfig,
): BentoLayoutConfig | PresetLayoutName {
  const [width, setWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 0,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return useMemo(() => {
    if (!isResponsiveConfig(config)) {
      return config;
    }

    // Sort breakpoints by minWidth descending to find the largest matching one
    const sortedBreakpoints = [...config.breakpoints].sort(
      (a, b) => b.minWidth - a.minWidth,
    );

    for (const bp of sortedBreakpoints) {
      if (width >= bp.minWidth) {
        return bp.layout;
      }
    }

    return config.default;
  }, [config, width]);
}

/**
 * Hook to track window width with debouncing
 */
export function useWindowWidth(debounceMs = 100): number {
  const [width, setWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 0,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    let timeoutId: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setWidth(window.innerWidth), debounceMs);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, [debounceMs]);

  return width;
}

/**
 * Hook to create card definitions from an object map
 * Provides a cleaner API for defining cards
 *
 * @example
 * ```tsx
 * const cards = useCardDefinitions({
 *   stats: { component: StatsCard, colSpan: 2 },
 *   chart: { component: ChartCard },
 *   list: { component: ListCard, rowSpan: 2 },
 * });
 * ```
 */
export function useCardDefinitions<
  T extends Record<string, Omit<BentoCardDefinition<any>, "id">>,
>(definitions: T): BentoCardDefinition<any>[] {
  const stableDefinitions = useStableValue(definitions);

  return useMemo(() => {
    return Object.entries(stableDefinitions).map(([id, def]) => ({
      id,
      ...def,
    }));
  }, [stableDefinitions]);
}

/**
 * Hook to create data mappings from an object map
 * Provides a cleaner API for mapping data to cards
 *
 * @example
 * ```tsx
 * const dataMapping = useDataMapping<MyDataType>({
 *   stats: (data) => ({ count: data.total, label: 'Items' }),
 *   chart: (data) => ({ points: data.chartData }),
 * });
 * ```
 */
export function useDataMapping<TData>(
  mappings: Record<string, (data: TData) => Record<string, unknown>>,
): CardDataMapping<TData>[] {
  const stableMappings = useStableValue(mappings);

  return useMemo(() => {
    return Object.entries(stableMappings).map(([cardId, propsSelector]) => ({
      cardId,
      propsSelector,
    }));
  }, [stableMappings]);
}

/**
 * Hook to create a layout configuration
 * Handles both preset names and custom configs
 *
 * @example
 * ```tsx
 * // Using preset
 * const layout = useLayout("3x3", ["stats", "chart", "list", ...]);
 *
 * // Using custom config
 * const layout = useLayout({
 *   columns: 3,
 *   placements: [
 *     { cardId: "stats", col: 1, row: 1, colSpan: 2 },
 *     { cardId: "chart", col: 3, row: 1 },
 *   ]
 * });
 * ```
 */
export function useLayout(
  config: PresetLayoutName | BentoLayoutConfig,
  cardIds?: string[],
): BentoLayoutConfig {
  return useMemo(() => {
    if (isPresetName(config)) {
      if (!cardIds) {
        throw new Error("cardIds required when using preset layout name");
      }
      return presetToLayout(config, cardIds);
    }
    return config;
  }, [config, cardIds]);
}
