export type AlternativePerformanceRow = {
  existing_month_year_annexone: string;
  input_consumption: string;
  ro_consumption: string;
  stp_input: string;
  stp_output: string;
  rainwater_collection: string;
  domestic_water: string;
  cooling_consumption: string;
  flushing_water: string;
  landing_water: string;
  total_alter_water: string;
  total_water_com: string;
  water_performance: string;
};

export type AlternativePerformanceFooter = {
  total_municipal: string;
  total_ro_water: string;
  total_stp_input: string;
  total_stp_output: string;
  total_rainwater_collect: string;
  total_domestic: string;
  total_cooling_water: string;
  total_flushing: string;
  total_landing_water: string;
  total_alter: string;
  total_water_con: string;
  total_water_ratio: string;
};

export type ExistingAlternativePerformanceState = {
  rows: AlternativePerformanceRow[];
  footer: AlternativePerformanceFooter;
};

export const ALTERNATIVE_PERFORMANCE_ROW_INPUT_PARAMS = [
  "existing_month_year_annexone",
  "input_consumption",
  "ro_consumption",
  "stp_input",
  "stp_output",
  "rainwater_collection",
  "domestic_water",
  "cooling_consumption",
  "flushing_water",
  "landing_water",
] as const;

export const ALTERNATIVE_PERFORMANCE_ROW_COMPUTED_PARAMS = [
  "total_alter_water",
  "total_water_com",
  "water_performance",
] as const;

export const ALTERNATIVE_PERFORMANCE_FOOTER_PARAMS = [
  "total_municipal",
  "total_ro_water",
  "total_stp_input",
  "total_stp_output",
  "total_rainwater_collect",
  "total_domestic",
  "total_cooling_water",
  "total_flushing",
  "total_landing_water",
  "total_alter",
  "total_water_con",
  "total_water_ratio",
] as const;

function n(v: string | undefined): number {
  const x = parseFloat(String(v ?? "").trim());
  return Number.isFinite(x) ? x : 0;
}

function fmt2(v: number): string {
  return v.toFixed(2);
}

export function computeAlternativePerformanceRow(
  row: AlternativePerformanceRow,
): AlternativePerformanceRow {
  const input = n(row.input_consumption);
  const ro = n(row.ro_consumption);
  const stpOutput = n(row.stp_output);
  const rainwater = n(row.rainwater_collection);
  const totalAlter = stpOutput + rainwater;
  const totalWaterCom = input + ro + stpOutput + rainwater;
  const wpr = totalWaterCom !== 0 ? (totalAlter / totalWaterCom) * 100 : 0;
  return {
    ...row,
    total_alter_water: fmt2(totalAlter),
    total_water_com: fmt2(totalWaterCom),
    water_performance: fmt2(wpr),
  };
}

function sumRows(rows: AlternativePerformanceRow[], field: keyof AlternativePerformanceRow): number {
  return rows.reduce((sum, row) => sum + n(row[field]), 0);
}

export function computeExistingAlternativePerformanceState(
  state: ExistingAlternativePerformanceState,
): ExistingAlternativePerformanceState {
  const rows = state.rows.map(computeAlternativePerformanceRow);

  const sumAlter = sumRows(rows, "total_alter_water");
  const sumWaterCom = sumRows(rows, "total_water_com");
  const totalRatio = sumWaterCom !== 0 ? (sumAlter / sumWaterCom) * 100 : 0;

  const footer: AlternativePerformanceFooter = {
    total_municipal: fmt2(sumRows(rows, "input_consumption")),
    total_ro_water: fmt2(sumRows(rows, "ro_consumption")),
    total_stp_input: fmt2(sumRows(rows, "stp_input")),
    total_stp_output: fmt2(sumRows(rows, "stp_output")),
    total_rainwater_collect: fmt2(sumRows(rows, "rainwater_collection")),
    total_domestic: fmt2(sumRows(rows, "domestic_water")),
    total_cooling_water: fmt2(sumRows(rows, "cooling_consumption")),
    total_flushing: fmt2(sumRows(rows, "flushing_water")),
    total_landing_water: fmt2(sumRows(rows, "landing_water")),
    total_alter: fmt2(sumAlter),
    total_water_con: fmt2(sumWaterCom),
    total_water_ratio: fmt2(totalRatio),
  };

  return { rows, footer };
}

export function emptyAlternativePerformanceRow(): AlternativePerformanceRow {
  return {
    existing_month_year_annexone: "",
    input_consumption: "",
    ro_consumption: "",
    stp_input: "",
    stp_output: "",
    rainwater_collection: "",
    domestic_water: "",
    cooling_consumption: "",
    flushing_water: "",
    landing_water: "",
    total_alter_water: "0.00",
    total_water_com: "0.00",
    water_performance: "0.00",
  };
}

export function emptyAlternativePerformanceFooter(): AlternativePerformanceFooter {
  return {
    total_municipal: "0.00",
    total_ro_water: "0.00",
    total_stp_input: "0.00",
    total_stp_output: "0.00",
    total_rainwater_collect: "0.00",
    total_domestic: "0.00",
    total_cooling_water: "0.00",
    total_flushing: "0.00",
    total_landing_water: "0.00",
    total_alter: "0.00",
    total_water_con: "0.00",
    total_water_ratio: "0.00",
  };
}
