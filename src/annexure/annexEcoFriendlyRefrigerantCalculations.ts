export type RefrigerantCatalogEntry = {
  slug: string;
  label: string;
  gwp: number;
  odp: number;
  leak_rate: string;
  end_loss: string;
};

export type EquipmentLifeCatalogEntry = {
  slug: string;
  label: string;
  life: number;
};

export type EcoRefrigerantColumn = {
  refrig_type: string;
  equipment_type: string;
  cap_tons: string;
  reg_charge: string;
  reg_charge_ton: string;
  leak_rate: string;
  equipment_life: string;
  end_loss: string;
  golbal_refri: string;
  ozone_refri: string;
  life_cycle_golbal_refri: string;
  life_cycle_ozone_refri: string;
  tsac_factor: string;
  tsac_factor_cap: string;
  cap_tons2: string;
  tsac_factor_cap2: string;
  identical_units: string;
};

export type EcoRefrigerantSingleState = EcoRefrigerantColumn & {
  cal_refrigerant: string;
  cal_credit: string;
};

export type EcoRefrigerantMultiState = {
  columns: EcoRefrigerantColumn[];
  qtotal_cap_tons: string;
  tsac_factor_total: string;
  cal_refrigerant: string;
  cal_credit: string;
};

export type EcoRefrigerantAnnexState = {
  single: EcoRefrigerantSingleState;
  multi: EcoRefrigerantMultiState;
};

export const ECO_REFRIGERANT_EMPTY_COLUMN: EcoRefrigerantColumn = {
  refrig_type: "",
  equipment_type: "",
  cap_tons: "",
  reg_charge: "",
  reg_charge_ton: "",
  leak_rate: "",
  equipment_life: "",
  end_loss: "",
  golbal_refri: "",
  ozone_refri: "",
  life_cycle_golbal_refri: "",
  life_cycle_ozone_refri: "",
  tsac_factor: "",
  tsac_factor_cap: "",
  cap_tons2: "",
  tsac_factor_cap2: "",
  identical_units: "1",
};

function num(v: string | undefined): number {
  const n = parseFloat(v ?? "");
  return Number.isFinite(n) ? n : 0;
}

function fmt2(n: number): string {
  if (!Number.isFinite(n)) return "";
  return n.toFixed(2);
}

function computeLifecycle(
  rc: number,
  gwpOrOdp: number,
  leakRatePct: number,
  endLossPct: number,
  life: number,
  mode: "single" | "multi",
): number {
  if (rc <= 0 || life <= 0) return 0;
  if (mode === "single") {
    const lr = leakRatePct / 100;
    const mr = endLossPct / 100;
    return (rc * gwpOrOdp * (lr * life + mr)) / life;
  }
  return (rc * gwpOrOdp * (leakRatePct * life + endLossPct)) / life / 100;
}

export function computeEcoRefrigerantColumn(
  col: EcoRefrigerantColumn,
  mode: "single" | "multi",
): EcoRefrigerantColumn {
  const capTons = num(col.cap_tons);
  const regCharge = num(col.reg_charge);
  const rc = capTons > 0 ? regCharge / capTons : 0;
  const leakRate = num(col.leak_rate);
  const endLoss = num(col.end_loss);
  const life = num(col.equipment_life);
  const gwp = num(col.golbal_refri);
  const odp = num(col.ozone_refri);
  const identical = mode === "multi" ? Math.max(num(col.identical_units), 0) || 1 : 1;

  const lcgwp = computeLifecycle(rc, gwp, leakRate, endLoss, life, mode);
  const lcodp = computeLifecycle(rc, odp, leakRate, endLoss, life, mode);
  const tsac = lcgwp + 100000 * lcodp;
  const tsacCap = capTons * tsac * identical;

  return {
    ...col,
    cap_tons2: col.cap_tons,
    reg_charge_ton: fmt2(rc),
    life_cycle_golbal_refri: fmt2(lcgwp),
    life_cycle_ozone_refri: fmt2(lcodp),
    tsac_factor: fmt2(tsac),
    tsac_factor_cap: fmt2(tsacCap),
    tsac_factor_cap2: fmt2(tsacCap),
    identical_units: mode === "multi" ? String(identical || 1) : col.identical_units,
  };
}

export function computeEcoRefrigerantSingle(
  col: EcoRefrigerantColumn,
  threshold: number,
): EcoRefrigerantSingleState {
  const computed = computeEcoRefrigerantColumn(col, "single");
  const capTons = num(computed.cap_tons2);
  const tsacCap = num(computed.tsac_factor_cap2);
  const finalCal = capTons > 0 ? tsacCap / capTons : 100.1;
  return {
    ...computed,
    cal_refrigerant: fmt2(finalCal),
    cal_credit: finalCal > threshold ? "No" : "Yes",
  };
}

export function computeEcoRefrigerantMulti(
  state: EcoRefrigerantMultiState,
  threshold: number,
): EcoRefrigerantMultiState {
  const columns = state.columns.map((c) => computeEcoRefrigerantColumn(c, "multi"));

  let qtotal = 0;
  for (const col of columns) {
    qtotal += num(col.cap_tons) * num(col.reg_charge);
  }

  let tsacTotal = 0;
  for (const col of columns) {
    tsacTotal += num(col.tsac_factor_cap);
  }

  const calTotal = qtotal > 0 ? tsacTotal / qtotal : 100.1;

  return {
    columns,
    qtotal_cap_tons: fmt2(qtotal),
    tsac_factor_total: fmt2(tsacTotal),
    cal_refrigerant: fmt2(calTotal),
    cal_credit: calTotal > threshold ? "No" : "Yes",
  };
}

export function createEmptyMultiState(columnCount: number): EcoRefrigerantMultiState {
  const columns = Array.from({ length: columnCount }, () => ({ ...ECO_REFRIGERANT_EMPTY_COLUMN }));
  return {
    columns,
    qtotal_cap_tons: "",
    tsac_factor_total: "",
    cal_refrigerant: "",
    cal_credit: "",
  };
}
