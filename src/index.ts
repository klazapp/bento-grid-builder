// Core components
export { BentoGrid, UnifiedBentoGrid } from "./BentoGrid.js";
export { BentoCard } from "./BentoCard.js";

// Hooks
export {
  useCardDefinitions,
  useDataMapping,
  useLayout,
  useResponsiveLayout,
  useWindowWidth,
  isResponsiveConfig,
} from "./hooks.js";

// Utilities
export { createSimpleLayout, layoutBuilder, validateLayout } from "./utils.js";

// Presets
export {
  PRESET_LAYOUTS,
  presetToLayout,
  isPresetName,
  getPresetSlotNames,
} from "./presets.js";

// Types
export type {
  BentoGridProps,
  UnifiedBentoGridProps,
  BentoCardProps,
  BentoCardDefinition,
  UnifiedCardDefinition,
  BentoLayoutConfig,
  ResponsiveLayoutConfig,
  BreakpointConfig,
  CardPlacement,
  CardDataMapping,
  CardWrapperProps,
  PresetLayoutName,
  PresetLayout,
  PresetSlotMapping,
} from "./types.js";
