import type { ComponentType, CSSProperties, ReactNode } from "react";

// ============================================================================
// Card Definition Types
// ============================================================================

/**
 * Definition for a card component that can be rendered in the bento grid
 * Users register their card components with this interface
 */
export interface BentoCardDefinition<TProps = any> {
  /** Unique identifier for this card type */
  id: string;
  /** The React component to render */
  component: ComponentType<TProps>;
  /** Default column span (defaults to 1) */
  colSpan?: number;
  /** Default row span (defaults to 1) */
  rowSpan?: number;
}

/**
 * Unified card definition that combines component, layout, and data mapping
 * This is the preferred way to define cards - cleaner than separate arrays
 * @template TData - The shape of your data source
 * @template TProps - The props your card component expects
 */
export interface UnifiedCardDefinition<TData = unknown, TProps = any> {
  /** Unique identifier for this card */
  id: string;
  /** The React component to render */
  component: ComponentType<TProps>;
  /** Function that extracts props from your data for this card */
  propsSelector: (data: TData) => TProps;
  /** Default column span (defaults to 1) */
  colSpan?: number;
  /** Default row span (defaults to 1) */
  rowSpan?: number;
  /** Whether this card should be visible (defaults to true) */
  visible?: boolean | ((data: TData) => boolean);
  /** Whether this card is in a loading state */
  loading?: boolean | ((data: TData) => boolean);
  /** Custom loading component for this card */
  loadingComponent?: ComponentType;
}

// ============================================================================
// Layout Configuration Types
// ============================================================================

/**
 * Position and size of a card in the grid
 */
export interface CardPlacement {
  /** Card definition ID to render */
  cardId: string;
  /** Starting column (1-indexed) */
  col: number;
  /** Starting row (1-indexed) */
  row: number;
  /** Number of columns to span (overrides card default) */
  colSpan?: number;
  /** Number of rows to span (overrides card default) */
  rowSpan?: number;
}

/**
 * Explicit slot-to-card mapping for preset layouts
 * Allows users to specify which card goes in which slot by name
 */
export interface PresetSlotMapping {
  /** Slot index (0-based) or slot name if preset supports named slots */
  slot: number | string;
  /** Card ID to place in this slot */
  cardId: string;
}

/**
 * Complete layout configuration for the bento grid
 */
export interface BentoLayoutConfig {
  /** Number of columns in the grid */
  columns: number;
  /** Number of rows (optional - auto-calculated if not provided) */
  rows?: number;
  /** Gap between cards in pixels (applies to both row and column) */
  gap?: number;
  /** Gap between columns in pixels (overrides gap for columns) */
  columnGap?: number;
  /** Gap between rows in pixels (overrides gap for rows) */
  rowGap?: number;
  /** Card placements in the grid */
  placements: CardPlacement[];
}

/**
 * Breakpoint configuration for responsive layouts
 */
export interface BreakpointConfig {
  /** Minimum viewport width for this breakpoint (in pixels) */
  minWidth: number;
  /** Layout to use at this breakpoint */
  layout: BentoLayoutConfig | PresetLayoutName;
}

/**
 * Responsive layout configuration
 * Allows different layouts at different viewport widths
 */
export interface ResponsiveLayoutConfig {
  /** Default layout (used when no breakpoint matches) */
  default: BentoLayoutConfig | PresetLayoutName;
  /** Breakpoint-specific layouts (applied when viewport >= minWidth) */
  breakpoints: BreakpointConfig[];
}

// ============================================================================
// Data Mapping Types
// ============================================================================

/**
 * Maps data from your data source to a specific card's props
 * @template TData - The shape of your data source
 */
export interface CardDataMapping<TData = unknown> {
  /** Card definition ID this mapping applies to */
  cardId: string;
  /** Function that extracts props from your data for this card */
  propsSelector: (data: TData) => Record<string, unknown>;
}

// ============================================================================
// Preset Layout Types
// ============================================================================

/** Available preset layout names */
export type PresetLayoutName =
  | "2x2"
  | "3x2"
  | "3x3"
  | "4x2"
  | "2x1-hero-left"
  | "2x1-hero-right"
  | "dashboard-9";

/**
 * Preset layout definition
 */
export interface PresetLayout {
  name: PresetLayoutName;
  columns: number;
  rows: number;
  /** Slot positions for cards - users just provide cardIds in order */
  slots: Array<{
    /** Optional name for this slot (e.g., "hero", "sidebar") */
    name?: string;
    col: number;
    row: number;
    colSpan?: number;
    rowSpan?: number;
  }>;
}

/**
 * Options for preset layout configuration
 */
export interface PresetLayoutOptions {
  /** Card IDs in slot order (legacy approach) */
  cardIds?: string[];
  /** Explicit slot-to-card mapping (preferred approach) */
  slotMapping?: PresetSlotMapping[];
}

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Props for the main BentoGrid component
 * @template TData - The shape of your data source
 */
export interface BentoGridProps<TData = unknown> {
  /** Layout configuration, preset name, or responsive config */
  layout: BentoLayoutConfig | PresetLayoutName | ResponsiveLayoutConfig;
  /** Registered card definitions */
  cards: BentoCardDefinition[];
  /** Your data source */
  data: TData;
  /** Maps your data to each card's props */
  dataMapping: CardDataMapping<TData>[];
  /** Additional CSS class for the grid container */
  className?: string;
  /** Additional inline styles for the grid container */
  style?: CSSProperties;
  /** Custom card wrapper component */
  cardWrapper?: ComponentType<CardWrapperProps>;
  /** Called when a card fails to render */
  onCardError?: (cardId: string, error: Error) => void;
  /** Accessible label for the grid region */
  ariaLabel?: string;
  /** ID of element that labels this grid */
  ariaLabelledBy?: string;
  /** Enable enter/exit animations for cards */
  animated?: boolean;
  /** Animation duration in milliseconds (default: 300) */
  animationDuration?: number;
  /** CSS class for grid cells */
  cellClassName?: string | ((cardId: string) => string);
}

/**
 * Props for the unified BentoGrid component (preferred API)
 * Combines cards and data mapping into a single prop
 * @template TData - The shape of your data source
 */
export interface UnifiedBentoGridProps<TData = unknown> {
  /** Layout configuration, preset name, or responsive config */
  layout: BentoLayoutConfig | PresetLayoutName | ResponsiveLayoutConfig;
  /** Unified card definitions with components and data selectors */
  cards: UnifiedCardDefinition<TData, any>[];
  /** Your data source */
  data: TData;
  /** Additional CSS class for the grid container */
  className?: string;
  /** Additional inline styles for the grid container */
  style?: CSSProperties;
  /** Custom card wrapper component */
  cardWrapper?: ComponentType<CardWrapperProps>;
  /** Called when a card fails to render */
  onCardError?: (cardId: string, error: Error) => void;
  /** Accessible label for the grid region */
  ariaLabel?: string;
  /** ID of element that labels this grid */
  ariaLabelledBy?: string;
  /** Enable enter/exit animations for cards */
  animated?: boolean;
  /** Animation duration in milliseconds (default: 300) */
  animationDuration?: number;
  /** Global loading component for all cards */
  loadingComponent?: ComponentType;
  /** CSS class for grid cells */
  cellClassName?: string | ((cardId: string) => string);
}

/**
 * Props passed to the card wrapper component
 */
export interface CardWrapperProps {
  children: ReactNode;
  cardId: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Props for the default BentoCard wrapper
 */
export interface BentoCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}
