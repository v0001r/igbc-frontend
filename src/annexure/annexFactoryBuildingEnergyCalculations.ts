import type { ComparisonValues } from "@/annexure/annexureComparisonStorage";

const ENERGY_SUM_BASE = [
  "space_cooling_base",
  "space_heating_base",
  "vent_fans_base",
  "ext_usage_base",
  "misc_equip_base",
  "area_lights_base",
  "process_load_base",
] as const;

const ENERGY_SUM_DESIGN = [
  "space_cooling_design",
  "space_heating_design",
  "vent_fans_design",
  "ext_usage_design",
  "misc_equip_design",
  "area_lights_design",
  "process_load_design",
] as const;

function n(v: string | undefined): number {
  const x = parseFloat(String(v ?? "").trim());
  return Number.isFinite(x) ? x : 0;
}

function fmt2(v: number): string {
  return v.toFixed(2);
}

/** Laravel `factorybuildingenergy.blade.php` energy summary calculations. */
export function computeFactoryBuildingEnergy(values: ComparisonValues): ComparisonValues {
  const next = { ...values };
  const baseTotal = ENERGY_SUM_BASE.reduce((sum, key) => sum + n(next[key]), 0);
  const designTotal = ENERGY_SUM_DESIGN.reduce((sum, key) => sum + n(next[key]), 0);

  next.total_energy_consumption_base = fmt2(baseTotal);
  next.total_energy_consumption_design = fmt2(designTotal);

  const savedPct = designTotal > 0 ? ((designTotal - baseTotal) / designTotal) * 100 : 0;
  next.energy_saved = fmt2(savedPct);

  return next;
}
