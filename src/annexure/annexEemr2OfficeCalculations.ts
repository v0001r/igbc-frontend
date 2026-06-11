export type Eemr2OfficeFloorRow = {
  floor_no: string;
  opera_hr: string;
  days_op_hr: string;
  area_sqm: string;
  cond_area: string;
  percentage_air_cond: string;
};

export type Eemr2OfficeEnergyRow = {
  month: string;
  existing_energy_consumption: string;
  existing_onoff_site: string;
  existing_on_site_renewable: string;
  existing_off_site_renewable: string;
  existing_total_consumption: string;
  existing_renewable_wheeling: string;
};

export type Eemr2OfficeEpiLimitRow = {
  bpo: string;
  mandatory: string;
  cp4: string;
  cp6: string;
  cp10: string;
  cp14: string;
};

export type Eemr2OfficeEpiTableKey =
  | "uniform_composite"
  | "uniform_warm_humid"
  | "uniform_hot_dry"
  | "non_uniform_composite"
  | "non_uniform_warm_humid"
  | "non_uniform_hot_dry";

export type Eemr2OfficeState = {
  total_built_up_area_annexone: string;
  total_air_cond_annexone: string;
  percentage_air_condition_annexone: string;
  op_hr_annexone: string;
  floors: Eemr2OfficeFloorRow[];
  percentage_ac_area: string;
  correction_factor: string;
  cli_zone_annexone: string;
  office_space_type: string;
  cli_zone_annexone_value: string;
  energyRows: Eemr2OfficeEnergyRow[];
  total_existing_energy_consumption_annexone: string;
  existing_total_onoffsite_annexone: string;
  existing_total_onsite_renewable_annexone: string;
  existing_total_offsite_renewable_annexone: string;
  existing_total_energy_annexone: string;
  existing_total_renewable_wheeling_annexone: string;
  percentage_existing_energy_consumption_annexone: string;
  non_uniform_air_conditioned: string;
  epiLimits: Record<Eemr2OfficeEpiTableKey, Eemr2OfficeEpiLimitRow[]>;
};

export const EEMR2_OFFICE_DEFAULT_FLOOR_ROW: Eemr2OfficeFloorRow = {
  floor_no: "",
  opera_hr: "",
  days_op_hr: "",
  area_sqm: "",
  cond_area: "",
  percentage_air_cond: "",
};

export const EEMR2_OFFICE_DEFAULT_ENERGY_ROW: Eemr2OfficeEnergyRow = {
  month: "",
  existing_energy_consumption: "",
  existing_onoff_site: "",
  existing_on_site_renewable: "",
  existing_off_site_renewable: "",
  existing_total_consumption: "",
  existing_renewable_wheeling: "",
};

const OFFICE_TYPE_LABELS: Record<string, string> = {
  large: "Large",
  middle: "Medium",
  small: "Small",
};

const TABLE_FORMULA_MAP: Record<Eemr2OfficeEpiTableKey, number[]> = {
  uniform_composite: [1, 2, 3],
  uniform_warm_humid: [4, 5, 6],
  uniform_hot_dry: [7, 8, 9],
  non_uniform_composite: [10, 11, 12],
  non_uniform_warm_humid: [13, 14, 15],
  non_uniform_hot_dry: [16, 17, 18],
};

const OFFICE_TYPE_ORDER = ["large", "middle", "small"] as const;

type D4Formula = {
  mandatory: (d4: number) => number;
  cp4: (d4: number) => number;
  cp6: (d4: number) => number;
  cp10: (d4: number) => number;
  cp14: (d4: number) => number;
};

type UniformD4Formula = {
  mandatory_uniform: (d4: number) => number;
  cp4_uniform: (d4: number) => number;
  cp6_uniform: (d4: number) => number;
  cp10_uniform: (d4: number) => number;
  cp14_uniform: (d4: number) => number;
};

type NonUniformFormula = {
  mandatory_uniform: (e12: number, e13: number) => number;
  cp4_uniform: (e12: number, e13: number) => number;
  cp6_uniform: (e12: number, e13: number) => number;
  cp10_uniform: (e12: number, e13: number) => number;
  cp14_uniform: (e12: number, e13: number) => number;
};

const FORMULAS: Record<number, D4Formula | UniformD4Formula | NonUniformFormula> = {
  1: {
    mandatory: (d4) => 0.95 * d4 + 60,
    cp4: (d4) => 0.9 * d4 + 50,
    cp6: (d4) => 0.85 * d4 + 40,
    cp10: (d4) => 0.8 * d4 + 30,
    cp14: (d4) => 0.75 * d4 + 20,
  },
  2: {
    mandatory: (d4) => 1.1 * d4 + 60,
    cp4: (d4) => 1.05 * d4 + 50,
    cp6: (d4) => 1 * d4 + 40,
    cp10: (d4) => 0.95 * d4 + 30,
    cp14: (d4) => 0.9 * d4 + 20,
  },
  3: {
    mandatory: (d4) => 0.65 * d4 + 60,
    cp4: (d4) => 0.6 * d4 + 50,
    cp6: (d4) => 0.55 * d4 + 40,
    cp10: (d4) => 0.5 * d4 + 30,
    cp14: (d4) => 0.45 * d4 + 20,
  },
  4: {
    mandatory_uniform: (d4) => 0.9 * d4 + 65,
    cp4_uniform: (d4) => 0.85 * d4 + 55,
    cp6_uniform: (d4) => 0.8 * d4 + 45,
    cp10_uniform: (d4) => 0.75 * d4 + 35,
    cp14_uniform: (d4) => 0.7 * d4 + 25,
  },
  5: {
    mandatory_uniform: (d4) => 0.9 * d4 + 65,
    cp4_uniform: (d4) => 0.85 * d4 + 55,
    cp6_uniform: (d4) => 0.8 * d4 + 45,
    cp10_uniform: (d4) => 0.75 * d4 + 35,
    cp14_uniform: (d4) => 0.7 * d4 + 25,
  },
  6: {
    mandatory_uniform: (d4) => 0.7 * d4 + 65,
    cp4_uniform: (d4) => 0.65 * d4 + 55,
    cp6_uniform: (d4) => 0.6 * d4 + 45,
    cp10_uniform: (d4) => 0.55 * d4 + 35,
    cp14_uniform: (d4) => 0.5 * d4 + 25,
  },
  7: {
    mandatory_uniform: (d4) => 1.1 * d4 + 55,
    cp4_uniform: (d4) => 1.05 * d4 + 45,
    cp6_uniform: (d4) => 1 * d4 + 35,
    cp10_uniform: (d4) => 0.95 * d4 + 25,
    cp14_uniform: (d4) => 0.9 * d4 + 15,
  },
  8: {
    mandatory_uniform: (d4) => 1.25 * d4 + 55,
    cp4_uniform: (d4) => 1.2 * d4 + 45,
    cp6_uniform: (d4) => 1.15 * d4 + 35,
    cp10_uniform: (d4) => 1.1 * d4 + 25,
    cp14_uniform: (d4) => 1.05 * d4 + 15,
  },
  9: {
    mandatory_uniform: (d4) => 0.75 * d4 + 55,
    cp4_uniform: (d4) => 0.7 * d4 + 45,
    cp6_uniform: (d4) => 0.65 * d4 + 35,
    cp10_uniform: (d4) => 0.6 * d4 + 25,
    cp14_uniform: (d4) => 0.55 * d4 + 15,
  },
  10: {
    mandatory_uniform: (e12, e13) => (0.95 * e12 + 60) * e13,
    cp4_uniform: (e12, e13) => (0.9 * e12 + 50) * e13,
    cp6_uniform: (e12, e13) => (0.85 * e12 + 40) * e13,
    cp10_uniform: (e12, e13) => (0.8 * e12 + 30) * e13,
    cp14_uniform: (e12, e13) => (0.75 * e12 + 20) * e13,
  },
  11: {
    mandatory_uniform: (e12, e13) => (1.1 * e12 + 60) * e13,
    cp4_uniform: (e12, e13) => (1.05 * e12 + 50) * e13,
    cp6_uniform: (e12, e13) => (1 * e12 + 40) * e13,
    cp10_uniform: (e12, e13) => (0.95 * e12 + 30) * e13,
    cp14_uniform: (e12, e13) => (0.9 * e12 + 20) * e13,
  },
  12: {
    mandatory_uniform: (e12, e13) => (0.65 * e12 + 60) * e13,
    cp4_uniform: (e12, e13) => (0.6 * e12 + 50) * e13,
    cp6_uniform: (e12, e13) => (0.55 * e12 + 40) * e13,
    cp10_uniform: (e12, e13) => (0.5 * e12 + 30) * e13,
    cp14_uniform: (e12, e13) => (0.45 * e12 + 20) * e13,
  },
  13: {
    mandatory_uniform: (e12, e13) => (0.95 * e12 + 65) * e13,
    cp4_uniform: (e12, e13) => (0.85 * e12 + 55) * e13,
    cp6_uniform: (e12, e13) => (0.8 * e12 + 45) * e13,
    cp10_uniform: (e12, e13) => (0.75 * e12 + 35) * e13,
    cp14_uniform: (e12, e13) => (0.7 * e12 + 25) * e13,
  },
  14: {
    mandatory_uniform: (e12, e13) => (0.9 * e12 + 65) * e13,
    cp4_uniform: (e12, e13) => (0.85 * e12 + 55) * e13,
    cp6_uniform: (e12, e13) => (0.8 * e12 + 45) * e13,
    cp10_uniform: (e12, e13) => (0.75 * e12 + 35) * e13,
    cp14_uniform: (e12, e13) => (0.7 * e12 + 25) * e13,
  },
  15: {
    mandatory_uniform: (e12, e13) => (0.7 * e12 + 65) * e13,
    cp4_uniform: (e12, e13) => (0.65 * e12 + 55) * e13,
    cp6_uniform: (e12, e13) => (0.6 * e12 + 45) * e13,
    cp10_uniform: (e12, e13) => (0.55 * e12 + 35) * e13,
    cp14_uniform: (e12, e13) => (0.5 * e12 + 25) * e13,
  },
  16: {
    mandatory_uniform: (e12, e13) => (1.1 * e12 + 55) * e13,
    cp4_uniform: (e12, e13) => (1.05 * e12 + 45) * e13,
    cp6_uniform: (e12, e13) => (1 * e12 + 35) * e13,
    cp10_uniform: (e12, e13) => (0.95 * e12 + 25) * e13,
    cp14_uniform: (e12, e13) => (0.9 * e12 + 15) * e13,
  },
  17: {
    mandatory_uniform: (e12) => 1.25 * e12 + 55,
    cp4_uniform: (e12, e13) => (1.2 * e12 + 45) * e13,
    cp6_uniform: (e12, e13) => (1.15 * e12 + 35) * e13,
    cp10_uniform: (e12, e13) => (1.1 * e12 + 25) * e13,
    cp14_uniform: (e12, e13) => (1.05 * e12 + 15) * e13,
  },
  18: {
    mandatory_uniform: (e12, e13) => (0.75 * e12 + 55) * e13,
    cp4_uniform: (e12, e13) => (0.7 * e12 + 45) * e13,
    cp6_uniform: (e12, e13) => (0.65 * e12 + 35) * e13,
    cp10_uniform: (e12, e13) => (0.6 * e12 + 25) * e13,
    cp14_uniform: (e12, e13) => (0.55 * e12 + 15) * e13,
  },
};

function n(v: string | undefined): number {
  const x = parseFloat(v ?? "");
  return Number.isFinite(x) ? x : 0;
}

function fmt2(v: number): string {
  return v.toFixed(2);
}

function emptyEpiRows(): Eemr2OfficeEpiLimitRow[] {
  return OFFICE_TYPE_ORDER.map((type) => ({
    bpo: OFFICE_TYPE_LABELS[type],
    mandatory: "",
    cp4: "",
    cp6: "",
    cp10: "",
    cp14: "",
  }));
}

export function createDefaultEemr2OfficeState(
  floorCount = 5,
  energyCount = 5,
): Eemr2OfficeState {
  return {
    total_built_up_area_annexone: "",
    total_air_cond_annexone: "",
    percentage_air_condition_annexone: "",
    op_hr_annexone: "",
    floors: Array.from({ length: floorCount }, () => ({ ...EEMR2_OFFICE_DEFAULT_FLOOR_ROW })),
    percentage_ac_area: "",
    correction_factor: "",
    cli_zone_annexone: "",
    office_space_type: "",
    cli_zone_annexone_value: "",
    energyRows: Array.from({ length: energyCount }, () => ({ ...EEMR2_OFFICE_DEFAULT_ENERGY_ROW })),
    total_existing_energy_consumption_annexone: "",
    existing_total_onoffsite_annexone: "",
    existing_total_onsite_renewable_annexone: "",
    existing_total_offsite_renewable_annexone: "",
    existing_total_energy_annexone: "",
    existing_total_renewable_wheeling_annexone: "",
    percentage_existing_energy_consumption_annexone: "",
    non_uniform_air_conditioned: "",
    epiLimits: {
      uniform_composite: emptyEpiRows(),
      uniform_warm_humid: emptyEpiRows(),
      uniform_hot_dry: emptyEpiRows(),
      non_uniform_composite: emptyEpiRows(),
      non_uniform_warm_humid: emptyEpiRows(),
      non_uniform_hot_dry: emptyEpiRows(),
    },
  };
}

function calcFloorRow(row: Eemr2OfficeFloorRow): Eemr2OfficeFloorRow {
  const area = n(row.area_sqm);
  const cond = n(row.cond_area);
  const pct = area > 0 ? (cond / area) * 100 : 0;
  return { ...row, percentage_air_cond: fmt2(pct) };
}

function calcEpiRow(
  formulaIndex: number,
  officeType: (typeof OFFICE_TYPE_ORDER)[number],
  d4: number,
  e12: number,
  e13: number,
): Eemr2OfficeEpiLimitRow {
  const formula = FORMULAS[formulaIndex];
  const label = OFFICE_TYPE_LABELS[officeType];

  if (formulaIndex <= 3) {
    const f = formula as D4Formula;
    return {
      bpo: label,
      mandatory: fmt2(f.mandatory(d4)),
      cp4: fmt2(f.cp4(d4)),
      cp6: fmt2(f.cp6(d4)),
      cp10: fmt2(f.cp10(d4)),
      cp14: fmt2(f.cp14(d4)),
    };
  }

  if (formulaIndex <= 9) {
    const f = formula as UniformD4Formula;
    return {
      bpo: label,
      mandatory: fmt2(f.mandatory_uniform(d4)),
      cp4: fmt2(f.cp4_uniform(d4)),
      cp6: fmt2(f.cp6_uniform(d4)),
      cp10: fmt2(f.cp10_uniform(d4)),
      cp14: fmt2(f.cp14_uniform(d4)),
    };
  }

  const f = formula as NonUniformFormula;
  return {
    bpo: label,
    mandatory: fmt2(f.mandatory_uniform(e12, e13)),
    cp4: fmt2(f.cp4_uniform(e12, e13)),
    cp6: fmt2(f.cp6_uniform(e12, e13)),
    cp10: fmt2(f.cp10_uniform(e12, e13)),
    cp14: fmt2(f.cp14_uniform(e12, e13)),
  };
}

function calcEpiTable(
  tableKey: Eemr2OfficeEpiTableKey,
  d4: number,
  e12: number,
  e13: number,
): Eemr2OfficeEpiLimitRow[] {
  const formulaIds = TABLE_FORMULA_MAP[tableKey];
  return OFFICE_TYPE_ORDER.map((officeType, index) =>
    calcEpiRow(formulaIds[index], officeType, d4, e12, e13),
  );
}

export function computeEemr2OfficeState(state: Eemr2OfficeState): Eemr2OfficeState {
  const area1 = n(state.total_built_up_area_annexone);
  const area2 = n(state.total_air_cond_annexone);

  const percentageAirCondition = area1 > 0 ? (area2 / area1) * 100 : 0;
  const d4 = percentageAirCondition;

  const floors = state.floors.map(calcFloorRow);

  let numerator = 0;
  let denominator = 0;
  let correctionSum = 0;
  let areaSum = 0;

  for (const row of floors) {
    const e = n(row.opera_hr);
    const f = n(row.days_op_hr);
    const g = n(row.area_sqm);
    const i = n(row.percentage_air_cond);
    numerator += e * f * g * i;
    denominator += e * f * g;
    correctionSum += e * f * g;
    areaSum += g;
  }

  const weightedAverage = denominator > 0 ? numerator / denominator : 0;
  const productFactor = areaSum * 8 * 6;
  const correctionFactor = productFactor > 0 ? correctionSum / productFactor : 0;
  const e12 = weightedAverage;
  const e13 = correctionFactor;

  const epiLimits = (Object.keys(TABLE_FORMULA_MAP) as Eemr2OfficeEpiTableKey[]).reduce(
    (acc, key) => {
      acc[key] = calcEpiTable(key, d4, e12, e13);
      return acc;
    },
    {} as Record<Eemr2OfficeEpiTableKey, Eemr2OfficeEpiLimitRow[]>,
  );

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

  const uniformEpi = area1 > 0 && totalEnergy > 0 ? totalEnergy / area1 : 0;
  const nonUniformEpi = area1 > 0 && totalEnergy > 0 ? (totalEnergy / area1) * e13 : 0;

  return {
    ...state,
    floors,
    percentage_air_condition_annexone: fmt2(percentageAirCondition),
    percentage_ac_area: fmt2(weightedAverage),
    correction_factor: fmt2(correctionFactor),
    energyRows,
    total_existing_energy_consumption_annexone: fmt2(totalGrid),
    existing_total_onoffsite_annexone: fmt2(totalOnoff),
    existing_total_onsite_renewable_annexone: fmt2(totalDg),
    existing_total_offsite_renewable_annexone: fmt2(totalOther),
    existing_total_energy_annexone: fmt2(totalEnergy),
    existing_total_renewable_wheeling_annexone: fmt2(totalWheeling),
    percentage_existing_energy_consumption_annexone: fmt2(uniformEpi),
    non_uniform_air_conditioned: fmt2(nonUniformEpi),
    epiLimits,
  };
}

export const CLIMATE_ZONE_LABELS: Record<string, string> = {
  Composite: "Composite",
  hot_dry: "Hot and Dry",
  warm_humid: "Warm and Humid",
};

export function officeTypeRowIndex(officeType: string): number {
  const idx = OFFICE_TYPE_ORDER.indexOf(officeType as (typeof OFFICE_TYPE_ORDER)[number]);
  return idx >= 0 ? idx : -1;
}

export function visibleEpiTableKey(
  climateZone: string,
  uniform: boolean,
): Eemr2OfficeEpiTableKey | null {
  if (!climateZone) return null;
  if (uniform) {
    if (climateZone === "Composite") return "uniform_composite";
    if (climateZone === "warm_humid") return "uniform_warm_humid";
    if (climateZone === "hot_dry") return "uniform_hot_dry";
  } else {
    if (climateZone === "Composite") return "non_uniform_composite";
    if (climateZone === "warm_humid") return "non_uniform_warm_humid";
    if (climateZone === "hot_dry") return "non_uniform_hot_dry";
  }
  return null;
}
