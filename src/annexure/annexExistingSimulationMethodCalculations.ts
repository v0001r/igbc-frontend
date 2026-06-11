export type ExistingSimulationHvacRow = {
  lighting_type: string;
  lighting_power_hvac: string;
  lighting_power_base_hvac: string;
};

export type ExistingSimulationOutputRow = {
  existing_overall_enegry: string;
  existing_baseline_simulation: string;
  existing_baseline_90: string;
  existing_baseline_average: string;
};

export type ExistingSimulationMethodState = {
  scalars: Record<string, string>;
  hvacRows: ExistingSimulationHvacRow[];
  simulationRows: ExistingSimulationOutputRow[];
};

export const EXISTING_SIMULATION_DEFAULT_HVAC_ROW: ExistingSimulationHvacRow = {
  lighting_type: "",
  lighting_power_hvac: "",
  lighting_power_base_hvac: "",
};

export const EXISTING_SIMULATION_DEFAULT_OUTPUT_ROW: ExistingSimulationOutputRow = {
  existing_overall_enegry: "",
  existing_baseline_simulation: "",
  existing_baseline_90: "",
  existing_baseline_average: "",
};

export const EXISTING_SIMULATION_SCALAR_DEFAULTS: Record<string, string> = {
  exterior_wall: "",
  exterior_wall_base: "",
  roof_cons: "",
  roof_cons_base: "",
  fenestration: "",
  fenestration_base: "",
  shgc_simulation: "",
  design_shgc_simulation: "",
  wwr_ratio: "",
  wwr_ratio_base: "",
  sky_ratio: "",
  sky_ratio_base: "",
  lighting_power: "",
  lighting_power_base: "",
  equipment_power: "",
  equipment_power_base: "",
  ligting_controls: "",
  ligting_controls_base: "",
  exterior_power: "",
  exterior_power_base: "",
};

function n(v: string | undefined): number {
  const x = parseFloat(v ?? "");
  return Number.isFinite(x) ? x : 0;
}

function calcPercentage(base: string, existing: string): string {
  const c = n(base);
  const d = n(existing);
  if (c === 0) return "";
  return ((c - d) / c).toFixed(4);
}

export function createDefaultExistingSimulationMethodState(
  hvacCount = 5,
  simulationCount = 5,
): ExistingSimulationMethodState {
  return {
    scalars: { ...EXISTING_SIMULATION_SCALAR_DEFAULTS },
    hvacRows: Array.from({ length: hvacCount }, () => ({ ...EXISTING_SIMULATION_DEFAULT_HVAC_ROW })),
    simulationRows: Array.from({ length: simulationCount }, () => ({
      ...EXISTING_SIMULATION_DEFAULT_OUTPUT_ROW,
    })),
  };
}

export function computeExistingSimulationMethodState(
  state: ExistingSimulationMethodState,
): ExistingSimulationMethodState {
  const simulationRows = state.simulationRows.map((row) => ({
    ...row,
    existing_baseline_average: calcPercentage(
      row.existing_baseline_simulation,
      row.existing_baseline_90,
    ),
  }));

  return { ...state, simulationRows };
}
