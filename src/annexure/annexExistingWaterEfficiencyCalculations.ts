export type ExistingWaterEfficiencyRow = {
  fixture_type: string;
  fixture_detail: string;
  duration: string;
  daily_uses: string;
  fte: string;
  baseline_flow: string;
  total_daily_base: string;
  baseline_flow_proposed: string;
  total_daily_proposed: string;
};

export type ExistingWaterEfficiencyBuilding = {
  tableIndex: number;
  dwelling_type: string;
  rows: ExistingWaterEfficiencyRow[];
  flush_base_total: string;
  flush_proposed_total: string;
  annual_days: string;
  annual_water_flush: string;
  fixture_flow_vol: string;
  saving_percentage: string;
  annex_mandatory: string;
};

export type ExistingWaterEfficiencyLockedRowDef = {
  fixture_type: string;
  fixture_detail: string;
  duration: string;
  daily_uses: string;
  fte: string;
  baseline_flow: string;
  baseline_flow_proposed: string;
  readonlyFields?: string[];
};

export type ExistingWaterEfficiencyState = {
  buildings: ExistingWaterEfficiencyBuilding[];
  overallsavedpercentage: string;
};

function n(v: string | undefined): number {
  const x = parseFloat(String(v ?? "").trim());
  return Number.isFinite(x) ? x : 0;
}

function fmt2(v: number): string {
  return v.toFixed(2);
}

export function computeFixtureRow(row: ExistingWaterEfficiencyRow): ExistingWaterEfficiencyRow {
  const duration = n(row.duration);
  const dailyUses = n(row.daily_uses);
  const fte = n(row.fte);
  const baseFlow = n(row.baseline_flow);
  const proposedFlow = n(row.baseline_flow_proposed);
  const totalDailyBase = duration * dailyUses * fte * baseFlow;
  const totalDailyProposed = duration * dailyUses * fte * proposedFlow;
  return {
    ...row,
    total_daily_base: fmt2(totalDailyBase),
    total_daily_proposed: fmt2(totalDailyProposed),
  };
}

export function computeExistingWaterEfficiencyBuilding(
  building: ExistingWaterEfficiencyBuilding,
): ExistingWaterEfficiencyBuilding {
  const rows = building.rows.map(computeFixtureRow);
  const flushBaseTotal = rows.reduce((sum, row) => sum + n(row.total_daily_base), 0);
  const flushProposedTotal = rows.reduce((sum, row) => sum + n(row.total_daily_proposed), 0);
  const annualDays = n(building.annual_days) || 365;
  const annualWaterFlush = flushBaseTotal * annualDays;
  const fixtureFlowVol = flushProposedTotal * annualDays;
  const savingPct =
    annualWaterFlush > 0 ? ((annualWaterFlush - fixtureFlowVol) / annualWaterFlush) * 100 : 0;

  return {
    ...building,
    rows,
    annual_days: building.annual_days.trim() ? building.annual_days : "365",
    flush_base_total: fmt2(flushBaseTotal),
    flush_proposed_total: fmt2(flushProposedTotal),
    annual_water_flush: fmt2(annualWaterFlush),
    fixture_flow_vol: fmt2(fixtureFlowVol),
    saving_percentage: fmt2(savingPct),
    annex_mandatory: savingPct >= 0 ? "YES" : "NO",
  };
}

export function computeExistingWaterEfficiencyState(
  state: ExistingWaterEfficiencyState,
): ExistingWaterEfficiencyState {
  const buildings = state.buildings.map(computeExistingWaterEfficiencyBuilding);
  const overall = buildings.reduce((sum, b) => sum + n(b.saving_percentage), 0);
  return {
    buildings,
    overallsavedpercentage: fmt2(overall),
  };
}

export function emptyFixtureRow(): ExistingWaterEfficiencyRow {
  return {
    fixture_type: "",
    fixture_detail: "",
    duration: "",
    daily_uses: "",
    fte: "",
    baseline_flow: "",
    total_daily_base: "0.00",
    baseline_flow_proposed: "",
    total_daily_proposed: "0.00",
  };
}

export function rowFromLockedTemplate(
  template: ExistingWaterEfficiencyLockedRowDef,
): ExistingWaterEfficiencyRow {
  return {
    fixture_type: template.fixture_type,
    fixture_detail: template.fixture_detail,
    duration: template.duration,
    daily_uses: template.daily_uses,
    fte: template.fte,
    baseline_flow: template.baseline_flow,
    total_daily_base: "0.00",
    baseline_flow_proposed: template.baseline_flow_proposed,
    total_daily_proposed: "0.00",
  };
}

export function emptyBuilding(
  tableIndex: number,
  lockedRows: ExistingWaterEfficiencyLockedRowDef[],
): ExistingWaterEfficiencyBuilding {
  return {
    tableIndex,
    dwelling_type: "",
    rows: lockedRows.length
      ? lockedRows.map(rowFromLockedTemplate)
      : [emptyFixtureRow()],
    flush_base_total: "0.00",
    flush_proposed_total: "0.00",
    annual_days: "365",
    annual_water_flush: "0.00",
    fixture_flow_vol: "0.00",
    saving_percentage: "0.00",
    annex_mandatory: "YES",
  };
}

export function isFixtureFieldReadonly(
  rowIndex: number,
  field: keyof ExistingWaterEfficiencyRow,
  lockedRows: ExistingWaterEfficiencyLockedRowDef[],
  lockExtraRowCalcFields = true,
): boolean {
  if (field === "total_daily_base" || field === "total_daily_proposed") return true;
  if (rowIndex < lockedRows.length) {
    return lockedRows[rowIndex].readonlyFields?.includes(field) ?? false;
  }
  if (!lockExtraRowCalcFields) return false;
  return field === "duration" || field === "daily_uses" || field === "baseline_flow";
}
