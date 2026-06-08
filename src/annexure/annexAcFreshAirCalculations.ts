import {
  filterAreaSourceRows,
  type AreaSourceRow,
} from "@/annexure/annexConditionedSpacesCalculations";

export type { AreaSourceRow };

export type FreshAirSystemRow = {
  type_of_fresh_air_sys: string;
  air_space_baseline_capacity: string;
};

export type FreshAirAreaSubRow = {
  type_of_fresh_air: string;
};

export type FreshAirAreaRow = {
  sourceIndex: number;
  reqularly_occupied_spaces: string;
  air_space_regular_occ: string;
  air_type_of_spaces: string;
  type_of_fresh_air: string;
  air_space_baseline_lpd: string;
  air_design_occupancy: string;
  air_space_outdoor: string;
  air_space_minimum: string;
  air_space_ventilation: string;
  expanded: boolean;
  subRows: FreshAirAreaSubRow[];
};

export type SpaceTypeDef = {
  label: string;
  baseline: number;
  outdoor: number | null;
};

export type AcFreshAirState = {
  systemRows: FreshAirSystemRow[];
  areaRows: FreshAirAreaRow[];
  air_fresh_mandatory_all: string;
  meets_ventilation_project: string;
  total_meets_supplied_air: string;
  meets_occupancy: string;
  meets_regulary_area_space: string;
};

function n(v: string | undefined): number {
  const x = parseFloat(String(v ?? "").trim());
  return Number.isFinite(x) ? x : 0;
}

function fmt2(v: number): string {
  return v.toFixed(2);
}

export function buildFreshAirOptions(
  systemRows: FreshAirSystemRow[],
): { value: string; label: string; capacity: string }[] {
  const out: { value: string; label: string; capacity: string }[] = [];
  for (const row of systemRows) {
    const type = row.type_of_fresh_air_sys.trim();
    if (!type) continue;
    const capacity = row.air_space_baseline_capacity.trim();
    const label = capacity ? `${type} -  ${capacity}` : type;
    if (!out.some((o) => o.value === type)) {
      out.push({ value: type, label, capacity });
    }
  }
  return out;
}

export function computeFreshAirAreaRow(
  row: FreshAirAreaRow,
  spaceTypes: Record<string, SpaceTypeDef>,
): FreshAirAreaRow {
  const def = spaceTypes[row.air_type_of_spaces];
  const baselineLpd = def ? def.baseline : 0;
  const outdoor = def?.outdoor != null ? def.outdoor : 0;

  const designOcc = n(row.air_design_occupancy);
  const carpet = n(row.air_space_regular_occ);
  const minimum = outdoor * designOcc + baselineLpd * carpet;
  const ventilation = minimum + 0.1 * minimum;

  return {
    ...row,
    air_space_baseline_lpd: def ? fmt2(baselineLpd) : "",
    air_space_outdoor: def && def.outdoor != null ? fmt2(outdoor) : "",
    air_space_minimum: fmt2(minimum),
    air_space_ventilation: fmt2(ventilation),
  };
}

export function computeAcFreshAirState(
  state: AcFreshAirState,
  spaceTypes: Record<string, SpaceTypeDef>,
): AcFreshAirState {
  const areaRows = state.areaRows.map((r) => computeFreshAirAreaRow(r, spaceTypes));

  let mandatoryAll = 0;
  let totalOccupancy = 0;
  let totalCarpet = 0;
  for (const r of areaRows) {
    mandatoryAll += n(r.air_space_minimum);
    totalOccupancy += n(r.air_design_occupancy);
    totalCarpet += n(r.air_space_regular_occ);
  }

  let ventilationProject = 0;
  for (const r of state.systemRows) {
    ventilationProject += n(r.air_space_baseline_capacity);
  }

  const mandatory = mandatoryAll;
  const pct =
    mandatory > 0 ? ((ventilationProject - mandatory) / mandatory) * 100 : 0;

  return {
    ...state,
    areaRows,
    air_fresh_mandatory_all: fmt2(mandatory),
    meets_ventilation_project: fmt2(ventilationProject),
    total_meets_supplied_air: fmt2(pct),
    meets_occupancy: fmt2(totalOccupancy),
    meets_regulary_area_space: fmt2(totalCarpet),
  };
}

export function emptyFreshAirSystemRow(): FreshAirSystemRow {
  return { type_of_fresh_air_sys: "", air_space_baseline_capacity: "" };
}

export function emptyFreshAirAreaSubRow(): FreshAirAreaSubRow {
  return { type_of_fresh_air: "" };
}

export function mergeAreaRowsFromSource(
  sources: AreaSourceRow[],
  prev: FreshAirAreaRow[],
): FreshAirAreaRow[] {
  const filtered = filterAreaSourceRows(sources);
  const prevBySource = new Map(prev.map((r) => [r.sourceIndex, r]));
  return filtered.map((src) => {
    const existing = prevBySource.get(src.sourceIndex);
    if (existing) {
      return {
        ...existing,
        reqularly_occupied_spaces: src.reqularly_occupied_spaces,
        air_space_regular_occ: src.total_carpet_area_circulation,
      };
    }
    return {
      sourceIndex: src.sourceIndex,
      reqularly_occupied_spaces: src.reqularly_occupied_spaces,
      air_space_regular_occ: src.total_carpet_area_circulation,
      air_type_of_spaces: "",
      type_of_fresh_air: "",
      air_space_baseline_lpd: "",
      air_design_occupancy: "",
      air_space_outdoor: "",
      air_space_minimum: "0.00",
      air_space_ventilation: "0.00",
      expanded: false,
      subRows: [],
    };
  });
}
