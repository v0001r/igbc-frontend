import type { AreaSourceRow } from "@/annexure/annexConditionedSpacesCalculations";
import { SQFT_TO_SQM } from "@/annexure/annexNaturalVentilationCalculations";

export type LpdSpaceFunctionRow = {
  rowId: number;
  sourceIndex: number | null;
  reqularly_occupied_spaces: string;
  applicable_space_lpd: string;
  carpet_area_lpd: string;
  lighting_fixture_type: string;
  no_of_lighting_fixture: string;
  wattage_of_each_lighting_fixture: string;
  total_wattage_lpd: string;
  design_lpd_space: string;
  baseline_space_lpd: string;
  lpd_reduction_space: string;
};

export type LpdSpaceFunctionState = {
  rows: LpdSpaceFunctionRow[];
  total_carpet_area_lpd: string;
  amount_lpd_reduction_space: string;
  total_regularly_occupied_area: string;
};

export type LpdSpaceBaselineEntry = {
  slug: string;
  label: string;
  baseline: number;
};

function n(v: string | undefined): number {
  const x = parseFloat(String(v ?? "").trim());
  return Number.isFinite(x) ? x : 0;
}

function fmt2(v: number): string {
  return v.toFixed(2);
}

export function sqftToSqmLpd(sqft: string): string {
  const v = n(sqft);
  return v > 0 ? fmt2(v * SQFT_TO_SQM) : "";
}

export function filterLpdSpaceSourceRows(sources: AreaSourceRow[]): AreaSourceRow[] {
  return sources.filter(
    (r) => r.reqularly_occupied_spaces.trim() !== "" || n(r.total_carpet_area_circulation) > 0,
  );
}

export function baselineForSpaceType(
  slug: string,
  catalog: LpdSpaceBaselineEntry[],
): number {
  const hit = catalog.find((e) => e.slug === slug);
  return hit?.baseline ?? 0;
}

export function computeLpdSpaceFunctionRow(
  row: LpdSpaceFunctionRow,
  catalog: LpdSpaceBaselineEntry[],
): LpdSpaceFunctionRow {
  const totalWattage = n(row.no_of_lighting_fixture) * n(row.wattage_of_each_lighting_fixture);
  const carpet = n(row.carpet_area_lpd);
  const design = carpet > 0 ? totalWattage / carpet : 0;
  const baseline = baselineForSpaceType(row.applicable_space_lpd, catalog);
  const reduction = baseline > 0 ? ((baseline - design) / baseline) * 100 : 0;

  return {
    ...row,
    total_wattage_lpd: totalWattage > 0 ? fmt2(totalWattage) : "0.00",
    design_lpd_space: carpet > 0 ? fmt2(design) : "0.00",
    baseline_space_lpd: baseline > 0 ? fmt2(baseline) : "0.00",
    lpd_reduction_space: baseline > 0 ? fmt2(reduction) : "0.00",
  };
}

export function computeLpdSpaceFunctionState(
  state: LpdSpaceFunctionState,
  catalog: LpdSpaceBaselineEntry[],
): LpdSpaceFunctionState {
  const rows = state.rows.map((r) => computeLpdSpaceFunctionRow(r, catalog));

  let totalCarpet = 0;
  let totalWattage = 0;
  let weightedBaseline = 0;
  for (const r of rows) {
    const carpet = n(r.carpet_area_lpd);
    totalCarpet += carpet;
    totalWattage += n(r.total_wattage_lpd);
    weightedBaseline += carpet * n(r.baseline_space_lpd);
  }

  const designAgg = totalCarpet > 0 ? totalWattage / totalCarpet : 0;
  const baselineAgg = totalCarpet > 0 ? weightedBaseline / totalCarpet : 0;
  const amount = baselineAgg - designAgg;
  const pct = baselineAgg > 0 ? (amount / baselineAgg) * 100 : 0;

  return {
    rows,
    total_carpet_area_lpd: fmt2(totalCarpet),
    amount_lpd_reduction_space: fmt2(amount),
    total_regularly_occupied_area: fmt2(pct),
  };
}

export function emptyLpdSpaceFunctionRow(rowId: number): LpdSpaceFunctionRow {
  return {
    rowId,
    sourceIndex: null,
    reqularly_occupied_spaces: "",
    applicable_space_lpd: "",
    carpet_area_lpd: "",
    lighting_fixture_type: "",
    no_of_lighting_fixture: "",
    wattage_of_each_lighting_fixture: "",
    total_wattage_lpd: "0.00",
    design_lpd_space: "0.00",
    baseline_space_lpd: "0.00",
    lpd_reduction_space: "0.00",
  };
}
