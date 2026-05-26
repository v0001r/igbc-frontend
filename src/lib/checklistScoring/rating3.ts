/**
 * Green Factory Buildings — Laravel `__get_checklist_calculation` `$rating == 3`.
 */
import type { CertificationFormResponse } from "@/lib/certificationForm";
import { ChecklistForm, runRegistry } from "@/lib/checklistScoring/helpers";
import type { ChecklistScoringContext, ChecklistScorerRegistry } from "@/lib/checklistScoring/types";

function scoreGfbRainwater(form: CertificationFormResponse): number {
  const f = new ChecklistForm(form);
  const avg = f.num("water_conservation", "annex_wc_one", "average");
  const oneday = f.num("water_conservation", "annex_wc_one", "oneday");
  const selected = f.num("water_conservation", "annex_wc_one", "case");
  if (!Number.isFinite(avg) || !Number.isFinite(oneday)) return 0;

  const case1 = selected === 1;
  if (avg <= 500) {
    if (case1) {
      if (oneday >= 12) return 4;
      if (oneday >= 10) return 3;
      if (oneday >= 8) return 2;
    } else {
      if (oneday >= 8) return 4;
      if (oneday >= 6) return 3;
      if (oneday >= 4) return 2;
    }
  }
  if (avg <= 700) {
    if (case1) {
      if (oneday >= 9) return 4;
      if (oneday >= 7.5) return 3;
      if (oneday >= 6) return 2;
    } else {
      if (oneday >= 6) return 4;
      if (oneday >= 4.5) return 3;
      if (oneday >= 3) return 2;
    }
  }
  if (case1) {
    if (oneday >= 6) return 4;
    if (oneday >= 5) return 3;
    if (oneday >= 4) return 2;
  } else {
    if (oneday >= 4) return 4;
    if (oneday >= 3) return 3;
    if (oneday >= 2) return 2;
  }
  return 0;
}

const REGISTRY: ChecklistScorerRegistry = {
  "sustainable_design/access_public_transport": (form) => {
    const f = new ChecklistForm(form);
    const tab = "sustainable_design";
    const sub = "access_public_transport";
    if (f.isYes(tab, sub, "public_transport")) {
      const hasSelect = f.get(tab, sub, "public_transport_select").trim() !== "";
      const dist = f.num(tab, sub, "distance_annexure_ac_fresh_air");
      return hasSelect && dist > 0 ? 1 : 0;
    }
    return f.isYes(tab, sub, "eco_friendly_shuttle_service") ? 1 : 0;
  },
  "sustainable_design/basic_amenities": (form) => {
    const f = new ChecklistForm(form);
    const tab = "sustainable_design";
    const sub = "basic_amenities";
    let total = 0;
    if (f.isYes(tab, sub, "2_km_from_factory")) {
      if (
        f.anyYes(tab, sub, [
          "retail_store",
          "school",
          "bank",
          "restaurant",
          "hospital_dental",
          "pharmacy",
          "courier_service",
        ])
      ) {
        total += 1;
      }
    }
    if (f.isYes(tab, sub, "provided_situ")) {
      if (
        f.anyYes(tab, sub, [
          "first_aid_medical_facility",
          "creche",
          "locker_shower",
          "canteen",
          "resting_prooms",
          "gymnasium",
        ])
      ) {
        total += 1;
      }
    }
    return total;
  },
  "sustainable_design/natural_topography": (form) => {
    const f = new ChecklistForm(form);
    const tab = "sustainable_design";
    const sub = "topography";
    const sel = f.get(tab, sub, "select_casea_vegetation");
    if (sel === "Option 1: Natural topography and/or landscape area") {
      const v = f.num(tab, sub, "casea_percentage");
      if (v >= 30) return 2;
      if (v >= 20) return 1;
    }
    if (sel === "Option 2: Vegetatoin over build structure") {
      const v = f.num(tab, sub, "caseb_percent");
      if (v >= 40) return 2;
      if (v >= 30) return 1;
    }
    return 0;
  },
  "sustainable_design/heat_island_mitigation": (form) => {
    const f = new ChecklistForm(form);
    const tab = "sustainable_design";
    const sub = "heat_island_mitigation";
    let total = 0;
    if (f.isYes(tab, sub, "urban_heat_roof_island")) {
      const v = f.num(tab, sub, "island_mitigation_non_roof");
      if (v >= 75) total += 2;
      else if (v >= 50) total += 1;
    }
    if (f.isYes(tab, sub, "urban_heat_non_roof_island")) {
      const v = f.num(tab, sub, "mitigation_non_roof_percent");
      if (v >= 75) total += 2;
      else if (v >= 50) total += 1;
    }
    return total;
  },
  "sustainable_design/green_transportation_facility": (form) => {
    const f = new ChecklistForm(form);
    const tab = "sustainable_design";
    const sub = "green_transportation_facility";
    let opt1 = 0;
    let opt2 = 0;
    if (f.isYes(tab, sub, "option_electric_charging_infra")) {
      const v = f.num(tab, sub, "four_parking_percents");
      if (v >= 20) opt1 = 2;
      else if (v >= 10) opt1 = 1;
    }
    if (f.isYes(tab, sub, "option_eco_friendly_transport_facility")) {
      if (
        f.existsChecked(tab, sub, [
          "narrative",
          "parking_plans",
          "ev_socketsev",
          "po_green_invoice",
          "photos_green",
          "laws_green_parking_re",
          "alternate_fuel",
        ])
      ) {
        opt2 = 1;
      }
    }
    return Math.max(opt1, opt2);
  },
  "sustainable_design/universal_design": (form) => {
    const f = new ChecklistForm(form);
    const tab = "sustainable_design";
    const sub = "universal_design";
    const docs = f.existsChecked(tab, sub, [
      "universal_design_narrative",
      "universal_design_site_plan",
      "detailed_draw",
      "submit_permanent",
    ]);
    const inputs =
      f.num(tab, sub, "universal_design_parking_abled") > 0 ||
      f.num(tab, sub, "universal_design_toilets_abled") > 0;
    return docs || inputs ? 2 : 0;
  },
  "sustainable_design/outdoor_light_pollution_reduction": (form) =>
    new ChecklistForm(form).existsChecked("sustainable_design", "outdoor_light_pollution_reduction", [
      "outdoor_light_narrative",
      "details_of_exterior_fixtures",
      "site_plan_lighting_fixtures",
      "provide_fix",
      "lpd_calculation_template",
      "outdoor_light_tax_invoice",
    ])
      ? 1
      : 0,
  "sustainable_design/green_education": (form) =>
    new ChecklistForm(form).existsChecked("sustainable_design", "green_education", [
      "green_education_narrative",
      "green_education_photos",
      "outeach_educational_programmes",
      "poster_project",
    ])
      ? 1
      : 0,
  "water_conservation/management_irrigation_systems": (form) =>
    new ChecklistForm(form).existsChecked("water_conservation", "management_irrigation_systems", [
      "irrigation_narrative",
      "irrigation_sops",
      "irrigation_landscape",
      "irrigation_fixtures",
      "irrigation_photos",
      "irrigation_invoices",
    ])
      ? 2
      : 0,
  "water_conservation/emhanced_rainwater_harvesting": (form) => scoreGfbRainwater(form),
  "water_conservation/waste_water_treatment": (form) =>
    new ChecklistForm(form).existsChecked("water_conservation", "waste_water_treatment", [
      "reuse_narrative",
      "water_balance_chart",
      "reuse_site_plan",
      "resue_tech_datasheet",
      "reuse_dual_plumbing",
      "reuse_drawings",
      "reuse_test_reports",
      "reuse_commissioning",
      "reuse_photos",
    ])
      ? 1
      : 0,
  "water_conservation/enhanced_water_efficency": (form) => {
    const v = new ChecklistForm(form).num(
      "water_conservation",
      "enhanced_water_efficency",
      "percent_saving_consumption",
    );
    if (v >= 30) return 4;
    if (v >= 25) return 3;
    if (v >= 20) return 2;
    if (v >= 15) return 1;
    return 0;
  },
  "water_conservation/alternative_water_performance": (form) => {
    const v = new ChecklistForm(form).num(
      "water_conservation",
      "alternative_water_performance",
      "alternative_water_usage",
    );
    if (v >= 70) return 4;
    if (v >= 60) return 3;
    if (v >= 50) return 2;
    if (v >= 40) return 1;
    return 0;
  },
  "water_conservation/sustainable_landscape_design": (form) => {
    const f = new ChecklistForm(form);
    let score = 0;
    const turf = f.num("water_conservation", "sustainable_landscape_design", "project_turf_factory");
    const drought = f.num("water_conservation", "sustainable_landscape_design", "project_drought_factory");
    if (Number.isFinite(turf)) {
      if (turf <= 20) score += 2;
      else if (turf <= 30) score += 1;
    }
    if (Number.isFinite(drought) && drought >= 30) score += 1;
    return score;
  },
  "water_conservation/water_metering_management": (form) => {
    const v = new ChecklistForm(form).num(
      "water_conservation",
      "water_metering_management",
      "percentage_water_meter",
    );
    if (v >= 90) return 2;
    if (v >= 80) return 1;
    return 0;
  },
  "energy_efficiency/eco_friendly_refrigerant_management": (form) =>
    new ChecklistForm(form).existsChecked("energy_efficiency", "eco_friendly_refrigerant_management", [
      "refe_narr",
      "ref_hvac",
      "refe_indicating",
    ])
      ? 1
      : 0,
  "energy_efficiency/green_power": (form) => {
    const v = new ChecklistForm(form).num("energy_efficiency", "green_power", "percentage_green_power");
    if (v >= 100) return 8;
    if (v >= 90) return 7;
    if (v >= 80) return 6;
    if (v >= 70) return 5;
    if (v >= 60) return 4;
    if (v >= 50) return 3;
    if (v >= 40) return 2;
    if (v >= 30) return 1;
    return 0;
  },
  "energy_efficiency/eco_friendly_captive_power_generation": (form) =>
    new ChecklistForm(form).existsChecked(
      "energy_efficiency",
      "eco_friendly_captive_power_generation",
      ["dg_biodiesel_narrative", "dg_biodiesel_cut_sheet_invoice", "dg_biodiesel_fuel_consumption_calc"],
    )
      ? 1
      : 0,
  "energy_efficiency/energy_monitoring": (form) =>
    new ChecklistForm(form).existsChecked("energy_efficiency", "energy_monitoring", [
      "meter_air_conditioning_energy",
      "meter_internal_lighting_energy",
      "meter_external_lighting_energy",
      "meter_btu_chilled_water",
      "meter_onsite_re_generation",
      "meter_process_energy",
      "meter_pumping_system",
      "meter_major_energy_end_use",
      "submeter_narrative",
      "submeter_sld_diagram",
      "submeter_technical_cutsheet",
      "submeter_year",
      "submeter_photograph",
    ])
      ? 2
      : 0,
  "material_resources/green_procurement": (form) => {
    const v = new ChecklistForm(form).num(
      "material_resources",
      "green_procurement",
      "percent_ecolabelled_products_from_master_material",
    );
    if (v >= 20) return 2;
    if (v >= 10) return 1;
    return 0;
  },
  "material_resources/organic_waste_management_post": (form) => {
    const f = new ChecklistForm(form);
    const garden = f.num("material_resources", "organic_waste_management_post", "total_generated_waste");
    const food = f.num("material_resources", "organic_waste_management_post", "org_generated_waste");
    if (garden >= 25) return 2;
    if (food >= 75) return 1;
    return 0;
  },
  "material_resources/waste_management_during_construction": (form) => {
    const v = new ChecklistForm(form).num(
      "material_resources",
      "annexure_waste_management",
      "percentage_waste_diverted_landfill",
    );
    if (v >= 95) return 2;
    if (v >= 75) return 1;
    return 0;
  },
  "material_resources/materials_with_recycled_content": (form) => {
    const v = new ChecklistForm(form).num(
      "material_resources",
      "materials_with_recycled_content",
      "percent_recycled_content",
    );
    if (v >= 25) return 3;
    if (v >= 15) return 2;
    if (v >= 5) return 1;
    return 0;
  },
  "material_resources/local_materials": (form) => {
    const v = new ChecklistForm(form).num("material_resources", "local_materials", "percent_local_materials");
    if (v >= 75) return 3;
    if (v >= 50) return 2;
    if (v >= 25) return 1;
    return 0;
  },
  "material_resources/use_of_salvaged_materials": (form) => {
    const v = new ChecklistForm(form).num(
      "material_resources",
      "use_of_salvaged_materials",
      "salavged_material_percent",
    );
    if (v >= 2.5) return 2;
    return 0;
  },
  "material_resources/eco_friendly_wood_based_materials": (form) => {
    const v = new ChecklistForm(form).num(
      "material_resources",
      "eco_friendly_wood_based_materials",
      "eco_friendly_wood_based_material_percent",
    );
    if (v >= 95) return 2;
    if (v >= 75) return 1;
    return 0;
  },
  "indoor_environment/building_flush_out": (form) =>
    new ChecklistForm(form).existsChecked("indoor_environment", "building_flush_out", [
      "build_narrative",
      "building_auth",
      "building_photo",
    ])
      ? 1
      : 0,
  "indoor_environment/low_voc_materials": (form) =>
    new ChecklistForm(form).existsChecked("indoor_environment", "low_voc_materials", [
      "low_voc_narrative",
      "low_voc_list",
      "low_voc_manufacturer",
      "low_voc_purchase_invoices",
    ])
      ? 2
      : 0,
  "indoor_environment/eco_friendly_housekeeping_chemicals": (form) =>
    new ChecklistForm(form).existsChecked("indoor_environment", "eco_friendly_housekeeping_chemicals", [
      "eco_narrative",
      "eco_policy",
      "eco_manufacturer",
      "eco_purchase_invoices",
      "eco_photographs",
    ])
      ? 2
      : 0,
  "indoor_environment/indoor_air_quality": (form) => {
    const f = new ChecklistForm(form);
    const tab = "indoor_environment";
    const sub = "indoor_air_quality";
    let score = 0;
    if (f.num(tab, sub, "indoor_parameters_area") > 0) score += 1;
    if (f.isYes(tab, sub, "indoor_co2_monitoring")) score += 1;
    return score;
  },
  "indoor_environment/daylighting": (form) => {
    const f = new ChecklistForm(form);
    const tab = "indoor_environment";
    const sub = "daylighting";
    const approach = f.get(tab, sub, "daylight_approch");
    if (approach === "Simulation Approach") {
      const v = f.num(tab, sub, "day_parameters_area");
      if (v >= 50) return 5;
      if (v >= 45) return 4;
      if (v >= 40) return 3;
      if (v >= 35) return 2;
      if (v >= 30) return 1;
      return 0;
    }
    if (approach === "Mannual Approach") {
      return f.existsChecked(tab, sub, [
        "mannual_narrative",
        "mannual_def_report",
        "mannual_floor_plan",
        "mannual_site_plan",
        "mannual_manufacturer",
        "mannual_build",
        "mannual_purchase_invoices",
      ])
        ? 5
        : 0;
    }
    return 0;
  },
  "indoor_environment/occupant_wellbeing_facilities": (form) => {
    const f = new ChecklistForm(form);
    const tab = "indoor_environment";
    const sub = "occupant_wellbeing_facilities";
    let score = 0;
    if (f.num(tab, sub, "indoor_outdoor_option_one") > 0) score += 1;
    if (f.isYes(tab, sub, "break_out_option_two")) score += 1;
    return score;
  },
  "innovation_exemplay_performance/innovation_one_one": (form) =>
    new ChecklistForm(form).existsChecked("innovation_development", "innovation_one_one", [
      "innovation_One_narrative",
      "innovation_One_supporting",
      "innovation_One_photographs",
    ])
      ? 1
      : 0,
  "innovation_exemplay_performance/innovation_one_two": (form) =>
    new ChecklistForm(form).existsChecked("innovation_development", "innovation_one_two", [
      "innovation_One_two_narrative",
      "innovation_One_two_supporting",
      "innovation_One_two_photographs",
    ])
      ? 1
      : 0,
  "innovation_exemplay_performance/innovation_one_three": (form) =>
    new ChecklistForm(form).existsChecked("innovation_development", "innovation_one_three", [
      "innovation_One_three_narrative",
      "innovation_One_three_supporting",
      "innovation_One_three_photographs",
    ])
      ? 1
      : 0,
  "innovation_exemplay_performance/innovation_one_four": (form) =>
    new ChecklistForm(form).existsChecked("innovation_development", "innovation_one_four", [
      "innovation_One_four_narrative",
      "innovation_One_four_supporting",
      "innovation_One_four_photographs",
    ])
      ? 1
      : 0,
  "innovation_exemplay_performance/innovation_one_five": (form) =>
    new ChecklistForm(form).existsChecked("innovation_development", "innovation_one_five", [
      "innovation_One_five_narrative",
      "innovation_One_five_supporting",
      "innovation_One_five_photographs",
    ])
      ? 1
      : 0,
  "innovation_exemplay_performance/igbc_accredited_professional": (form) =>
    new ChecklistForm(form).existsChecked("innovation_development", "igbc_accredited_professional", [
      "certificate_igbc_ap",
    ])
      ? 1
      : 0,
};

export function computeRating3ChecklistAttempted(
  form: CertificationFormResponse,
  tabSlug: string,
  subSlug: string,
  possiblePoints: number,
  ctx: ChecklistScoringContext,
): number | null {
  return runRegistry(REGISTRY, form, tabSlug, subSlug, possiblePoints, ctx);
}
