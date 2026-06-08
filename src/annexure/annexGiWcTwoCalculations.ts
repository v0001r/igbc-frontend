import type { GiWcTwoPresetDef } from "@/annexure/annexureTypes";

export type GiWcTwoPartTimeRow = {
  part_time_no: string;
  part_time_emply: string;
};

export type GiWcTwoAnnexState = {
  permanent_no: string;
  permanent_time: string;
  permanent_fte: string;
  partTimeRows: GiWcTwoPartTimeRow[];
  part_time_fte: string;
  transient_no: string;
  transient_time: string;
  transient_fte: string;
  total_fte: string;
  total_male_occupant: string;
  total_female_occupant: string;
  scalars: Record<string, string>;
};

export type GiWcTwoComputeContext = {
  topologyType: number;
  permanentNo: string;
  transientNo: string;
  defaultAnnualDays: string;
};

function n(v: string | undefined): number {
  const x = parseFloat(String(v ?? "").trim());
  return Number.isFinite(x) ? x : 0;
}

function fmt2(v: number): string {
  return v.toFixed(2);
}

function baseForPreset(preset: GiWcTwoPresetDef, topologyType: number): string {
  if (topologyType === 1 && preset.defaults.baseTopology1 != null) {
    return preset.defaults.baseTopology1;
  }
  return preset.defaults.baseDefault;
}

function resolveFixtureFte(
  status: string,
  totals: { totalFte: number; male: number; female: number },
  defaultKind: "division" | "total",
): number {
  if (status === "male") return Math.round(totals.male);
  if (status === "female") return Math.round(totals.female);
  if (status === "both") return Math.round(totals.totalFte);
  if (defaultKind === "division") return Math.round(totals.totalFte / 2);
  return Math.round(totals.totalFte);
}

function computeFteScalars(state: GiWcTwoAnnexState, ctx: GiWcTwoComputeContext): Partial<GiWcTwoAnnexState> {
  const permanent_no = ctx.permanentNo || state.permanent_no;
  const transient_no = ctx.transientNo || state.transient_no;
  const pTime = n(state.permanent_time);
  const permanent_fte = String(Math.round((n(permanent_no) * pTime) / 8));

  let partSum = 0;
  for (const row of state.partTimeRows) {
    partSum += (n(row.part_time_no) * n(row.part_time_emply)) / 8;
  }
  const part_time_fte = fmt2(partSum);

  const transient_fte = String(Math.round((n(transient_no) * n(state.transient_time)) / 8));
  const totalFteNum = Math.ceil(n(permanent_fte) + n(part_time_fte) + n(transient_fte));
  const total_male_occupant = String(Math.ceil(totalFteNum / 2));
  const total_female_occupant = String(Math.floor(totalFteNum / 2));

  return {
    permanent_no,
    transient_no,
    permanent_fte,
    part_time_fte,
    transient_fte,
    total_fte: String(totalFteNum),
    total_male_occupant,
    total_female_occupant,
  };
}

function rowLitres(duration: string, daily: string, totalFte: string, flow: string): string {
  return fmt2(n(duration) * n(daily) * n(totalFte) * n(flow));
}

export function computeGiWcTwoAnnex(
  draft: GiWcTwoAnnexState,
  presets: GiWcTwoPresetDef[],
  ctx: GiWcTwoComputeContext,
): GiWcTwoAnnexState {
  const ftePatch = computeFteScalars(draft, ctx);
  const next: GiWcTwoAnnexState = { ...draft, ...ftePatch, scalars: { ...draft.scalars } };

  const totals = {
    totalFte: n(next.total_fte),
    male: n(next.total_male_occupant),
    female: n(next.total_female_occupant),
  };

  let flushBase = 0;
  let flushProposed = 0;
  let flowBase = 0;
  let flowProposed = 0;

  for (const preset of presets) {
    const prefix = preset.prefix;
    const duration = next.scalars[`${prefix}_duration`] ?? preset.defaults.duration;
    const daily = next.scalars[`${prefix}_daily`] ?? preset.defaults.daily;
    const base = next.scalars[`${prefix}_base`] || baseForPreset(preset, ctx.topologyType);
    const proposed = next.scalars[`${prefix}_proposed`] ?? "";
    const status = next.scalars[preset.occupantStatusParam] ?? preset.defaults.defaultOccupantStatus ?? "";

    next.scalars[`${prefix}_duration`] = duration;
    next.scalars[`${prefix}_daily`] = daily;
    next.scalars[`${prefix}_base`] = base;
    next.scalars[`${prefix}_unit`] = next.scalars[`${prefix}_unit`] || preset.defaults.unit;
    next.scalars[preset.proposedUnitParam] =
      next.scalars[preset.proposedUnitParam] || preset.defaults.unit;

    const fixtureFte = resolveFixtureFte(status, totals, preset.defaultFteKind);
    next.scalars[`${prefix}_total_fte`] = String(fixtureFte);

    const baseTotal = rowLitres(duration, daily, String(fixtureFte), base);
    const proposedTotal = proposed.trim() !== "" ? rowLitres(duration, daily, String(fixtureFte), proposed) : "0";
    next.scalars[`${prefix}_total_use`] = baseTotal;
    next.scalars[`${prefix}_proposed_total`] = proposedTotal;

    const baseNum = n(baseTotal);
    const propNum = n(proposedTotal);
    if (preset.category === "flush") {
      flushBase += baseNum;
      flushProposed += propNum;
    } else {
      flowBase += baseNum;
      flowProposed += propNum;
    }
  }

  next.scalars.flush_base_total = fmt2(flushBase);
  next.scalars.flush_proposed_total = fmt2(flushProposed);
  next.scalars.fixture_base_total = fmt2(flowBase);
  next.scalars.fixture_proposed_total = fmt2(flowProposed);

  const days = n(next.scalars.annual_days) || n(ctx.defaultAnnualDays) || 365;
  if (!next.scalars.annual_days) next.scalars.annual_days = ctx.defaultAnnualDays || "365";

  const annualFlushBase = days * flushBase;
  const annualFixtureBase = days * flowBase;
  const annualFlushProposed = days * flushProposed;
  const annualFixtureProposed = days * flowProposed;

  next.scalars.annual_flush_base = fmt2(annualFlushBase);
  next.scalars.annual_fixture_base = fmt2(annualFixtureBase);
  next.scalars.annual_flush_proposed = fmt2(annualFlushProposed);
  next.scalars.annual_fixture_proposed = fmt2(annualFixtureProposed);

  const totalBase = annualFlushBase + annualFixtureBase;
  const totalProposed = annualFlushProposed + annualFixtureProposed;
  next.scalars.total_volume_base = fmt2(totalBase);
  next.scalars.total_volume_proposed = fmt2(totalProposed);

  const difference = totalBase - totalProposed;
  next.scalars.saving_annual = fmt2(difference);
  const percent = totalBase > 0 ? (difference / totalBase) * 100 : 0;
  next.scalars.saving_percentage = fmt2(percent);
  next.scalars.annex_mandatory = percent >= 0 ? "Yes" : "No";

  return next;
}

export function clearGiFixtureRow(
  state: GiWcTwoAnnexState,
  preset: GiWcTwoPresetDef,
): GiWcTwoAnnexState {
  const prefix = preset.prefix;
  const scalars = { ...state.scalars };
  scalars[preset.occupantStatusParam] = preset.defaults.defaultOccupantStatus ?? "";
  scalars[`${prefix}_proposed`] = "";
  scalars[`${prefix}_proposed_total`] = "0";
  return { ...state, scalars };
}
