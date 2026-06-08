export type OccupantWellbeingRow = {
  rowId: number;
  wellbeign_facilities_provide: string;
  wellbeing_served: string;
  wellbeing_facility: string;
  wellbeing_total: string;
};

export type OccupantWellbeingState = {
  rows: OccupantWellbeingRow[];
  total_occupant_access: string;
  total_permanent_occupancy: string;
  total_recreational: string;
};

function n(v: string | undefined): number {
  const x = parseFloat(String(v ?? "").trim());
  return Number.isFinite(x) ? x : 0;
}

function fmt2(v: number): string {
  return v.toFixed(2);
}

export function computeOccupantWellbeingRow(row: OccupantWellbeingRow): OccupantWellbeingRow {
  const total = n(row.wellbeing_served) * n(row.wellbeing_facility);
  return { ...row, wellbeing_total: fmt2(total) };
}

export function computeOccupantWellbeingState(state: OccupantWellbeingState): OccupantWellbeingState {
  const rows = state.rows.map(computeOccupantWellbeingRow);

  let accessTotal = 0;
  for (const r of rows) {
    accessTotal += n(r.wellbeing_total);
  }

  const permanent = n(state.total_permanent_occupancy);
  const pct = permanent > 0 ? (accessTotal / permanent) * 100 : 0;

  return {
    rows,
    total_occupant_access: fmt2(accessTotal),
    total_permanent_occupancy: state.total_permanent_occupancy,
    total_recreational: fmt2(pct),
  };
}

export function emptyOccupantWellbeingRow(rowId: number): OccupantWellbeingRow {
  return {
    rowId,
    wellbeign_facilities_provide: "",
    wellbeing_served: "",
    wellbeing_facility: "",
    wellbeing_total: "0.00",
  };
}
