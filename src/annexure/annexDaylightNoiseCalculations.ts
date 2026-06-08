import type { AreaSourceRow } from "@/annexure/annexConditionedSpacesCalculations";

export type DaylightSpaceTypeDef = {
  label: string;
  benchmarkLux: number;
};

export type AcousticSpaceTypeDef = {
  label: string;
  baselineDb: number;
};

export type DaylightNoiseRow = {
  sourceIndex: number;
  reqularly_occupied_air_spaces: string;
  air_space_regular_occ: string;
  space_co2_noise: string;
  space_co2_benchmark: string;
  space_co2_lux_level: string;
  space_co2_compiant_area: string;
  space_co2_compliant_boolean: string;
  type_of_spaces_lpd: string;
  baseline_lpd_datlight: string;
  space_co2_measure: string;
  space_co2_measure_value: string;
  space_co2_performance_value: string;
  space_co2_outdoor: string;
};

export type DaylightNoiseState = {
  rows: DaylightNoiseRow[];
  total_carpet_area_daylight: string;
  total_regularly_occupied_daylight: string;
  base_total_consum_daylight: string;
  total_annual_boolean_daylight: string;
  total_annual_outdoor_daylight: string;
  total_annual_occupied_daylight: string;
};

function n(v: string | undefined): number {
  const x = parseFloat(String(v ?? "").trim());
  return Number.isFinite(x) ? x : 0;
}

function fmt2(v: number): string {
  return v.toFixed(2);
}

export type DaylightSourceFilter = {
  occupancyValue?: string;
  acValue?: string;
};

export function filterDaylightSourceRows(
  sources: AreaSourceRow[],
  filter?: DaylightSourceFilter,
): AreaSourceRow[] {
  const occupancyValue = filter?.occupancyValue ?? "regularly_occupied_spaces";
  const acValue = filter?.acValue;
  return sources.filter((r) => {
    if (r.reqularly_non_occupied_spaces !== occupancyValue) return false;
    if (acValue != null && acValue !== "") {
      return r.air_condition_spaces === acValue;
    }
    return true;
  });
}

function clampOutdoor(regularOcc: number, outdoor: number): number {
  return regularOcc <= outdoor ? regularOcc : outdoor;
}

export function computeDaylightNoiseRow(
  row: DaylightNoiseRow,
  daylightTypes: Record<string, DaylightSpaceTypeDef>,
  acousticTypes: Record<string, AcousticSpaceTypeDef>,
): DaylightNoiseRow {
  const regularOcc = n(row.air_space_regular_occ);
  const lux = n(row.space_co2_lux_level);
  const daylightDef = daylightTypes[row.space_co2_noise];
  const benchmark = daylightDef ? daylightDef.benchmarkLux : n(row.space_co2_benchmark);
  const acousticDef = acousticTypes[row.type_of_spaces_lpd];
  const baselineDb = acousticDef ? acousticDef.baselineDb : n(row.baseline_lpd_datlight);
  const measure = n(row.space_co2_measure);

  const outdoorRaw = n(row.space_co2_outdoor);
  const outdoor = fmt2(clampOutdoor(regularOcc, outdoorRaw));

  const compliantArea = lux >= benchmark && benchmark > 0 ? regularOcc : 0;
  const measureValue = measure < baselineDb && baselineDb > 0 ? regularOcc : 0;

  return {
    ...row,
    space_co2_benchmark: daylightDef ? fmt2(benchmark) : row.space_co2_benchmark,
    baseline_lpd_datlight: acousticDef ? fmt2(baselineDb) : row.baseline_lpd_datlight,
    space_co2_outdoor: outdoor,
    space_co2_compiant_area: fmt2(compliantArea),
    space_co2_compliant_boolean: lux >= benchmark && benchmark > 0 ? "Yes" : "No",
    space_co2_measure_value: fmt2(measureValue),
    space_co2_performance_value: measure <= baselineDb && baselineDb > 0 ? "Yes" : "No",
  };
}

export function computeDaylightNoiseState(
  state: DaylightNoiseState,
  daylightTypes: Record<string, DaylightSpaceTypeDef>,
  acousticTypes: Record<string, AcousticSpaceTypeDef>,
): DaylightNoiseState {
  const rows = state.rows.map((r) =>
    computeDaylightNoiseRow(r, daylightTypes, acousticTypes),
  );

  let totalCarpet = 0;
  let totalDaylight = 0;
  let totalOutdoor = 0;
  let allNoiseYes = rows.length > 0;

  for (const r of rows) {
    totalCarpet += n(r.air_space_regular_occ);
    totalDaylight += n(r.space_co2_compiant_area);
    totalOutdoor += n(r.space_co2_outdoor);
    if (r.space_co2_performance_value.trim().toLowerCase() !== "yes") {
      allNoiseYes = false;
    }
  }

  const daylightPct = totalCarpet > 0 ? (totalDaylight / totalCarpet) * 100 : 0;
  const outdoorPct = totalCarpet > 0 ? (totalOutdoor / totalCarpet) * 100 : 0;

  return {
    rows,
    total_carpet_area_daylight: fmt2(totalCarpet),
    total_regularly_occupied_daylight: fmt2(totalDaylight),
    base_total_consum_daylight: fmt2(daylightPct),
    total_annual_boolean_daylight: allNoiseYes ? "Yes" : "No",
    total_annual_outdoor_daylight: fmt2(totalOutdoor),
    total_annual_occupied_daylight: fmt2(outdoorPct),
  };
}
