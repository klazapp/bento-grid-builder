/**
 * UnifiedBentoGrid example - cleaner API
 */
import React from "react";
import { UnifiedBentoGrid } from "bento-grid-builder";

// Card components
const StatsCard = ({ count, label }: { count: number; label: string }) => (
  <div>
    <h2 style={{ fontSize: 32, margin: 0 }}>{count.toLocaleString()}</h2>
    <p style={{ margin: 0, opacity: 0.7 }}>{label}</p>
  </div>
);

const ChartCard = ({ data }: { data: number[] }) => (
  <div>
    <h3>Revenue Trend</h3>
    <div
      style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 80 }}
    >
      {data.map((value, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${value}%`,
            backgroundColor: "#3b82f6",
            borderRadius: 4,
          }}
        />
      ))}
    </div>
  </div>
);

const ListCard = ({ items }: { items: string[] }) => (
  <div>
    <h3>Recent Activity</h3>
    <ul style={{ margin: 0, paddingLeft: 20 }}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  </div>
);

// Data type
interface DashboardData {
  totalRevenue: number;
  newOrders: number;
  chartData: number[];
  recentActivity: string[];
  isLoading: boolean;
}

// Custom loading skeleton
const Skeleton = () => (
  <div
    style={{
      width: "100%",
      height: "100%",
      minHeight: 100,
      background:
        "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s infinite",
      borderRadius: 8,
    }}
  />
);

export function UnifiedExample() {
  const data: DashboardData = {
    totalRevenue: 125430,
    newOrders: 47,
    chartData: [40, 65, 45, 80, 55, 90, 70],
    recentActivity: [
      "Order #1234 placed",
      "User signed up",
      "Payment received",
    ],
    isLoading: false,
  };

  return (
    <UnifiedBentoGrid<DashboardData>
      layout="3x2"
      cards={[
        {
          id: "revenue",
          component: StatsCard,
          propsSelector: (d) => ({
            count: d.totalRevenue,
            label: "Total Revenue",
          }),
          colSpan: 2,
        },
        {
          id: "orders",
          component: StatsCard,
          propsSelector: (d) => ({ count: d.newOrders, label: "New Orders" }),
        },
        {
          id: "chart",
          component: ChartCard,
          propsSelector: (d) => ({ data: d.chartData }),
          colSpan: 2,
          loading: (d) => d.isLoading,
          loadingComponent: Skeleton,
        },
        {
          id: "activity",
          component: ListCard,
          propsSelector: (d) => ({ items: d.recentActivity }),
          visible: (d) => d.recentActivity.length > 0,
        },
      ]}
      data={data}
      animated
      animationDuration={400}
    />
  );
}
