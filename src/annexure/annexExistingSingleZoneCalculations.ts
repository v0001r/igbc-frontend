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
  occupantDensity: string;
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
  totalOutdoorAirIntake: string;
};

export type VentilationZoneVariant = "existingBuilding" | "newBuilding";

export const EXISTING_SINGLE_ZONE_DEFAULT_ROW: ExistingSingleZoneRow = {
  zone: "",
  areaDescription: "",
  outdoorAirflowRate: "",
  zonePopulation: "",
  occupantDensity: "",
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
    totalOutdoorAirIntake: "",
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
  variant: VentilationZoneVariant = "existingBuilding",
): ExistingSingleZoneRow {
  const withRates = applyAreaDescription(row, areaDescriptions);

  const rp = n(withRates.outdoorAirflowRate);
  const ra = n(withRates.outdoorFlowRateArea);
  const az = n(withRates.totalArea);
  const ez = n(withRates.zoneAirDistribution) || 1;

  const pz =
    variant === "newBuilding"
      ? (() => {
          const od = n(withRates.occupantDensity);
          return od > 0 ? az / od : 0;
        })()
      : n(withRates.zonePopulation);

  const breathingZone = pz * rp + ra * az;
  const roundedBreathing = Math.round(breathingZone);
  const airFlow = ez > 0 ? roundedBreathing / ez : 0;

  const shared = {
    ...withRates,
    zonePopulation: variant === "newBuilding" ? (pz > 0 ? fmt2(pz) : "") : withRates.zonePopulation,
    breathingZoneOutdoor: roundedBreathing > 0 ? String(roundedBreathing) : "",
    zoneOutdoorAirFlow: airFlow > 0 ? fmt2(airFlow) : "",
  };

  if (variant === "newBuilding") {
    return {
      ...shared,
      outdoorAirIntakeFlow: "",
      minimumAirFresh: "",
      minimumAirFreshOver: "",
      increaseOverStandard: "",
    };
  }

  const designIntake = n(withRates.flowOutdoorAirIntake);
  const minimumFresh = airFlow * 1.2;
  const minimumFreshOver = airFlow * 1.3;
  const increaseOverStandard =
    designIntake > 0 ? ((designIntake - airFlow) / designIntake) * 100 : 0;

  return {
    ...shared,
    zoneAirDistribution: withRates.zoneAirDistribution || "1",
    outdoorAirIntakeFlow: airFlow > 0 ? fmt2(airFlow) : "",
    minimumAirFresh: airFlow > 0 ? fmt2(minimumFresh) : "",
    minimumAirFreshOver: airFlow > 0 ? fmt2(minimumFreshOver) : "",
    increaseOverStandard: designIntake > 0 ? fmt2(increaseOverStandard) : "",
  };
}

export function computeExistingSingleZoneState(
  state: ExistingSingleZoneState,
  areaDescriptions: Record<string, AreaDescriptionDef>,
  variant: VentilationZoneVariant = "existingBuilding",
): ExistingSingleZoneState {
  const rows = state.rows.map((row) => computeExistingSingleZoneRow(row, areaDescriptions, variant));

  if (variant === "newBuilding") {
    const total = rows.reduce((sum, r) => sum + n(r.zoneOutdoorAirFlow), 0);
    return {
      rows,
      totalOutdoorAirIntake: total > 0 ? fmt2(total) : "",
    };
  }

  return { rows, totalOutdoorAirIntake: "" };
}
