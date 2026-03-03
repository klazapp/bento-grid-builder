import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BentoGrid, UnifiedBentoGrid } from "../BentoGrid";

const StatsCard = ({ count, label }: { count: number; label: string }) => (
  <div data-testid="stats-card">
    <span>{count}</span>
    <span>{label}</span>
  </div>
);

const ChartCard = ({ data }: { data: number[] }) => (
  <div data-testid="chart-card">Chart: {data.length} points</div>
);

describe("BentoGrid", () => {
  it("renders cards in grid", () => {
    render(
      <BentoGrid
        layout="2x2"
        cards={[
          { id: "stats", component: StatsCard },
          { id: "chart", component: ChartCard },
        ]}
        data={{ total: 100, chartData: [1, 2, 3] }}
        dataMapping={[
          {
            cardId: "stats",
            propsSelector: (d) => ({ count: d.total, label: "Users" }),
          },
          { cardId: "chart", propsSelector: (d) => ({ data: d.chartData }) },
        ]}
      />,
    );

    expect(screen.getByTestId("stats-card")).toBeInTheDocument();
    expect(screen.getByTestId("chart-card")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("Chart: 3 points")).toBeInTheDocument();
  });

  it("applies grid styles via CSS custom properties", () => {
    const { container } = render(
      <BentoGrid
        layout={{
          columns: 3,
          gap: 20,
          placements: [{ cardId: "stats", col: 1, row: 1 }],
        }}
        cards={[{ id: "stats", component: StatsCard }]}
        data={{ total: 50 }}
        dataMapping={[
          {
            cardId: "stats",
            propsSelector: (d) => ({ count: d.total, label: "Test" }),
          },
        ]}
      />,
    );

    const grid = container.querySelector(".bento-grid") as HTMLElement;
    expect(grid).toHaveClass("bento-grid");
    // CSS custom properties are set on the element
    expect(grid.style.getPropertyValue("--bento-columns")).toBe("3");
    expect(grid.style.getPropertyValue("--bento-gap")).toBe("20px");
  });

  it("has accessibility attributes", () => {
    const { container } = render(
      <BentoGrid
        layout="2x2"
        cards={[{ id: "stats", component: StatsCard }]}
        data={{ total: 100 }}
        dataMapping={[
          {
            cardId: "stats",
            propsSelector: (d) => ({ count: d.total, label: "Test" }),
          },
        ]}
        ariaLabel="Test dashboard"
      />,
    );

    const grid = container.querySelector(".bento-grid");
    expect(grid).toHaveAttribute("role", "region");
    expect(grid).toHaveAttribute("aria-label", "Test dashboard");
  });

  it("calls onCardError when card throws", () => {
    const ThrowingCard = () => {
      throw new Error("Card error");
    };

    const onCardError = vi.fn();

    render(
      <BentoGrid
        layout="2x2"
        cards={[{ id: "broken", component: ThrowingCard }]}
        data={{}}
        dataMapping={[{ cardId: "broken", propsSelector: () => ({}) }]}
        onCardError={onCardError}
      />,
    );

    expect(onCardError).toHaveBeenCalledWith("broken", expect.any(Error));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Failed to render card",
    );
  });

  it("applies animation class when animated", () => {
    const { container } = render(
      <BentoGrid
        layout="2x2"
        cards={[{ id: "stats", component: StatsCard }]}
        data={{ total: 100 }}
        dataMapping={[
          {
            cardId: "stats",
            propsSelector: (d) => ({ count: d.total, label: "Test" }),
          },
        ]}
        animated
      />,
    );

    const cell = container.querySelector(".bento-cell");
    expect(cell).toHaveClass("bento-cell-animated");
  });
});

describe("UnifiedBentoGrid", () => {
  it("renders with unified card definitions", () => {
    render(
      <UnifiedBentoGrid
        layout="2x2"
        cards={[
          {
            id: "stats",
            component: StatsCard,
            propsSelector: (d: any) => ({ count: d.total, label: "Users" }),
          },
        ]}
        data={{ total: 200 }}
      />,
    );

    expect(screen.getByTestId("stats-card")).toBeInTheDocument();
    expect(screen.getByText("200")).toBeInTheDocument();
  });

  it("respects visible prop as boolean", () => {
    render(
      <UnifiedBentoGrid
        layout="2x2"
        cards={[
          {
            id: "visible",
            component: StatsCard,
            propsSelector: () => ({ count: 1, label: "Visible" }),
            visible: true,
          },
          {
            id: "hidden",
            component: StatsCard,
            propsSelector: () => ({ count: 2, label: "Hidden" }),
            visible: false,
          },
        ]}
        data={{}}
      />,
    );

    expect(screen.getByText("Visible")).toBeInTheDocument();
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
  });

  it("respects visible prop as function", () => {
    render(
      <UnifiedBentoGrid
        layout="2x2"
        cards={[
          {
            id: "conditional",
            component: StatsCard,
            propsSelector: () => ({ count: 1, label: "Conditional" }),
            visible: (d: any) => d.showCard,
          },
        ]}
        data={{ showCard: false }}
      />,
    );

    expect(screen.queryByText("Conditional")).not.toBeInTheDocument();
  });

  it("shows loading component when loading", () => {
    const LoadingSkeleton = () => <div data-testid="loading">Loading...</div>;

    render(
      <UnifiedBentoGrid
        layout="2x2"
        cards={[
          {
            id: "stats",
            component: StatsCard,
            propsSelector: () => ({ count: 1, label: "Test" }),
            loading: true,
          },
        ]}
        data={{}}
        loadingComponent={LoadingSkeleton}
      />,
    );

    expect(screen.getByTestId("loading")).toBeInTheDocument();
    expect(screen.queryByTestId("stats-card")).not.toBeInTheDocument();
  });

  it("uses per-card loading component", () => {
    const CardSkeleton = () => (
      <div data-testid="card-skeleton">Card loading</div>
    );

    render(
      <UnifiedBentoGrid
        layout="2x2"
        cards={[
          {
            id: "stats",
            component: StatsCard,
            propsSelector: () => ({ count: 1, label: "Test" }),
            loading: true,
            loadingComponent: CardSkeleton,
          },
        ]}
        data={{}}
      />,
    );

    expect(screen.getByTestId("card-skeleton")).toBeInTheDocument();
  });

  it("supports loading as function", () => {
    render(
      <UnifiedBentoGrid
        layout="2x2"
        cards={[
          {
            id: "stats",
            component: StatsCard,
            propsSelector: () => ({ count: 1, label: "Test" }),
            loading: (d: any) => d.isLoading,
          },
        ]}
        data={{ isLoading: true }}
      />,
    );

    expect(screen.queryByTestId("stats-card")).not.toBeInTheDocument();
  });
});
