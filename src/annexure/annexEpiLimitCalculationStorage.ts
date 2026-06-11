import {
  computeEpiLimitCalculationState,
  createDefaultEpiLimitCalculationState,
  type EpiLimitCalculationState,
} from "@/annexure/annexEpiLimitCalculationCalculations";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { CertificationFormResponse } from "@/lib/certificationForm";

function getParam(
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
  param: string,
): string | undefined {
  return (form.data ?? []).find((d) => d.tab === tab && d.subtab === subtab && d.paramName === param)?.value;
}

function parseArray(raw: string | undefined, fallback: string[] = []): string[] {
  if (!raw?.trim()) return fallback;
  try {
    const v = JSON.parse(raw) as unknown;
    if (Array.isArray(v)) return v.map((x) => (x == null ? "" : String(x)));
  } catch {
    /* use fallback */
  }
  return fallback;
}

function parseScalar(raw: string | undefined, fallback = ""): string {
  if (!raw?.trim()) return fallback;
  try {
    const v = JSON.parse(raw) as unknown;
    if (Array.isArray(v)) return v[0] != null ? String(v[0]) : fallback;
    return String(v);
  } catch {
    return raw;
  }
}

function saveArray(values: string[]): string {
  return JSON.stringify(values);
}

function saveScalar(value: string): string {
  return JSON.stringify([value]);
}

export function hydrateEpiLimitCalculationAnnex(
  schema: AnnexureSchemaDefinition,
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
): EpiLimitCalculationState {
  const layout = schema.epiLimitCalculationLayout ?? {};
  const minEnergy = layout.minEnergyRows ?? 5;
  const draft = createDefaultEpiLimitCalculationState(minEnergy);

  draft.total_built_up_area_annexone = parseScalar(
    getParam(form, tab, subtab, "total_built_up_area_annexone"),
  );
  draft.total_air_cond_annexone = parseScalar(getParam(form, tab, subtab, "total_air_cond_annexone"));
  draft.op_hr_annexone = parseScalar(getParam(form, tab, subtab, "op_hr_annexone"));
  draft.cli_zone_annexone = parseScalar(getParam(form, tab, subtab, "cli_zone_annexone"));

  const months = parseArray(getParam(form, tab, subtab, "existing_month_year_annexone"));
  const grid = parseArray(getParam(form, tab, subtab, "existing_energy_consumption_annexone"));
  const onoff = parseArray(getParam(form, tab, subtab, "existing_onoff_site_annexone"));
  const dg = parseArray(getParam(form, tab, subtab, "existing_on_site_renewable_annexone"));
  const other = parseArray(getParam(form, tab, subtab, "existing_off_site_renewable_annexone"));
  const wheeling = parseArray(getParam(form, tab, subtab, "existing_renewable_wheeling_annexone"));

  const energyCount = Math.max(minEnergy, months.length, grid.length, onoff.length, dg.length, other.length);
  draft.energyRows = Array.from({ length: energyCount }, (_, i) => ({
    month: months[i] ?? "",
    existing_energy_consumption: grid[i] ?? "",
    existing_onoff_site: onoff[i] ?? "",
    existing_on_site_renewable: dg[i] ?? "",
    existing_off_site_renewable: other[i] ?? "",
    existing_total_consumption: "",
    existing_renewable_wheeling: wheeling[i] ?? "",
  }));

  return computeEpiLimitCalculationState(draft);
}

export function buildSavePayloadFromEpiLimitCalculation(state: EpiLimitCalculationState): {
  paramName: string;
  type: string;
  value: string;
}[] {
  const computed = computeEpiLimitCalculationState(state);

  return [
    {
      paramName: "total_built_up_area_annexone",
      type: "t",
      value: saveScalar(computed.total_built_up_area_annexone),
    },
    {
      paramName: "total_air_cond_annexone",
      type: "t",
      value: saveScalar(computed.total_air_cond_annexone),
    },
    {
      paramName: "percentage_air_cond_annexone",
      type: "t",
      value: saveScalar(computed.percentage_air_cond_annexone),
    },
    { paramName: "op_hr_annexone", type: "t", value: saveScalar(computed.op_hr_annexone) },
    { paramName: "cli_zone_annexone", type: "t", value: saveArray([computed.cli_zone_annexone]) },
    { paramName: "bpo_annexone", type: "t", value: saveArray(computed.epiLimits.map((r) => r.bpo)) },
    {
      paramName: "mandatory_annexone",
      type: "t",
      value: saveArray(computed.epiLimits.map((r) => r.mandatory)),
    },
    { paramName: "cp4_annexone", type: "t", value: saveArray(computed.epiLimits.map((r) => r.cp4)) },
    { paramName: "cp6_annexone", type: "t", value: saveArray(computed.epiLimits.map((r) => r.cp6)) },
    { paramName: "cp10_annexone", type: "t", value: saveArray(computed.epiLimits.map((r) => r.cp10)) },
    { paramName: "cp14_annexone", type: "t", value: saveArray(computed.epiLimits.map((r) => r.cp14)) },
    {
      paramName: "existing_month_year_annexone",
      type: "t",
      value: saveArray(computed.energyRows.map((r) => r.month)),
    },
    {
      paramName: "existing_energy_consumption_annexone",
      type: "t",
      value: saveArray(computed.energyRows.map((r) => r.existing_energy_consumption)),
    },
    {
      paramName: "existing_onoff_site_annexone",
      type: "t",
      value: saveArray(computed.energyRows.map((r) => r.existing_onoff_site)),
    },
    {
      paramName: "existing_on_site_renewable_annexone",
      type: "t",
      value: saveArray(computed.energyRows.map((r) => r.existing_on_site_renewable)),
    },
    {
      paramName: "existing_off_site_renewable_annexone",
      type: "t",
      value: saveArray(computed.energyRows.map((r) => r.existing_off_site_renewable)),
    },
    {
      paramName: "existing_total_consumption_annexone",
      type: "t",
      value: saveArray(computed.energyRows.map((r) => r.existing_total_consumption)),
    },
    {
      paramName: "existing_renewable_wheeling_annexone",
      type: "t",
      value: saveArray(computed.energyRows.map((r) => r.existing_renewable_wheeling)),
    },
    {
      paramName: "total_existing_energy_consumption_annexone",
      type: "t",
      value: saveScalar(computed.total_existing_energy_consumption_annexone),
    },
    {
      paramName: "existing_total_onoffsite_annexone",
      type: "t",
      value: saveScalar(computed.existing_total_onoffsite_annexone),
    },
    {
      paramName: "existing_total_onsite_renewable_annexone",
      type: "t",
      value: saveScalar(computed.existing_total_onsite_renewable_annexone),
    },
    {
      paramName: "existing_total_offsite_renewable_annexone",
      type: "t",
      value: saveScalar(computed.existing_total_offsite_renewable_annexone),
    },
    {
      paramName: "existing_total_energy_annexone",
      type: "t",
      value: saveScalar(computed.existing_total_energy_annexone),
    },
    {
      paramName: "existing_total_renewable_wheeling_annexone",
      type: "t",
      value: saveScalar(computed.existing_total_renewable_wheeling_annexone),
    },
    {
      paramName: "percentage_existing_energy_consumption_annexone",
      type: "t",
      value: saveScalar(computed.percentage_existing_energy_consumption_annexone),
    },
  ];
}
