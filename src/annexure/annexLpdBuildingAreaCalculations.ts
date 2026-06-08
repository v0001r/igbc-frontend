import type { AreaSourceRow } from "@/annexure/annexConditionedSpacesCalculations";
import { SQFT_TO_SQM } from "@/annexure/annexNaturalVentilationCalculations";

export type LpdFixtureSubRow = {
  lighting_fixture_type: string;
  no_of_lighting_fixture: string;
  wattage_of_each_lighting_fixture: string;
  total_wattage_lpd: string;
};

export type LpdBuildingAreaRow = {
  sourceIndex: number;
  reqularly_occupied_spaces: string;
  carpet_area_lpd: string;
  lighting_fixture_type: string;
  no_of_lighting_fixture: string;
  wattage_of_each_lighting_fixture: string;
  total_wattage_lpd: string;
  expanded: boolean;
  subRows: LpdFixtureSubRow[];
};

export type LpdBuildingAreaState = {
  rows: LpdBuildingAreaRow[];
  building_typology_lpd: string;
  total_carpet_area_lpd: string;
  total_wattage_lpd_building: string;
  design_lpd_building: string;
  baseline_lpd_building: string;
  percentagelpd_reduction_building: string;
};

export type LpdBuildingTypologyEntry = {
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

/** All area-statement rows with a space description or carpet area. */
export function filterLpdAreaSourceRows(sources: AreaSourceRow[]): AreaSourceRow[] {
  return sources.filter(
    (r) => r.reqularly_occupied_spaces.trim() !== "" || n(r.total_carpet_area_circulation) > 0,
  );
}

function fixtureWattage(qty: string, wattage: string): number {
  return n(qty) * n(wattage);
}

function computeFixtureRow(
  type: string,
  qty: string,
  wattage: string,
): { lighting_fixture_type: string; no_of_lighting_fixture: string; wattage_of_each_lighting_fixture: string; total_wattage_lpd: string } {
  const total = fixtureWattage(qty, wattage);
  return {
    lighting_fixture_type: type,
    no_of_lighting_fixture: qty,
    wattage_of_each_lighting_fixture: wattage,
    total_wattage_lpd: total > 0 ? fmt2(total) : "0.00",
  };
}

export function computeLpdBuildingAreaRow(row: LpdBuildingAreaRow): LpdBuildingAreaRow {
  const parent = computeFixtureRow(
    row.lighting_fixture_type,
    row.no_of_lighting_fixture,
    row.wattage_of_each_lighting_fixture,
  );
  const subRows = row.subRows.map((sub) =>
    computeFixtureRow(
      sub.lighting_fixture_type,
      sub.no_of_lighting_fixture,
      sub.wattage_of_each_lighting_fixture,
    ),
  );

  let rowTotal = n(parent.total_wattage_lpd);
  for (const sub of subRows) rowTotal += n(sub.total_wattage_lpd);

  return {
    ...row,
    ...parent,
    total_wattage_lpd: rowTotal > 0 ? fmt2(rowTotal) : "0.00",
    subRows,
  };
}

export function baselineForTypology(
  slug: string,
  catalog: LpdBuildingTypologyEntry[],
): number {
  const hit = catalog.find((e) => e.slug === slug);
  return hit?.baseline ?? 0;
}

export function computeLpdBuildingAreaState(
  state: LpdBuildingAreaState,
  typologyCatalog: LpdBuildingTypologyEntry[],
): LpdBuildingAreaState {
  const rows = state.rows.map(computeLpdBuildingAreaRow);

  let totalCarpet = 0;
  let totalWattage = 0;
  for (const r of rows) {
    totalCarpet += n(r.carpet_area_lpd);
    totalWattage += n(r.total_wattage_lpd);
  }

  const designLpd = totalCarpet > 0 ? totalWattage / totalCarpet : 0;
  const baseline = baselineForTypology(state.building_typology_lpd, typologyCatalog);
  const reduction =
    baseline > 0 ? ((baseline - designLpd) / baseline) * 100 : 0;

  return {
    rows,
    building_typology_lpd: state.building_typology_lpd,
    total_carpet_area_lpd: fmt2(totalCarpet),
    total_wattage_lpd_building: fmt2(totalWattage),
    design_lpd_building: fmt2(designLpd),
    baseline_lpd_building: baseline > 0 ? fmt2(baseline) : "0.00",
    percentagelpd_reduction_building: fmt2(reduction),
  };
}

export function emptyLpdFixtureSubRow(): LpdFixtureSubRow {
  return {
    lighting_fixture_type: "",
    no_of_lighting_fixture: "",
    wattage_of_each_lighting_fixture: "",
    total_wattage_lpd: "0.00",
  };
}

export function emptyLpdBuildingAreaRow(sourceIndex: number): LpdBuildingAreaRow {
  return {
    sourceIndex,
    reqularly_occupied_spaces: "",
    carpet_area_lpd: "",
    lighting_fixture_type: "",
    no_of_lighting_fixture: "",
    wattage_of_each_lighting_fixture: "",
    total_wattage_lpd: "0.00",
    expanded: false,
    subRows: [],
  };
}
