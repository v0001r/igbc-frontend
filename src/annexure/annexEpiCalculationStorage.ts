import {
  computeEpiCalculationState,
  createDefaultEpiCalculationState,
  type EpiCalculationState,
} from "@/annexure/annexEpiCalculationCalculations";
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

export function hydrateEpiCalculationAnnex(
  schema: AnnexureSchemaDefinition,
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
): EpiCalculationState {
  const layout = schema.epiCalculationLayout ?? {};
  const minEnergy = layout.minEnergyRows ?? 5;
  const draft = createDefaultEpiCalculationState(minEnergy);

  draft.total_built_up_area = parseScalar(getParam(form, tab, subtab, "total_built_up_area"));
  draft.total_air_cond = parseScalar(getParam(form, tab, subtab, "total_air_cond"));
  draft.op_hr = parseScalar(getParam(form, tab, subtab, "op_hr"));
  draft.day_hr = parseScalar(getParam(form, tab, subtab, "day_hr"));
  draft.cli_zone = parseScalar(getParam(form, tab, subtab, "cli_zone"));

  const months = parseArray(getParam(form, tab, subtab, "existing_month_year"));
  const grid = parseArray(getParam(form, tab, subtab, "existing_energy_consumption"));
  const onoff = parseArray(getParam(form, tab, subtab, "existing_onoff_site"));
  const dg = parseArray(getParam(form, tab, subtab, "existing_on_site_renewable"));
  const other = parseArray(getParam(form, tab, subtab, "existing_off_site_renewable"));
  const wheeling = parseArray(getParam(form, tab, subtab, "existing_renewable_wheeling"));

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

  return computeEpiCalculationState(draft);
}

export function buildSavePayloadFromEpiCalculation(state: EpiCalculationState): {
  paramName: string;
  type: string;
  value: string;
}[] {
  const computed = computeEpiCalculationState(state);

  return [
    { paramName: "total_built_up_area", type: "t", value: saveScalar(computed.total_built_up_area) },
    { paramName: "total_air_cond", type: "t", value: saveScalar(computed.total_air_cond) },
    { paramName: "percentage_air_cond", type: "t", value: saveScalar(computed.percentage_air_cond) },
    { paramName: "op_hr", type: "t", value: saveScalar(computed.op_hr) },
    { paramName: "day_hr", type: "t", value: saveScalar(computed.day_hr) },
    { paramName: "cli_zone", type: "t", value: saveArray([computed.cli_zone]) },
    { paramName: "bpo", type: "t", value: saveArray(computed.epiLimits.map((r) => r.bpo)) },
    { paramName: "mandatory", type: "t", value: saveArray(computed.epiLimits.map((r) => r.mandatory)) },
    { paramName: "cp4", type: "t", value: saveArray(computed.epiLimits.map((r) => r.cp4)) },
    { paramName: "cp6", type: "t", value: saveArray(computed.epiLimits.map((r) => r.cp6)) },
    { paramName: "cp10", type: "t", value: saveArray(computed.epiLimits.map((r) => r.cp10)) },
    { paramName: "cp14", type: "t", value: saveArray(computed.epiLimits.map((r) => r.cp14)) },
    {
      paramName: "existing_month_year",
      type: "t",
      value: saveArray(computed.energyRows.map((r) => r.month)),
    },
    {
      paramName: "existing_energy_consumption",
      type: "t",
      value: saveArray(computed.energyRows.map((r) => r.existing_energy_consumption)),
    },
    {
      paramName: "existing_onoff_site",
      type: "t",
      value: saveArray(computed.energyRows.map((r) => r.existing_onoff_site)),
    },
    {
      paramName: "existing_on_site_renewable",
      type: "t",
      value: saveArray(computed.energyRows.map((r) => r.existing_on_site_renewable)),
    },
    {
      paramName: "existing_off_site_renewable",
      type: "t",
      value: saveArray(computed.energyRows.map((r) => r.existing_off_site_renewable)),
    },
    {
      paramName: "existing_total_consumption",
      type: "t",
      value: saveArray(computed.energyRows.map((r) => r.existing_total_consumption)),
    },
    {
      paramName: "existing_renewable_wheeling",
      type: "t",
      value: saveArray(computed.energyRows.map((r) => r.existing_renewable_wheeling)),
    },
    {
      paramName: "total_existing_energy_consumption",
      type: "t",
      value: saveScalar(computed.total_existing_energy_consumption),
    },
    {
      paramName: "existing_total_onoffsite",
      type: "t",
      value: saveScalar(computed.existing_total_onoffsite),
    },
    {
      paramName: "existing_total_onsite_renewable",
      type: "t",
      value: saveScalar(computed.existing_total_onsite_renewable),
    },
    {
      paramName: "existing_total_offsite_renewable",
      type: "t",
      value: saveScalar(computed.existing_total_offsite_renewable),
    },
    {
      paramName: "existing_total_energy",
      type: "t",
      value: saveScalar(computed.existing_total_energy),
    },
    {
      paramName: "existing_total_renewable_wheeling",
      type: "t",
      value: saveScalar(computed.existing_total_renewable_wheeling),
    },
    {
      paramName: "percentage_existing_energy_consumption",
      type: "t",
      value: saveScalar(computed.percentage_existing_energy_consumption),
    },
    {
      paramName: "percentage_epi_cal",
      type: "t",
      value: saveScalar(computed.percentage_epi_cal),
    },
  ];
}
