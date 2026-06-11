export type UrbanHeatNonRoofRow = {
  non_roof_typo: string;
  non_roof_values: string;
  area_covered: string;
  area_factor: string;
  open_area_covered: string;
  open_area_factor: string;
  handscape_area_covered: string;
  handscape_area_factor: string;
  treated_roof_area: string;
};

export type UrbanHeatNonRoofState = {
  total_non: string;
  covered_area_exempted: string;
  rows: UrbanHeatNonRoofRow[];
  total_non_roof: string;
  total_treated_nonroof: string;
  total_treated_percentage: string;
};

export const URBAN_HEAT_NON_ROOF_FACTORS = {
  area_factor: "1.2",
  open_area_factor: "0.9",
  handscape_area_factor: "0.8",
} as const;

export function emptyUrbanHeatNonRoofRow(): UrbanHeatNonRoofRow {
  return {
    non_roof_typo: "",
    non_roof_values: "",
    area_covered: "",
    area_factor: URBAN_HEAT_NON_ROOF_FACTORS.area_factor,
    open_area_covered: "",
    open_area_factor: URBAN_HEAT_NON_ROOF_FACTORS.open_area_factor,
    handscape_area_covered: "",
    handscape_area_factor: URBAN_HEAT_NON_ROOF_FACTORS.handscape_area_factor,
    treated_roof_area: "",
  };
}

function n(v: string | undefined): number {
  const x = parseFloat(String(v ?? "").trim());
  return Number.isFinite(x) ? x : 0;
}

function fmt2(v: number): string {
  return v.toFixed(2);
}

export function computeUrbanHeatNonRoofRow(row: UrbanHeatNonRoofRow): UrbanHeatNonRoofRow {
  const treated =
    n(row.area_covered) * n(row.area_factor) +
    n(row.open_area_covered) * n(row.open_area_factor) +
    n(row.handscape_area_covered) * n(row.handscape_area_factor);

  return {
    ...row,
    area_factor: row.area_factor || URBAN_HEAT_NON_ROOF_FACTORS.area_factor,
    open_area_factor: row.open_area_factor || URBAN_HEAT_NON_ROOF_FACTORS.open_area_factor,
    handscape_area_factor: row.handscape_area_factor || URBAN_HEAT_NON_ROOF_FACTORS.handscape_area_factor,
    treated_roof_area: fmt2(treated),
  };
}

export function allowedNonRoofArea(state: UrbanHeatNonRoofState): number {
  return n(state.total_non) - n(state.covered_area_exempted);
}

export function sumNonRoofValues(rows: UrbanHeatNonRoofRow[]): number {
  return rows.reduce((sum, row) => sum + n(row.non_roof_values), 0);
}

export function computeUrbanHeatNonRoofState(state: UrbanHeatNonRoofState): UrbanHeatNonRoofState {
  const rows = state.rows.map(computeUrbanHeatNonRoofRow);
  const total_non_roof = sumNonRoofValues(rows);
  const total_treated_nonroof = rows.reduce((sum, row) => sum + n(row.treated_roof_area), 0);
  const allowed = allowedNonRoofArea(state);

  let total_treated_percentage = 0;
  if (total_non_roof > 0 && allowed > 0) {
    total_treated_percentage = (total_treated_nonroof / allowed) * 100;
  }

  return {
    ...state,
    rows,
    total_non_roof: fmt2(total_non_roof),
    total_treated_nonroof: fmt2(total_treated_nonroof),
    total_treated_percentage: fmt2(total_treated_percentage),
  };
}

export function clampNonRoofValueAtIndex(
  state: UrbanHeatNonRoofState,
  rowIndex: number,
  nextValue: string,
): { state: UrbanHeatNonRoofState; exceeded: boolean; allowed: number } {
  const allowed = allowedNonRoofArea(state);
  const rows = state.rows.map((row, idx) =>
    idx === rowIndex ? { ...row, non_roof_values: nextValue } : row,
  );
  const used = sumNonRoofValues(rows);

  if (used <= allowed) {
    return {
      state: computeUrbanHeatNonRoofState({ ...state, rows }),
      exceeded: false,
      allowed,
    };
  }

  const current = n(nextValue);
  const excess = used - allowed;
  const corrected = Math.max(0, current - excess).toFixed(2);
  const correctedRows = state.rows.map((row, idx) =>
    idx === rowIndex ? { ...row, non_roof_values: corrected } : row,
  );

  return {
    state: computeUrbanHeatNonRoofState({ ...state, rows: correctedRows }),
    exceeded: true,
    allowed,
  };
}
