import {
  computeDaylightNoiseState,
  filterDaylightSourceRows,
  type AcousticSpaceTypeDef,
  type DaylightNoiseRow,
  type DaylightNoiseState,
  type DaylightSpaceTypeDef,
} from "@/annexure/annexDaylightNoiseCalculations";
import { loadAreaSourceRows } from "@/annexure/annexConditionedSpacesStorage";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { CertificationFormResponse } from "@/lib/certificationForm";

const ROW_PARAMS = [
  "reqularly_occupied_air_spaces",
  "air_space_regular_occ",
  "space_co2_noise",
  "space_co2_benchmark",
  "space_co2_lux_level",
  "space_co2_compiant_area",
  "space_co2_compliant_boolean",
  "type_of_spaces_lpd",
  "baseline_lpd_datlight",
  "space_co2_measure",
  "space_co2_measure_value",
  "space_co2_performance_value",
  "space_co2_outdoor",
] as const;

const SUMMARY_ARRAY_PARAMS = [
  "total_regularly_occupied_daylight",
  "base_total_consum_daylight",
  "total_annual_boolean_daylight",
  "total_annual_outdoor_daylight",
  "total_annual_occupied_daylight",
] as const;

function getParam(
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
  param: string,
): string | undefined {
  return (form.data ?? []).find((d) => d.tab === tab && d.subtab === subtab && d.paramName === param)?.value;
}

function parseJsonArray(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) ? v.map((x) => (x == null ? "" : String(x))) : [];
  } catch {
    return [];
  }
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

function catalogsFromSchema(schema: AnnexureSchemaDefinition): {
  daylightTypes: Record<string, DaylightSpaceTypeDef>;
  acousticTypes: Record<string, AcousticSpaceTypeDef>;
} {
  const daylightTypes: Record<string, DaylightSpaceTypeDef> = {};
  for (const [key, def] of Object.entries(schema.daylightNoiseLayout?.daylightSpaceTypes ?? {})) {
    daylightTypes[key] = { label: def.label, benchmarkLux: def.benchmarkLux };
  }
  const acousticTypes: Record<string, AcousticSpaceTypeDef> = {};
  for (const [key, def] of Object.entries(schema.daylightNoiseLayout?.acousticSpaceTypes ?? {})) {
    acousticTypes[key] = { label: def.label, baselineDb: def.baselineDb };
  }
  return { daylightTypes, acousticTypes };
}

function sourceFilterFromSchema(schema: AnnexureSchemaDefinition) {
  const src = schema.daylightNoiseLayout?.sourceAnnex;
  return {
    occupancyValue: src?.occupancyValue ?? "regularly_occupied_spaces",
    acValue: src?.acValue,
  };
}

function hydrateRows(
  schema: AnnexureSchemaDefinition,
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
): DaylightNoiseRow[] {
  const sources = filterDaylightSourceRows(
    loadAreaSourceRows(form),
    sourceFilterFromSchema(schema),
  );
  const saved: Record<(typeof ROW_PARAMS)[number], string[]> = {} as Record<
    (typeof ROW_PARAMS)[number],
    string[]
  >;
  for (const p of ROW_PARAMS) {
    saved[p] = parseJsonArray(getParam(form, tab, subtab, p));
  }

  return sources.map((src, displayIdx) => ({
    sourceIndex: src.sourceIndex,
    reqularly_occupied_air_spaces:
      saved.reqularly_occupied_air_spaces[displayIdx] || src.reqularly_occupied_spaces,
    air_space_regular_occ:
      saved.air_space_regular_occ[displayIdx] || src.total_carpet_area_circulation,
    space_co2_noise: saved.space_co2_noise[displayIdx] ?? "",
    space_co2_benchmark: saved.space_co2_benchmark[displayIdx] ?? "",
    space_co2_lux_level: saved.space_co2_lux_level[displayIdx] ?? "",
    space_co2_compiant_area: saved.space_co2_compiant_area[displayIdx] ?? "0.00",
    space_co2_compliant_boolean: saved.space_co2_compliant_boolean[displayIdx] ?? "No",
    type_of_spaces_lpd: saved.type_of_spaces_lpd[displayIdx] ?? "",
    baseline_lpd_datlight: saved.baseline_lpd_datlight[displayIdx] ?? "",
    space_co2_measure: saved.space_co2_measure[displayIdx] ?? "",
    space_co2_measure_value: saved.space_co2_measure_value[displayIdx] ?? "0.00",
    space_co2_performance_value: saved.space_co2_performance_value[displayIdx] ?? "No",
    space_co2_outdoor: saved.space_co2_outdoor[displayIdx] ?? "",
  }));
}

export function hydrateDaylightNoiseAnnex(
  schema: AnnexureSchemaDefinition,
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
): DaylightNoiseState {
  const { daylightTypes, acousticTypes } = catalogsFromSchema(schema);
  const rows = hydrateRows(schema, form, tab, subtab);

  const draft: DaylightNoiseState = {
    rows,
    total_carpet_area_daylight: parseScalar(
      getParam(form, tab, subtab, "total_carpet_area_daylight"),
    ),
    total_regularly_occupied_daylight: parseScalar(
      parseJsonArray(getParam(form, tab, subtab, "total_regularly_occupied_daylight"))[0] ??
        getParam(form, tab, subtab, "total_regularly_occupied_daylight"),
    ),
    base_total_consum_daylight: parseScalar(
      parseJsonArray(getParam(form, tab, subtab, "base_total_consum_daylight"))[0] ??
        getParam(form, tab, subtab, "base_total_consum_daylight"),
    ),
    total_annual_boolean_daylight: parseScalar(
      parseJsonArray(getParam(form, tab, subtab, "total_annual_boolean_daylight"))[0] ??
        getParam(form, tab, subtab, "total_annual_boolean_daylight"),
      "No",
    ),
    total_annual_outdoor_daylight: parseScalar(
      parseJsonArray(getParam(form, tab, subtab, "total_annual_outdoor_daylight"))[0] ??
        getParam(form, tab, subtab, "total_annual_outdoor_daylight"),
    ),
    total_annual_occupied_daylight: parseScalar(
      parseJsonArray(getParam(form, tab, subtab, "total_annual_occupied_daylight"))[0] ??
        getParam(form, tab, subtab, "total_annual_occupied_daylight"),
    ),
  };

  return computeDaylightNoiseState(draft, daylightTypes, acousticTypes);
}

export function buildSavePayloadFromDaylightNoise(state: DaylightNoiseState): {
  paramName: string;
  type: string;
  value: string;
}[] {
  const fields: { paramName: string; type: string; value: string }[] = [];

  for (const p of ROW_PARAMS) {
    fields.push({
      paramName: p,
      type: "t",
      value: JSON.stringify(
        state.rows.map((r) => (r as unknown as Record<string, string>)[p] ?? ""),
      ),
    });
  }

  fields.push({
    paramName: "total_carpet_area_daylight",
    type: "t",
    value: JSON.stringify([state.total_carpet_area_daylight]),
  });

  for (const p of SUMMARY_ARRAY_PARAMS) {
    fields.push({
      paramName: p,
      type: "t",
      value: JSON.stringify([state[p as keyof DaylightNoiseState] as string]),
    });
  }

  return fields;
}
