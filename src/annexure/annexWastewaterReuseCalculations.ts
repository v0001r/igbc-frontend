import type { WaterBalanceRowDef } from "@/annexure/annexureTypes";

export type WastewaterReuseScalars = Record<string, string>;

function n(v: string | undefined): number {
  const x = parseFloat(String(v ?? "").trim());
  return Number.isFinite(x) ? x : 0;
}

function fmt2(v: number): string {
  return v.toFixed(2);
}

export function annualFromDaily(daily: string, days: number): string {
  return fmt2(n(daily) * days);
}

function sumDailyParams(scalars: WastewaterReuseScalars, rows: WaterBalanceRowDef[]): number {
  return rows.reduce((sum, row) => sum + n(scalars[row.dailyParam]), 0);
}

function sumAnnualParams(scalars: WastewaterReuseScalars, rows: WaterBalanceRowDef[]): number {
  return rows.reduce((sum, row) => sum + n(scalars[row.annualParam]), 0);
}

/** Laravel `calculate_annex_four()` / `#stp_efficency` keyup handler. */
export function computeTreatmentMetrics(
  wasteGenerated: number,
  stpCapacityKld: number,
  efficiencyPct: number,
  reuseDailyTotal: number,
): { treated_daily_water: string; treated_water_percent: string; reuse_water_percent: string } {
  const com = stpCapacityKld * 1000;
  const percent = efficiencyPct / 100;
  let treated = 0;
  if (wasteGenerated >= com && com > 0) {
    treated = com * percent;
  } else {
    treated = wasteGenerated * percent;
  }
  if (!treated || !Number.isFinite(treated)) {
    return { treated_daily_water: "0", treated_water_percent: "0", reuse_water_percent: "0" };
  }
  const treatedPct =
    percent > 0 && wasteGenerated > 0 ? ((treated / percent) / wasteGenerated) * 100 : 0;
  const reusePct = treated > 0 ? (reuseDailyTotal / treated) * 100 : 0;
  return {
    treated_daily_water: fmt2(treated),
    treated_water_percent: fmt2(treatedPct),
    reuse_water_percent: fmt2(reusePct),
  };
}

export function clampStpEfficiency(raw: string): string {
  if (raw === "" || raw === ".") return raw;
  const v = parseFloat(raw);
  if (!Number.isFinite(v)) return raw;
  if (v > 100) return "100";
  if (v < 0) return "0";
  return raw;
}

export type WastewaterReuseComputeInput = {
  scalars: WastewaterReuseScalars;
  wasteGenerated: string;
  stpCapacity: string;
  reuseRows: WaterBalanceRowDef[];
  annualDays: number;
};

export function computeWastewaterReuseAnnex(input: WastewaterReuseComputeInput): WastewaterReuseScalars {
  const { scalars: draft, wasteGenerated, stpCapacity, reuseRows, annualDays } = input;
  const scalars = { ...draft };

  scalars.waste_water_generated = wasteGenerated;
  scalars.stp_capacity = stpCapacity;

  for (const row of reuseRows) {
    scalars[row.annualParam] = annualFromDaily(scalars[row.dailyParam] ?? "", annualDays);
  }
  scalars.reuse_daily_total = fmt2(sumDailyParams(scalars, reuseRows));
  scalars.reuse_annual_total = fmt2(sumAnnualParams(scalars, reuseRows));

  const eff = Math.min(100, Math.max(0, n(scalars.stp_efficency)));
  const treatment = computeTreatmentMetrics(
    n(wasteGenerated),
    n(stpCapacity),
    eff,
    n(scalars.reuse_daily_total),
  );
  scalars.treated_daily_water = treatment.treated_daily_water;
  scalars.treated_water_percent = treatment.treated_water_percent;
  scalars.reuse_water_percent = treatment.reuse_water_percent;

  return scalars;
}
