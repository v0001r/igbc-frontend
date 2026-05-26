/**
 * Green Homes checklist attempted-points (Laravel `__get_checklist_calculation`, `$rating == 2`).
 * Source: repo root `Calculations.php` lines ~1911–2843.
 */
import type { CertificationFormResponse } from "@/lib/certificationForm";
import { RatingDataIndex } from "@/lib/ratingDataIndex";

export type ChecklistScorer = (
  form: CertificationFormResponse,
  tabSlug: string,
  subSlug: string,
) => number;

function index(form: CertificationFormResponse): RatingDataIndex {
  return new RatingDataIndex(form);
}

function num(form: CertificationFormResponse, tab: string, subtab: string, param: string): number {
  const raw = index(form).get(tab, subtab, param);
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : NaN;
}

function numRelated(form: CertificationFormResponse, param: string, preferTab?: string): number {
  const raw = index(form).getRelated(param, preferTab);
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : NaN;
}

function isYes(form: CertificationFormResponse, tab: string, subtab: string, param: string): boolean {
  const v = index(form).get(tab, subtab, param).trim().toLowerCase();
  return v === "1" || v === "yes" || v === "true";
}

function anyYes(form: CertificationFormResponse, tab: string, subtab: string, params: string[]): boolean {
  return params.some((p) => isYes(form, tab, subtab, p));
}

/** Laravel counts rows for param names (any non-empty value). */
function countParamRows(
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
  params: string[],
): number {
  const i = index(form);
  let n = 0;
  for (const p of params) {
    if ((i.get(tab, subtab, p) ?? "").trim() !== "") n += 1;
  }
  return n;
}

function percentSavingConsumption(form: CertificationFormResponse): number {
  const i = index(form);
  const raw =
    i.get("water_conservation", "enhanced_water_efficency", "percent_saving_consumption") ||
    i.getRelated("saving_percentage", "water_conservation") ||
    i.getParamAnywhere("saving_percentage");
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : 0;
}

// --- Sustainable design ---

function scoreTopography(form: CertificationFormResponse): number {
  const tab = "sustainable_design";
  const sub = "topography";
  const caseA = isYes(form, tab, sub, "casea_vegetation");
  const caseB = isYes(form, tab, sub, "caseb_vegetation");
  if (caseA && caseB) return 4;

  if (caseA) {
    const v = num(form, tab, sub, "casea_percentage");
    if (Number.isFinite(v)) {
      if (v >= 20) return 2;
      if (v >= 15) return 1;
    }
  }
  if (caseB) {
    const v = num(form, tab, sub, "caseb_percent");
    if (Number.isFinite(v)) {
      if (v >= 40) return 4;
      if (v >= 30) return 3;
    }
  }
  return 0;
}

function scoreUrbanHeatIsland(form: CertificationFormResponse): number {
  const tab = "sustainable_design";
  const sub = "urban_heat_island";
  const roof = isYes(form, tab, sub, "heat_roof");
  const nonRoof = isYes(form, tab, sub, "heat_non_roof");
  if (roof && nonRoof) return 4;

  let total = 0;
  if (roof) {
    const v = num(form, tab, sub, "heat_island_mitigation");
    if (Number.isFinite(v)) {
      if (v >= 75) total += 2;
      else if (v >= 50) total += 1;
    }
  }
  if (nonRoof) {
    const v = num(form, tab, sub, "heat_island_mitigation_non_roof");
    if (Number.isFinite(v)) {
      if (v >= 95) total += 2;
      else if (v >= 75) total += 1;
    }
  }
  return total;
}

function scorePassiveArch(form: CertificationFormResponse): number {
  const params = ["exterior_opening", "skylights", "daylights", "cool_heat_tech"];
  const count = countParamRows(form, "sustainable_design", "passive_arch", params);
  if (count > 2) return 2;
  if (count === 2) return 1;
  return 0;
}

function scoreUniversalDesign(form: CertificationFormResponse): number {
  const params = [
    "universal_narrative",
    "parking_abled",
    "toilets_abled_units_diff",
    "site_plan",
    "ramps_toilets",
    "universal_photos",
  ];
  return anyYes(form, "sustainable_design", "universal_design", params) ? 2 : 0;
}

function scoreGreenParking(form: CertificationFormResponse): number {
  const params = [
    "green_narrative",
    "ventilation",
    "ev_provisions",
    "bycycle_parking",
    "dwelling_units",
    "parking_plans",
    "ev_sockets",
    "axcial_fans",
    "basement_parking",
    "green_photos",
    "po",
  ];
  return anyYes(form, "sustainable_design", "green_parking", params) ? 4 : 0;
}

function scoreBasicAmenities(form: CertificationFormResponse): number {
  const params = ["basic_narrative", "site_plan", "facilities_photos", "toilets_seats"];
  return anyYes(form, "sustainable_design", "basic_amenities", params) ? 2 : 0;
}

function scoreBasicFacilities(form: CertificationFormResponse): number {
  const params = ["narrative", "facilities_provided", "construction_contaract", "basic_photos"];
  return anyYes(form, "sustainable_design", "basic_facilities", params) ? 1 : 0;
}

function scoreGreenEducation(form: CertificationFormResponse): number {
  const params = ["deatil_narrative", "broucher", "photographs"];
  return anyYes(form, "sustainable_design", "green_education", params) ? 1 : 0;
}

// --- Water conservation ---

function scoreEnhancedWaterEfficiency(form: CertificationFormResponse): number {
  const percent = percentSavingConsumption(form);
  if (percent > 35) return 6;
  if (percent >= 30) return 5;
  if (percent >= 25) return 4;
  if (percent >= 20) return 3;
  if (percent >= 15) return 2;
  if (percent >= 10) return 1;
  return 0;
}

function scoreSustainableLandscape(form: CertificationFormResponse): number {
  const v = index(form)
    .get("water_conservation", "sustainable_landscape_design", "land_design_applicability")
    .toLowerCase();
  return v === "yes" ? 3 : 0;
}

function scoreIrrigationManagement(form: CertificationFormResponse): number {
  const v = index(form)
    .get("water_conservation", "management_irrigation_systems", "irrigation_system_applicablity")
    .toLowerCase();
  return v === "yes" ? 2 : 0;
}

function scoreWasteWaterTreatment(form: CertificationFormResponse): number {
  const tab = "water_conservation";
  const sub = "waste_water_treatment";
  let total = 0;
  const treat = num(form, tab, sub, "percent_waste_water");
  if (Number.isFinite(treat)) {
    if (treat >= 95) total += 2;
    else if (treat >= 50) total += 1;
  }
  const reuse = num(form, tab, sub, "percent_reuse_water");
  if (Number.isFinite(reuse)) {
    if (reuse > 50) total += 2;
    else if (reuse >= 25) total += 1;
  }
  return Math.min(total, 4);
}

function scoreWaterQuality(form: CertificationFormResponse): number {
  const params = [
    "quality_narrative",
    "quality_calculations",
    "quality_bod",
    "quality_noc",
    "quality_photos",
  ];
  return anyYes(form, "water_conservation", "water_quality", params) ? 1 : 0;
}

function scoreEnhancedRainwater(form: CertificationFormResponse): number {
  const params = [
    "enhanced_narrative",
    "enhanced_rainfall",
    "enhanced_rain_harvesting",
    "enhanced_highlights",
    "enhanced_drawings",
    "enhanced_hydrology",
    "enhanced_photos",
  ];
  return anyYes(form, "water_conservation", "emhanced_rainwater_harvesting", params) ? 4 : 0;
}

function scoreWaterMetering(form: CertificationFormResponse): number {
  const params = [
    "metering_narrative",
    "metering_sld",
    "metering_cutsheet",
    "metering_invoices",
    "metering_photos",
  ];
  return anyYes(form, "water_conservation", "water_metering", params) ? 3 : 0;
}

// --- Energy efficiency ---

const MIN_ENERGY_PARAMS = [
  "retv_calculation_template",
  "narrative_min_energy_cert",
  "retv_excel_sheet",
  "baseline_building_parameters_ecbc",
  "porposed_glazing_details_ecbc",
  "drawings_wall_roof_assembly_ecbc",
  "proposed_lighting_system_details_ecbc",
  "lpd_calculations_interior_exterior_ecbc",
  "conceptual_interior_common_ecbc",
  "air_proposed_conditioning_ecbc",
  "manufacturer_brochures_ecbc",
  "wall_roof_photographs_construction_ecbc",
  "all_releavent_materials_ecbc",
  "detailed_energy_simulation_report",
  "narrative_min_energy",
  "comparison_baseline_building_parameters",
  "glazing_details_proposed",
  "construction_details_proposed_wall_roof",
  "drawings_wall_roof_assembly",
  "proposed_lighting_system_details",
  "proposed_lpd_calculations_interior_exterior",
  "lighting_layout_interior_common_areas",
  "proposed_air_conditioning_system",
  "brochures_cut_sheets_letters",
  "wall_roof_construction",
  "invoices_releavent_materials",
];

function scoreMinimumEnergyPerformance(form: CertificationFormResponse): number {
  return anyYes(form, "energy_efficency", "minimum_energy_performance", MIN_ENERGY_PARAMS) ? 10 : 0;
}

function scoreAlternateWaterHeating(form: CertificationFormResponse): number {
  const percent = num(form, "energy_efficency", "alternate_water_heating", "hot_water_requ");
  if (!Number.isFinite(percent)) return 0;
  if (percent > 95) return 3;
  if (percent >= 75) return 2;
  if (percent >= 50) return 1;
  return 0;
}

function scoreOnSiteRenewable(form: CertificationFormResponse): number {
  const percent = num(form, "energy_efficency", "on_site_renewable_energy", "energy_percentage_renaw");
  if (!Number.isFinite(percent)) return 0;
  if (percent > 95) return 4;
  if (percent >= 75) return 3;
  if (percent >= 50) return 2;
  if (percent >= 25) return 1;
  return 0;
}

function scoreEnergyCommonArea(form: CertificationFormResponse): number {
  const params = [
    "energy_efficient_pumps",
    "energy_efficient_motors",
    "energy_efficient_elevators",
    "narrative_comman_area",
    "proposed_energy_commanarea",
    "manufacturer_cut_sheet_commanarea",
    "broucher_common_area",
    "geotagged_timestamped_commonarea",
    "tax_inovices_commonarea",
  ];
  return anyYes(form, "energy_efficency", "energy_efficiency_common_area", params) ? 1 : 0;
}

function scoreIntegratedMonitoring(form: CertificationFormResponse): number {
  const params = [
    "area_lighting",
    "area_lighting_ex",
    "manag_sys",
    "manag_sys_light",
    "narrative_monitoring",
    "single_line_drawing_monitoring",
    "manufacturer_cut_sheet_monitoring",
    "photographs_monitoring",
    "tax_inovices_monitoring",
  ];
  return anyYes(form, "energy_efficency", "integrated_energy_monitoring", params) ? 2 : 0;
}

// --- Material resources ---

function scoreGreenProcurement(form: CertificationFormResponse): number {
  const params = [
    "green_procurement_narrative",
    "green_procurement",
    "procured_green_material",
    "green_procurement_policy_tax_invoice",
  ];
  return anyYes(form, "material_resources", "green_procurement_policy", params) ? 1 : 0;
}

function scoreOptimisationStructural(form: CertificationFormResponse): number {
  const params = [
    "optimisation_structural_design_narrative",
    "structural_design_analysis_indicating_reduction_steel_cement_consumption",
    "calculations_indicating_reduction_steel_cement_consumption",
    "list_material_along_technical_cutsheets",
    "optimisation_structural_design_photographs",
  ];
  return anyYes(form, "material_resources", "optimisation_structural_design", params) ? 1 : 0;
}

function scoreEcolabelledProducts(form: CertificationFormResponse): number {
  let percent = num(
    form,
    "material_resources",
    "use_ecolabelled_products",
    "percent_ecolabelled_products_from_master_material",
  );
  if (!Number.isFinite(percent)) {
    percent = numRelated(form, "percent_ecolabelled_products_from_master_material", "material_resources");
  }
  if (!Number.isFinite(percent)) return 0;
  if (percent > 25) return 5;
  if (percent >= 20) return 4;
  if (percent >= 15) return 3;
  if (percent >= 10) return 2;
  if (percent >= 5) return 1;
  return 0;
}

function scoreLocalMaterials(form: CertificationFormResponse): number {
  let percent = num(form, "material_resources", "local_materials", "percent_local_materials");
  if (!Number.isFinite(percent)) {
    percent = numRelated(form, "local_percent", "material_resources");
  }
  if (!Number.isFinite(percent)) return 0;
  if (percent >= 75) return 2;
  if (percent >= 50) return 1;
  return 0;
}

function scoreWasteManagementConstruction(form: CertificationFormResponse): number {
  const i = index(form);
  let raw =
    i.get("material_resources", "annexure_waste_management", "percentage_waste_diverted_landfill") ||
    i.get("material_resources", "waste_management_during_construction", "percentage_waste_diverted_landfill") ||
    i.getParamAnywhere("percentage_waste_diverted_landfill");
  const percent = parseFloat(raw);
  if (!Number.isFinite(percent)) return 0;
  if (percent >= 75) return 2;
  if (percent >= 50) return 1;
  return 0;
}

function scoreEcoFriendlyWood(form: CertificationFormResponse): number {
  let percent = num(form, "material_resources", "annexure_master_material", "local_percent");
  if (!Number.isFinite(percent)) {
    percent = numRelated(form, "local_percent", "material_resources");
  }
  if (!Number.isFinite(percent)) return 0;
  if (percent >= 75) return 2;
  if (percent >= 50) return 1;
  return 0;
}

function scoreAlternateConstruction(form: CertificationFormResponse): number {
  const percent = num(
    form,
    "material_resources",
    "alternate_construction_materials",
    "percent_alternate_material_used",
  );
  if (!Number.isFinite(percent)) return 0;
  if (percent >= 10) return 2;
  if (percent >= 5) return 1;
  return 0;
}

function scoreOrganicWastePost(form: CertificationFormResponse): number {
  const percent = num(
    form,
    "material_resources",
    "organic_waste_management_post",
    "percent_of_treated_organic_waste",
  );
  if (!Number.isFinite(percent)) return 0;
  if (percent >= 95) return 3;
  if (percent >= 75) return 2;
  if (percent >= 50) return 1;
  return 0;
}

// --- Resident health & wellbeing ---

function daylightTier(v: number): number {
  if (v >= 95) return 2;
  if (v >= 75) return 1;
  return 0;
}

function scoreMinimumDaylighting(form: CertificationFormResponse): number {
  const tab = "resident_health_wellbeing";
  const sub = "minimum_daylighting_enhanced";
  const prescriptive = isYes(form, tab, sub, "prescriptive_approach");
  const simulation = isYes(form, tab, sub, "simulation_approach");
  if (prescriptive && simulation) return 4;

  let best = 0;
  if (prescriptive) {
    const v = num(form, tab, sub, "min_percen_comp");
    if (Number.isFinite(v)) best = Math.max(best, daylightTier(v));
  }
  if (simulation) {
    const v = num(form, tab, sub, "min_percen_comp_area");
    if (Number.isFinite(v)) best = Math.max(best, daylightTier(v));
  }
  return best;
}

function scoreVentilationDesignEnhanced(form: CertificationFormResponse): number {
  const v = index(form)
    .get("resident_health_wellbeing", "ventilation_design_enhanced", "total_floor_area")
    .toLowerCase();
  return v === "yes" ? 2 : 0;
}

function scoreEnhancedDaylighting(form: CertificationFormResponse): number {
  const v = num(
    form,
    "resident_health_wellbeing",
    "minimum_daylighting_enhanced",
    "min_percen_comp_area",
  );
  return Number.isFinite(v) ? daylightTier(v) : 0;
}

function scoreCrossVentilation(form: CertificationFormResponse): number {
  const percent = num(
    form,
    "resident_health_wellbeing",
    "cross_ventilation",
    "percentage_regularly_occupied_cross",
  );
  if (!Number.isFinite(percent)) return 0;
  if (percent >= 95) return 4;
  if (percent >= 75) return 3;
  if (percent >= 50) return 2;
  if (percent >= 25) return 1;
  return 0;
}

function scoreConnectivityExteriors(form: CertificationFormResponse): number {
  const percent = num(
    form,
    "resident_health_wellbeing",
    "connectivity_to_exteriors",
    "percentage_regularly_connectivity_exterior",
  );
  if (!Number.isFinite(percent)) return 0;
  if (percent >= 75) return 2;
  if (percent >= 50) return 1;
  return 0;
}

function scoreLowVoc(form: CertificationFormResponse): number {
  const params = [
    "narrative_voc",
    "sealants_adhesives",
    "paint_interior_walls",
    "voc_content_materials",
    "cut_sheet_materials_voc",
    "ecolablled_certificate_voc",
    "tax_invoices_voc",
  ];
  return anyYes(form, "resident_health_wellbeing", "low_voc_materials_adhesives", params) ? 2 : 0;
}

function scorePhysicalWellbeing(form: CertificationFormResponse): number {
  const percent = num(
    form,
    "resident_health_wellbeing",
    "facility_for_physical_wellbeing",
    "percentage_occupants_facility",
  );
  if (!Number.isFinite(percent)) return 0;
  if (percent >= 5) return 2;
  if (percent >= 2.5) return 1;
  return 0;
}

// --- Innovation ---

function scoreInnovationExists(
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
  params: string[],
): number {
  return anyYes(form, tab, subtab, params) ? 1 : 0;
}

/** Laravel `$rating == 2` (IGBC Green Homes) checklist scorers by `tab/subtab`. */
export const GREEN_HOMES_CHECKLIST_SCORERS: Record<string, ChecklistScorer> = {
  "sustainable_design/topography": scoreTopography,
  "sustainable_design/urban_heat_island": scoreUrbanHeatIsland,
  "sustainable_design/passive_arch": scorePassiveArch,
  "sustainable_design/universal_design": scoreUniversalDesign,
  "sustainable_design/green_parking": scoreGreenParking,
  "sustainable_design/basic_amenities": scoreBasicAmenities,
  "sustainable_design/basic_facilities": scoreBasicFacilities,
  "sustainable_design/green_education": scoreGreenEducation,

  "water_conservation/enhanced_water_efficency": scoreEnhancedWaterEfficiency,
  "water_conservation/sustainable_landscape_design": scoreSustainableLandscape,
  "water_conservation/management_irrigation_systems": scoreIrrigationManagement,
  "water_conservation/waste_water_treatment": scoreWasteWaterTreatment,
  "water_conservation/water_quality": scoreWaterQuality,
  "water_conservation/emhanced_rainwater_harvesting": scoreEnhancedRainwater,
  "water_conservation/water_metering": scoreWaterMetering,

  "energy_efficency/minimum_energy_performance": scoreMinimumEnergyPerformance,
  "energy_efficency/enhanced_energy_performance": scoreMinimumEnergyPerformance,
  "energy_efficency/alternate_water_heating": scoreAlternateWaterHeating,
  "energy_efficency/on_site_renewable_energy": scoreOnSiteRenewable,
  "energy_efficency/energy_efficiency_common_area": scoreEnergyCommonArea,
  "energy_efficency/integrated_energy_monitoring": scoreIntegratedMonitoring,

  "material_resources/green_procurement_policy": scoreGreenProcurement,
  "material_resources/optimisation_structural_design": scoreOptimisationStructural,
  "material_resources/use_ecolabelled_products": scoreEcolabelledProducts,
  "material_resources/local_materials": scoreLocalMaterials,
  "material_resources/waste_management_during_construction": scoreWasteManagementConstruction,
  "material_resources/eco_friendly_wood_based_materials": scoreEcoFriendlyWood,
  "material_resources/alternate_construction_materials": scoreAlternateConstruction,
  "material_resources/organic_waste_management_post": scoreOrganicWastePost,

  "resident_health_wellbeing/minimum_daylighting_enhanced": scoreMinimumDaylighting,
  "resident_health_wellbeing/enhanced_day_lighing": scoreEnhancedDaylighting,
  "resident_health_wellbeing/ventilation_design_enhanced": scoreVentilationDesignEnhanced,
  "resident_health_wellbeing/cross_ventilation": scoreCrossVentilation,
  "resident_health_wellbeing/connectivity_to_exteriors": scoreConnectivityExteriors,
  "resident_health_wellbeing/low_voc_materials_adhesives": scoreLowVoc,
  "resident_health_wellbeing/facility_for_physical_wellbeing": scorePhysicalWellbeing,

  "innovation_interior_design/innovation_one_one": (f) =>
    scoreInnovationExists(f, "innovation_interior_design", "innovation_one_one", [
      "narrative_one_one",
      "supporting_documents_one_one",
      "photographs_one_one",
      "exemplary_performance_one_one",
    ]),
  "innovation_interior_design/innovation_one_two": (f) =>
    scoreInnovationExists(f, "innovation_interior_design", "innovation_one_two", [
      "narrative_one_two",
      "supporting_documents_one_two",
      "photographs_one_two",
      "exemplary_performance_one_two",
    ]),
  "innovation_interior_design/innovation_two_one": (f) =>
    scoreInnovationExists(f, "innovation_interior_design", "innovation_two_one", [
      "narrative_two_one",
      "exemplary_performance_two_one",
    ]),
  "innovation_interior_design/innovation_two_two": (f) =>
    scoreInnovationExists(f, "innovation_interior_design", "innovation_two_two", [
      "narrative_two_two",
      "exemplary_performance_two_two",
    ]),
  "innovation_interior_design/igbc_accredited_professional": (f) =>
    scoreInnovationExists(f, "innovation_interior_design", "igbc_accredited_professional", [
      "narrative_accredited_professional",
      "certificate_igbc_accredited",
    ]),
};

/**
 * Laravel `__get_checklist_calculation` for Green Homes (`$rating == 2`).
 * Returns `null` when no custom rule exists (caller falls back to form completion %).
 */
export function computeGreenHomesChecklistAttempted(
  form: CertificationFormResponse,
  tabSlug: string,
  subSlug: string,
  possiblePoints: number,
): number | null {
  if (possiblePoints <= 0) return 0;

  // Config reuses `minimum_daylighting_enhanced` for MR (0 pts) and CR1 Enhanced Daylighting (2 pts).
  if (tabSlug === "resident_health_wellbeing" && subSlug === "minimum_daylighting_enhanced") {
    const raw =
      possiblePoints === 2 ? scoreEnhancedDaylighting(form) : scoreMinimumDaylighting(form);
    return Math.min(Math.max(0, raw), possiblePoints);
  }

  const scorer = GREEN_HOMES_CHECKLIST_SCORERS[`${tabSlug}/${subSlug}`];
  if (!scorer) return null;

  const raw = scorer(form, tabSlug, subSlug);
  return Math.min(Math.max(0, raw), possiblePoints);
}
