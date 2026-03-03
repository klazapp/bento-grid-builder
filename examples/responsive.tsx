/**
 * Responsive layout example
 */
import React from "react";
import { UnifiedBentoGrid, layoutBuilder } from "bento-grid-builder";

const Card = ({ title, value }: { title: string; value: string }) => (
  <div style={{ textAlign: "center" }}>
    <h3 style={{ margin: "0 0 8px" }}>{title}</h3>
    <p style={{ fontSize: 24, margin: 0, fontWeight: "bold" }}>{value}</p>
  </div>
);

// Custom desktop layout with specific positioning
const desktopLayout = layoutBuilder(4)
  .gap(20)
  .place("hero", 1, 1, { colSpan: 2, rowSpan: 2 })
  .place("stats1", 3, 1)
  .place("stats2", 4, 1)
  .place("stats3", 3, 2)
  .place("stats4", 4, 2)
  .build();

interface Data {
  hero: string;
  stats: { title: string; value: string }[];
}

export function ResponsiveExample() {
  const data: Data = {
    hero: "Welcome to Dashboard",
    stats: [
      { title: "Users", value: "12.5K" },
      { title: "Revenue", value: "$45K" },
      { title: "Orders", value: "892" },
      { title: "Growth", value: "+23%" },
    ],
  };

  return (
    <UnifiedBentoGrid<Data>
      layout={{
        // Mobile: 1 column stack
        default: {
          columns: 1,
          gap: 12,
          placements: [
            { cardId: "hero", col: 1, row: 1 },
            { cardId: "stats1", col: 1, row: 2 },
            { cardId: "stats2", col: 1, row: 3 },
            { cardId: "stats3", col: 1, row: 4 },
            { cardId: "stats4", col: 1, row: 5 },
          ],
        },
        breakpoints: [
          // Tablet: 2x3 grid
          {
            minWidth: 768,
            layout: {
              columns: 2,
              gap: 16,
              placements: [
                { cardId: "hero", col: 1, row: 1, colSpan: 2 },
                { cardId: "stats1", col: 1, row: 2 },
                { cardId: "stats2", col: 2, row: 2 },
                { cardId: "stats3", col: 1, row: 3 },
                { cardId: "stats4", col: 2, row: 3 },
              ],
            },
          },
          // Desktop: custom 4-column layout
          { minWidth: 1024, layout: desktopLayout },
        ],
      }}
      cards={[
        {
          id: "hero",
          component: ({ text }: { text: string }) => (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <h1>{text}</h1>
            </div>
          ),
          propsSelector: (d) => ({ text: d.hero }),
        },
        {
          id: "stats1",
          component: Card,
          propsSelector: (d) => d.stats[0],
        },
        {
          id: "stats2",
          component: Card,
          propsSelector: (d) => d.stats[1],
        },
        {
          id: "stats3",
          component: Card,
          propsSelector: (d) => d.stats[2],
        },
        {
          id: "stats4",
          component: Card,
          propsSelector: (d) => d.stats[3],
        },
      ]}
      data={data}
      animated
    />
  );
}
