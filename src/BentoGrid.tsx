import React, { useMemo, useEffect } from "react";
import type {
  BentoGridProps,
  BentoLayoutConfig,
  BentoCardDefinition,
  CardDataMapping,
  CardWrapperProps,
  UnifiedBentoGridProps,
  UnifiedCardDefinition,
} from "./types.js";
import { isPresetName, presetToLayout } from "./presets.js";
import { BentoCard } from "./BentoCard.js";
import { validateLayout } from "./utils.js";
import { useResponsiveLayout } from "./hooks.js";

/**
 * Default card wrapper - just uses BentoCard
 */
const DefaultCardWrapper: React.FC<CardWrapperProps> = ({
  children,
  className,
  style,
}) => (
  <BentoCard className={className} style={style}>
    {children}
  </BentoCard>
);

/**
 * Default loading component - simple pulse animation
 */
const DefaultLoadingComponent: React.FC = () => (
  <div
    className="bento-card-loading"
    style={{
      width: "100%",
      height: "100%",
      minHeight: 100,
      backgroundColor: "var(--bento-loading-bg, rgba(128, 128, 128, 0.1))",
      borderRadius: "var(--bento-card-radius, 12px)",
      animation: "bento-pulse 1.5s ease-in-out infinite",
    }}
    aria-label="Loading"
    role="status"
  />
);

/**
 * Inject base grid styles into the document
 * Uses CSS custom properties so Tailwind classes can override
 */
function useGridStyles() {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const styleId = "bento-grid-styles";
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .bento-grid {
        display: grid;
        grid-template-columns: repeat(var(--bento-columns, 3), 1fr);
        grid-template-rows: repeat(var(--bento-rows, 2), minmax(0, 1fr));
        column-gap: var(--bento-column-gap, var(--bento-gap, 16px));
        row-gap: var(--bento-row-gap, var(--bento-gap, 16px));
      }
      .bento-cell {
        grid-column: var(--bento-col, 1) / span var(--bento-col-span, 1);
        grid-row: var(--bento-row, 1) / span var(--bento-row-span, 1);
      }
    `;
    document.head.appendChild(style);
  }, []);
}

/**
 * Inject animation keyframes into the document
 */
function useAnimationStyles() {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const styleId = "bento-grid-animations";
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @keyframes bento-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      @keyframes bento-fade-in {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
      .bento-cell-animated {
        animation: bento-fade-in var(--bento-animation-duration, 300ms) ease-out;
      }
    `;
    document.head.appendChild(style);
  }, []);
}

/**
 * Error boundary for individual cards
 * Resets when cardId or children change
 */
class CardErrorBoundary extends React.Component<
  {
    cardId: string;
    onError?: (cardId: string, error: Error) => void;
    children: React.ReactNode;
    resetKey?: string | number;
  },
  { hasError: boolean; errorKey: string }
> {
  constructor(props: {
    cardId: string;
    onError?: (cardId: string, error: Error) => void;
    children: React.ReactNode;
    resetKey?: string | number;
  }) {
    super(props);
    this.state = {
      hasError: false,
      errorKey: `${props.cardId}-${props.resetKey ?? ""}`,
    };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  static getDerivedStateFromProps(
    props: { cardId: string; resetKey?: string | number },
    state: { errorKey: string },
  ) {
    const newKey = `${props.cardId}-${props.resetKey ?? ""}`;
    // Reset error state when key changes
    if (newKey !== state.errorKey) {
      return { hasError: false, errorKey: newKey };
    }
    return null;
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(this.props.cardId, error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="bento-card-error"
          role="alert"
          style={{ color: "#ef4444", padding: 16 }}
        >
          Failed to render card
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * BentoGrid - A flexible, configurable bento grid layout system
 *
 * @example
 * ```tsx
 * <BentoGrid
 *   layout="3x3"
 *   cards={[
 *     { id: 'stats', component: StatsCard },
 *     { id: 'chart', component: ChartCard },
 *   ]}
 *   data={myData}
 *   dataMapping={[
 *     { cardId: 'stats', propsSelector: (d) => ({ count: d.total }) },
 *     { cardId: 'chart', propsSelector: (d) => ({ points: d.chartData }) },
 *   ]}
 * />
 * ```
 */
export function BentoGrid<TData>({
  layout,
  cards,
  data,
  dataMapping,
  className = "",
  style,
  cardWrapper,
  onCardError,
  ariaLabel,
  ariaLabelledBy,
  animated = false,
  animationDuration = 300,
  cellClassName,
}: BentoGridProps<TData>): React.ReactElement {
  // Inject styles
  useGridStyles();
  useAnimationStyles();

  // Handle responsive layouts
  const responsiveLayout = useResponsiveLayout(layout);

  // Choose card wrapper
  const CardWrapper = cardWrapper ?? DefaultCardWrapper;

  // Resolve layout config from preset or use directly
  const resolvedLayout = useMemo((): BentoLayoutConfig => {
    if (isPresetName(responsiveLayout)) {
      const cardIds = dataMapping.map((m) => m.cardId);
      return presetToLayout(responsiveLayout, cardIds);
    }
    return responsiveLayout as BentoLayoutConfig;
  }, [responsiveLayout, dataMapping]);

  // Create lookup maps for cards and data mappings
  const cardMap = useMemo(() => {
    const map = new Map<string, BentoCardDefinition>();
    cards.forEach((card) => map.set(card.id, card));
    return map;
  }, [cards]);

  const dataMappingMap = useMemo(() => {
    const map = new Map<string, CardDataMapping<TData>>();
    dataMapping.forEach((mapping) => map.set(mapping.cardId, mapping));
    return map;
  }, [dataMapping]);

  // Validate layout in development
  useMemo(() => {
    if (process.env.NODE_ENV !== "production") {
      const errors = validateLayout(resolvedLayout);
      if (errors.length > 0) {
        console.warn("BentoGrid layout validation errors:", errors);
      }

      // Check for missing card definitions
      for (const placement of resolvedLayout.placements) {
        if (!cards.some((c) => c.id === placement.cardId)) {
          console.warn(
            `BentoGrid: Card "${placement.cardId}" in layout but not in cards array`,
          );
        }
      }

      // Check for missing data mappings
      for (const placement of resolvedLayout.placements) {
        if (!dataMapping.some((m) => m.cardId === placement.cardId)) {
          console.warn(
            `BentoGrid: Card "${placement.cardId}" has no data mapping`,
          );
        }
      }
    }
  }, [resolvedLayout, cards, dataMapping]);

  // Calculate grid dimensions
  const {
    columns,
    rows,
    gap = 16,
    columnGap,
    rowGap,
    placements,
  } = resolvedLayout;
  const calculatedRows =
    rows ?? Math.max(...placements.map((p) => p.row + (p.rowSpan ?? 1) - 1), 1);

  // Grid uses CSS custom properties - Tailwind classes can override the CSS rules
  const gridStyle: React.CSSProperties = {
    "--bento-columns": columns,
    "--bento-rows": calculatedRows,
    "--bento-gap": `${gap}px`,
    "--bento-column-gap": `${columnGap ?? gap}px`,
    "--bento-row-gap": `${rowGap ?? gap}px`,
    ...(animated && { "--bento-animation-duration": `${animationDuration}ms` }),
    ...style,
  } as React.CSSProperties;

  // Helper to get cell class name
  const getCellClassName = (cardId: string) => {
    const baseClass = `bento-cell ${animated ? "bento-cell-animated" : ""}`;
    if (!cellClassName) return baseClass;
    if (typeof cellClassName === "function")
      return `${baseClass} ${cellClassName(cardId)}`;
    return `${baseClass} ${cellClassName}`;
  };

  return (
    <div
      className={`bento-grid ${className}`}
      style={gridStyle}
      role="region"
      aria-label={ariaLabel ?? (ariaLabelledBy ? undefined : "Dashboard grid")}
      aria-labelledby={ariaLabelledBy}
    >
      {placements.map((placement) => {
        const card = cardMap.get(placement.cardId);
        const mapping = dataMappingMap.get(placement.cardId);

        if (!card) {
          console.warn(`BentoGrid: Card "${placement.cardId}" not found`);
          return null;
        }

        // Get props from data mapping or empty object
        const cardProps = mapping ? mapping.propsSelector(data) : {};

        // Create a reset key for error boundary - changes when data changes
        const resetKey = JSON.stringify(cardProps);

        // Calculate span (placement overrides card defaults)
        const colSpan = placement.colSpan ?? card.colSpan ?? 1;
        const rowSpan = placement.rowSpan ?? card.rowSpan ?? 1;

        // Cell uses CSS custom properties for positioning
        const cellStyle: React.CSSProperties = {
          "--bento-col": placement.col,
          "--bento-row": placement.row,
          "--bento-col-span": colSpan,
          "--bento-row-span": rowSpan,
        } as React.CSSProperties;

        const CardComponent = card.component;

        return (
          <div
            key={`${placement.cardId}-${placement.col}-${placement.row}`}
            className={getCellClassName(placement.cardId)}
            style={cellStyle}
            data-card-id={placement.cardId}
          >
            <CardErrorBoundary
              cardId={placement.cardId}
              onError={onCardError}
              resetKey={resetKey}
            >
              <CardWrapper cardId={placement.cardId}>
                <CardComponent {...cardProps} />
              </CardWrapper>
            </CardErrorBoundary>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Check if a card should be visible based on its visibility config
 */
function isCardVisible<TData>(
  card: UnifiedCardDefinition<TData>,
  data: TData,
): boolean {
  if (card.visible === undefined) return true;
  if (typeof card.visible === "function") return card.visible(data);
  return card.visible;
}

/**
 * Check if a card is in loading state
 */
function isCardLoading<TData>(
  card: UnifiedCardDefinition<TData>,
  data: TData,
): boolean {
  if (card.loading === undefined) return false;
  if (typeof card.loading === "function") return card.loading(data);
  return card.loading;
}

/**
 * UnifiedBentoGrid - Cleaner API that combines cards and data mapping
 *
 * This is the preferred way to use BentoGrid. Instead of separate `cards` and
 * `dataMapping` arrays, you define everything in one place.
 *
 * @example
 * ```tsx
 * <UnifiedBentoGrid
 *   layout="3x2"
 *   cards={[
 *     {
 *       id: 'stats',
 *       component: StatsCard,
 *       propsSelector: (d) => ({ count: d.total, label: 'Users' }),
 *       colSpan: 2,
 *     },
 *     {
 *       id: 'chart',
 *       component: ChartCard,
 *       propsSelector: (d) => ({ data: d.chartData }),
 *       visible: (d) => d.chartData.length > 0,
 *       loading: (d) => d.isLoading,
 *     },
 *   ]}
 *   data={myData}
 *   animated
 * />
 * ```
 */
export function UnifiedBentoGrid<TData>({
  layout,
  cards,
  data,
  className = "",
  style,
  cardWrapper,
  onCardError,
  ariaLabel,
  ariaLabelledBy,
  animated = false,
  animationDuration = 300,
  loadingComponent: GlobalLoadingComponent = DefaultLoadingComponent,
  cellClassName,
}: UnifiedBentoGridProps<TData>): React.ReactElement {
  // Inject styles
  useGridStyles();
  useAnimationStyles();

  // Handle responsive layouts
  const responsiveLayout = useResponsiveLayout(layout);

  // Choose card wrapper
  const CardWrapper = cardWrapper ?? DefaultCardWrapper;

  // Filter visible cards
  const visibleCards = useMemo(() => {
    return cards.filter((card) => isCardVisible(card, data));
  }, [cards, data]);

  // Resolve layout config from preset or use directly
  const resolvedLayout = useMemo((): BentoLayoutConfig => {
    if (isPresetName(responsiveLayout)) {
      const cardIds = visibleCards.map((c) => c.id);
      return presetToLayout(responsiveLayout, cardIds);
    }
    return responsiveLayout as BentoLayoutConfig;
  }, [responsiveLayout, visibleCards]);

  // Create lookup map for cards
  const cardMap = useMemo(() => {
    const map = new Map<string, UnifiedCardDefinition<TData>>();
    visibleCards.forEach((card) => map.set(card.id, card));
    return map;
  }, [visibleCards]);

  // Validate layout in development
  useMemo(() => {
    if (process.env.NODE_ENV !== "production") {
      const errors = validateLayout(resolvedLayout);
      if (errors.length > 0) {
        console.warn("UnifiedBentoGrid layout validation errors:", errors);
      }

      // Check for missing card definitions
      for (const placement of resolvedLayout.placements) {
        if (!visibleCards.some((c) => c.id === placement.cardId)) {
          console.warn(
            `UnifiedBentoGrid: Card "${placement.cardId}" in layout but not in cards array`,
          );
        }
      }
    }
  }, [resolvedLayout, visibleCards]);

  // Calculate grid dimensions
  const {
    columns,
    rows,
    gap = 16,
    columnGap,
    rowGap,
    placements,
  } = resolvedLayout;
  const calculatedRows =
    rows ?? Math.max(...placements.map((p) => p.row + (p.rowSpan ?? 1) - 1), 1);

  // Grid uses CSS custom properties - Tailwind classes can override the CSS rules
  const gridStyle: React.CSSProperties = {
    "--bento-columns": columns,
    "--bento-rows": calculatedRows,
    "--bento-gap": `${gap}px`,
    "--bento-column-gap": `${columnGap ?? gap}px`,
    "--bento-row-gap": `${rowGap ?? gap}px`,
    ...(animated && { "--bento-animation-duration": `${animationDuration}ms` }),
    ...style,
  } as React.CSSProperties;

  // Helper to get cell class name
  const getCellClassName = (cardId: string) => {
    const baseClass = `bento-cell ${animated ? "bento-cell-animated" : ""}`;
    if (!cellClassName) return baseClass;
    if (typeof cellClassName === "function")
      return `${baseClass} ${cellClassName(cardId)}`;
    return `${baseClass} ${cellClassName}`;
  };

  return (
    <div
      className={`bento-grid ${className}`}
      style={gridStyle}
      role="region"
      aria-label={ariaLabel ?? (ariaLabelledBy ? undefined : "Dashboard grid")}
      aria-labelledby={ariaLabelledBy}
    >
      {placements.map((placement) => {
        const card = cardMap.get(placement.cardId);

        if (!card) {
          if (process.env.NODE_ENV !== "production") {
            console.warn(
              `UnifiedBentoGrid: Card "${placement.cardId}" not found`,
            );
          }
          return null;
        }

        // Check loading state
        const loading = isCardLoading(card, data);

        // Get props from card's propsSelector
        const cardProps = card.propsSelector(data);

        // Create a reset key for error boundary
        const resetKey = JSON.stringify(cardProps);

        // Calculate span (placement overrides card defaults)
        const colSpan = placement.colSpan ?? card.colSpan ?? 1;
        const rowSpan = placement.rowSpan ?? card.rowSpan ?? 1;

        // Cell uses CSS custom properties for positioning
        const cellStyle: React.CSSProperties = {
          "--bento-col": placement.col,
          "--bento-row": placement.row,
          "--bento-col-span": colSpan,
          "--bento-row-span": rowSpan,
        } as React.CSSProperties;

        const CardComponent = card.component;
        const LoadingComponent =
          card.loadingComponent ?? GlobalLoadingComponent;

        return (
          <div
            key={`${placement.cardId}-${placement.col}-${placement.row}`}
            className={getCellClassName(placement.cardId)}
            style={cellStyle}
            data-card-id={placement.cardId}
          >
            <CardErrorBoundary
              cardId={placement.cardId}
              onError={onCardError}
              resetKey={resetKey}
            >
              <CardWrapper cardId={placement.cardId}>
                {loading ? (
                  <LoadingComponent />
                ) : (
                  <CardComponent {...cardProps} />
                )}
              </CardWrapper>
            </CardErrorBoundary>
          </div>
        );
      })}
    </div>
  );
}
