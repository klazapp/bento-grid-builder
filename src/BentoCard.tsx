import React from "react";
import type { BentoCardProps } from "./types.js";

/**
 * Default card wrapper component
 * Provides basic styling - users can override with their own wrapper
 * Uses CSS custom properties for easy theming
 */
export const BentoCard: React.FC<BentoCardProps> = ({
  children,
  className = "",
  style,
}) => (
  <div
    className={`bento-card ${className}`}
    style={{
      backgroundColor: "var(--bento-card-bg, transparent)",
      borderRadius: "var(--bento-card-radius, 12px)",
      padding: "var(--bento-card-padding, 16px)",
      border: "var(--bento-card-border, 1px solid rgba(128, 128, 128, 0.2))",
      height: "100%",
      boxSizing: "border-box",
      ...style,
    }}
  >
    {children}
  </div>
);
