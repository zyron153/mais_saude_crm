"use client";

import { useReportWebVitals } from "next/web-vitals";
import { usePerfStore } from "../lib/perf-store";

const RATING_COLOR: Record<string, string> = {
  good: "\x1b[32m",       // green
  "needs-improvement": "\x1b[33m", // yellow
  poor: "\x1b[31m",       // red
};
const RESET = "\x1b[0m";

export function WebVitals() {
  const recordVital = usePerfStore((s) => s.recordVital);

  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV !== "development") return;
    const { name, value, rating } = metric;
    const color = RATING_COLOR[rating] ?? "";
    const rounded = name === "CLS" ? value.toFixed(3) : `${Math.round(value)}ms`;
    console.debug(`[Web Vitals] ${color}${name}: ${rounded} [${rating}]${RESET}`);
    recordVital(name, value, rating);
  });

  return null;
}
