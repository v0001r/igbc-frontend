export type AreaDescriptionDef = {
  label: string;
  outdoor_air_rate: number | null;
  area_outdoor_rate: number;
};

export type ExistingSingleZoneRow = {
  zone: string;
  areaDescription: string;
  outdoorAirflowRate: string;
  zonePopulation: string;
  outdoorFlowRateArea: string;
  totalArea: string;
  breathingZoneOutdoor: string;
  zoneAirDistribution: string;
  zoneOutdoorAirFlow: string;
  outdoorAirIntakeFlow: string;
  minimumAirFresh: string;
  minimumAirFreshOver: string;
  flowOutdoorAirIntake: string;
  increaseOverStandard: string;
};

export type ExistingSingleZoneState = {
  rows: ExistingSingleZoneRow[];
};

export const EXISTING_SINGLE_ZONE_DEFAULT_ROW: ExistingSingleZoneRow = {
  zone: "",
  areaDescription: "",
  outdoorAirflowRate: "",
  zonePopulation: "",
  outdoorFlowRateArea: "",
  totalArea: "",
  breathingZoneOutdoor: "",
  zoneAirDistribution: "1",
  zoneOutdoorAirFlow: "",
  outdoorAirIntakeFlow: "",
  minimumAirFresh: "",
  minimumAirFreshOver: "",
  flowOutdoorAirIntake: "",
  increaseOverStandard: "",
};

function n(v: string | undefined): number {
  const x = parseFloat(String(v ?? "").trim());
  return Number.isFinite(x) ? x : 0;
}

function fmt2(v: number): string {
  return v.toFixed(2);
}

export function occupancySlug(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "_");
}

export function createDefaultExistingSingleZoneState(rowCount = 5): ExistingSingleZoneState {
  return {
    rows: Array.from({ length: rowCount }, () => ({
      ...EXISTING_SINGLE_ZONE_DEFAULT_ROW,
      zoneAirDistribution: "1",
    })),
  };
}

export function applyAreaDescription(
  row: ExistingSingleZoneRow,
  areaDescriptions: Record<string, AreaDescriptionDef>,
): ExistingSingleZoneRow {
  if (!row.areaDescription) {
    return {
      ...row,
      outdoorAirflowRate: "",
      outdoorFlowRateArea: "",
    };
  }
  const def = areaDescriptions[row.areaDescription];
  if (!def) return row;
  return {
    ...row,
    outdoorAirflowRate: def.outdoor_air_rate != null ? String(def.outdoor_air_rate) : "",
    outdoorFlowRateArea: String(def.area_outdoor_rate),
  };
}

export function computeExistingSingleZoneRow(
  row: ExistingSingleZoneRow,
  areaDescriptions: Record<string, AreaDescriptionDef>,
): ExistingSingleZoneRow {
  const withRates = applyAreaDescription(row, areaDescriptions);

  const rp = n(withRates.outdoorAirflowRate);
  const ra = n(withRates.outdoorFlowRateArea);
  const pz = n(withRates.zonePopulation);
  const az = n(withRates.totalArea);
  const ez = n(withRates.zoneAirDistribution) || 1;
  const designIntake = n(withRates.flowOutdoorAirIntake);

  const breathingZone = pz * rp + ra * az;
  const roundedBreathing = Math.round(breathingZone);
  const airFlow = ez > 0 ? roundedBreathing / ez : 0;

  const minimumFresh = airFlow * 1.2;
  const minimumFreshOver = airFlow * 1.3;

  const increaseOverStandard =
    designIntake > 0 ? ((designIntake - airFlow) / designIntake) * 100 : 0;

  return {
    ...withRates,
    zoneAirDistribution: withRates.zoneAirDistribution || "1",
    breathingZoneOutdoor: roundedBreathing > 0 ? String(roundedBreathing) : "",
    zoneOutdoorAirFlow: airFlow > 0 ? fmt2(airFlow) : "",
    outdoorAirIntakeFlow: airFlow > 0 ? fmt2(airFlow) : "",
    minimumAirFresh: airFlow > 0 ? fmt2(minimumFresh) : "",
    minimumAirFreshOver: airFlow > 0 ? fmt2(minimumFreshOver) : "",
    increaseOverStandard: designIntake > 0 ? fmt2(increaseOverStandard) : "",
  };
}

export function computeExistingSingleZoneState(
  state: ExistingSingleZoneState,
  areaDescriptions: Record<string, AreaDescriptionDef>,
): ExistingSingleZoneState {
  return {
    ...state,
    rows: state.rows.map((row) => computeExistingSingleZoneRow(row, areaDescriptions)),
  };
}
