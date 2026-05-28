/**
 * Green New Buildings — Laravel `__get_checklist_calculation` `$rating == 1`.
 */
import type { CertificationFormResponse } from "@/lib/certificationForm";
import { ChecklistForm, runRegistry } from "@/lib/checklistScoring/helpers";
import type { ChecklistScoringContext, ChecklistScorerRegistry } from "@/lib/checklistScoring/types";

function isOwner(ctx: ChecklistScoringContext): boolean {
  return ctx.subRatingType === 1;
}

function scoreNbRainwater(form: CertificationFormResponse): number {
  const f = new ChecklistForm(form);
  const avg = f.num("water_conservation", "annex_wc_one", "average");
  const val = f.num("water_conservation", "annex_wc_one", "avg_rainfall");
  const selected = f.get("water_conservation", "annex_wc_one", "case");
  if (!Number.isFinite(avg) || !Number.isFinite(val)) return 0;
  const case1 = selected === "1";

  const pick = (bands: [number, number][]): number => {
    for (let i = bands.length - 1; i >= 0; i--) {
      if (val >= bands[i][0]) return bands[i][1];
    }
    return 0;
  };

  if (avg <= 250) {
    return case1
      ? pick([
          [12.5, 2],
          [15, 3],
          [18, 4],
        ])
      : pick([
          [6, 2],
          [9, 3],
          [12, 4],
        ]);
  }
  if (avg < 350) {
    return case1
      ? pick([
          [10, 2],
          [12.5, 3],
          [15, 4],
        ])
      : pick([
          [5, 2],
          [7.5, 3],
          [10, 4],
        ]);
  }
  if (avg < 500) {
    return case1
      ? pick([
          [8, 2],
          [10, 3],
          [12, 4],
        ])
      : pick([
          [4, 2],
          [6, 3],
          [8, 4],
        ]);
  }
  if (avg < 700) {
    return case1
      ? pick([
          [6, 2],
          [7.5, 3],
          [9, 4],
        ])
      : pick([
          [3, 2],
          [4.5, 3],
          [6, 4],
        ]);
  }
  return case1
    ? pick([
        [4, 2],
        [5, 3],
        [6, 4],
      ])
    : pick([
        [2, 2],
        [3, 3],
        [4, 4],
      ]);
}

const REGISTRY: ChecklistScorerRegistry = {
  "sustainable_planning/integrated_design_approch": (form) =>
    new ChecklistForm(form).existsChecked("sustainable_planning", "integrated_design_approch", [
      "narrative_integrated_design_approch",
      "members",
      "least",
    ])
      ? 1
      : 0,
  "sustainable_planning/site_preservation": (form) => {
    const c = new ChecklistForm(form).countChecked("sustainable_planning", "site_preservation", [
      "topo_narrative",
      "topo_photographs",
      "survey_plan",
    ]);
    if (c >= 2) return 2;
    if (c >= 1) return 1;
    return 0;
  },
  "sustainable_planning/passive_architecture": (form) => {
    const f = new ChecklistForm(form);
    const tab = "sustainable_planning";
    const sub = "passive_architecture";
    const opt = f.num(tab, sub, "passive_architecture_option");
    if (opt === 1) {
      const pct = f.num(tab, sub, "percentage_eng");
      if (pct >= 4) return 2;
      if (pct >= 2) return 1;
      return 0;
    }
    if (opt === 2) {
      const c = f.countChecked(tab, sub, ["exterior", "skylights", "daylighting", "passive"]);
      if (c > 2) return 2;
      if (c >= 1) return 1;
    }
    return 0;
  },
  "site_selection_planning/basic_amenities": (form) =>
    new ChecklistForm(form).existsChecked("site_selection_planning", "basic_amenities", [
      "narrative",
      "site_plan",
      "photos",
    ])
      ? 1
      : 0,
  "site_selection_planning/eco_friendly_commuting": (form) =>
    new ChecklistForm(form).existsChecked("site_selection_planning", "eco_friendly_commuting", [
      "areial_eco",
      "detailed_narrative_eco",
      "areial",
      "signed_agreement_eco",
      "photographs_ecofriendly",
    ])
      ? 1
      : 0,
  "site_selection_planning/green_transportation": (form) =>
    new ChecklistForm(form).existsChecked("site_selection_planning", "green_transportation", [
      "detailed_narrative_cal",
      "parking_plan_cal",
      "detailed_narrative_cal_optionb",
      "parking_plan_cal_optionb",
      "site_vicinity_map",
      "narrative_charging",
      "parking_plans_charging",
      "ev_sockets",
    ])
      ? 1
      : 0,
  "site_selection_planning/topography": (form) => {
    const f = new ChecklistForm(form);
    const tab = "site_selection_planning";
    const sub = "topography";
    const p1 = f.get(tab, sub, "caseb_natural_topography_nb");
    const p2 = f.get(tab, sub, "caseb_natural_topography_nb_2");
    if (p1.trim()) {
      const v = parseFloat(p1);
      if (v >= 20) return 2;
      if (v >= 15) return 1;
    }
    if (p2.trim()) {
      const v = parseFloat(p2);
      if (v >= 40) return 2;
      if (v >= 30) return 1;
    }
    return 0;
  },
  "site_selection_planning/transplantation_of_trees": (form) =>
    new ChecklistForm(form).existsChecked("site_selection_planning", "transplantation_of_trees", [
      "narrative_trees",
      "planted",
      "species",
      "trees",
    ])
      ? 1
      : 0,
  "site_selection_planning/urban_heat_non_roof": (form) => {
    const f = new ChecklistForm(form);
    const tab = "site_selection_planning";
    const sub = "urban_heat_non_roof";
    const opt = f.num(tab, sub, "non_roof_options");
    const map: Record<number, string> = { 1: "non_roof_mitigation_one", 2: "non_roof_mitigation_two" };
    const param = map[opt];
    if (!param) return 0;
    const pct = f.num(tab, sub, param);
    if (pct >= 75) return 2;
    if (pct >= 50) return 1;
    return 0;
  },
  "site_selection_planning/urban_heat_island": (form) => {
    const f = new ChecklistForm(form);
    const tab = "site_selection_planning";
    const sub = "urban_heat_island";
    const opt = f.num(tab, sub, "roof_public_transport");
    const map: Record<number, string> = {
      1: "reflective_mitigation",
      2: "vegetation_mitigation",
      3: "sri_vegetation_island_mitigation",
    };
    const param = map[opt];
    if (!param) return 0;
    const pct = f.num(tab, sub, param);
    if (param === "reflective_mitigation") {
      if (pct >= 95) return 2;
      if (pct >= 75) return 1;
    } else {
      if (pct >= 75) return 2;
      if (pct >= 50) return 1;
    }
    return 0;
  },
  "site_selection_planning/pollution_reduction": (form) =>
    new ChecklistForm(form).existsChecked("site_selection_planning", "pollution_reduction", [
      "narrative",
      "highlighing",
      "exterior",
      "calculation",
    ])
      ? 1
      : 0,
  "site_selection_planning/universal_design": (form) =>
    new ChecklistForm(form).existsChecked("site_selection_planning", "universal_design", [
      "narrative",
      "site_plan",
      "ramps_toilets",
      "dime_park_indica",
      "cutsheets",
    ])
      ? 1
      : 0,
  "site_selection_planning/construction_workforce": (form) =>
    new ChecklistForm(form).existsChecked("site_selection_planning", "construction_workforce", [
      "narrative",
      "exterior",
      "extract",
    ])
      ? 1
      : 0,
  "site_selection_planning/green_building_guidelines": (form) =>
    new ChecklistForm(form).existsChecked("site_selection_planning", "green_building_guidelines", [
      "narrative_detailed",
      "green_building_renovation",
      "brochure_tenant_guidelines",
    ])
      ? 1
      : 0,
  "water_conservation/emhanced_rainwater_harvesting": (form) => scoreNbRainwater(form),
  "water_conservation/waste_water_treatment": (form) => {
    const f = new ChecklistForm(form);
    let score = 0;
    const treated = f.num("water_conservation", "hvac_water_requirement", "treated_waste");
    const annual = f.num("water_conservation", "hvac_water_requirement", "percentage_annual");
    if (treated >= 100) score += 2;
    else if (annual >= 75) score += 3;
    else if (annual >= 50) score += 2;
    else if (annual >= 25) score += 1;
    return Math.min(score, 5);
  },
  "water_conservation/sustainable_landscape_design": (form) => {
    const f = new ChecklistForm(form);
    let score = 0;
    const turf = f.num("water_conservation", "sustainable_landscape_design", "project_turf");
    const drought = f.num("water_conservation", "sustainable_landscape_design", "project_drought");
    if (turf <= 30) score += 1;
    if (drought >= 30) score += 1;
    return score;
  },
  "water_conservation/management_irrigation_systems": (form) =>
    new ChecklistForm(form).existsChecked("water_conservation", "management_irrigation_systems", [
      "irrigation_narrative",
      "irrigation_fixtures",
      "declaration_letter",
    ])
      ? 1
      : 0,
  "water_conservation/water_efficient_plumbing": (form) => {
    const pct = new ChecklistForm(form).num(
      "water_conservation",
      "water_efficient_plumbing",
      "flow_percentage_achive",
    );
    if (pct >= 24) return 5;
    if (pct >= 20) return 4;
    if (pct >= 16) return 3;
    if (pct >= 12) return 2;
    if (pct >= 8) return 1;
    return 0;
  },
  "water_conservation/water_metering": (form, _t, _s, ctx) =>
    new ChecklistForm(form).existsChecked("water_conservation", "water_metering", [
      "metering_narrative",
      "metering_sld",
      "metering_cutsheet",
    ])
      ? isOwner(ctx)
        ? 2
        : 1
      : 0,
  "energy_efficency/eco_friendly_refrigerants": (form) =>
    new ChecklistForm(form).existsChecked("energy_efficency", "eco_friendly_refrigerants", [
      "annex_narrative_commission",
      "manufacturers_cut_sheet_annex",
    ])
      ? 1
      : 0,
  "energy_efficency/minimum_energy_enhanced": (form) => {
    const f = new ChecklistForm(form);
    const tab = "energy_efficency";
    const sub = "minimum_energy_enhanced";
    const approach = f.get(tab, sub, "select_approach_credit_2");
    if (approach === "Case A: Performance Based Approach") {
      const pct = f.num(tab, sub, "energy_savings_percentage");
      if (pct >= 32) return 15;
      if (pct >= 30) return 14;
      if (pct >= 28) return 13;
      if (pct >= 26) return 12;
      if (pct >= 24) return 11;
      if (pct >= 22) return 10;
      if (pct >= 20) return 9;
      if (pct >= 18) return 8;
      if (pct >= 16) return 7;
      if (pct >= 14) return 6;
      if (pct >= 12) return 5;
      if (pct >= 10) return 4;
      if (pct >= 8) return 3;
      if (pct >= 6) return 2;
      if (pct >= 4) return 1;
      return 0;
    }
    if (approach === "Case B: Prescriptive Based Approach") {
      const c = f.countChecked(tab, sub, ["narrative_energy_caseb", "suppotive_energy_caseb"]);
      if (c >= 2) return 8;
      if (c === 1) return 1;
    }
    return 0;
  },
  "energy_efficency/on_site_renewable_energy": (form, _t, _s, ctx) => {
    const pct = new ChecklistForm(form).num("energy_efficency", "on_site_renewable_energy", "catered_lighting_energy");
    if (!Number.isFinite(pct)) return 0;
    if (isOwner(ctx)) {
      if (pct >= 5) return 6;
      if (pct >= 4) return 5;
      if (pct >= 3) return 4;
      if (pct >= 2) return 3;
      if (pct >= 1) return 2;
      return 0;
    }
    if (pct >= 8) return 8;
    if (pct >= 7) return 7;
    if (pct >= 6) return 6;
    if (pct >= 5) return 5;
    if (pct >= 4) return 4;
    if (pct >= 3) return 3;
    if (pct >= 2) return 2;
    return 0;
  },
  "energy_efficency/off_site_renewable_energy": (form) =>
    new ChecklistForm(form).existsChecked("energy_efficency", "off_site_renewable_energy", [
      "annex_narrative_offsite",
      "declaration_letter_offsite",
    ])
      ? 2
      : 0,
  "energy_efficency/installation_equipment": (form) =>
    new ChecklistForm(form).existsChecked("energy_efficency", "installation_equipment", [
      "annex_narrative_equipment",
      "work_order",
    ])
      ? 2
      : 0,
  "energy_efficency/energy_metering_management": (form) => {
    const f = new ChecklistForm(form);
    const tab = "energy_efficency";
    const sub = "energy_metering_management";
    const approach = f.get(tab, sub, "select_approach_metering").toLowerCase().trim();
    if (approach === "energy metering") {
      return f.existsChecked(tab, sub, ["annex_narrative_offsite1", "annex_singleline_diagram"]) ? 1 : 0;
    }
    if (approach === "building management system") {
      const c = f.countChecked(tab, sub, [
        "annex_narrative_bms",
        "annex_bms_architecture",
        "annex_bms_control_logic",
      ]);
      if (c >= 2) return 2;
      if (c >= 1) return 1;
    }
    return 0;
  },
  "material_resources/sustainable_building_materials": (form) => {
    const f = new ChecklistForm(form);
    const tab = "material_resources";
    const sub = "sustainable_building_materials";
    let score = 0;
    if (f.isYes(tab, sub, "option_salvage_materials")) {
      const v = f.num(tab, sub, "percent_salavged_material_used");
      if (v >= 5) score += 2;
      else if (v >= 2.5) score += 1;
    }
    if (f.isYes(tab, sub, "option_materials_with_recycled_content")) {
      const v = f.num(tab, sub, "percent_materials_with_recycled_content_used");
      if (v >= 20) score += 2;
      else if (v >= 10) score += 1;
    }
    if (f.isYes(tab, sub, "option_local_materials")) {
      const v = f.num(tab, sub, "percent_local_materials_used");
      if (v >= 30) score += 2;
      else if (v >= 20) score += 1;
    }
    if (f.isYes(tab, sub, "option_wood_based_materials")) {
      const v = f.num(tab, sub, "percent_certified_wood_used");
      if (v >= 75) score += 2;
      else if (v >= 50) score += 1;
    }
    return Math.min(score, 8);
  },
  "material_resources/organic_waste_management_post": (form) => {
    const v = new ChecklistForm(form).num(
      "material_resources",
      "organic_waste_management_post",
      "treated_onsite",
    );
    if (v >= 95) return 2;
    if (v >= 50) return 1;
    return 0;
  },
  "material_resources/waste_management_during_construction": (form) =>
    new ChecklistForm(form).existsChecked("material_resources", "waste_management_during_construction", [
      "waste_management_during_construction_narrative",
      "waste_management_yard",
    ])
      ? 2
      : 0,
  "material_resources/use_ecolabelled_products": (form) => {
    const c = new ChecklistForm(form).countChecked("material_resources", "use_ecolabelled_products", [
      "green_certified",
    ]);
    return Math.min(c, 5);
  },
  "indoor_enviornment_quality/co2_monitoring": (form) =>
    new ChecklistForm(form).existsChecked("indoor_enviornment_quality", "co2_monitoring", [
      "narrative_co2",
      "co2_sensors",
      "co2_control",
      "co2_commissioning",
    ])
      ? 1
      : 0,
  "indoor_enviornment_quality/daylighting_credit": (form) => {
    const f = new ChecklistForm(form);
    const tab = "indoor_enviornment_quality";
    const sub = "daylighting_credit";
    const approach = f.get(tab, sub, "select_approach_credit");
    const param =
      approach === "Simulation Approach"
        ? "total_compliant_reg_area2"
        : "total_compliant_reg_area";
    const v = f.num(tab, sub, param);
    if (v >= 95) return 2;
    if (v >= 50) return 1;
    return 0;
  },
  "indoor_enviornment_quality/outdoors_views": (form) =>
    new ChecklistForm(form).existsChecked("indoor_enviornment_quality", "outdoors_views", [
      "narrative_outdoor",
      "site_plan_outdoor",
      "floor_plan_outdoor",
      "section_outdoor",
      "photographs_outdoor",
    ])
      ? 1
      : 0,
  "indoor_enviornment_quality/minimise_indoor_outdoor_pollutants": (form) =>
    new ChecklistForm(form).existsChecked(
      "indoor_enviornment_quality",
      "minimise_indoor_outdoor_pollutants",
      [
        "narrative_pollutant",
        "entryway_systems",
        "exterior_smoking",
        "interior_smoking",
        "hvac_filtration",
        "green_housekeeping",
        "iaq_management_plan",
        "flush_out_procedure",
        "commissioning_iaq",
      ],
    )
      ? 1
      : 0,
  "indoor_enviornment_quality/low_emitting_materials": (form) => {
    const params = [
      "paints_coatings",
      "adhesives_sealants",
      "flooring",
      "composite_wood",
      "furniture",
    ];
    const c = new ChecklistForm(form).countChecked(
      "indoor_enviornment_quality",
      "low_emitting_materials",
      params,
    );
    if (c >= 3) return 3;
    if (c >= 2) return 2;
    if (c >= 1) return 1;
    return 0;
  },
  "indoor_enviornment_quality/quality_management_during_construction": (form) =>
    new ChecklistForm(form).existsChecked(
      "indoor_enviornment_quality",
      "quality_management_during_construction",
      ["narrative_iaq_construction", "iaq_management_during_construction"],
    )
      ? 1
      : 0,
  "innovation_exemplay_performance/innovation_one": (form) =>
    new ChecklistForm(form).existsChecked("innovation_exemplay_performance", "innovation_one", [
      "innova_one",
      "perfor_one",
      "narrative_one",
      "supporting_documents_one",
      "photographs_one",
    ])
      ? 1
      : 0,
  "innovation_exemplay_performance/innovation_two": (form) =>
    new ChecklistForm(form).existsChecked("innovation_exemplay_performance", "innovation_two", [
      "innova_two",
      "perfor_two",
      "narrative_two",
      "supporting_documents_two",
      "photographs_two",
    ])
      ? 1
      : 0,
  "innovation_exemplay_performance/innovation_three": (form) =>
    new ChecklistForm(form).existsChecked("innovation_exemplay_performance", "innovation_three", [
      "innova_three",
      "perfor_three",
      "narrative_three",
      "supporting_documents_three",
      "photographs_three",
    ])
      ? 1
      : 0,
  "innovation_exemplay_performance/innovation_four": (form) =>
    new ChecklistForm(form).existsChecked("innovation_exemplay_performance", "innovation_four", [
      "innova_four",
      "perfor_four",
      "narrative_four",
      "supporting_documents_four",
      "photographs_four",
    ])
      ? 1
      : 0,
  "innovation_exemplay_performance/igbc_accredited_professional": (form) =>
    new ChecklistForm(form).paramExists(
      "innovation_exemplay_performance",
      "igbc_accredited_professional",
      "certificate_igbcap",
    )
      ? 1
      : 0,
};

export function computeRating1ChecklistAttempted(
  form: CertificationFormResponse,
  tabSlug: string,
  subSlug: string,
  possiblePoints: number,
  ctx: ChecklistScoringContext,
): number | null {
  return runRegistry(REGISTRY, form, tabSlug, subSlug, possiblePoints, ctx);
}
