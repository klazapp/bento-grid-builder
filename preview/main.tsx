import React from "react";
import { createRoot } from "react-dom/client";
import { UnifiedBentoGrid } from "../src";

// Inject global styles
const style = document.createElement("style");
style.textContent = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
    background: #000;
    min-height: 100vh;
    color: #fff;
  }
  
  .app {
    max-width: 1200px;
    margin: 0 auto;
    padding: 80px 24px;
  }
  
  .app h1 {
    font-size: 56px;
    font-weight: 600;
    letter-spacing: -0.02em;
    text-align: center;
    margin-bottom: 16px;
  }
  
  .app > p {
    text-align: center;
    color: #86868b;
    font-size: 21px;
    margin-bottom: 80px;
  }
  
  /* Base card - no background, cards define their own */
  .bento-card {
    height: 100%;
    border-radius: 24px;
    overflow: hidden;
  }
  
  /* Feature card - large hero */
  .feature-card {
    background: linear-gradient(145deg, #1d1d1f 0%, #0a0a0a 100%);
    height: 100%;
    padding: 48px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    border-radius: 24px;
  }
  
  .feature-card .label {
    color: #f5f5f7;
    font-size: 17px;
    font-weight: 600;
  }
  
  .feature-card h2 {
    font-size: 48px;
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.1;
    max-width: 400px;
  }
  
  .feature-card .highlight {
    background: linear-gradient(90deg, #2997ff, #5ac8fa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  /* Stat card */
  .stat-card {
    background: #1d1d1f;
    height: 100%;
    padding: 32px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    border-radius: 24px;
  }
  
  .stat-card .value {
    font-size: 64px;
    font-weight: 600;
    letter-spacing: -0.03em;
    line-height: 1;
  }
  
  .stat-card .value.blue { color: #2997ff; }
  .stat-card .value.green { color: #30d158; }
  .stat-card .value.orange { color: #ff9f0a; }
  .stat-card .value.pink { color: #ff375f; }
  .stat-card .value.purple { color: #bf5af2; }
  
  .stat-card .label {
    color: #86868b;
    font-size: 17px;
    margin-top: 8px;
  }
  
  /* Image card */
  .image-card {
    height: 100%;
    border-radius: 24px;
    overflow: hidden;
    position: relative;
  }
  
  .image-card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .image-card .overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 32px;
    background: linear-gradient(transparent, rgba(0,0,0,0.8));
  }
  
  .image-card .overlay h3 {
    font-size: 24px;
    font-weight: 600;
  }
  
  /* Gradient card */
  .gradient-card {
    height: 100%;
    padding: 32px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    border-radius: 24px;
  }
  
  .gradient-card.blue {
    background: linear-gradient(145deg, #0071e3 0%, #004999 100%);
  }
  
  .gradient-card.purple {
    background: linear-gradient(145deg, #bf5af2 0%, #8944c6 100%);
  }
  
  .gradient-card.orange {
    background: linear-gradient(145deg, #ff9f0a 0%, #e67700 100%);
  }
  
  .gradient-card h3 {
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  
  .gradient-card p {
    font-size: 15px;
    opacity: 0.85;
  }
  
  /* Chart card */
  .chart-card {
    background: #1d1d1f;
    height: 100%;
    padding: 32px;
    border-radius: 24px;
    display: flex;
    flex-direction: column;
  }
  
  .chart-card .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
  }
  
  .chart-card h3 {
    font-size: 17px;
    font-weight: 600;
    color: #86868b;
  }
  
  .chart-card .value {
    font-size: 32px;
    font-weight: 600;
  }
  
  .chart-card .bars {
    flex: 1;
    display: flex;
    align-items: flex-end;
    gap: 6px;
  }
  
  .chart-card .bar {
    flex: 1;
    background: linear-gradient(180deg, #2997ff, #0071e3);
    border-radius: 4px;
    min-height: 8px;
  }
  
  /* Icon card */
  .icon-card {
    background: #1d1d1f;
    height: 100%;
    padding: 32px;
    border-radius: 24px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  
  .icon-card .icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
  }
  
  .icon-card .icon.blue { background: rgba(41, 151, 255, 0.2); }
  .icon-card .icon.green { background: rgba(48, 209, 88, 0.2); }
  .icon-card .icon.orange { background: rgba(255, 159, 10, 0.2); }
  
  .icon-card h3 {
    font-size: 21px;
    font-weight: 600;
    margin-bottom: 4px;
  }
  
  .icon-card p {
    font-size: 15px;
    color: #86868b;
  }
`;
document.head.appendChild(style);

// Card Components
const FeatureCard = ({
  label,
  title,
  highlight,
}: {
  label: string;
  title: string;
  highlight: string;
}) => (
  <div className="feature-card">
    <span className="label">{label}</span>
    <h2>
      {title} <span className="highlight">{highlight}</span>
    </h2>
  </div>
);

const StatCard = ({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) => (
  <div className="stat-card">
    <div className={`value ${color}`}>{value}</div>
    <div className="label">{label}</div>
  </div>
);

const GradientCard = ({
  title,
  description,
  color,
}: {
  title: string;
  description: string;
  color: string;
}) => (
  <div className={`gradient-card ${color}`}>
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);

const ChartCard = ({
  title,
  value,
  data,
}: {
  title: string;
  value: string;
  data: number[];
}) => (
  <div className="chart-card">
    <div className="header">
      <div>
        <h3>{title}</h3>
        <div className="value">{value}</div>
      </div>
    </div>
    <div className="bars">
      {data.map((h, i) => (
        <div key={i} className="bar" style={{ height: `${h}%` }} />
      ))}
    </div>
  </div>
);

const IconCard = ({
  icon,
  title,
  description,
  color,
}: {
  icon: string;
  title: string;
  description: string;
  color: string;
}) => (
  <div className="icon-card">
    <div className={`icon ${color}`}>{icon}</div>
    <div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  </div>
);

const ImageCard = ({ src, title }: { src: string; title: string }) => (
  <div className="image-card">
    <img src={src} alt={title} />
    <div className="overlay">
      <h3>{title}</h3>
    </div>
  </div>
);

interface Data {
  chartData: number[];
}

const data: Data = {
  chartData: [35, 55, 45, 70, 50, 85, 60, 90, 75, 95, 80, 88],
};

function AppleBento() {
  return (
    <UnifiedBentoGrid<Data>
      layout={{
        columns: 4,
        rows: 4,
        gap: 12,
        placements: [
          // Row 1-2: Large feature + stats
          { cardId: "feature", col: 1, row: 1, colSpan: 2, rowSpan: 2 },
          { cardId: "stat1", col: 3, row: 1 },
          { cardId: "stat2", col: 4, row: 1 },
          { cardId: "chart", col: 3, row: 2, colSpan: 2 },
          // Row 3: Mixed sizes
          { cardId: "gradient1", col: 1, row: 3 },
          { cardId: "image", col: 2, row: 3, colSpan: 2, rowSpan: 2 },
          { cardId: "icon1", col: 4, row: 3 },
          // Row 4
          { cardId: "icon2", col: 1, row: 4 },
          { cardId: "gradient2", col: 4, row: 4 },
        ],
      }}
      cards={[
        {
          id: "feature",
          component: FeatureCard,
          propsSelector: () => ({
            label: "Introducing",
            title: "The future of",
            highlight: "dashboards.",
          }),
        },
        {
          id: "stat1",
          component: StatCard,
          propsSelector: () => ({
            value: "98%",
            label: "Uptime",
            color: "green",
          }),
        },
        {
          id: "stat2",
          component: StatCard,
          propsSelector: () => ({
            value: "2.4M",
            label: "Users",
            color: "blue",
          }),
        },
        {
          id: "chart",
          component: ChartCard,
          propsSelector: (d) => ({
            title: "Revenue",
            value: "$84,254",
            data: d.chartData,
          }),
        },
        {
          id: "gradient1",
          component: GradientCard,
          propsSelector: () => ({
            title: "Fast",
            description: "Blazing performance",
            color: "blue",
          }),
        },
        {
          id: "image",
          component: ImageCard,
          propsSelector: () => ({
            src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
            title: "Beautiful Design",
          }),
        },
        {
          id: "icon1",
          component: IconCard,
          propsSelector: () => ({
            icon: "⚡",
            title: "Lightning",
            description: "Instant updates",
            color: "orange",
          }),
        },
        {
          id: "icon2",
          component: IconCard,
          propsSelector: () => ({
            icon: "🔒",
            title: "Secure",
            description: "Enterprise ready",
            color: "green",
          }),
        },
        {
          id: "gradient2",
          component: GradientCard,
          propsSelector: () => ({
            title: "Scale",
            description: "Grows with you",
            color: "purple",
          }),
        },
      ]}
      data={data}
      animated
      animationDuration={500}
    />
  );
}

function App() {
  return (
    <div className="app">
      <h1>Bento Grid</h1>
      <p>Beautiful layouts, effortlessly.</p>
      <AppleBento />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
