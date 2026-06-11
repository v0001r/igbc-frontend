export type WaterConsumptionRow = {
  years_ex: string;
  rainfall_ex: string;
  ex_peak_month: string;
  rainy_day: string;
};

export type WaterConsumptionBuilding = {
  tableIndex: number;
  dwelling_type: string;
  rows: WaterConsumptionRow[];
  previous_year: string;
  current_year: string;
  percentage_current_pervious: string;
};

export type ExistingWaterConsumptionState = {
  buildings: WaterConsumptionBuilding[];
};

function n(v: string | undefined): number {
  const x = parseFloat(String(v ?? "").trim());
  return Number.isFinite(x) ? x : 0;
}

function fmt2(v: number): string {
  return v.toFixed(2);
}

export function computeWaterConsumptionBuilding(
  building: WaterConsumptionBuilding,
): WaterConsumptionBuilding {
  const previousTotal = building.rows.reduce((sum, row) => sum + n(row.rainfall_ex), 0);
  const currentTotal = building.rows.reduce((sum, row) => sum + n(row.rainy_day), 0);
  const percentage =
    previousTotal > 0 ? ((previousTotal - currentTotal) / previousTotal) * 100 : 0;

  return {
    ...building,
    previous_year: fmt2(previousTotal),
    current_year: fmt2(currentTotal),
    percentage_current_pervious: fmt2(percentage),
  };
}

export function computeExistingWaterConsumptionState(
  state: ExistingWaterConsumptionState,
): ExistingWaterConsumptionState {
  return {
    buildings: state.buildings.map(computeWaterConsumptionBuilding),
  };
}

export function emptyWaterConsumptionRow(): WaterConsumptionRow {
  return {
    years_ex: "",
    rainfall_ex: "",
    ex_peak_month: "",
    rainy_day: "",
  };
}

export function emptyWaterConsumptionBuilding(
  tableIndex: number,
  minRows = 5,
): WaterConsumptionBuilding {
  return {
    tableIndex,
    dwelling_type: "",
    rows: Array.from({ length: minRows }, () => emptyWaterConsumptionRow()),
    previous_year: "0.00",
    current_year: "0.00",
    percentage_current_pervious: "0.00",
  };
}
