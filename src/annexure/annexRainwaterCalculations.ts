import type { RowRecord } from "@/annexure/annexureExprEval";

function num(s: string | undefined): number {
  const n = parseFloat(String(s ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function averagePeakRainfall(rows: { rainfall: string }[]): string {
  let count = 0;
  let sum = 0;
  for (const r of rows) {
    const v = num(r.rainfall);
    if (v > 0) {
      count += 1;
      sum += v;
    }
  }
  if (count === 0) return "";
  return (sum / count).toFixed(2);
}

/** Laravel `change_case` for Green Homes / non–rating-type-3 projects. */
export function onedayFromCase(
  caseVal: string,
  avg: number,
  ratingTypeId: number,
): { oneday: string; caseRange: string } {
  const c = parseInt(caseVal, 10);
  const a = avg;
  if (!c || !Number.isFinite(a) || a <= 0) {
    return { oneday: "", caseRange: "" };
  }

  if (ratingTypeId === 3) {
    const pct = (p: number) => ((a * p) / 100).toFixed(3);
    if (c === 1 || c === 2) {
      if (a <= 500) return { oneday: pct(6), caseRange: "Range 1" };
      if (a <= 700) return { oneday: pct(4.5), caseRange: "Range 2" };
      return { oneday: pct(3), caseRange: "Range 3" };
    }
    return { oneday: "", caseRange: "" };
  }

  if (c === 2) {
    let range = "Range 1";
    if (a > 701) range = "Range 5";
    else if (a > 500) range = "Range 4";
    else if (a > 350) range = "Range 3";
    else if (a > 250) range = "Range 2";
    return { oneday: "0", caseRange: range };
  }

  if (c === 1) {
    const pct = (p: number) => ((a * p) / 100 / 1000).toFixed(3);
    if (a <= 250) return { oneday: pct(9), caseRange: "Range 1" };
    if (a <= 350) return { oneday: pct(7.5), caseRange: "Range 2" };
    if (a <= 500) return { oneday: pct(6), caseRange: "Range 3" };
    if (a <= 700) return { oneday: pct(4.5), caseRange: "Range 4" };
    return { oneday: pct(3), caseRange: "Range 5" };
  }

  return { oneday: "", caseRange: "" };
}

export function computeSurfaceRow(
  surfaceId: string,
  area: string,
  coeffs: Record<string, number>,
): { runoff: string; imprevious_area: string } {
  const coeff = coeffs[surfaceId] ?? 0;
  const runoff = surfaceId ? String(coeff) : "";
  const a = num(area);
  const imp = surfaceId && a > 0 ? (a * coeff).toFixed(2) : "0";
  return { runoff, imprevious_area: imp };
}

export function sumImpervious(rows: RowRecord[]): string {
  const sum = rows.reduce((s, r) => s + num(r.imprevious_area), 0);
  return sum > 0 ? sum.toFixed(2) : "";
}

export type RainwaterSummaryInput = {
  caseVal: string;
  totalRain: number;
  average: number;
  oneday: number;
  harvesting: number;
  ratingTypeId: number;
};

export function computeRainwaterSummary(input: RainwaterSummaryInput): {
  mandatory_harvesting: string;
  requirment: string;
  avg_rainfall: string;
} {
  const { caseVal, totalRain, average, oneday, harvesting, ratingTypeId } = input;
  const mandatory = totalRain * oneday;

  let avgRainfall = 0;
  const c = parseInt(caseVal, 10);
  if (ratingTypeId === 1 || ratingTypeId === 2 || ratingTypeId === 5) {
    if (totalRain > 0 && average > 0) {
      avgRainfall = ((harvesting * 1000) / (totalRain * average)) * 100;
    }
  } else if (mandatory > 0) {
    avgRainfall = harvesting / mandatory;
  }

  let requirement = "No";
  if (c === 2) requirement = "Yes";
  else if (mandatory > 0 && harvesting >= mandatory) requirement = "Yes";

  return {
    mandatory_harvesting: mandatory > 0 ? mandatory.toFixed(2) : "0",
    requirment: requirement,
    avg_rainfall: avgRainfall > 0 ? avgRainfall.toFixed(2) : "0",
  };
}
