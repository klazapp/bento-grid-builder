/**
 * Basic BentoGrid usage example
 */
import React from "react";
import { BentoGrid } from "bento-grid-builder";

// Define your card components
const StatsCard = ({ count, label }: { count: number; label: string }) => (
  <div>
    <h2 style={{ fontSize: 32, margin: 0 }}>{count.toLocaleString()}</h2>
    <p style={{ margin: 0, opacity: 0.7 }}>{label}</p>
  </div>
);

const ChartCard = ({ data }: { data: number[] }) => (
  <div>
    <h3>Chart</h3>
    <div
      style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 60 }}
    >
      {data.map((value, i) => (
        <div
          key={i}
          style={{
            width: 20,
            height: `${value}%`,
            backgroundColor: "currentColor",
            opacity: 0.6,
          }}
        />
      ))}
    </div>
  </div>
);

// Your data type
interface DashboardData {
  totalUsers: number;
  activeUsers: number;
  chartData: number[];
}

// Example usage
export function BasicExample() {
  const data: DashboardData = {
    totalUsers: 12543,
    activeUsers: 8721,
    chartData: [30, 50, 80, 60, 90, 70, 85],
  };

  return (
    <BentoGrid<DashboardData>
      layout="3x2"
      cards={[
        { id: "total", component: StatsCard },
        { id: "active", component: StatsCard },
        { id: "chart", component: ChartCard, colSpan: 2 },
      ]}
      data={data}
      dataMapping={[
        {
          cardId: "total",
          propsSelector: (d) => ({ count: d.totalUsers, label: "Total Users" }),
        },
        {
          cardId: "active",
          propsSelector: (d) => ({
            count: d.activeUsers,
            label: "Active Users",
          }),
        },
        { cardId: "chart", propsSelector: (d) => ({ data: d.chartData }) },
      ]}
    />
  );
}
