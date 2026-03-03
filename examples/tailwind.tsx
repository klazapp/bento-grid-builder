/**
 * Tailwind CSS example
 *
 * BentoGrid uses CSS custom properties for layout, which means Tailwind
 * utility classes naturally override them. No special configuration needed!
 *
 * The grid sets --bento-columns, --bento-gap, etc. via inline styles,
 * and CSS rules consume them. Tailwind classes like `grid-cols-3` or `gap-4`
 * override the CSS rules directly.
 */
import React from "react";
import { UnifiedBentoGrid } from "bento-grid-builder";

const StatsCard = ({ count, label }: { count: number; label: string }) => (
  <div className="text-center">
    <h2 className="text-3xl font-bold">{count.toLocaleString()}</h2>
    <p className="text-gray-500 dark:text-gray-400">{label}</p>
  </div>
);

const ChartCard = ({ title }: { title: string }) => (
  <div>
    <h3 className="font-semibold mb-2">{title}</h3>
    <div className="h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded" />
  </div>
);

interface Data {
  users: number;
  revenue: number;
}

export function TailwindExample() {
  const data: Data = { users: 12543, revenue: 89420 };

  return (
    <UnifiedBentoGrid<Data>
      layout={{
        columns: 3,
        rows: 2,
        placements: [
          { cardId: "users", col: 1, row: 1 },
          { cardId: "revenue", col: 2, row: 1 },
          { cardId: "chart", col: 3, row: 1, rowSpan: 2 },
          { cardId: "activity", col: 1, row: 2, colSpan: 2 },
        ],
      }}
      cards={[
        {
          id: "users",
          component: StatsCard,
          propsSelector: (d) => ({ count: d.users, label: "Total Users" }),
        },
        {
          id: "revenue",
          component: StatsCard,
          propsSelector: (d) => ({ count: d.revenue, label: "Revenue" }),
        },
        {
          id: "chart",
          component: ChartCard,
          propsSelector: () => ({ title: "Growth" }),
        },
        {
          id: "activity",
          component: ChartCard,
          propsSelector: () => ({ title: "Recent Activity" }),
        },
      ]}
      data={data}
      // Tailwind classes override the default CSS - no special props needed!
      className="grid grid-cols-3 gap-4 max-w-4xl mx-auto"
      cellClassName="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
    />
  );
}

/**
 * With dynamic cell classes based on card ID
 */
export function TailwindDynamicExample() {
  const data: Data = { users: 12543, revenue: 89420 };

  return (
    <UnifiedBentoGrid<Data>
      layout={{
        columns: 3,
        rows: 2,
        placements: [
          { cardId: "hero", col: 1, row: 1, colSpan: 2, rowSpan: 2 },
          { cardId: "stats", col: 3, row: 1 },
          { cardId: "chart", col: 3, row: 2 },
        ],
      }}
      cards={[
        {
          id: "hero",
          component: () => (
            <div className="flex items-center justify-center h-full text-white text-2xl font-bold">
              Hero Card
            </div>
          ),
          propsSelector: () => ({}),
        },
        {
          id: "stats",
          component: StatsCard,
          propsSelector: (d) => ({ count: d.users, label: "Users" }),
        },
        {
          id: "chart",
          component: ChartCard,
          propsSelector: () => ({ title: "Chart" }),
        },
      ]}
      data={data}
      // Tailwind classes override the CSS custom properties
      className="grid grid-cols-3 grid-rows-2 gap-4"
      // Dynamic classes per card - use col-span-* and row-span-* for spanning
      cellClassName={(cardId) => {
        const base = "rounded-xl p-4";
        if (cardId === "hero") {
          return `${base} bg-gradient-to-br from-blue-600 to-purple-600 col-span-2 row-span-2`;
        }
        return `${base} bg-white dark:bg-gray-800 border border-gray-200`;
      }}
    />
  );
}

/**
 * How it works:
 *
 * BentoGrid injects base CSS that uses CSS custom properties:
 *   .bento-grid { grid-template-columns: repeat(var(--bento-columns), 1fr); }
 *   .bento-cell { grid-column: var(--bento-col) / span var(--bento-col-span); }
 *
 * The component sets these via inline styles (--bento-columns: 3, etc.)
 *
 * Tailwind classes like `grid-cols-3` or `col-span-2` override the CSS rules
 * directly, giving you full control without any special configuration.
 */
