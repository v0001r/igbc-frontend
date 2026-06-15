import {
  computeHvacWaterRequirementAnnex,
  readAnnexWcTwoTotals,
} from "@/annexure/annexHvacWaterRequirementCalculations";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { CertificationFormResponse } from "@/lib/certificationForm";
import { RatingDataIndex } from "@/lib/ratingDataIndex";

const COOLING_SCALAR_PARAMS = [
  "cooling_tower_capacity",
  "water_flow_input",
  "drift_loss_input",
  "water_drift_input",
  "evaporation_loss_input",
  "evaporation_input",
  "blow_down_userinput",
  "blow_down_input",
  "total_make_input",
  "total_gal_input",
  "operation_hours_input",
  "water_towerinput",
  "up_input",
  "liter_input",
] as const;

const BALANCE_SCALAR_PARAMS = [
  "stp_cap",
  "stp_effici",
  "waste_water",
  "generated_waste",
  "treated_water",
  "treated_waste",
  "stored_rainwater",
  "rain_waste",
  "totaL_water",
  "ava_total",
  "flusing_water",
  "flusing_waste",
  "landscaping_water",
  "landscaping_waste",
  "cooling_tower_makeup",
  "maleup_waste",
  "others_reuse_daily",
  "others_reuse_annual",
  "total_water_demand",
  "total_demand",
  "percentage_requ",
  "percentage_annual",
] as const;

const ALL_PARAMS = [...COOLING_SCALAR_PARAMS, ...BALANCE_SCALAR_PARAMS] as const;

function getParam(
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
  param: string,
): string | undefined {
  return (form.data ?? []).find((d) => d.tab === tab && d.subtab === subtab && d.paramName === param)?.value;
}

function resolveStpCapacity(
  form: CertificationFormResponse,
  layout: NonNullable<AnnexureSchemaDefinition["hvacWaterRequirementLayout"]>,
  globalExtras?: Record<string, string>,
): string {
  const fromExtras = globalExtras?.capacity_of_stp?.trim();
  if (fromExtras) return fromExtras;
  const src = layout.stpCapacityFrom;
  const idx = new RatingDataIndex(form);
  const tab = src?.tab ?? "project_details";
  const subtab = src?.subtab ?? "water_conservation_details";
  const param = src?.param ?? "capacity_of_stp";
  return idx.get(tab, subtab, param) || idx.getRelated(param, "water_conservation") || "";
}

export function hydrateHvacWaterRequirementAnnex(
  schema: AnnexureSchemaDefinition,
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
  globalExtras?: Record<string, string>,
): Record<string, string> {
  const layout = schema.hvacWaterRequirementLayout!;
  const scalars: Record<string, string> = {};
  for (const param of ALL_PARAMS) {
    scalars[param] = getParam(form, tab, subtab, param) ?? "";
  }
  const stpCapacity = resolveStpCapacity(form, layout, globalExtras);
  const wcTwoTotals = readAnnexWcTwoTotals(form, layout);
  return computeHvacWaterRequirementAnnex({
    scalars,
    wcTwoTotals,
    stpCapacity,
    gallonsToLiters: layout.gallonsToLiters ?? 3.78,
  });
}

export function buildSavePayloadFromHvacWaterRequirement(
  scalars: Record<string, string>,
): { paramName: string; type: string; value: string }[] {
  return ALL_PARAMS.map((paramName) => ({
    paramName,
    type: "t",
    value: scalars[paramName] ?? "",
  }));
}
