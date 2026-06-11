export type UrbanHeatRoofState = {
  working_days: string;
  roof_area: string;
  exposed_ex: string;
  non_value: string;
  covered_sri: string;
  treated_roof_area: string;
  non_value_covered: string;
  covered_sri_high: string;
  treated_roof_high: string;
  non_value_vegetation: string;
  covered_vegetation: string;
  vegetation_roof: string;
  terrace_built: string;
  basement_podium: string;
  play_area_pathways: string;
  including_area: string;
  non_value_mitigation: string;
  mitigation_roof: string;
  mitigation_treated: string;
  non_value_covered_sri: string;
  mitigation_high: string;
  mitigation_tiles: string;
  non_value_roof: string;
  area_roof_vegetation: string;
  covered_tiles: string;
  roof_area_total: string;
  buil_structure: string;
  roof_net_area: string;
  area_treated_percentage: string;
};

export const URBAN_HEAT_ROOF_DEFAULTS: UrbanHeatRoofState = {
  working_days: "",
  roof_area: "",
  exposed_ex: "",
  non_value: "",
  covered_sri: "0.8",
  treated_roof_area: "",
  non_value_covered: "",
  covered_sri_high: "1",
  treated_roof_high: "",
  non_value_vegetation: "",
  covered_vegetation: "1.2",
  vegetation_roof: "",
  terrace_built: "",
  basement_podium: "",
  play_area_pathways: "",
  including_area: "",
  non_value_mitigation: "",
  mitigation_roof: "0.8",
  mitigation_treated: "",
  non_value_covered_sri: "",
  mitigation_high: "1",
  mitigation_tiles: "",
  non_value_roof: "",
  area_roof_vegetation: "1.2",
  covered_tiles: "",
  roof_area_total: "",
  buil_structure: "",
  roof_net_area: "",
  area_treated_percentage: "",
};

function n(v: string | undefined): number {
  const x = parseFloat(String(v ?? "").trim());
  return Number.isFinite(x) ? x : 0;
}

function fmt2(v: number): string {
  return v.toFixed(2);
}

export function computeUrbanHeatRoofState(state: UrbanHeatRoofState): UrbanHeatRoofState {
  const exposed_ex = n(state.working_days) - n(state.roof_area);
  const treated_roof_area = n(state.non_value) * n(state.covered_sri);
  const treated_roof_high = n(state.non_value_covered) * n(state.covered_sri_high);
  const vegetation_roof = n(state.non_value_vegetation) * n(state.covered_vegetation);
  const terrace_built = treated_roof_area + treated_roof_high + vegetation_roof;

  const including_area = n(state.basement_podium) - n(state.play_area_pathways);
  const mitigation_treated = n(state.non_value_mitigation) * n(state.mitigation_roof);
  const mitigation_tiles = n(state.non_value_covered_sri) * n(state.mitigation_high);
  const covered_tiles = n(state.non_value_roof) * n(state.area_roof_vegetation);
  const roof_area_total = mitigation_treated + mitigation_tiles + covered_tiles;

  const buil_structure = terrace_built + roof_area_total;
  const roof_net_area = exposed_ex + including_area;

  let area_treated_percentage = 0;
  if (roof_net_area > 0) {
    area_treated_percentage = (buil_structure / roof_net_area) * 100;
  }

  return {
    ...state,
    covered_sri: state.covered_sri || "0.8",
    covered_sri_high: state.covered_sri_high || "1",
    covered_vegetation: state.covered_vegetation || "1.2",
    mitigation_roof: state.mitigation_roof || "0.8",
    mitigation_high: state.mitigation_high || "1",
    area_roof_vegetation: state.area_roof_vegetation || "1.2",
    exposed_ex: fmt2(exposed_ex),
    treated_roof_area: fmt2(treated_roof_area),
    treated_roof_high: fmt2(treated_roof_high),
    vegetation_roof: fmt2(vegetation_roof),
    terrace_built: fmt2(terrace_built),
    including_area: fmt2(including_area),
    mitigation_treated: fmt2(mitigation_treated),
    mitigation_tiles: fmt2(mitigation_tiles),
    covered_tiles: fmt2(covered_tiles),
    roof_area_total: fmt2(roof_area_total),
    buil_structure: fmt2(buil_structure),
    roof_net_area: fmt2(roof_net_area),
    area_treated_percentage: fmt2(area_treated_percentage),
  };
}
