import {
  computeUrbanHeatRoofState,
  URBAN_HEAT_ROOF_DEFAULTS,
  type UrbanHeatRoofState,
} from "@/annexure/annexUrbanHeatRoofCalculations";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { CertificationFormResponse } from "@/lib/certificationForm";

export const URBAN_HEAT_ROOF_PARAMS = Object.keys(URBAN_HEAT_ROOF_DEFAULTS) as (keyof UrbanHeatRoofState)[];

function getParam(
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
  param: string,
): string | undefined {
  return (form.data ?? []).find((d) => d.tab === tab && d.subtab === subtab && d.paramName === param)?.value;
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

export function hydrateUrbanHeatRoofAnnex(
  _schema: AnnexureSchemaDefinition,
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
): UrbanHeatRoofState {
  const draft = { ...URBAN_HEAT_ROOF_DEFAULTS };
  for (const param of URBAN_HEAT_ROOF_PARAMS) {
    const raw = getParam(form, tab, subtab, param);
    if (raw != null) {
      draft[param] = parseScalar(raw, URBAN_HEAT_ROOF_DEFAULTS[param]);
    }
  }
  return computeUrbanHeatRoofState(draft);
}

export function buildSavePayloadFromUrbanHeatRoof(state: UrbanHeatRoofState): {
  paramName: string;
  type: string;
  value: string;
}[] {
  const computed = computeUrbanHeatRoofState(state);
  return URBAN_HEAT_ROOF_PARAMS.map((paramName) => ({
    paramName,
    type: "t",
    value: JSON.stringify([computed[paramName]]),
  }));
}
