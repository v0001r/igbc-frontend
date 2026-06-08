export type MasterMaterialRow = {
  rowId: number;
  one_materials_master: string;
  other_material_input: string;
  sub_category: string;
  other_sub_catg: string;
  quantity: string;
  unit: string;
  rates: string;
  total_rates: string;
  manufacture_details: string;
  manufacture_location: string;
  distance: string;
  total_cost_material: string;
  salvaged: string;
  salvaged_cost: string;
  reuse_material: string;
  reuse_cost: string;
  ecolablled: string;
  ecolablled_cost: string;
  recycled: string;
  recycled_cost: string;
  woodbased_material: string;
  composite_wood: string;
  woodbased_cost_rapid: string;
  alternative_material: string;
  alternative_material_cost: string;
};

export type MasterMaterialState = {
  rows: MasterMaterialRow[];
  total_material_cost: string;
  total_procured_cost: string;
  total_salvage_cost: string;
  total_resued_cost: string;
  total_ecolabled_cost: string;
  total_recycled_cost: string;
  total_renewable_cost: string;
  total_wood_cost: string;
  total_alternative_cost: string;
  local_percent: string;
  recycled_percent: string;
  ecolablled_products: string;
  ecolablled_material_percent: string;
  salvage_percent: string;
  reused_percent: string;
  wood_percent: string;
  alternate_material_percent: string;
};

function n(v: string | undefined): number {
  const x = parseFloat(String(v ?? "").trim());
  return Number.isFinite(x) ? x : 0;
}

function fmt2(v: number): string {
  return v.toFixed(2);
}

function isYes(v: string): boolean {
  return v.trim().toLowerCase() === "yes";
}

export function computeMasterMaterialRow(
  row: MasterMaterialRow,
  localDistanceMaxKm: number,
): MasterMaterialRow {
  const quantity = n(row.quantity);
  const rate = n(row.rates);
  const totalRates = quantity * rate;

  const distanceRaw = row.distance.trim();
  const distance = n(distanceRaw);
  const isLocal =
    distanceRaw !== "" && distance <= localDistanceMaxKm && distance >= 0;

  const reusePct = n(row.reuse_material);
  const recycledPct = n(row.recycled);
  const woodPct = n(row.woodbased_material);
  const compositePct = n(row.composite_wood);
  const woodSum = woodPct + compositePct;
  const renewableCost =
    woodSum <= 100 ? (totalRates * woodSum) / 100 : n(row.woodbased_cost_rapid);

  return {
    ...row,
    total_rates: fmt2(totalRates),
    total_cost_material: isLocal ? fmt2(totalRates) : "0.00",
    salvaged_cost: isYes(row.salvaged) ? fmt2(totalRates) : "0.00",
    reuse_cost: fmt2((totalRates * reusePct) / 100),
    ecolablled_cost: isYes(row.ecolablled) ? fmt2(totalRates) : "0.00",
    recycled_cost: fmt2((totalRates * recycledPct) / 100),
    woodbased_cost_rapid: fmt2(renewableCost),
    alternative_material_cost: isYes(row.alternative_material) ? fmt2(totalRates) : "0.00",
  };
}

export function computeMasterMaterialState(
  state: MasterMaterialState,
  localDistanceMaxKm: number,
): MasterMaterialState {
  const rows = state.rows.map((r) => computeMasterMaterialRow(r, localDistanceMaxKm));

  let totalMaterial = 0;
  let totalProcured = 0;
  let totalSalvage = 0;
  let totalReuse = 0;
  let totalEcolabelled = 0;
  let totalRecycled = 0;
  let totalRenewable = 0;
  let totalWood = 0;
  let totalAlternative = 0;
  let ecolabelledCount = 0;

  for (const r of rows) {
    totalMaterial += n(r.total_rates);
    totalProcured += n(r.total_cost_material);
    totalSalvage += n(r.salvaged_cost);
    totalReuse += n(r.reuse_cost);
    totalEcolabelled += n(r.ecolablled_cost);
    totalRecycled += n(r.recycled_cost);
    totalRenewable += n(r.woodbased_cost_rapid);
    totalAlternative += n(r.alternative_material_cost);
    if (r.one_materials_master === "wood") totalWood += n(r.total_rates);
    if (isYes(r.ecolablled)) ecolabelledCount += 1;
  }

  const total = totalMaterial;
  const pct = (part: number) => (total > 0 ? (part / total) * 100 : 0);
  const woodPct = totalWood > 0 ? (totalRenewable / totalWood) * 100 : 0;

  return {
    rows,
    total_material_cost: fmt2(totalMaterial),
    total_procured_cost: fmt2(totalProcured),
    total_salvage_cost: fmt2(totalSalvage),
    total_resued_cost: fmt2(totalReuse),
    total_ecolabled_cost: fmt2(totalEcolabelled),
    total_recycled_cost: fmt2(totalRecycled),
    total_renewable_cost: fmt2(totalRenewable),
    total_wood_cost: fmt2(totalWood),
    total_alternative_cost: fmt2(totalAlternative),
    local_percent: fmt2(pct(totalProcured)),
    recycled_percent: fmt2(pct(totalRecycled)),
    ecolablled_products: String(ecolabelledCount),
    ecolablled_material_percent: fmt2(pct(totalEcolabelled)),
    salvage_percent: fmt2(pct(totalSalvage)),
    reused_percent: fmt2(pct(totalReuse)),
    wood_percent: fmt2(woodPct),
    alternate_material_percent: fmt2(pct(totalAlternative)),
  };
}

export function emptyMasterMaterialRow(rowId: number): MasterMaterialRow {
  return {
    rowId,
    one_materials_master: "",
    other_material_input: "",
    sub_category: "",
    other_sub_catg: "",
    quantity: "",
    unit: "",
    rates: "",
    total_rates: "0.00",
    manufacture_details: "",
    manufacture_location: "",
    distance: "",
    total_cost_material: "0.00",
    salvaged: "",
    salvaged_cost: "0.00",
    reuse_material: "",
    reuse_cost: "0.00",
    ecolablled: "",
    ecolablled_cost: "0.00",
    recycled: "",
    recycled_cost: "0.00",
    woodbased_material: "",
    composite_wood: "",
    woodbased_cost_rapid: "0.00",
    alternative_material: "",
    alternative_material_cost: "0.00",
  };
}
