/**
 * Using hooks for cleaner component code
 */
import React from "react";
import {
  BentoGrid,
  useCardDefinitions,
  useDataMapping,
} from "bento-grid-builder";

// Card components
const MetricCard = ({
  value,
  label,
  trend,
}: {
  value: number;
  label: string;
  trend?: number;
}) => (
  <div>
    <p style={{ margin: 0, opacity: 0.7, fontSize: 14 }}>{label}</p>
    <h2 style={{ margin: "4px 0", fontSize: 28 }}>{value.toLocaleString()}</h2>
    {trend !== undefined && (
      <span style={{ color: trend >= 0 ? "#22c55e" : "#ef4444", fontSize: 14 }}>
        {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
      </span>
    )}
  </div>
);

const TableCard = ({ rows }: { rows: { name: string; value: number }[] }) => (
  <div>
    <h3 style={{ margin: "0 0 12px" }}>Top Products</h3>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <tbody>
        {rows.map((row, i) => (
          <tr
            key={i}
            style={{ borderBottom: "1px solid rgba(128,128,128,0.2)" }}
          >
            <td style={{ padding: "8px 0" }}>{row.name}</td>
            <td style={{ padding: "8px 0", textAlign: "right" }}>
              ${row.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Data type
interface AnalyticsData {
  visitors: number;
  visitorsTrend: number;
  conversions: number;
  conversionsTrend: number;
  revenue: number;
  revenueTrend: number;
  topProducts: { name: string; value: number }[];
}

export function HooksExample() {
  // Define cards using hook - stable reference
  const cards = useCardDefinitions({
    visitors: { component: MetricCard },
    conversions: { component: MetricCard },
    revenue: { component: MetricCard, colSpan: 2 },
    products: { component: TableCard, colSpan: 2 },
  });

  // Define data mapping using hook - stable reference
  const dataMapping = useDataMapping<AnalyticsData>({
    visitors: (d) => ({
      value: d.visitors,
      label: "Visitors",
      trend: d.visitorsTrend,
    }),
    conversions: (d) => ({
      value: d.conversions,
      label: "Conversions",
      trend: d.conversionsTrend,
    }),
    revenue: (d) => ({
      value: d.revenue,
      label: "Revenue",
      trend: d.revenueTrend,
    }),
    products: (d) => ({ rows: d.topProducts }),
  });

  const data: AnalyticsData = {
    visitors: 45231,
    visitorsTrend: 12,
    conversions: 1823,
    conversionsTrend: -3,
    revenue: 89420,
    revenueTrend: 8,
    topProducts: [
      { name: "Product A", value: 12500 },
      { name: "Product B", value: 8900 },
      { name: "Product C", value: 6700 },
    ],
  };

  return (
    <BentoGrid<AnalyticsData>
      layout="3x2"
      cards={cards}
      data={data}
      dataMapping={dataMapping}
      ariaLabel="Analytics dashboard"
    />
  );
}
