import type { WaterEfficiencyPresetDef } from "@/annexure/annexureTypes";

export type WaterEfficiencyPresetFields = {
  status: string;
  duration: string;
  daily: string;
  occupancy: string;
  base: string;
  unit: string;
  totalUse: string;
  proposed: string;
  proposedTotal: string;
};

export function presetFieldNames(p: WaterEfficiencyPresetDef): WaterEfficiencyPresetFields {
  const prefix = p.prefix;
  return {
    status: `${prefix}_status`,
    duration: `${prefix}_duration`,
    daily: `${prefix}_daily`,
    occupancy: `${prefix}_occupancy`,
    base: `${prefix}_base`,
    unit: `${prefix}_unit`,
    totalUse: p.totalUseParam ?? `${prefix}_total_use`,
    proposed: p.proposedParam ?? `${prefix}_proposed`,
    proposedTotal: p.proposedTotalParam ?? `${prefix}_proposed_total`,
  };
}

export type WaterEfficiencyDynamicRow = {
  fixture_type: string;
  shower: string;
  shower_status: string;
  shower_duration: string;
  shower_daily: string;
  shower_occupancy: string;
  shower_base: string;
  shower_unit: string;
  shower_total_use: string;
  shower_proposed: string;
  shower_proposed_total: string;
};

export type WaterEfficiencyScalars = Record<string, string>;

function n(v: string | undefined): number {
  const x = parseFloat(String(v ?? "").trim());
  return Number.isFinite(x) ? x : 0;
}

function fmt2(v: number): string {
  return v.toFixed(2);
}

/** Laravel `calculateFixture`: daily litres when status is yes. */
export function dailyUseLitres(
  status: string,
  duration: string,
  daily: string,
  occupancy: string,
  flowRate: string,
): string {
  if (status !== "yes") return "0";
  return fmt2(n(duration) * n(daily) * n(occupancy) * n(flowRate));
}

export function computePresetRow(
  status: string,
  duration: string,
  daily: string,
  occupancy: string,
  base: string,
  proposed: string,
): { baseTotal: string; proposedTotal: string } {
  const baseTotal = dailyUseLitres(status, duration, daily, occupancy, base);
  let proposedTotal = "0";
  if (status === "yes" && proposed.trim() !== "") {
    proposedTotal = dailyUseLitres(status, duration, daily, occupancy, proposed);
  }
  return { baseTotal, proposedTotal };
}

export function computeDynamicRow(row: WaterEfficiencyDynamicRow): WaterEfficiencyDynamicRow {
  const baseTotal = dailyUseLitres(
    row.shower_status,
    row.shower_duration,
    row.shower_daily,
    row.shower_occupancy,
    row.shower_base,
  );
  let proposedTotal = "0";
  if (row.shower_status === "yes" && row.shower_proposed.trim() !== "") {
    proposedTotal = dailyUseLitres(
      row.shower_status,
      row.shower_duration,
      row.shower_daily,
      row.shower_occupancy,
      row.shower_proposed,
    );
  }
  return { ...row, shower_total_use: baseTotal, shower_proposed_total: proposedTotal };
}

export type WaterEfficiencyAnnexState = {
  scalars: WaterEfficiencyScalars;
  dynamicRows: WaterEfficiencyDynamicRow[];
};

export function computeWaterEfficiencyAnnex(
  draft: WaterEfficiencyAnnexState,
  presets: WaterEfficiencyPresetDef[],
  occupancy: string,
): WaterEfficiencyAnnexState {
  const scalars = { ...draft.scalars };

  for (const p of presets) {
    const fields = presetFieldNames(p);
    const status = scalars[fields.status] ?? "";
    const duration = scalars[fields.duration] ?? p.defaults.duration ?? "";
    const daily = scalars[fields.daily] ?? p.defaults.daily ?? "";
    const occ = scalars[fields.occupancy] ?? occupancy;
    const base = scalars[fields.base] ?? p.defaults.base ?? "";
    const proposed = scalars[fields.proposed] ?? "";
    const { baseTotal, proposedTotal } = computePresetRow(status, duration, daily, occ, base, proposed);
    scalars[fields.totalUse] = baseTotal;
    scalars[fields.proposedTotal] = proposedTotal;
    if (!scalars[fields.occupancy]) scalars[fields.occupancy] = occupancy;
    if (!scalars[fields.unit]) scalars[fields.unit] = p.defaults.unit ?? "";
  }

  const dynamicRows = draft.dynamicRows.map(computeDynamicRow);

  let flushBase = 0;
  let flushProposed = 0;
  let flowBase = 0;
  let flowProposed = 0;

  for (const p of presets) {
    const fields = presetFieldNames(p);
    const base = n(scalars[fields.totalUse]);
    const prop = n(scalars[fields.proposedTotal]);
    if (p.category === "flush") {
      flushBase += base;
      flushProposed += prop;
    } else {
      flowBase += base;
      flowProposed += prop;
    }
  }

  for (const row of dynamicRows) {
    const unit = (row.shower_unit ?? "").toUpperCase();
    const base = n(row.shower_total_use);
    const prop = n(row.shower_proposed_total);
    if (unit === "LPF") {
      flushBase += base;
      flushProposed += prop;
    } else {
      flowBase += base;
      flowProposed += prop;
    }
  }

  scalars.flush_base_total = fmt2(flushBase);
  scalars.flush_proposed_total = fmt2(flushProposed);
  scalars.fixture_base_total = fmt2(flowBase);
  scalars.fixture_proposed_total = fmt2(flowProposed);

  const days = n(scalars.annual_days) || 365;
  if (!scalars.annual_days) scalars.annual_days = "365";

  const annualFlushBase = days * flushBase;
  const annualFixtureBase = days * flowBase;
  const annualFlushProposed = days * flushProposed;
  const annualFixtureProposed = days * flowProposed;

  scalars.annual_flush_base = fmt2(annualFlushBase);
  scalars.annual_fixture_base = fmt2(annualFixtureBase);
  scalars.annual_flush_proposed = fmt2(annualFlushProposed);
  scalars.annual_fixture_proposed = fmt2(annualFixtureProposed);

  const totalBase = annualFlushBase + annualFixtureBase;
  const totalProposed = annualFlushProposed + annualFixtureProposed;
  scalars.total_volume_base = fmt2(totalBase);
  scalars.total_volume_proposed = fmt2(totalProposed);

  const difference = totalBase - totalProposed;
  scalars.saving_annual = fmt2(difference);
  const percent = totalBase > 0 ? (difference / totalBase) * 100 : 0;
  scalars.saving_percentage = fmt2(percent);
  scalars.annex_mandatory = percent >= 0 ? "Yes" : "No";

  return { scalars, dynamicRows };
}

export type WaterEfficiencyTableState = {
  tableIndex: number;
  tableName: string;
  scalars: WaterEfficiencyScalars;
  dynamicRows: WaterEfficiencyDynamicRow[];
};

export type WaterEfficiencyMultiAnnexState = {
  tables: WaterEfficiencyTableState[];
  aggregates: {
    total_volume_base_tb: string;
    total_volume_proposed_tb: string;
    saving_percentage_tb: string;
  };
};

export function computeWaterEfficiencyMultiAnnex(
  draft: WaterEfficiencyMultiAnnexState,
  presets: WaterEfficiencyPresetDef[],
  occupancyDefault: string,
): WaterEfficiencyMultiAnnexState {
  const tables = draft.tables.map((table) => {
    const computed = computeWaterEfficiencyAnnex(
      { scalars: table.scalars, dynamicRows: table.dynamicRows },
      presets,
      occupancyDefault,
    );
    return { ...table, scalars: computed.scalars, dynamicRows: computed.dynamicRows };
  });

  let totalBase = 0;
  let totalProposed = 0;
  for (const table of tables) {
    totalBase += n(table.scalars.total_volume_base);
    totalProposed += n(table.scalars.total_volume_proposed);
  }

  const difference = totalBase - totalProposed;
  const saving = totalBase > 0 ? (difference / totalBase) * 100 : 0;

  return {
    tables,
    aggregates: {
      total_volume_base_tb: fmt2(totalBase),
      total_volume_proposed_tb: fmt2(totalProposed),
      saving_percentage_tb: fmt2(saving),
    },
  };
}
