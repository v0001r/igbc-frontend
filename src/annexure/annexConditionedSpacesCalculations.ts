export type AcSystemType =
  | "unitary_split_ac"
  | "unitary_cassette_unit"
  | "vrv_vrf"
  | "water_cooled_chiller"
  | "water_cooled_scroll_chiller"
  | "water_cooled_rotary_screw_chiller"
  | "air_cooled_chiller"
  | "air_cooled_scroll_chiller"
  | "unitary_packaged_air_conditioning"
  | "other"
  | "";

export type EfficiencyUnit =
  | "bee_star_rating"
  | "iseer"
  | "eer"
  | "ieer"
  | "cop"
  | "iplv"
  | "others"
  | "";

export type ConditionedSystemRow = {
  air_condition_sys: string;
  other_space_condition: string;
  air_qty: string;
  air_capacity: string;
  actual_efficiency_unit: string;
  actual_efficiency_value: string;
  regestration_type: string;
  regestration_gwp: string;
  baseline_unit: string;
  baseline_value: string;
  meet_credit_comp: string;
};

export type ConditionedAreaSubRow = {
  air_condition_sys_type: string;
  scope_air_condition: string;
  air_regestration_gwp: string;
};

export type ConditionedAreaRow = {
  sourceIndex: number;
  reqularly_occupied_air_spaces: string;
  air_condition_sys_type: string;
  other_area_condition: string;
  scope_air_condition: string;
  area_space_air: string;
  area_meet_credit: string;
  air_regestration_gwp: string;
  expanded: boolean;
  subRows: ConditionedAreaSubRow[];
};

export type ConditionedSpacesState = {
  systemRows: ConditionedSystemRow[];
  areaRows: ConditionedAreaRow[];
  air_total_air_conditioned_area: string;
  air_efficiently_area: string;
  air_percentage_area: string;
  air_meeting_gwp: string;
};

export type AreaSourceRow = {
  sourceIndex: number;
  reqularly_occupied_spaces: string;
  reqularly_non_occupied_spaces: string;
  air_condition_spaces: string;
  total_carpet_area_circulation: string;
};

function n(v: string | undefined): number {
  const x = parseFloat(String(v ?? "").trim());
  return Number.isFinite(x) ? x : 0;
}

function fmt2(v: number): string {
  return v.toFixed(2);
}

export function computeBaselineValue(
  sys: string,
  unit: string,
  capacity: number,
): number {
  const cap = capacity;
  if (
    (sys === "unitary_split_ac" ||
      sys === "unitary_cassette_unit" ||
      sys === "unitary_packaged_air_conditioning") &&
    unit === "bee_star_rating"
  ) {
    return 3;
  }
  if (
    (sys === "unitary_split_ac" ||
      sys === "unitary_cassette_unit" ||
      sys === "unitary_packaged_air_conditioning") &&
    (unit === "iseer" || unit === "eer")
  ) {
    return 2.8;
  }
  if (sys === "vrv_vrf" && unit === "eer") {
    if (cap < 40) return 3.28;
    if (cap < 70) return 3.26;
    return 3.02;
  }
  if (sys === "vrv_vrf" && unit === "ieer") {
    if (cap < 40) return 4.36;
    if (cap < 70) return 4.34;
    return 4.07;
  }
  if (sys === "water_cooled_chiller" && unit === "cop") {
    if (cap < 260) return 4.7;
    if (cap < 530) return 4.9;
    if (cap < 1050) return 5.4;
    if (cap < 1580) return 5.8;
    return 6.3;
  }
  if (sys === "water_cooled_scroll_chiller" && unit === "cop") {
    if (cap < 264) return 4.2;
    if (cap < 526) return 4.65;
    return 0;
  }
  if (sys === "water_cooled_rotary_screw_chiller" && unit === "cop") {
    if (cap < 264) return 4.2;
    if (cap < 526) return 4.65;
    if (cap < 1055) return 5;
    return 0;
  }
  if (sys === "air_cooled_scroll_chiller" && unit === "cop") {
    return cap < 264 ? 2.9 : 3;
  }
  if (sys === "air_cooled_chiller" && unit === "cop") {
    return cap < 260 ? 2.8 : 3;
  }
  if (sys === "water_cooled_chiller" && unit === "iplv") {
    if (cap < 260) return 5.8;
    if (cap < 530) return 5.9;
    if (cap < 1050) return 6.5;
    if (cap < 1580) return 6.8;
    return 7;
  }
  if (sys === "water_cooled_scroll_chiller" && unit === "iplv") {
    if (cap < 264) return 5;
    if (cap < 526) return 5.4;
    return 0;
  }
  if (sys === "water_cooled_rotary_screw_chiller" && unit === "iplv") {
    if (cap < 264) return 5;
    if (cap < 526) return 5.4;
    if (cap < 1055) return 5.7;
    return 0;
  }
  if (sys === "air_cooled_scroll_chiller" && unit === "iplv") {
    return cap < 264 ? 3.4 : 3.55;
  }
  if (sys === "air_cooled_chiller" && unit === "iplv") {
    return cap < 260 ? 3.5 : 3.7;
  }
  return 0;
}

export function computeSystemRow(row: ConditionedSystemRow): ConditionedSystemRow {
  const baseline = computeBaselineValue(
    row.air_condition_sys,
    row.actual_efficiency_unit,
    n(row.air_capacity),
  );
  const baselineStr = baseline > 0 ? String(baseline) : "0";
  const actual = n(row.actual_efficiency_value);
  const meet = actual >= n(baselineStr) ? "Yes" : "No";
  const gwp = row.regestration_type ? fmt2(n(row.regestration_type)) : "";
  return {
    ...row,
    baseline_unit: row.actual_efficiency_unit || row.baseline_unit,
    baseline_value: baselineStr,
    regestration_gwp: gwp,
    meet_credit_comp: meet,
  };
}

export function buildGwpMapFromSystems(rows: ConditionedSystemRow[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const r of rows) {
    const sys = r.air_condition_sys.trim();
    const gwp = n(r.regestration_gwp);
    if (sys && map[sys] === undefined) map[sys] = gwp;
  }
  return map;
}

export function buildMeetMapFromSystems(rows: ConditionedSystemRow[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const r of rows) {
    const sys = r.air_condition_sys.trim();
    if (sys && map[sys] === undefined) map[sys] = r.meet_credit_comp;
  }
  return map;
}

export type SystemOption = {
  value: string;
  label: string;
  meetCredit: string;
  capacity: string;
};

export function buildSystemOptions(rows: ConditionedSystemRow[]): SystemOption[] {
  const out: SystemOption[] = [];
  for (const r of rows) {
    const sys = r.air_condition_sys.trim();
    if (!sys) continue;
    const label = `${sys.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}-${r.air_capacity || "0"}`;
    out.push({
      value: sys,
      label,
      meetCredit: r.meet_credit_comp,
      capacity: r.air_capacity,
    });
  }
  return out;
}

export function filterAreaSourceRows(sources: AreaSourceRow[]): AreaSourceRow[] {
  return sources.filter(
    (r) =>
      r.air_condition_spaces === "air_conditioned_space" &&
      r.reqularly_non_occupied_spaces === "regularly_occupied_spaces",
  );
}

function gwpForSysType(sysType: string, gwpMap: Record<string, number>): string {
  if (!sysType || gwpMap[sysType] === undefined) return "";
  return fmt2(gwpMap[sysType]);
}

export function computeAreaRow(
  row: ConditionedAreaRow,
  gwpMap: Record<string, number>,
  meetMap: Record<string, string>,
): ConditionedAreaRow {
  const sysType = row.air_condition_sys_type.trim();
  const gwp = gwpForSysType(sysType, gwpMap);
  const meets = meetMap[sysType] === "Yes";
  const areaMeet = meets ? row.area_space_air : "0";
  const subRows = row.subRows.map((sub) => ({
    ...sub,
    air_regestration_gwp: gwpForSysType(sub.air_condition_sys_type.trim(), gwpMap),
  }));
  return {
    ...row,
    air_regestration_gwp: gwp,
    area_meet_credit: areaMeet,
    subRows,
  };
}

export function computeConditionedSpacesState(state: ConditionedSpacesState): ConditionedSpacesState {
  const systemRows = state.systemRows.map(computeSystemRow);
  const gwpMap = buildGwpMapFromSystems(systemRows);
  const meetMap = buildMeetMapFromSystems(systemRows);
  const areaRows = state.areaRows.map((r) => computeAreaRow(r, gwpMap, meetMap));

  let totalArea = 0;
  let totalEff = 0;
  for (const r of areaRows) {
    totalArea += n(r.area_space_air);
    totalEff += n(r.area_meet_credit);
  }

  let totalAreaGwp = 0;
  let sumUnder1000 = 0;
  let sumUnder1500 = 0;

  for (const r of areaRows) {
    const area = n(r.area_space_air);
    totalAreaGwp += area;
    const parentGwp = n(r.air_regestration_gwp);
    let subMeets1000 = false;
    let subMeets1500 = false;
    for (const sub of r.subRows) {
      const subGwp = n(sub.air_regestration_gwp);
      if (subGwp > 0) {
        if (subGwp < 1000) subMeets1000 = true;
        if (subGwp < 1500) subMeets1500 = true;
      }
    }
    const parentMeets1000 = parentGwp > 0 && parentGwp < 1000;
    const parentMeets1500 = parentGwp > 0 && parentGwp < 1500;
    if (parentMeets1000 || subMeets1000) sumUnder1000 += area;
    if (parentMeets1500 || subMeets1500) sumUnder1500 += area;
  }

  let air_meeting_gwp = "0";
  if (totalAreaGwp > 0) {
    if (sumUnder1000 >= 0.95 * totalAreaGwp) air_meeting_gwp = "2";
    else if (sumUnder1500 >= 0.95 * totalAreaGwp) air_meeting_gwp = "1";
  }

  const pct = totalArea > 0 ? (totalEff / totalArea) * 100 : 0;

  return {
    systemRows,
    areaRows,
    air_total_air_conditioned_area: fmt2(totalArea),
    air_efficiently_area: fmt2(totalEff),
    air_percentage_area: fmt2(pct),
    air_meeting_gwp,
  };
}

export function emptySystemRow(): ConditionedSystemRow {
  return {
    air_condition_sys: "",
    other_space_condition: "",
    air_qty: "",
    air_capacity: "",
    actual_efficiency_unit: "",
    actual_efficiency_value: "",
    regestration_type: "",
    regestration_gwp: "",
    baseline_unit: "",
    baseline_value: "0",
    meet_credit_comp: "No",
  };
}

export function emptyAreaSubRow(): ConditionedAreaSubRow {
  return { air_condition_sys_type: "", scope_air_condition: "", air_regestration_gwp: "" };
}
