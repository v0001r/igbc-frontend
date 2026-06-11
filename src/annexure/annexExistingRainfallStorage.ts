import {
  computeExistingRainfallState,
  emptyExistingRainfallRow,
  emptyExistingSurfaceRow,
  type ExistingRainfallState,
} from "@/annexure/annexExistingRainfallCalculations";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { CertificationFormResponse } from "@/lib/certificationForm";

const RAINFALL_ARRAY_PARAMS = [
  "years_ex",
  "ex_peak_month",
  "rainfall_ex",
  "rainy_day",
  "rainfall_oneday",
] as const;

const SURFACE_ARRAY_PARAMS = ["surface", "runoff", "area", "imprevious_area"] as const;

const SCALAR_PARAMS = [
  "location_ex",
  "average_ex",
  "average_rainfall_m",
  "ex_total_rain",
  "ex_mandatory_harvesting",
  "cap_recharge",
  "cap_recharge_reuse",
  "harvesting_existing",
  "requirment_ex",
  "ex_avg_rainfall",
  "ex_avg_rainfall_peak",
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

export function getRunoffCoefficients(schema: AnnexureSchemaDefinition): Record<string, number> {
  const fromMap = schema.lookupMaps?.runoffCoefficients;
  if (fromMap && typeof fromMap === "object") {
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(fromMap)) {
      const n = typeof v === "number" ? v : parseFloat(String(v));
      if (Number.isFinite(n)) out[k] = n;
    }
    if (Object.keys(out).length) return out;
  }
  return {};
}

export function hydrateExistingRainfallAnnex(
  schema: AnnexureSchemaDefinition,
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
): ExistingRainfallState {
  const rainfallCount = schema.existingRainfallLayout?.rainfallRowCount ?? 5;
  const surfaceCount = schema.existingRainfallLayout?.surfaceRowCount ?? 15;
  const coeffs = getRunoffCoefficients(schema);

  const rainfallSaved: Record<(typeof RAINFALL_ARRAY_PARAMS)[number], string[]> = {} as Record<
    (typeof RAINFALL_ARRAY_PARAMS)[number],
    string[]
  >;
  for (const p of RAINFALL_ARRAY_PARAMS) {
    rainfallSaved[p] = parseJsonArray(getParam(form, tab, subtab, p));
  }

  const rainfallRows = Array.from({ length: rainfallCount }, (_, i) => ({
    ...emptyExistingRainfallRow(),
    years_ex: rainfallSaved.years_ex[i] ?? "",
    ex_peak_month: rainfallSaved.ex_peak_month[i] ?? "",
    rainfall_ex: rainfallSaved.rainfall_ex[i] ?? "",
    rainy_day: rainfallSaved.rainy_day[i] ?? "",
    rainfall_oneday: rainfallSaved.rainfall_oneday[i] ?? "",
  }));

  const surfaceSaved: Record<(typeof SURFACE_ARRAY_PARAMS)[number], string[]> = {} as Record<
    (typeof SURFACE_ARRAY_PARAMS)[number],
    string[]
  >;
  for (const p of SURFACE_ARRAY_PARAMS) {
    surfaceSaved[p] = parseJsonArray(getParam(form, tab, subtab, p));
  }

  const surfaceRows = Array.from({ length: surfaceCount }, (_, i) => ({
    ...emptyExistingSurfaceRow(),
    surface: surfaceSaved.surface[i] ?? "",
    runoff: surfaceSaved.runoff[i] ?? "",
    area: surfaceSaved.area[i] ?? "",
    imprevious_area: surfaceSaved.imprevious_area[i] ?? "0.00",
  }));

  const draft: ExistingRainfallState = {
    location_ex: parseScalar(getParam(form, tab, subtab, "location_ex")),
    rainfallRows,
    average_ex: parseScalar(getParam(form, tab, subtab, "average_ex")),
    average_rainfall_m: parseScalar(getParam(form, tab, subtab, "average_rainfall_m")),
    surfaceRows,
    ex_total_rain: parseScalar(getParam(form, tab, subtab, "ex_total_rain")),
    ex_mandatory_harvesting: parseScalar(getParam(form, tab, subtab, "ex_mandatory_harvesting")),
    cap_recharge: parseScalar(getParam(form, tab, subtab, "cap_recharge")),
    cap_recharge_reuse: parseScalar(getParam(form, tab, subtab, "cap_recharge_reuse")),
    harvesting_existing: parseScalar(getParam(form, tab, subtab, "harvesting_existing")),
    requirment_ex: parseScalar(getParam(form, tab, subtab, "requirment_ex")),
    ex_avg_rainfall: parseScalar(getParam(form, tab, subtab, "ex_avg_rainfall")),
    ex_avg_rainfall_peak: parseScalar(getParam(form, tab, subtab, "ex_avg_rainfall_peak")),
  };

  return computeExistingRainfallState(draft, coeffs);
}

export function buildSavePayloadFromExistingRainfall(state: ExistingRainfallState): {
  paramName: string;
  type: string;
  value: string;
}[] {
  const fields: { paramName: string; type: string; value: string }[] = [];

  for (const param of SCALAR_PARAMS) {
    fields.push({
      paramName: param,
      type: "t",
      value: state[param],
    });
  }

  for (const param of RAINFALL_ARRAY_PARAMS) {
    fields.push({
      paramName: param,
      type: "t",
      value: JSON.stringify(state.rainfallRows.map((r) => r[param])),
    });
  }

  for (const param of SURFACE_ARRAY_PARAMS) {
    fields.push({
      paramName: param,
      type: "t",
      value: JSON.stringify(state.surfaceRows.map((r) => r[param])),
    });
  }

  return fields;
}
