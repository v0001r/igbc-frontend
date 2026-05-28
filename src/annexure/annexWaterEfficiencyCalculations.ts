import type { WaterEfficiencyPresetDef } from "@/annexure/annexureTypes";

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
    const prefix = p.prefix;
    const status = scalars[`${prefix}_status`] ?? "";
    const duration = scalars[`${prefix}_duration`] ?? p.defaults.duration ?? "";
    const daily = scalars[`${prefix}_daily`] ?? p.defaults.daily ?? "";
    const occ = scalars[`${prefix}_occupancy`] ?? occupancy;
    const base = scalars[`${prefix}_base`] ?? p.defaults.base ?? "";
    const proposed = scalars[`${prefix}_proposed`] ?? "";
    const { baseTotal, proposedTotal } = computePresetRow(status, duration, daily, occ, base, proposed);
    scalars[`${prefix}_total_use`] = baseTotal;
    scalars[`${prefix}_proposed_total`] = proposedTotal;
    if (!scalars[`${prefix}_occupancy`]) scalars[`${prefix}_occupancy`] = occupancy;
    if (!scalars[`${prefix}_unit`]) scalars[`${prefix}_unit`] = p.defaults.unit ?? "";
  }

  const dynamicRows = draft.dynamicRows.map(computeDynamicRow);

  let flushBase = 0;
  let flushProposed = 0;
  let flowBase = 0;
  let flowProposed = 0;

  for (const p of presets) {
    const base = n(scalars[`${p.prefix}_total_use`]);
    const prop = n(scalars[`${p.prefix}_proposed_total`]);
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
