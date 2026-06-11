export type EpiLimitCalculationEnergyRow = {
  month: string;
  existing_energy_consumption: string;
  existing_onoff_site: string;
  existing_on_site_renewable: string;
  existing_off_site_renewable: string;
  existing_total_consumption: string;
  existing_renewable_wheeling: string;
};

export type EpiLimitCalculationLimitRow = {
  bpo: string;
  mandatory: string;
  cp4: string;
  cp6: string;
  cp10: string;
  cp14: string;
};

export type EpiLimitCalculationClimateZone =
  | "composition"
  | "hot_dry"
  | "warm_humid"
  | "temperate";

export type EpiLimitCalculationState = {
  total_built_up_area_annexone: string;
  total_air_cond_annexone: string;
  percentage_air_cond_annexone: string;
  op_hr_annexone: string;
  cli_zone_annexone: string;
  energyRows: EpiLimitCalculationEnergyRow[];
  total_existing_energy_consumption_annexone: string;
  existing_total_onoffsite_annexone: string;
  existing_total_onsite_renewable_annexone: string;
  existing_total_offsite_renewable_annexone: string;
  existing_total_energy_annexone: string;
  existing_total_renewable_wheeling_annexone: string;
  percentage_existing_energy_consumption_annexone: string;
  epiLimits: EpiLimitCalculationLimitRow[];
};

export const EPI_LIMIT_CALCULATION_DEFAULT_ENERGY_ROW: EpiLimitCalculationEnergyRow = {
  month: "",
  existing_energy_consumption: "",
  existing_onoff_site: "",
  existing_on_site_renewable: "",
  existing_off_site_renewable: "",
  existing_total_consumption: "",
  existing_renewable_wheeling: "",
};

const CLIMATE_ZONE_ORDER: EpiLimitCalculationClimateZone[] = [
  "composition",
  "hot_dry",
  "warm_humid",
  "temperate",
];

export const EPI_LIMIT_CLIMATE_ZONE_LABELS: Record<EpiLimitCalculationClimateZone, string> = {
  composition: "Composition",
  hot_dry: "Hot and Dry",
  warm_humid: "Warm Humid",
  temperate: "Temperate",
};

const STATIC_LIMITS: Record<number, Omit<EpiLimitCalculationLimitRow, "bpo">> = {
  1: {
    mandatory: "350-300",
    cp4: "300-250",
    cp6: "250-200",
    cp10: "200-150",
    cp14: "below 150",
  },
  2: {
    mandatory: "300-250",
    cp4: "250-200",
    cp6: "200-150",
    cp10: "150-100",
    cp14: "below 100",
  },
  3: {
    mandatory: "275-250",
    cp4: "250-225",
    cp6: "225-200",
    cp10: "200-175",
    cp14: "below 175",
  },
  4: {
    mandatory: "450-400",
    cp4: "400-350",
    cp6: "350-300",
    cp10: "300-250",
    cp14: "below 250",
  },
};

function n(v: string | undefined): number {
  const x = parseFloat(v ?? "");
  return Number.isFinite(x) ? x : 0;
}

function fmt2(v: number): string {
  return v.toFixed(2);
}

function buildStaticEpiLimits(): EpiLimitCalculationLimitRow[] {
  return CLIMATE_ZONE_ORDER.map((zone, index) => {
    const staticRow = STATIC_LIMITS[index + 1];
    return {
      bpo: EPI_LIMIT_CLIMATE_ZONE_LABELS[zone],
      ...staticRow,
    };
  });
}

export function createDefaultEpiLimitCalculationState(energyCount = 5): EpiLimitCalculationState {
  return {
    total_built_up_area_annexone: "",
    total_air_cond_annexone: "",
    percentage_air_cond_annexone: "",
    op_hr_annexone: "",
    cli_zone_annexone: "",
    energyRows: Array.from({ length: energyCount }, () => ({
      ...EPI_LIMIT_CALCULATION_DEFAULT_ENERGY_ROW,
    })),
    total_existing_energy_consumption_annexone: "",
    existing_total_onoffsite_annexone: "",
    existing_total_onsite_renewable_annexone: "",
    existing_total_offsite_renewable_annexone: "",
    existing_total_energy_annexone: "",
    existing_total_renewable_wheeling_annexone: "",
    percentage_existing_energy_consumption_annexone: "",
    epiLimits: buildStaticEpiLimits(),
  };
}

export function climateZoneRowIndex(zone: string): number {
  const idx = CLIMATE_ZONE_ORDER.indexOf(zone as EpiLimitCalculationClimateZone);
  return idx >= 0 ? idx : -1;
}

export function computeEpiLimitCalculationState(
  state: EpiLimitCalculationState,
): EpiLimitCalculationState {
  const area1 = n(state.total_built_up_area_annexone);
  const area2 = n(state.total_air_cond_annexone);
  const percentageAirCond = area1 > 0 ? (area2 / area1) * 100 : 0;

  let totalEnergy = 0;
  let totalGrid = 0;
  let totalOnoff = 0;
  let totalDg = 0;
  let totalOther = 0;
  let totalWheeling = 0;

  const energyRows = state.energyRows.map((row) => {
    const grid = n(row.existing_energy_consumption);
    const onoff = n(row.existing_onoff_site);
    const dg = n(row.existing_on_site_renewable);
    const other = n(row.existing_off_site_renewable);
    const wheeling = n(row.existing_renewable_wheeling);
    const rowTotal = grid + onoff + dg + other;

    totalGrid += grid;
    totalOnoff += onoff;
    totalDg += dg;
    totalOther += other;
    totalWheeling += wheeling;
    totalEnergy += rowTotal;

    return { ...row, existing_total_consumption: fmt2(rowTotal) };
  });

  const epiCalculation = area1 > 0 && totalEnergy > 0 ? totalEnergy / area1 : 0;

  return {
    ...state,
    percentage_air_cond_annexone: fmt2(percentageAirCond),
    epiLimits: buildStaticEpiLimits(),
    energyRows,
    total_existing_energy_consumption_annexone: fmt2(totalGrid),
    existing_total_onoffsite_annexone: fmt2(totalOnoff),
    existing_total_onsite_renewable_annexone: fmt2(totalDg),
    existing_total_offsite_renewable_annexone: fmt2(totalOther),
    existing_total_energy_annexone: fmt2(totalEnergy),
    existing_total_renewable_wheeling_annexone: fmt2(totalWheeling),
    percentage_existing_energy_consumption_annexone: fmt2(epiCalculation),
  };
}
