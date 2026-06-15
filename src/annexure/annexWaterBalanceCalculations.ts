import type { AnnexureWaterBalanceLayoutDef, WaterBalanceRowDef } from "@/annexure/annexureTypes";

export type WaterBalanceScalars = Record<string, string>;

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

function sumDailyParams(scalars: WaterBalanceScalars, rows: WaterBalanceRowDef[]): number {
  return rows.reduce((sum, row) => sum + n(scalars[row.dailyParam]), 0);
}

function sumAnnualParams(scalars: WaterBalanceScalars, rows: WaterBalanceRowDef[]): number {
  return rows.reduce((sum, row) => sum + n(scalars[row.annualParam]), 0);
}

export function computeWaterBalanceValidity(
  availabilityDaily: string,
  consumptionDaily: string,
  wasteDaily: string,
): "Valid" | "In-Valid" {
  const avail = n(availabilityDaily);
  const need = n(consumptionDaily) + n(wasteDaily);
  return avail === need ? "Valid" : "In-Valid";
}

export function computeWaterBalanceAnnex(
  draft: WaterBalanceScalars,
  layout: AnnexureWaterBalanceLayoutDef,
  wcTwoFlushDaily: string,
  wcTwoFlowDaily: string,
): { scalars: WaterBalanceScalars; validity: "Valid" | "In-Valid" } {
  const days = layout.annualDays ?? 365;
  const scalars = { ...draft };

  for (const section of layout.sections) {
    for (const row of section.rows) {
      if (row.source === "wcTwoFlush") {
        scalars[row.dailyParam] = wcTwoFlushDaily;
        scalars[row.annualParam] = annualFromDaily(wcTwoFlushDaily, days);
      } else if (row.source === "wcTwoFlow") {
        scalars[row.dailyParam] = wcTwoFlowDaily;
        scalars[row.annualParam] = annualFromDaily(wcTwoFlowDaily, days);
      } else if (row.annualMode === "mirrorDaily") {
        scalars[row.annualParam] = scalars[row.dailyParam] ?? "";
      } else if (!row.editableAnnual && row.editableDaily !== false) {
        scalars[row.annualParam] = annualFromDaily(scalars[row.dailyParam] ?? "", days);
      }
    }
    scalars[section.totalDailyParam] = fmt2(sumDailyParams(scalars, section.rows));
    scalars[section.totalAnnualParam] = fmt2(sumAnnualParams(scalars, section.rows));
  }

  const validity = computeWaterBalanceValidity(
    scalars.availability_daily_total ?? "0",
    scalars.consumption_daily_total ?? "0",
    scalars.waste_daily_total ?? "0",
  );

  return { scalars, validity };
}
