export type OnsiteRenewableRow = {
  rowId: number;
  month_year: string;
  energy_consumption: string;
  on_site_renewable: string;
  off_site_renewable: string;
};

export type OnsiteRenewableState = {
  rows: OnsiteRenewableRow[];
  total_energy_consumption: string;
  total_onsite_renewable: string;
  total_offsite_renewable: string;
  percentage_energy_consumption: string;
  percentage_energy_consumption_offsite: string;
  percentage_offsite_onsite: string;
  saving_reneweable_energy: string;
};

function n(v: string | undefined): number {
  const x = parseFloat(String(v ?? "").trim());
  return Number.isFinite(x) ? x : 0;
}

function fmt2(v: number): string {
  return v.toFixed(2);
}

export function computeOnsiteRenewableRow(row: OnsiteRenewableRow): OnsiteRenewableRow {
  return row;
}

export function computeOnsiteRenewableState(state: OnsiteRenewableState): OnsiteRenewableState {
  const rows = state.rows.map(computeOnsiteRenewableRow);

  let totalEnergy = 0;
  let totalOnsite = 0;
  let totalOffsite = 0;
  for (const r of rows) {
    totalEnergy += n(r.energy_consumption);
    totalOnsite += n(r.on_site_renewable);
    totalOffsite += n(r.off_site_renewable);
  }

  const totalSaving = totalOnsite + totalOffsite;
  const pctOnsite = totalEnergy > 0 ? (totalOnsite / totalEnergy) * 100 : 0;
  const pctOffsite = totalEnergy > 0 ? (totalOffsite / totalEnergy) * 100 : 0;
  const pctCombined = totalEnergy > 0 ? (totalSaving / totalEnergy) * 100 : 0;

  return {
    rows,
    total_energy_consumption: fmt2(totalEnergy),
    total_onsite_renewable: fmt2(totalOnsite),
    total_offsite_renewable: fmt2(totalOffsite),
    percentage_energy_consumption: fmt2(pctOnsite),
    percentage_energy_consumption_offsite: fmt2(pctOffsite),
    percentage_offsite_onsite: fmt2(pctCombined),
    saving_reneweable_energy: fmt2(totalSaving),
  };
}

export function emptyOnsiteRenewableRow(rowId: number): OnsiteRenewableRow {
  return {
    rowId,
    month_year: "",
    energy_consumption: "",
    on_site_renewable: "",
    off_site_renewable: "",
  };
}
