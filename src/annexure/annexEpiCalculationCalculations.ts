export type EpiCalculationEnergyRow = {
  month: string;
  existing_energy_consumption: string;
  existing_onoff_site: string;
  existing_on_site_renewable: string;
  existing_off_site_renewable: string;
  existing_total_consumption: string;
  existing_renewable_wheeling: string;
};

export type EpiCalculationLimitRow = {
  bpo: string;
  mandatory: string;
  cp4: string;
  cp6: string;
  cp10: string;
  cp14: string;
};

export type EpiCalculationClimateZone = "composition" | "hot_dry" | "warm_humid" | "temperate";

export type EpiCalculationState = {
  total_built_up_area: string;
  total_air_cond: string;
  percentage_air_cond: string;
  op_hr: string;
  day_hr: string;
  cli_zone: string;
  energyRows: EpiCalculationEnergyRow[];
  total_existing_energy_consumption: string;
  existing_total_onoffsite: string;
  existing_total_onsite_renewable: string;
  existing_total_offsite_renewable: string;
  existing_total_energy: string;
  existing_total_renewable_wheeling: string;
  percentage_existing_energy_consumption: string;
  percentage_epi_cal: string;
  epiLimits: EpiCalculationLimitRow[];
};

export const EPI_CALCULATION_DEFAULT_ENERGY_ROW: EpiCalculationEnergyRow = {
  month: "",
  existing_energy_consumption: "",
  existing_onoff_site: "",
  existing_on_site_renewable: "",
  existing_off_site_renewable: "",
  existing_total_consumption: "",
  existing_renewable_wheeling: "",
};

const CLIMATE_ZONE_ORDER: EpiCalculationClimateZone[] = [
  "composition",
  "hot_dry",
  "warm_humid",
  "temperate",
];

export const CLIMATE_ZONE_LABELS: Record<EpiCalculationClimateZone, string> = {
  composition: "Composition",
  hot_dry: "Hot and Dry",
  warm_humid: "Warm Humid",
  temperate: "Temperate",
};

type D4Formula = {
  mandatory: (d4: number) => number;
  cp4: (d4: number) => number;
  cp6: (d4: number) => number;
  cp10: (d4: number) => number;
  cp14: (d4: number) => number;
};

const FORMULAS: Record<number, D4Formula> = {
  1: {
    mandatory: (d4) => 0.21 * d4 + 28,
    cp4: (d4) => 0.18 * d4 + 24,
    cp6: (d4) => 0.15 * d4 + 20,
    cp10: (d4) => 0.12 * d4 + 16,
    cp14: (d4) => 0.09 * d4 + 12,
  },
  2: {
    mandatory: (d4) => 0.1 * d4 + 24,
    cp4: (d4) => 0.08 * d4 + 20,
    cp6: (d4) => 0.06 * d4 + 16,
    cp10: (d4) => 0.04 * d4 + 12,
    cp14: (d4) => 0.02 * d4 + 8,
  },
  3: {
    mandatory: (d4) => 0.17 * d4 + 36,
    cp4: (d4) => 0.14 * d4 + 32,
    cp6: (d4) => 0.11 * d4 + 28,
    cp10: (d4) => 0.08 * d4 + 24,
    cp14: (d4) => 0.05 * d4 + 20,
  },
  4: {
    mandatory: (d4) => 0.13 * d4 + 31,
    cp4: (d4) => 0.11 * d4 + 27,
    cp6: (d4) => 0.09 * d4 + 23,
    cp10: (d4) => 0.07 * d4 + 19,
    cp14: (d4) => 0.05 * d4 + 15,
  },
};

function n(v: string | undefined): number {
  const x = parseFloat(v ?? "");
  return Number.isFinite(x) ? x : 0;
}

function fmt2(v: number): string {
  return v.toFixed(2);
}

function emptyEpiLimits(): EpiCalculationLimitRow[] {
  return CLIMATE_ZONE_ORDER.map((zone) => ({
    bpo: CLIMATE_ZONE_LABELS[zone],
    mandatory: "",
    cp4: "",
    cp6: "",
    cp10: "",
    cp14: "",
  }));
}

export function createDefaultEpiCalculationState(energyCount = 5): EpiCalculationState {
  return {
    total_built_up_area: "",
    total_air_cond: "",
    percentage_air_cond: "",
    op_hr: "",
    day_hr: "",
    cli_zone: "",
    energyRows: Array.from({ length: energyCount }, () => ({ ...EPI_CALCULATION_DEFAULT_ENERGY_ROW })),
    total_existing_energy_consumption: "",
    existing_total_onoffsite: "",
    existing_total_onsite_renewable: "",
    existing_total_offsite_renewable: "",
    existing_total_energy: "",
    existing_total_renewable_wheeling: "",
    percentage_existing_energy_consumption: "",
    percentage_epi_cal: "",
    epiLimits: emptyEpiLimits(),
  };
}

function calcEpiLimits(d4: number): EpiCalculationLimitRow[] {
  return CLIMATE_ZONE_ORDER.map((zone, index) => {
    const formula = FORMULAS[index + 1];
    return {
      bpo: CLIMATE_ZONE_LABELS[zone],
      mandatory: fmt2(formula.mandatory(d4)),
      cp4: fmt2(formula.cp4(d4)),
      cp6: fmt2(formula.cp6(d4)),
      cp10: fmt2(formula.cp10(d4)),
      cp14: fmt2(formula.cp14(d4)),
    };
  });
}

export function climateZoneRowIndex(zone: string): number {
  const idx = CLIMATE_ZONE_ORDER.indexOf(zone as EpiCalculationClimateZone);
  return idx >= 0 ? idx : -1;
}

export function computeEpiCalculationState(state: EpiCalculationState): EpiCalculationState {
  const area1 = n(state.total_built_up_area);
  const area2 = n(state.total_air_cond);
  const opHr = n(state.op_hr);
  const dayHr = n(state.day_hr);

  const percentageAirCond = area1 > 0 ? (area2 / area1) * 100 : 0;
  const d4 = percentageAirCond;
  const epiLimits = calcEpiLimits(d4);

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

  const epiCalculation =
    area1 > 0 && totalEnergy > 0 ? (totalEnergy / area1) * 100 : 0;

  let aahEpi = "";
  if (opHr > 0 && dayHr > 0 && epiCalculation > 0) {
    aahEpi = fmt2((epiCalculation / (opHr * dayHr * 52)) * 1000);
  }

  return {
    ...state,
    percentage_air_cond: fmt2(percentageAirCond),
    epiLimits,
    energyRows,
    total_existing_energy_consumption: fmt2(totalGrid),
    existing_total_onoffsite: fmt2(totalOnoff),
    existing_total_onsite_renewable: fmt2(totalDg),
    existing_total_offsite_renewable: fmt2(totalOther),
    existing_total_energy: fmt2(totalEnergy),
    existing_total_renewable_wheeling: fmt2(totalWheeling),
    percentage_existing_energy_consumption: fmt2(epiCalculation),
    percentage_epi_cal: aahEpi,
  };
}
