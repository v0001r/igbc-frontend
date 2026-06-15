import type { HvacWaterRequirementLayoutDef } from "@/annexure/annexureTypes";
import type { CertificationFormResponse } from "@/lib/certificationForm";

export type HvacWaterRequirementScalars = Record<string, string>;

export type AnnexWcTwoTotals = {
  wasteWaterDaily: number;
  annualDaysTotal: number;
  flushBaseDaily: number;
};

function n(v: string | undefined): number {
  const x = parseFloat(String(v ?? "").trim());
  return Number.isFinite(x) ? x : 0;
}

function fmt2(v: number): string {
  return v.toFixed(2);
}

function parseMapValues(raw: string | undefined): number[] {
  if (!raw?.trim()) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    if (Array.isArray(v)) return v.map((x) => n(String(x)));
    if (v && typeof v === "object") {
      return Object.values(v as Record<string, unknown>).map((x) => n(String(x)));
    }
  } catch {
    /* plain scalar */
  }
  const scalar = n(raw);
  return scalar ? [scalar] : [];
}

function sumParamValues(form: CertificationFormResponse, tab: string, subtab: string, param: string): number {
  const row = (form.data ?? []).find((d) => d.tab === tab && d.subtab === subtab && d.paramName === param);
  return parseMapValues(row?.value).reduce((s, x) => s + x, 0);
}

export function readAnnexWcTwoTotals(
  form: CertificationFormResponse,
  layout: HvacWaterRequirementLayoutDef,
): AnnexWcTwoTotals {
  const src = layout.wasteFromAnnex;
  const wcTab = src?.tab ?? "water_conservation";
  const wcSubtab = src?.subtab ?? "annex_wc_two";
  const flushProposed = sumParamValues(form, wcTab, wcSubtab, src?.flushProposedParam ?? "flush_proposed_total");
  const fixtureProposed = sumParamValues(
    form,
    wcTab,
    wcSubtab,
    src?.fixtureProposedParam ?? "fixture_proposed_total",
  );
  const flushBase = sumParamValues(form, wcTab, wcSubtab, src?.flushBaseParam ?? "flush_base_total");
  const annualDays = sumParamValues(form, wcTab, wcSubtab, src?.annualDaysParam ?? "annual_days");
  return {
    wasteWaterDaily: flushProposed + fixtureProposed,
    annualDaysTotal: annualDays > 0 ? annualDays : 365,
    flushBaseDaily: flushBase,
  };
}

export type HvacWaterRequirementComputeInput = {
  scalars: HvacWaterRequirementScalars;
  wcTwoTotals: AnnexWcTwoTotals;
  stpCapacity: string;
  gallonsToLiters: number;
};

/** Laravel `hvacWaterRequire.blade.php` `calculateValues()`. */
export function computeHvacWaterRequirementAnnex(input: HvacWaterRequirementComputeInput): HvacWaterRequirementScalars {
  const { wcTwoTotals, stpCapacity, gallonsToLiters } = input;
  const s = { ...input.scalars };

  const waterFlow = n(s.water_flow_input);
  const driftPct = n(s.drift_loss_input);
  const evapPct = n(s.evaporation_loss_input);
  const blowDownFactor = n(s.blow_down_userinput);
  const operationHours = n(s.operation_hours_input);
  const towerCount = n(s.water_towerinput);
  const stpEfficiency = n(s.stp_effici);
  const storedRain = n(s.stored_rainwater);
  const landscapingDaily = n(s.landscaping_water);
  const othersDaily = n(s.others_reuse_daily);

  const annualDays = wcTwoTotals.annualDaysTotal;
  const wasteDaily = wcTwoTotals.wasteWaterDaily;
  const flushBaseDaily = wcTwoTotals.flushBaseDaily;

  const driftLoss = (waterFlow * driftPct) / 100;
  const evaporationLoss = (waterFlow * evapPct) / 100;
  const blowDownLoss = waterFlow * blowDownFactor;
  const totalMakeUpUsgpm = driftLoss + evaporationLoss + blowDownLoss;
  const totalGalPerHour = totalMakeUpUsgpm * 60;
  const totalGalPerDay = operationHours * towerCount * totalGalPerHour;
  const litersPerDay = totalGalPerDay * gallonsToLiters;

  s.water_drift_input = fmt2(driftLoss);
  s.evaporation_input = fmt2(evaporationLoss);
  s.blow_down_input = fmt2(blowDownLoss);
  s.total_make_input = fmt2(totalMakeUpUsgpm);
  s.total_gal_input = fmt2(totalGalPerHour);
  s.up_input = fmt2(totalGalPerDay);
  s.liter_input = fmt2(litersPerDay);
  s.cooling_tower_makeup = fmt2(litersPerDay);

  s.stp_cap = stpCapacity;
  s.waste_water = fmt2(wasteDaily);
  s.generated_waste = fmt2(wasteDaily * annualDays);

  const treatedDaily = wasteDaily * stpEfficiency;
  const treatedAnnual = treatedDaily * annualDays;
  s.treated_water = fmt2(treatedDaily);
  s.treated_waste = fmt2(treatedAnnual);

  const rainAnnual = storedRain * annualDays;
  s.rain_waste = fmt2(rainAnnual);

  const totalAvailDaily = treatedDaily + storedRain;
  const totalAvailAnnual = treatedAnnual + rainAnnual;
  s.totaL_water = fmt2(totalAvailDaily);
  s.ava_total = fmt2(totalAvailAnnual);

  s.flusing_water = fmt2(flushBaseDaily);
  const flushAnnual = flushBaseDaily * annualDays;
  s.flusing_waste = fmt2(flushAnnual);

  const landscapingAnnual = landscapingDaily * annualDays;
  s.landscaping_waste = fmt2(landscapingAnnual);

  const coolingAnnual = litersPerDay * annualDays;
  s.maleup_waste = fmt2(coolingAnnual);

  const othersAnnual = othersDaily * annualDays;
  s.others_reuse_annual = fmt2(othersAnnual);

  // Blade `hvacWaterRequire.blade.php` sums flushing + landscaping + cooling only (others excluded).
  const demandDaily = flushBaseDaily + landscapingDaily + litersPerDay;
  const demandAnnual = flushAnnual + landscapingAnnual + coolingAnnual;
  s.total_water_demand = fmt2(demandDaily);
  s.total_demand = fmt2(demandAnnual);

  const pctDaily = demandDaily > 0 ? (totalAvailDaily / demandDaily) * 100 : 0;
  const pctAnnual = demandDaily > 0 ? (totalAvailAnnual / demandDaily) * 100 : 0;
  s.percentage_requ = fmt2(pctDaily);
  s.percentage_annual = fmt2(pctAnnual);

  return s;
}
