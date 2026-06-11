import {
  computeExistingSingleZoneState,
  createDefaultExistingSingleZoneState,
  type AreaDescriptionDef,
  type ExistingSingleZoneState,
} from "@/annexure/annexExistingSingleZoneCalculations";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { CertificationFormResponse } from "@/lib/certificationForm";

const ROW_PARAMS = [
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

function saveArray(values: string[]): string {
  return JSON.stringify(values);
}

export function ventilationZoneLayout(schema: AnnexureSchemaDefinition) {
  return schema.existingSingleZoneLayout ?? schema.existingOutdoorAirSystemLayout ?? {};
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
  const minRows = layout.minRows ?? 5;
  const areaDescriptions = areaDescriptionsFromSchema(schema);

  const arrays = ROW_PARAMS.map(([, param]) =>
    parseArray(getParam(form, tab, subtab, param)),
  );
  const rowCount = Math.max(minRows, ...arrays.map((a) => a.length));

  const draft = createDefaultExistingSingleZoneState(rowCount);
  draft.rows = Array.from({ length: rowCount }, (_, i) => {
    const row = { ...draft.rows[i] };
    ROW_PARAMS.forEach(([key, _param], pi) => {
      const val = arrays[pi][i] ?? "";
      if (key === "zoneAirDistribution") {
        (row as Record<string, string>)[key] = val || "1";
      } else {
        (row as Record<string, string>)[key] = val;
      }
    });
    return row;
  });

  return computeExistingSingleZoneState(draft, areaDescriptions);
}

export function buildSavePayloadFromExistingSingleZone(
  state: ExistingSingleZoneState,
  schema: AnnexureSchemaDefinition,
): { paramName: string; type: string; value: string }[] {
  const areaDescriptions = areaDescriptionsFromSchema(schema);
  const computed = computeExistingSingleZoneState(state, areaDescriptions);

  return ROW_PARAMS.map(([key, paramName]) => ({
    paramName,
    type: "t",
    value: saveArray(
      computed.rows.map((r) => {
        const v = r[key as keyof typeof r];
        if (key === "zoneAirDistribution" && !v) return "1";
        return String(v ?? "");
      }),
    ),
  }));
}
