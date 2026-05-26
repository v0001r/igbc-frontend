/**
 * Green Existing Buildings — Laravel `__get_checklist_calculation` `$rating == 4`.
 */
import type { CertificationFormResponse } from "@/lib/certificationForm";
import { ChecklistForm, runRegistry } from "@/lib/checklistScoring/helpers";
import type { ChecklistScoringContext, ChecklistScorerRegistry } from "@/lib/checklistScoring/types";

function subtabParams(
  form: CertificationFormResponse,
  tab: string,
  sub: string,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const row of form.data) {
    if (row.tab === tab && row.subtab === sub && row.paramName) {
      out[row.paramName] = row.value ?? "";
    }
  }
  return out;
}

const REGISTRY: ChecklistScorerRegistry = {
  "sustainable_design/enhanced_waste_managementv": (form) => {
    const d = subtabParams(form, "sustainable_design", "enhanced_waste_managementv");
    let score = 0;
    if (
      d.dry_waste_reduction === "1" &&
      Number(d.percentage_reduction) <= 20
    ) {
      score += 1;
    }
    if (
      d.dry_waste_recycling_resue === "1" &&
      (d.dry_waste === "1" || d.manufacturer_certificate_dry === "1")
    ) {
      score += 1;
    }
    const wetFields = [
      "details_converted_preceding",
      "enhanced_waste_photos",
      "location_organic_waste",
      "payment_organic_wet",
      "wet_stamped_showing",
    ];
    const wetValid = wetFields.some((f) => d[f] === "1");
    if (d.div_wet_waste_composting === "1" && wetValid) score += 1;
    return Math.min(score, 3);
  },
  "sustainable_design/green_transportation": (form) => {
    const v = new ChecklistForm(form).num(
      "sustainable_design",
      "green_transportation",
      "low_emmiting_vehicles_ex",
    );
    if (v >= 10) return 2;
    if (v >= 5) return 1;
    return 0;
  },
  "sustainable_design/building_performance_dashboard": (form) => {
    const d = subtabParams(form, "sustainable_design", "building_performance_dashboard");
    let score = 0;
    const g1 = [
      "building_operations_narrative_dash",
      "sechematic_bms_installed",
      "meter_installed_details",
      "water_meter_photographs",
      "total_water_consumption_data",
      "project_comm_one",
    ];
    if (d.monitoring_energy_consumption === "1" && g1.some((p) => d[p] === "1")) score += 2;
    const g2 = [
      "narrative_con",
      "diagram_bms_installed",
      "system_pro",
      "installed_project",
      "water_meter_pro",
      "share_total",
      "project_comm_two",
    ];
    if (d.monitoring_con === "1" && g2.some((p) => d[p] === "1")) score += 2;
    const g3 = [
      "sehematic_m",
      "system_project",
      "installed_pro",
      "sensors_installed_photographs",
      "perfor",
      "project_comm_three",
    ];
    if (d.indoor_air_quality === "1" && g3.some((p) => d[p] === "1")) score += 2;
    return Math.min(score, 6);
  },
  "sustainable_design/urban_heat_island": (form) => {
    const f = new ChecklistForm(form);
    const tab = "sustainable_design";
    const sub = "urban_heat_island";
    let score = 0;
    if (f.isYes(tab, sub, "urban_heat_island_mitigation")) {
      const v = f.numAnywhere("per_treated_roof") || f.num(tab, sub, "per_treated_roof");
      if (v >= 100) score += 2;
      else if (v >= 60) score += 1;
    }
    if (f.isYes(tab, sub, "non_roof_impervious_area")) {
      const v = f.numAnywhere("per_treated_non_roof") || f.num(tab, sub, "per_treated_non_roof");
      if (v >= 80) score += 2;
      else if (v >= 60) score += 1;
    }
    return Math.min(score, 4);
  },
  "sustainable_design/sustainable_retrofitting": (form) => {
    const f = new ChecklistForm(form);
    const tab = "sustainable_design";
    const sub = "sustainable_retrofitting";
    let count = 0;
    if (
      f.existsChecked(tab, sub, [
        "sustainable_narrative",
        "procured_materials_list",
        "greenpro_certificate",
        "used_eco",
        "greenpro_geotag",
      ])
    ) {
      count += 1;
    }
    if (f.isYes(tab, sub, "signed_sustainable_policy")) count += 1;
    return count;
  },
  "sustainable_design/eco_friendly_landcaping_practices": (form) =>
    new ChecklistForm(form).existsChecked("sustainable_design", "eco_friendly_landcaping_practices", [
      "eco_frndly_lndcping_narrative",
      "landscape_site_natural_species",
      "eco_frndly_lndcping_photographs",
      "total_quantity_invoice_applicable",
      "list_of_native_species",
      "quantities_organic",
    ])
      ? 2
      : 0,
  "sustainable_design/eco_friendly_commuting": (form) => {
    const f = new ChecklistForm(form);
    const tab = "sustainable_design";
    const sub = "eco_friendly_commuting";
    let publicPct = 0;
    let shuttlePct = 0;
    let score = 0;
    if (f.isYes(tab, sub, "public_transport")) {
      const v = f.num(tab, sub, "occupants_public_transport");
      if (v >= 40) {
        score += 1;
        publicPct = v;
      }
    }
    if (f.isYes(tab, sub, "shuttel_service_eco")) {
      const v = f.num(tab, sub, "occupants_shutter_eco");
      if (v >= 30) {
        score += 1;
        shuttlePct = v;
      }
    }
    if (publicPct > 0 && shuttlePct > 0 && publicPct + shuttlePct >= 80) return 2;
    return Math.min(score, 2);
  },
  "sustainable_design/outdoor_light_pollution_reduction": (form) =>
    new ChecklistForm(form).existsChecked("sustainable_design", "outdoor_light_pollution_reduction", [
      "outdoor_light_narrative",
      "details_of_exterior_fixtures",
      "site_plan_lighting_fixtures",
      "sheet_fix_with",
      "exterior_lighting",
      "exterior_trans",
    ])
      ? 1
      : 0,
  "sustainable_design/building_operations_maintenance": (form) => {
    const f = new ChecklistForm(form);
    const tab = "sustainable_design";
    const sub = "building_operations_maintenance";
    let score = 0;
    if (
      f.existsChecked(tab, sub, [
        "hvac_chiller",
        "waster_sys",
        "onsite_engergy",
        "rain_har",
        "power_sys",
        "elevators_escalators",
        "building_sys",
        "building_operations_narrative",
        "annual_maintenance_contracts",
      ])
    ) {
      score += 1;
    }
    if (
      f.existsChecked(tab, sub, ["building_narr", "energy_and_water_assessment_report"])
    ) {
      score += 1;
    }
    return Math.min(score, 2);
  },
  "water_conservation/alternative_water_performances": (form) => {
    const v = new ChecklistForm(form).num(
      "water_conservation",
      "alternative_water_performances",
      "alternative_narrative",
    );
    if (v > 30) return 3;
    if (v > 20) return 2;
    if (v > 10) return 1;
    return 0;
  },
  "water_conservation/emhanced_rainwater_harvesting": (form) => {
    const f = new ChecklistForm(form);
    const tab = "water_conservation";
    const sub = "emhanced_rainwater_harvesting";
    const recharge = f.num(tab, sub, "recharge_percen");
    const reuse = f.num(tab, sub, "resue_percen");
    if (recharge >= 30 && reuse >= 30) {
      if (recharge >= 50 && reuse >= 50) return 4;
      if (recharge >= 30 && reuse >= 50) return 4;
      if (recharge >= 50 && reuse >= 30) return 3;
      return 3;
    }
    if (recharge >= 50) return 2;
    if (recharge >= 30) return 1;
    if (reuse >= 50) return 2;
    if (reuse >= 30) return 1;
    return 0;
  },
  "water_conservation/wastewater_treatment": (form) => {
    const v = new ChecklistForm(form).num(
      "water_conservation",
      "wastewater_treatment",
      "percent_waste_water_ex",
    );
    return v >= 100 ? 4 : 0;
  },
  "water_conservation/sustainable_landscape_design": (form) => {
    const f = new ChecklistForm(form);
    let score = 0;
    const docCount = f.countFilled("sustainable_design", "sustainable_landscape_design", [
      "landscape_design_narrative",
      "high_irrgation",
      "cutsheet_fix",
      "photo_land",
    ]);
    if (docCount >= 2) score += 2;
    else if (docCount === 1) score += 1;
    const turf = f.num("water_conservation", "sustainable_landscape_design", "per_turf");
    if (turf <= 20) score += 2;
    else if (turf <= 30) score += 1;
    const adaptive = f.num("water_conservation", "sustainable_landscape_design", "local_adaptive");
    if (adaptive >= 80) score += 2;
    else if (adaptive >= 60) score += 1;
    return Math.min(score, 6);
  },
  "energy_efficiency/enhanced_eco_friendly_refrigerants": (form) =>
    new ChecklistForm(form).existsChecked("energy_efficiency", "enhanced_eco_friendly_refrigerants", [
      "narrative_eco",
      "detailed_calculation_eco",
      "technical_cut_sheets_eco",
      "geotagged_timestamped_eco",
      "letter_signed_eco",
    ])
      ? 2
      : 0,
  "energy_efficiency/minimum_energy_performance": (form) => {
    const v = new ChecklistForm(form).num(
      "energy_efficiency",
      "minimum_energy_performance",
      "applicable_points",
    );
    return Number.isFinite(v) ? Math.min(v, 14) : 0;
  },
  "energy_efficiency/enhanced_energy_performance": (form) => {
    const f = new ChecklistForm(form);
    const tab = "energy_efficiency";
    const sub = "enhanced_energy_performance";
    const approach = f.get(tab, sub, "existing_apprich_similation_ench");
    const percent = f.num(tab, sub, "eng_per_saving_ench");
    if (approach === "Calibrated Simulation") {
      if (percent > 25) return 14;
      if (percent >= 21) return 12;
      if (percent >= 17) return 10;
      if (percent >= 13) return 8;
      if (percent >= 10) return 6;
      if (percent >= 7) return 4;
      if (percent >= 5) return 2;
      return 0;
    }
    if (approach === "Prescriptive Approach") {
      if (percent >= 21) return 12;
      if (percent >= 17) return 10;
      if (percent >= 13) return 8;
      if (percent >= 10) return 6;
      if (percent >= 7) return 4;
      if (percent >= 5) return 2;
    }
    return 0;
  },
  "energy_efficiency/green_power": (form) => {
    const f = new ChecklistForm(form);
    const tab = "energy_efficiency";
    const sub = "green_power";
    const approach = f.get(tab, sub, "green_power_select");
    if (approach === "On-site Renewable Energy") {
      const v = f.num(tab, sub, "percentage_energy_solor");
      if (v > 30) return 7;
      if (v >= 25) return 6;
      if (v >= 20) return 5;
      if (v >= 15) return 4;
      if (v >= 10) return 3;
      if (v >= 5) return 2;
      return 0;
    }
    if (approach === "Off-site Renewable Energy") {
      const v = f.num(tab, sub, "catered_off_site");
      if (v >= 90) return 7;
      if (v >= 80) return 6;
      if (v >= 70) return 5;
      if (v >= 60) return 4;
      if (v >= 50) return 3;
      if (v >= 40) return 2;
      return 0;
    }
    if (approach === "Off-set Grid Energy Use by Renewable Energy") {
      const v = f.num(tab, sub, "eng_catered_off_set");
      if (v >= 90) return 14;
      if (v >= 80) return 12;
      if (v >= 70) return 10;
      if (v >= 60) return 8;
      if (v >= 50) return 6;
      if (v >= 40) return 4;
      if (v >= 30) return 2;
    }
    return 0;
  },
  "health_comfort/enhanced_indoor_environment_quality": (form) => {
    const f = new ChecklistForm(form);
    const tab = "health_comfort";
    const sub = "enhanced_indoor_environment_quality";
    let score = 0;
    const c1 = f.num(tab, sub, "details_installed_space_indoor");
    const c2 = f.num(tab, sub, "indicating_openable_space_indoor");
    const c3 = f.num(tab, sub, "percentage_improvement_space_indoor");
    if (Number.isFinite(c1)) score += c1 >= 30 ? 2 : c1 >= 20 ? 1 : 0;
    else if (Number.isFinite(c2)) score += c2 >= 4 ? 2 : c2 >= 3 ? 1 : 0;
    else if (Number.isFinite(c3)) score += c3 >= 30 ? 2 : c3 >= 20 ? 1 : 0;
    const iaq = f.get(tab, sub, "monitor_iaq_parameters_space").trim().toUpperCase();
    if (iaq === "CLASS A") score += 4;
    else if (iaq === "CLASS B") score += 3;
    else if (iaq === "CLASS C") score += 2;
    if (f.paramExists(tab, sub, "thermal_comfort_strategies") || f.paramExists(tab, sub, "indoor_temp_rh")) {
      score += 1;
    }
    if (
      f.existsChecked(tab, sub, [
        "narrative_daylight",
        "site_building_daylight",
        "floor_plan_daylight",
        "report_analysis_daylight",
        "cutsheet_installed_glass",
        "purchase_invoice_daylight",
        "photo_graphs_interiors",
      ])
    ) {
      score += 1;
    }
    if (
      f.existsChecked(tab, sub, [
        "narrative_para",
        "highithin_area",
        "indicating_levels_para",
        "recommedation_para",
        "cutsheet_insulation_para",
        "photographs_para",
      ])
    ) {
      score += 1;
    }
    if (
      f.existsChecked(tab, sub, [
        "narrative_fac",
        "isolated_space_factory",
        "exhaust_system_factroy",
        "measure_undertaken_factroy",
      ])
    ) {
      score += 1;
    }
    return Math.min(score, 10);
  },
  "health_comfort/eco_friendly_housekeeping_chemicals": (form) => {
    const c = new ChecklistForm(form).countChecked(
      "health_comfort",
      "eco_friendly_housekeeping_chemicals",
      ["list_application_eco", "cut_sheet_eco", "eco_friendly_eco", "chem_time"],
    );
    return Math.min(c, 4);
  },
  "health_comfort/universal_designs": (form) => {
    const measures = [
      "slipper_ramps",
      "information_entrance",
      "floor_level",
      "park_space_closer",
      "braille_assistance",
      "area_building",
      "important_via",
      "facilitate_assisted",
      "survey_abled",
    ];
    const attempted = measures.filter((p) => {
      const v = new ChecklistForm(form).get("health_comfort", "universal_designs", p).trim();
      return v !== "";
    }).length;
    if (attempted >= 6) return 2;
    if (attempted >= 3) return 1;
    return 0;
  },
  "health_comfort/occupant_well_being_facilities": (form) => {
    const v = new ChecklistForm(form).num(
      "health_comfort",
      "occupant_well_being_facilities",
      "public_occupants",
    );
    return v > 15 ? 4 : 0;
  },
  "innovation_performance/innovation_1_1": (form) =>
    new ChecklistForm(form).existsChecked("innovation_performance", "innovation_1_1", [
      "innovation_1_1",
      "supporting_documents_one_one",
      "photographs_one_one",
    ])
      ? 1
      : 0,
  "innovation_performance/innovation_1_2": (form) =>
    new ChecklistForm(form).existsChecked("innovation_performance", "innovation_1_2", [
      "narrative_one_two",
      "supporting_documents_one_two",
      "photographs_one_two",
    ])
      ? 1
      : 0,
  "innovation_performance/innovation_1_3": (form) =>
    new ChecklistForm(form).existsChecked("innovation_performance", "innovation_1_3", [
      "narrative_one_three",
      "supporting_documents_one_three",
      "exemplary_performance_two_one",
    ])
      ? 1
      : 0,
  "innovation_performance/innovation_1_4": (form) =>
    new ChecklistForm(form).existsChecked("innovation_performance", "innovation_1_4", [
      "innovation_one_four",
      "supporting_documents_one_four",
      "exemplary_performance_two_two",
    ])
      ? 1
      : 0,
  "innovation_performance/igbc_accredited_professional": (form) =>
    new ChecklistForm(form).existsChecked("innovation_performance", "igbc_accredited_professional", [
      "narrative_accredited_professional",
    ])
      ? 1
      : 0,
  "innovation_performance/green_education": (form) => {
    const f = new ChecklistForm(form);
    const tab = "innovation_performance";
    const sub = "green_education";
    const awareness = [
      "relevant_applicable_documents",
      "photographs_green_education",
    ].filter((p) => f.get(tab, sub, p).trim() !== "").length;
    const education = ["crediy_comp", "photographs_showing_measure"].filter(
      (p) => f.get(tab, sub, p).trim() !== "",
    ).length;
    if (awareness >= 1 && education >= 1) return 2;
    if (awareness >= 2) return 2;
    if (awareness >= 1) return 1;
    if (education >= 2) return 2;
    if (education >= 1) return 1;
    return 0;
  },
};

export function computeRating4ChecklistAttempted(
  form: CertificationFormResponse,
  tabSlug: string,
  subSlug: string,
  possiblePoints: number,
  ctx: ChecklistScoringContext,
): number | null {
  return runRegistry(REGISTRY, form, tabSlug, subSlug, possiblePoints, ctx);
}
