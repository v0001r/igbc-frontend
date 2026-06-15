import {
  computeExistingSingleZoneState,
  createDefaultExistingSingleZoneState,
  type AreaDescriptionDef,
  type ExistingSingleZoneState,
  type VentilationZoneVariant,
} from "@/annexure/annexExistingSingleZoneCalculations";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { CertificationFormResponse } from "@/lib/certificationForm";

const EXISTING_ROW_PARAMS = [
  ["zone", "zone_area"],
  ["areaDescription", "area_description"],
  ["outdoorAirflowRate", "outdoor_airflow_rate"],
  ["zonePopulation", "zone_population"],
  ["outdoorFlowRateArea", "outdoor_flow_rate_area"],
  ["totalArea", "total_area"],
  ["breathingZoneOutdoor", "breathing_zone_outdoor"],
  ["zoneAirDistribution", "zone_air_distribution"],
  ["zoneOutdoorAirFlow", "zone_outdoor_air_flow"],
  ["outdoorAirIntakeFlow", "outdoor_air_intake_flow"],
  ["minimumAirFresh", "minimum_air_fresh"],
  ["minimumAirFreshOver", "minimum_air_fresh_over"],
  ["flowOutdoorAirIntake", "flow_outdoor_air_intake"],
  ["increaseOverStandard", "increase_over_standed"],
] as const;

const NEW_BUILDING_ROW_PARAMS = [
  ["zone", "zone_area"],
  ["areaDescription", "area_description"],
  ["outdoorAirflowRate", "outdoor_airflow_rate"],
  ["zonePopulation", "zone_population"],
  ["occupantDensity", "occupant_density"],
  ["outdoorFlowRateArea", "outdoor_flow_rate_area"],
  ["totalArea", "total_area"],
  ["breathingZoneOutdoor", "breathing_zone_outdoor"],
  ["zoneAirDistribution", "zone_air_distribution"],
  ["zoneOutdoorAirFlow", "zone_outdoor_air_flow"],
] as const;

function getParam(
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
  param: string,
): string | undefined {
  return (form.data ?? []).find((d) => d.tab === tab && d.subtab === subtab && d.paramName === param)?.value;
}

function parseArray(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    if (Array.isArray(v)) return v.map((x) => (x == null ? "" : String(x)));
  } catch {
    /* ignore */
  }
  return [];
}

function parseScalar(raw: string | undefined, fallback = ""): string {
  if (!raw?.trim()) return fallback;
  try {
    const v = JSON.parse(raw) as unknown;
    if (Array.isArray(v)) return v[0] != null ? String(v[0]) : fallback;
  } catch {
    return raw;
  }
  return raw;
}

function saveArray(values: string[]): string {
  return JSON.stringify(values);
}

export function ventilationZoneLayout(schema: AnnexureSchemaDefinition) {
  return schema.existingSingleZoneLayout ?? schema.existingOutdoorAirSystemLayout ?? {};
}

export function ventilationZoneVariant(schema: AnnexureSchemaDefinition): VentilationZoneVariant {
  return ventilationZoneLayout(schema).variant ?? "existingBuilding";
}

function rowParamsForVariant(variant: VentilationZoneVariant) {
  return variant === "newBuilding" ? NEW_BUILDING_ROW_PARAMS : EXISTING_ROW_PARAMS;
}

export function areaDescriptionsFromSchema(
  schema: AnnexureSchemaDefinition,
): Record<string, AreaDescriptionDef> {
  const raw = ventilationZoneLayout(schema).areaDescriptionOptions ?? {};
  const out: Record<string, AreaDescriptionDef> = {};
  for (const [slug, def] of Object.entries(raw)) {
    if (!slug || !def) continue;
    out[slug] = {
      label: def.label,
      outdoor_air_rate: def.outdoor_air_rate,
      area_outdoor_rate: def.area_outdoor_rate,
    };
  }
  return out;
}

export function hydrateExistingSingleZoneAnnex(
  schema: AnnexureSchemaDefinition,
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
): ExistingSingleZoneState {
  const layout = ventilationZoneLayout(schema);
  const variant = ventilationZoneVariant(schema);
  const minRows = layout.minRows ?? 5;
  const areaDescriptions = areaDescriptionsFromSchema(schema);
  const rowParams = rowParamsForVariant(variant);

  const arrays = rowParams.map(([, param]) => parseArray(getParam(form, tab, subtab, param)));
  const rowCount = Math.max(minRows, ...arrays.map((a) => a.length));

  const draft = createDefaultExistingSingleZoneState(rowCount);
  draft.rows = Array.from({ length: rowCount }, (_, i) => {
    const row = { ...draft.rows[i] };
    rowParams.forEach(([key, _param], pi) => {
      const val = arrays[pi][i] ?? "";
      if (key === "zoneAirDistribution" && variant === "existingBuilding") {
        (row as Record<string, string>)[key] = val || "1";
      } else {
        (row as Record<string, string>)[key] = val;
      }
    });
    return row;
  });

  if (variant === "newBuilding") {
    draft.totalOutdoorAirIntake = parseScalar(getParam(form, tab, subtab, "outdoor_air_intake_flow"));
  }

  return computeExistingSingleZoneState(draft, areaDescriptions, variant);
}

export function buildSavePayloadFromExistingSingleZone(
  state: ExistingSingleZoneState,
  schema: AnnexureSchemaDefinition,
): { paramName: string; type: string; value: string }[] {
  const variant = ventilationZoneVariant(schema);
  const areaDescriptions = areaDescriptionsFromSchema(schema);
  const computed = computeExistingSingleZoneState(state, areaDescriptions, variant);
  const rowParams = rowParamsForVariant(variant);

  const fields = rowParams.map(([key, paramName]) => ({
    paramName,
    type: "t",
    value: saveArray(
      computed.rows.map((r) => {
        const v = r[key as keyof typeof r];
        if (key === "zoneAirDistribution" && variant === "existingBuilding" && !v) return "1";
        return String(v ?? "");
      }),
    ),
  }));

  if (variant === "newBuilding") {
    fields.push({
      paramName: "outdoor_air_intake_flow",
      type: "t",
      value: computed.totalOutdoorAirIntake,
    });
  }

  return fields;
}
