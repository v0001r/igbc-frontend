import {
  computeEemr2OfficeState,
  createDefaultEemr2OfficeState,
  type Eemr2OfficeEpiTableKey,
  type Eemr2OfficeState,
} from "@/annexure/annexEemr2OfficeCalculations";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { CertificationFormResponse } from "@/lib/certificationForm";
import { RatingDataIndex } from "@/lib/ratingDataIndex";

const EPI_TABLE_SAVE_PARAMS: Record<
  Eemr2OfficeEpiTableKey,
  { bpo: string; mandatory: string; cp4: string; cp6: string; cp10: string; cp14: string }
> = {
  uniform_composite: {
    bpo: "bpo_annexone",
    mandatory: "mandatory_annexone",
    cp4: "cp4_annexone",
    cp6: "cp6_annexone",
    cp10: "cp10_annexone",
    cp14: "cp14_annexone",
  },
  uniform_warm_humid: {
    bpo: "bpo_uniform",
    mandatory: "mandatory_annexone_uniform",
    cp4: "cp4_annexone_uniform",
    cp6: "cp6_annexone_uniform",
    cp10: "cp10_annexone_uniform",
    cp14: "cp14_annexone_uniform",
  },
  uniform_hot_dry: {
    bpo: "bpo_uniform_dry",
    mandatory: "mandatory_annexone_hotdry",
    cp4: "cp4_annexone_hotdry",
    cp6: "cp6_annexone_hotdry",
    cp10: "cp10_annexone_hotdry",
    cp14: "cp14_annexone_hotdry",
  },
  non_uniform_composite: {
    bpo: "bpo_uniform_com",
    mandatory: "mandatory_annexone_epi_limit",
    cp4: "cp4_annexone_epi_limit",
    cp6: "cp6_annexone_epi_limit",
    cp10: "cp10_annexone_epi_limit",
    cp14: "cp14_annexone_epi_limit",
  },
  non_uniform_warm_humid: {
    bpo: "bpo_uniform_warm",
    mandatory: "mandatory_annexone_warm",
    cp4: "cp4_annexone_warm",
    cp6: "cp6_annexone_warm",
    cp10: "cp10_annexone_warm",
    cp14: "cp14_annexone_warm",
  },
  non_uniform_hot_dry: {
    bpo: "bpo_uniform_hotdry",
    mandatory: "mandatory_annexone_dryhot",
    cp4: "cp4_annexone_dryhot",
    cp6: "cp6_annexone_dryhot",
    cp10: "cp10_annexone_dryhot",
    cp14: "cp14_annexone_dryhot",
  },
};

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

export function hydrateEemr2OfficeAnnex(
  schema: AnnexureSchemaDefinition,
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
): Eemr2OfficeState {
  const layout = schema.eemr2OfficeLayout ?? {};
  const minFloors = layout.minFloorRows ?? 5;
  const minEnergy = layout.minEnergyRows ?? 5;

  const idx = new RatingDataIndex(form);
  const draft = createDefaultEemr2OfficeState(minFloors, minEnergy);

  const savedBuiltUp = getParam(form, tab, subtab, "total_built_up_area_annexone");
  if (savedBuiltUp != null) {
    draft.total_built_up_area_annexone = parseScalar(savedBuiltUp);
  }

  const savedAirCond = getParam(form, tab, subtab, "total_air_cond_annexone");
  draft.total_air_cond_annexone =
    savedAirCond != null
      ? parseScalar(savedAirCond)
      : idx.get("project_details", "project_details", "total_air_cond") ||
        idx.getRelated("total_air_cond", "project_details") ||
        "";

  const savedOpHr = getParam(form, tab, subtab, "op_hr_annexone");
  draft.op_hr_annexone =
    savedOpHr != null
      ? parseScalar(savedOpHr)
      : idx.get("project_details", "project_details", "opera_hr") ||
        idx.getRelated("opera_hr", "project_details") ||
        "";

  const floorNos = parseArray(getParam(form, tab, subtab, "floor_no_annexone"));
  const operaHrs = parseArray(getParam(form, tab, subtab, "opera_hr_annexone"));
  const daysOp = parseArray(getParam(form, tab, subtab, "days_op_hr_annexone"));
  const areas = parseArray(getParam(form, tab, subtab, "area_sqm_annexone"));
  const condAreas = parseArray(getParam(form, tab, subtab, "cond_area_annexone"));

  const floorCount = Math.max(minFloors, floorNos.length, operaHrs.length, areas.length, condAreas.length);
  draft.floors = Array.from({ length: floorCount }, (_, i) => ({
    floor_no: floorNos[i] ?? "",
    opera_hr: operaHrs[i] ?? "",
    days_op_hr: daysOp[i] ?? "",
    area_sqm: areas[i] ?? "",
    cond_area: condAreas[i] ?? "",
    percentage_air_cond: "",
  }));

  draft.cli_zone_annexone = parseScalar(getParam(form, tab, subtab, "cli_zone_annexone"));
  draft.office_space_type = parseScalar(getParam(form, tab, subtab, "office_space_type"));
  draft.cli_zone_annexone_value = parseScalar(getParam(form, tab, subtab, "cli_zone_annexone_value"));

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

  return computeEemr2OfficeState(draft);
}

export function buildSavePayloadFromEemr2Office(state: Eemr2OfficeState): {
  paramName: string;
  type: string;
  value: string;
}[] {
  const computed = computeEemr2OfficeState(state);
  const fields: { paramName: string; type: string; value: string }[] = [
    { paramName: "total_built_up_area_annexone", type: "t", value: saveScalar(computed.total_built_up_area_annexone) },
    { paramName: "total_air_cond_annexone", type: "t", value: saveScalar(computed.total_air_cond_annexone) },
    {
      paramName: "percentage_air_condition_annexone",
      type: "t",
      value: saveScalar(computed.percentage_air_condition_annexone),
    },
    { paramName: "op_hr_annexone", type: "t", value: saveScalar(computed.op_hr_annexone) },
    { paramName: "floor_no_annexone", type: "t", value: saveArray(computed.floors.map((r) => r.floor_no)) },
    { paramName: "opera_hr_annexone", type: "t", value: saveArray(computed.floors.map((r) => r.opera_hr)) },
    { paramName: "days_op_hr_annexone", type: "t", value: saveArray(computed.floors.map((r) => r.days_op_hr)) },
    { paramName: "area_sqm_annexone", type: "t", value: saveArray(computed.floors.map((r) => r.area_sqm)) },
    { paramName: "cond_area_annexone", type: "t", value: saveArray(computed.floors.map((r) => r.cond_area)) },
    {
      paramName: "percentage_air_cond_annexone",
      type: "t",
      value: saveArray(computed.floors.map((r) => r.percentage_air_cond)),
    },
    { paramName: "percentage_ac_area", type: "t", value: saveScalar(computed.percentage_ac_area) },
    { paramName: "correction_factor", type: "t", value: saveScalar(computed.correction_factor) },
    { paramName: "cli_zone_annexone", type: "t", value: saveArray([computed.cli_zone_annexone]) },
    { paramName: "office_space_type", type: "t", value: saveArray([computed.office_space_type]) },
    { paramName: "cli_zone_annexone_value", type: "t", value: saveArray([computed.cli_zone_annexone_value]) },
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
    {
      paramName: "non_uniform_air_conditioned",
      type: "t",
      value: saveScalar(computed.non_uniform_air_conditioned),
    },
  ];

  for (const tableKey of Object.keys(EPI_TABLE_SAVE_PARAMS) as Eemr2OfficeEpiTableKey[]) {
    const params = EPI_TABLE_SAVE_PARAMS[tableKey];
    const rows = computed.epiLimits[tableKey];
    fields.push(
      { paramName: params.bpo, type: "t", value: saveArray(rows.map((r) => r.bpo)) },
      { paramName: params.mandatory, type: "t", value: saveArray(rows.map((r) => r.mandatory)) },
      { paramName: params.cp4, type: "t", value: saveArray(rows.map((r) => r.cp4)) },
      { paramName: params.cp6, type: "t", value: saveArray(rows.map((r) => r.cp6)) },
      { paramName: params.cp10, type: "t", value: saveArray(rows.map((r) => r.cp10)) },
      { paramName: params.cp14, type: "t", value: saveArray(rows.map((r) => r.cp14)) },
    );
  }

  return fields;
}
