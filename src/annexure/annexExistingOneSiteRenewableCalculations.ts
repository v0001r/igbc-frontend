export type ExistingOnsiteEnergyRow = {
  month: string;
  grid: string;
  dg: string;
  other: string;
  total: string;
  renewableOnsite: string;
};

export type ExistingOffsiteEnergyRow = {
  month: string;
  grid: string;
  dg: string;
  other: string;
  total: string;
  wheelingOffsite: string;
};

export type ExistingGridEnergyRow = {
  month: string;
  grid: string;
  dg: string;
  other: string;
  total: string;
  renewableOnsite: string;
  wheelingOffsite: string;
  green: string;
};

export type ExistingOneSiteRenewableState = {
  onsiteRows: ExistingOnsiteEnergyRow[];
  offsiteRows: ExistingOffsiteEnergyRow[];
  gridRows: ExistingGridEnergyRow[];
  total_existing_energy_consumption: string;
  existing_total_onsite_renewable: string;
  existing_total_offsite_renewable: string;
  existing_total_energy: string;
  existing_total_renewable_wheeling: string;
  percentage_existing_energy_consumption: string;
  total_existing_energy_consumption_offsite: string;
  existing_total_onsite_renewable_offsite: string;
  existing_total_offsite_renewable_offsite: string;
  existing_total_energy_offsite: string;
  existing_total_renewable_wheeling_offsite: string;
  percentage_existing_energy_consumption_offsite: string;
  total_existing_energy_consumption_off_set: string;
  existing_total_onsite_renewable_off_set: string;
  existing_total_offsite_renewable_off_set: string;
  existing_total_energy_off_set: string;
  existing_total_on_site: string;
  existing_total_renewable_wheeling_off_set: string;
  existing_total_green: string;
  percentage_existing_energy_consumption_off_set: string;
};

export const EXISTING_ONSITE_DEFAULT_ROW: ExistingOnsiteEnergyRow = {
  month: "",
  grid: "",
  dg: "",
  other: "",
  total: "",
  renewableOnsite: "",
};

export const EXISTING_OFFSITE_DEFAULT_ROW: ExistingOffsiteEnergyRow = {
  month: "",
  grid: "",
  dg: "",
  other: "",
  total: "",
  wheelingOffsite: "",
};

export const EXISTING_GRID_DEFAULT_ROW: ExistingGridEnergyRow = {
  month: "",
  grid: "",
  dg: "",
  other: "",
  total: "",
  renewableOnsite: "",
  wheelingOffsite: "",
  green: "",
};

function n(v: string | undefined): number {
  const x = parseFloat(v ?? "");
  return Number.isFinite(x) ? x : 0;
}

function fmt2(v: number): string {
  return v.toFixed(2);
}

function sum(rows: string[]): number {
  return rows.reduce((acc, v) => acc + n(v), 0);
}

export function createDefaultExistingOneSiteRenewableState(rowCount = 5): ExistingOneSiteRenewableState {
  const emptyOnsite = () => ({ ...EXISTING_ONSITE_DEFAULT_ROW });
  const emptyOffsite = () => ({ ...EXISTING_OFFSITE_DEFAULT_ROW });
  const emptyGrid = () => ({ ...EXISTING_GRID_DEFAULT_ROW });
  return {
    onsiteRows: Array.from({ length: rowCount }, emptyOnsite),
    offsiteRows: Array.from({ length: rowCount }, emptyOffsite),
    gridRows: Array.from({ length: rowCount }, emptyGrid),
    total_existing_energy_consumption: "",
    existing_total_onsite_renewable: "",
    existing_total_offsite_renewable: "",
    existing_total_energy: "",
    existing_total_renewable_wheeling: "",
    percentage_existing_energy_consumption: "",
    total_existing_energy_consumption_offsite: "",
    existing_total_onsite_renewable_offsite: "",
    existing_total_offsite_renewable_offsite: "",
    existing_total_energy_offsite: "",
    existing_total_renewable_wheeling_offsite: "",
    percentage_existing_energy_consumption_offsite: "",
    total_existing_energy_consumption_off_set: "",
    existing_total_onsite_renewable_off_set: "",
    existing_total_offsite_renewable_off_set: "",
    existing_total_energy_off_set: "",
    existing_total_on_site: "",
    existing_total_renewable_wheeling_off_set: "",
    existing_total_green: "",
    percentage_existing_energy_consumption_off_set: "",
  };
}

export function computeExistingOneSiteRenewableState(
  state: ExistingOneSiteRenewableState,
): ExistingOneSiteRenewableState {
  const onsiteRows = state.onsiteRows.map((row) => {
    const total = n(row.grid) + n(row.dg) + n(row.other);
    return { ...row, total: fmt2(total) };
  });

  const offsiteRows = state.offsiteRows.map((row) => {
    const total = n(row.grid) + n(row.dg) + n(row.other);
    return { ...row, total: fmt2(total) };
  });

  const gridRows = state.gridRows.map((row) => {
    const total = n(row.grid) + n(row.dg) + n(row.other);
    const green = n(row.renewableOnsite) + n(row.wheelingOffsite);
    return { ...row, total: fmt2(total), green: fmt2(green) };
  });

  const onsiteEnergyTotal = sum(onsiteRows.map((r) => r.total));
  const totalGridOnsite = sum(onsiteRows.map((r) => r.grid));
  const totalDgOnsite = sum(onsiteRows.map((r) => r.dg));
  const totalOtherOnsite = sum(onsiteRows.map((r) => r.other));
  const totalRenewableOnsite = sum(onsiteRows.map((r) => r.renewableOnsite));

  const offsiteEnergyTotal = sum(offsiteRows.map((r) => r.total));
  const totalGridOffsite = sum(offsiteRows.map((r) => r.grid));
  const totalDgOffsite = sum(offsiteRows.map((r) => r.dg));
  const totalOtherOffsite = sum(offsiteRows.map((r) => r.other));
  const totalWheelingOffsite = sum(offsiteRows.map((r) => r.wheelingOffsite));

  const gridEnergyTotal = sum(gridRows.map((r) => r.total));
  const totalGridGrid = sum(gridRows.map((r) => r.grid));
  const totalDgGrid = sum(gridRows.map((r) => r.dg));
  const totalOtherGrid = sum(gridRows.map((r) => r.other));
  const totalRenewableOnsiteGrid = sum(gridRows.map((r) => r.renewableOnsite));
  const totalWheelingGrid = sum(gridRows.map((r) => r.wheelingOffsite));
  const totalGreen = sum(gridRows.map((r) => r.green));

  const pctOnsite =
    onsiteEnergyTotal > 0
      ? (totalRenewableOnsite / (onsiteEnergyTotal + totalRenewableOnsite)) * 100
      : 0;

  const pctOffsite = offsiteEnergyTotal > 0 ? (totalWheelingOffsite / offsiteEnergyTotal) * 100 : 0;

  const pctCombined =
    gridEnergyTotal > 0
      ? (totalGreen / (gridEnergyTotal + totalRenewableOnsiteGrid)) * 100
      : 0;

  return {
    ...state,
    onsiteRows,
    offsiteRows,
    gridRows,
    total_existing_energy_consumption: fmt2(totalGridOnsite),
    existing_total_onsite_renewable: fmt2(totalDgOnsite),
    existing_total_offsite_renewable: fmt2(totalOtherOnsite),
    existing_total_energy: fmt2(onsiteEnergyTotal),
    existing_total_renewable_wheeling: fmt2(totalRenewableOnsite),
    percentage_existing_energy_consumption: fmt2(pctOnsite),
    total_existing_energy_consumption_offsite: fmt2(totalGridOffsite),
    existing_total_onsite_renewable_offsite: fmt2(totalDgOffsite),
    existing_total_offsite_renewable_offsite: fmt2(totalOtherOffsite),
    existing_total_energy_offsite: fmt2(offsiteEnergyTotal),
    existing_total_renewable_wheeling_offsite: fmt2(totalWheelingOffsite),
    percentage_existing_energy_consumption_offsite: fmt2(pctOffsite),
    total_existing_energy_consumption_off_set: fmt2(totalGridGrid),
    existing_total_onsite_renewable_off_set: fmt2(totalDgGrid),
    existing_total_offsite_renewable_off_set: fmt2(totalOtherGrid),
    existing_total_energy_off_set: fmt2(gridEnergyTotal),
    existing_total_on_site: fmt2(totalRenewableOnsiteGrid),
    existing_total_renewable_wheeling_off_set: fmt2(totalWheelingGrid),
    existing_total_green: fmt2(totalGreen),
    percentage_existing_energy_consumption_off_set: fmt2(pctCombined),
  };
}
