import {
  computeExistingSimulationMethodState,
  createDefaultExistingSimulationMethodState,
  EXISTING_SIMULATION_SCALAR_DEFAULTS,
  type ExistingSimulationMethodState,
} from "@/annexure/annexExistingSimulationMethodCalculations";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { CertificationFormResponse } from "@/lib/certificationForm";

const SCALAR_PARAMS = Object.keys(EXISTING_SIMULATION_SCALAR_DEFAULTS);

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

export function hydrateExistingSimulationMethodAnnex(
  schema: AnnexureSchemaDefinition,
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
): ExistingSimulationMethodState {
  const layout = schema.existingSimulationMethodLayout ?? {};
  const minHvac = layout.minHvacRows ?? 5;
  const minSimulation = layout.minSimulationRows ?? 5;
  const draft = createDefaultExistingSimulationMethodState(minHvac, minSimulation);

  for (const param of SCALAR_PARAMS) {
    draft.scalars[param] = parseScalar(getParam(form, tab, subtab, param));
  }

  const lightingTypes = parseArray(getParam(form, tab, subtab, "lighting_type"));
  const hvacBase = parseArray(getParam(form, tab, subtab, "lighting_power_hvac"));
  const hvacExisting = parseArray(getParam(form, tab, subtab, "lighting_power_base_hvac"));
  const hvacCount = Math.max(minHvac, lightingTypes.length, hvacBase.length, hvacExisting.length);
  draft.hvacRows = Array.from({ length: hvacCount }, (_, i) => ({
    lighting_type: lightingTypes[i] ?? "",
    lighting_power_hvac: hvacBase[i] ?? "",
    lighting_power_base_hvac: hvacExisting[i] ?? "",
  }));

  const endUses = parseArray(getParam(form, tab, subtab, "existing_overall_enegry"));
  const baseCase = parseArray(getParam(form, tab, subtab, "existing_baseline_simulation"));
  const existingCase = parseArray(getParam(form, tab, subtab, "existing_baseline_90"));
  const simCount = Math.max(minSimulation, endUses.length, baseCase.length, existingCase.length);
  draft.simulationRows = Array.from({ length: simCount }, (_, i) => ({
    existing_overall_enegry: endUses[i] ?? "",
    existing_baseline_simulation: baseCase[i] ?? "",
    existing_baseline_90: existingCase[i] ?? "",
    existing_baseline_average: "",
  }));

  return computeExistingSimulationMethodState(draft);
}

export function buildSavePayloadFromExistingSimulationMethod(
  state: ExistingSimulationMethodState,
): { paramName: string; type: string; value: string }[] {
  const computed = computeExistingSimulationMethodState(state);
  const fields: { paramName: string; type: string; value: string }[] = SCALAR_PARAMS.map(
    (paramName) => ({
      paramName,
      type: "t",
      value: saveScalar(computed.scalars[paramName] ?? ""),
    }),
  );

  fields.push(
    {
      paramName: "lighting_type",
      type: "t",
      value: saveArray(computed.hvacRows.map((r) => r.lighting_type)),
    },
    {
      paramName: "lighting_power_hvac",
      type: "t",
      value: saveArray(computed.hvacRows.map((r) => r.lighting_power_hvac)),
    },
    {
      paramName: "lighting_power_base_hvac",
      type: "t",
      value: saveArray(computed.hvacRows.map((r) => r.lighting_power_base_hvac)),
    },
    {
      paramName: "existing_overall_enegry",
      type: "t",
      value: saveArray(computed.simulationRows.map((r) => r.existing_overall_enegry)),
    },
    {
      paramName: "existing_baseline_simulation",
      type: "t",
      value: saveArray(computed.simulationRows.map((r) => r.existing_baseline_simulation)),
    },
    {
      paramName: "existing_baseline_90",
      type: "t",
      value: saveArray(computed.simulationRows.map((r) => r.existing_baseline_90)),
    },
    {
      paramName: "existing_baseline_average",
      type: "t",
      value: saveArray(computed.simulationRows.map((r) => r.existing_baseline_average)),
    },
  );

  return fields;
}
