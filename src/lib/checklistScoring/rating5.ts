/**
 * Green Interiors — Laravel `__get_checklist_calculation` `$rating == 5`.
 */
import type { CertificationFormResponse } from "@/lib/certificationForm";
import { ChecklistForm, runRegistry } from "@/lib/checklistScoring/helpers";
import type { ChecklistScoringContext, ChecklistScorerRegistry } from "@/lib/checklistScoring/types";

function isTopology1(ctx: ChecklistScoringContext): boolean {
  return ctx.topology === 1;
}

function scoreGiWaterPlumbing(form: CertificationFormResponse, ctx: ChecklistScoringContext): number {
  const f = new ChecklistForm(form);
  const tab = "water_conservation";
  const sub = "water_efficent_plumbing_fixtures";
  const case1 = f.paramExists(tab, sub, "case_1_water_efficent");

  const saving = () =>
    f.numAnywhere("saving_percentage") ||
    f.num(tab, "annex_wc_two", "saving_percentage");

  if (case1) {
    const pct = saving();
    if (!Number.isFinite(pct)) return 0;
    if (isTopology1(ctx)) {
      if (pct >= 40) return 12;
      if (pct >= 37.5) return 11;
      if (pct >= 35) return 10;
      if (pct >= 32.5) return 9;
      if (pct >= 30) return 8;
      if (pct >= 27.5) return 7;
      if (pct >= 25) return 6;
      if (pct >= 22.5) return 5;
      if (pct >= 20) return 4;
      if (pct >= 17.5) return 3;
      if (pct >= 15) return 2;
      if (pct >= 12.5) return 1;
      if (pct >= 10) return 1;
      return 0;
    }
    if (pct >= 40) return 10;
    if (pct >= 37.5) return 9;
    if (pct >= 35) return 8;
    if (pct >= 32.5) return 7;
    if (pct >= 30) return 6;
    if (pct >= 27.5) return 5;
    if (pct >= 25) return 4;
    if (pct >= 22.5) return 3;
    if (pct >= 20) return 2;
    if (pct >= 17.5) return 1;
    if (pct >= 15) return 1;
    return 0;
  }

  const avg =
    f.num(tab, "annex_wc_one", "average") || f.num(tab, "annex_wc_two", "average");
  const rainfall =
    f.num(tab, "annex_wc_one", "avg_rainfall") || f.num(tab, "annex_wc_two", "avg_rainfall");
  if (!Number.isFinite(avg) || !Number.isFinite(rainfall)) return 0;

  const tier = (v: number, bands: [number, number][]): number => {
    for (const [min, pts] of [...bands].reverse()) {
      if (v >= min) return pts;
    }
    return 0;
  };

  if (isTopology1(ctx)) {
    if (avg <= 250) {
      return tier(rainfall, [
        [6.5, 2],
        [9, 4],
        [11.5, 6],
        [14, 8],
        [16.5, 10],
        [19, 12],
        [21.5, 12],
      ]);
    }
    if (avg <= 350) {
      return tier(rainfall, [
        [5.5, 2],
        [7.5, 4],
        [9.5, 6],
        [11.5, 8],
        [13.5, 10],
        [15.5, 12],
        [17.5, 12],
      ]);
    }
    if (avg <= 500) {
      return tier(rainfall, [
        [4.5, 2],
        [6, 4],
        [7.5, 6],
        [9, 8],
        [10.5, 10],
        [12, 12],
        [13.5, 12],
      ]);
    }
    if (avg <= 700) {
      return tier(rainfall, [
        [3.5, 2],
        [4.5, 4],
        [5.5, 6],
        [6.5, 8],
        [7.5, 10],
        [8.5, 12],
        [9.5, 12],
      ]);
    }
    return tier(rainfall, [
      [2.5, 2],
      [3, 4],
      [3.5, 6],
      [4, 8],
      [4.5, 10],
      [5, 12],
      [5.5, 12],
    ]);
  }

  if (avg <= 250) {
    return tier(rainfall, [
      [9, 2],
      [11.5, 4],
      [14, 6],
      [16.5, 8],
      [19, 10],
      [21.5, 10],
    ]);
  }
  if (avg <= 350) {
    return tier(rainfall, [
      [7.5, 2],
      [9.5, 4],
      [11.5, 6],
      [13.5, 8],
      [15.5, 10],
      [17.5, 10],
    ]);
  }
  if (avg <= 500) {
    return tier(rainfall, [
      [9, 2],
      [11.5, 4],
      [14, 6],
      [16.5, 8],
      [19, 10],
      [21.5, 10],
    ]);
  }
  if (avg <= 700) {
    return tier(rainfall, [
      [6, 2],
      [7.5, 4],
      [9, 6],
      [10.5, 8],
      [12, 10],
      [13.5, 10],
    ]);
  }
  return tier(rainfall, [
    [3, 2],
    [3.5, 4],
    [4, 6],
    [4.5, 8],
    [5, 10],
    [5.5, 10],
  ]);
}

const REGISTRY: ChecklistScorerRegistry = {
  "sustainable_design/optimise_spaces": (form) => {
    const v = new ChecklistForm(form).num(
      "material_resources",
      "area_space_circulation",
      "optimise_total_percentage",
    );
    if (v >= 30) return 2;
    if (v >= 25) return 1;
    return 0;
  },
  "sustainable_design/eco_friendly": (form) => {
    const f = new ChecklistForm(form);
    const pt = f.get("sustainable_design", "eco_friendly", "public_transport");
    if (pt === "1") {
      const d = f.num("sustainable_design", "eco_friendly", "distance_public_transport");
      if (Number.isFinite(d) && d <= 800) return 1;
    }
    if (pt === "2") return 1;
    return 0;
  },
  "sustainable_design/green_facility": (form) =>
    new ChecklistForm(form).strEq("sustainable_design", "green_facility", "compliances", "Yes")
      ? 1
      : 0,
  "sustainable_design/commercial_lease": (form) => {
    const f = new ChecklistForm(form);
    const lease = f.get("sustainable_design", "commercial_lease", "commercial_lease");
    if (!lease) return 0;
    if (lease === "1") {
      const t = f.num("sustainable_design", "commercial_lease", "lease_agreement_tenure");
      if (t >= 5) return 2;
      if (t >= 3) return 1;
      return 0;
    }
    return 2;
  },
  "sustainable_design/awareness_sustainability_concepts": (form) => {
    const f = new ChecklistForm(form);
    const tab = "sustainable_design";
    const sub = "awareness_sustainability_concepts";
    let score = 0;
    if (f.isYes(tab, sub, "display_permanent_signages")) {
      if (
        f.anyYes(tab, sub, [
          "narrative_display_permanent",
          "geotagged_photos_permanent_highlighting",
        ])
      ) {
        score += 1;
      }
    }
    if (f.isYes(tab, sub, "awareness_sessions")) {
      if (
        f.anyYes(tab, sub, [
          "narrative_awareness_sessions",
          "schedule_green_awareness_program",
          "attendance_record_program",
          "geotagged_photos_awareness_sessions",
        ])
      ) {
        score += 1;
      }
    }
    return score;
  },
  "sustainable_design/eco_vision": (form, _t, _s, ctx) => {
    const params = [
      "vernacular_architectural_elements",
      "health_wellbeing_of_occupants",
      "space_efficiency",
      "water_efficiency",
      "materials_and_resources",
      "passive_interior_architecture",
      "any_other_design_aspect",
    ];
    const count = new ChecklistForm(form).countFilled("sustainable_design", "eco_vision", params);
    if (isTopology1(ctx)) {
      if (count > 2) return 2;
      if (count === 2) return 1;
      return 0;
    }
    let total = 0;
    if (count === 1) total += 1;
    if (count === 2) total += 2;
    return total;
  },
  "water_conservation/water_efficent_plumbing_fixtures": (form, _t, _s, ctx) =>
    scoreGiWaterPlumbing(form, ctx),
  "water_conservation/repurposing_rejected_water": (form) => {
    const count = new ChecklistForm(form).countFilled("water_conservation", "repurposing_rejected_water", [
      "utilise_rejected_water_from_ac",
      "use_rejected_water_from_purifiers",
      "any_other_measure_rejected_water",
    ]);
    if (count === 2) return 2;
    if (count === 1) return 1;
    return 0;
  },
  "energy_efficency/eco_freindly_refrigerants": (form) =>
    new ChecklistForm(form).countFilled("energy_efficency", "eco_freindly_refrigerants", [
      "eco_freindly_refrigerant",
      "halons_free_fire_extinguisher",
    ]) === 2
      ? 1
      : 0,
  "energy_efficency/enahanced_eco_freindly_refrigrants": (form) => {
    const n = new ChecklistForm(form).jsonFirst(
      "energy_efficency",
      "annex_conditioned_spaces",
      "air_meeting_gwp",
    );
    return Number.isFinite(n) ? n : 0;
  },
  "energy_efficency/energy_efficent_appliances": (form) => {
    const n = new ChecklistForm(form).countFilled("energy_efficency", "energy_efficent_appliances", [
      "photocopiers",
      "refrigerators",
      "printers",
      "water_coolers",
      "ups",
      "coffee_vending_machines",
      "television",
      "fans",
      "ovens",
      "other",
    ]);
    return n >= 3 ? 1 : 0;
  },
  "energy_efficency/energy_efficent_lighting": (form) => {
    const f = new ChecklistForm(form);
    const tab = "energy_efficency";
    const sub = "energy_efficent_lighting";
    let total = 0;
    const method = f.get("project_details", "project_details", "projects_details_space_method");
    if (f.countFilled(tab, sub, ["lighting_power_density"]) > 0) {
      let reduction = NaN;
      if (method === "LPD Space Function Method") {
        reduction = f.jsonFirst(tab, "lpd_space_function_method", "total_regularly_occupied_area");
      } else {
        reduction = f.jsonFirst(tab, "lpd_building_area_method", "percentagelpd_reduction_building");
      }
      if (Number.isFinite(reduction)) {
        if (reduction > 30) total = 2;
        else if (reduction >= 25) total = 2;
        else if (reduction >= 20) total = 1;
      }
    }
    if (f.countFilled(tab, sub, ["Sensors"]) > 0) {
      const occ = f.num("sustainable_design", "area_space_circulation", "sensors_occupied_spaces");
      const non = f.num(
        "sustainable_design",
        "area_space_circulation",
        "non_regularly_occupied_area_sensors_percentage",
      );
      if (occ >= 75) total += 1;
      if (non >= 95) total += 1;
    }
    return total;
  },
  "energy_efficency/efficent_space_conditioning": (form, _t, _s, ctx) => {
    const f = new ChecklistForm(form);
    const tab = "energy_efficency";
    const sub = "efficent_space_conditioning";
    const topo1 = isTopology1(ctx);
    const nonAc = topo1
      ? f.paramExists(tab, sub, "non_air_conditioned_spaces")
      : f.isYes(tab, sub, "non_air_conditioned_spaces");
    const conditioned = topo1
      ? f.paramExists(tab, sub, "conditioned_spaces")
      : f.isYes(tab, sub, "conditioned_spaces");

    if (nonAc) {
      const caseVal = f.get(tab, sub, "case_for_energy_efficent_lighting");
      if (caseVal === "Door & window openings") {
        const pct = f.num(tab, sub, "area_percentage_credit");
        if (pct >= 10) return 5;
        if (pct >= 8) return 4;
        if (pct >= 7) return 3;
        if (pct >= 6) return 2;
        if (pct >= 5) return 1;
      }
      if (caseVal === "Alternate efficient cooling methods") {
        const carpet = f.num("project_details", "project_details", "total_carpet_area_sm");
        const minCarpet = topo1 ? 20 : 25;
        if (carpet >= 45) return 5;
        if (carpet >= 40) return 4;
        if (carpet >= 35) return 3;
        if (carpet >= 30) return 2;
        if (carpet >= minCarpet) return 1;
      }
    }
    if (conditioned) {
      if (topo1) {
        const pct = f.jsonFirst(tab, "annex_conditioned_spaces", "air_percentage_area");
        if (pct >= 75) return 6;
        if (pct >= 70) return 5;
        if (pct >= 65) return 4;
        if (pct >= 60) return 3;
        if (pct >= 55) return 2;
        if (pct >= 50) return 1;
      } else {
        const pct = f.num(tab, "annex_natural_venilation", "regularly_occupied_area_air");
        if (pct >= 75) return 5;
        if (pct >= 70) return 4;
        if (pct >= 65) return 3;
        if (pct >= 60) return 2;
        if (pct >= 10) return 1;
      }
    }
    return 0;
  },
  "energy_efficency/on_site_renewable_energy": (form) => {
    const f = new ChecklistForm(form);
    const tab = "energy_efficency";
    const sub = "on_site_renewable_energy";
    const annex = "annexure_onsite_renewable_energy";
    let total = 0;
    if (f.paramExists(tab, sub, "case_for_on_site_renewable")) {
      const v = f.num(tab, annex, "percentage_energy_consumption");
      if (v >= 14) total = 6;
      else if (v >= 12) total = 6;
      else if (v >= 10) total = 5;
      else if (v >= 8) total = 4;
      else if (v >= 6) total = 3;
      else if (v >= 4) total = 2;
      else if (v >= 2) total = 1;
    }
    if (f.paramExists(tab, sub, "case_for_off_site_renewable")) {
      const v = f.num(tab, annex, "percentage_energy_consumption_offsite");
      let off = 0;
      if (v >= 35) off = 6;
      else if (v >= 30) off = 5;
      else if (v >= 25) off = 4;
      else if (v >= 20) off = 3;
      else if (v >= 15) off = 2;
      else if (v >= 10) off = 1;
      else if (v >= 5) off = 1;
      total = Math.max(total, off);
    }
    if (
      f.paramExists(tab, sub, "case_for_on_site_renewable") &&
      f.paramExists(tab, sub, "case_for_off_site_renewable")
    ) {
      const v = f.num(tab, annex, "percentage_offsite_onsite");
      if (v >= 35) total = 6;
      else if (v >= 30) total = 5;
      else if (v >= 25) total = 4;
      else if (v >= 20) total = 3;
      else if (v >= 15) total = 2;
      else if (v >= 10) total = 1;
      else if (v >= 5) total = 1;
    }
    return total;
  },
  "energy_efficency/energy_metering_management": (form) => {
    const f = new ChecklistForm(form);
    const tab = "energy_efficency";
    const sub = "energy_metering_management";
    let total = 0;
    if (f.countFilled(tab, sub, ["sub_metering"]) > 0) {
      const c = f.countFilled(tab, sub, [
        "lighting_circuits",
        "power_back_up_systems",
        "btu_meter_chilled",
        "meters_renewable_energy",
        "other_major_equipment",
      ]);
      if (c >= 2) total += 2;
      else if (c === 1) total += 1;
    }
    if (f.countFilled(tab, sub, ["building_management_system"]) > 0) {
      const c = f.countFilled(tab, sub, [
        "lighting_management_system",
        "elevator_management_system",
        "fresh_air_monitoring_system",
        "co2_control_monitoring_system",
        "air_conditioning_management_system",
      ]);
      if (c >= 2) total += 2;
      else if (c === 1) total += 1;
    }
    return total;
  },
  "material_resources/waste_management_during_construction": (form, _t, _s, ctx) => {
    const v = new ChecklistForm(form).jsonFirst(
      "material_resources",
      "annexure_waste_management",
      "percentage_waste_diverted_landfill",
    );
    if (!Number.isFinite(v)) return 0;
    if (isTopology1(ctx)) {
      if (v > 80) return 3;
      if (v >= 60) return 3;
      if (v >= 40) return 2;
      if (v >= 20) return 1;
      return 0;
    }
    if (v > 80) return 2;
    if (v >= 60) return 2;
    if (v >= 40) return 1;
    return 0;
  },
  "material_resources/local_materials": (form, _t, _s, ctx) => {
    const v = new ChecklistForm(form).num(
      "material_resources",
      "annexure_master_material",
      "local_percent",
    );
    if (!Number.isFinite(v)) return 0;
    if (isTopology1(ctx)) {
      if (v > 60) return 4;
      if (v > 50) return 4;
      if (v > 40) return 3;
      if (v > 30) return 2;
      if (v >= 20) return 1;
      return 0;
    }
    if (v > 60) return 2;
    if (v > 50) return 2;
    if (v >= 40) return 1;
    return 0;
  },
  "material_resources/materials_with_recycled_content": (form, _t, _s, ctx) => {
    const f = new ChecklistForm(form);
    const tab = "material_resources";
    const sub = "materials_with_recycled_content";
    const type = f.get(tab, sub, "material_recycled");
    let total = 0;
    if (type === "Source recycled content materials") {
      const val = f.num(tab, sub, "percent_recycled_content_used_ver_two");
      if (isTopology1(ctx)) {
        if (val >= 30) return 4;
        if (val >= 25) return 4;
        if (val >= 20) return 3;
        if (val >= 15) return 2;
        if (val >= 10) return 1;
      } else {
        if (val >= 15) return 2;
        if (val >= 10) return 1;
      }
    }
    if (isTopology1(ctx) && type === "Source of type 1 eco-Labelled products") {
      const count = f.num(tab, sub, "no_type_eco_lablled_products");
      if (count >= 5) return 4;
      if (count === 4) return 4;
      if (count === 3) return 3;
      if (count === 2) return 2;
      if (count === 1) return 1;
    }
    return total;
  },
  "material_resources/use_of_ecolabelled_products": (form) => {
    const f = new ChecklistForm(form);
    const opt = f.get("material_resources", "use_of_ecolabelled_products", "case_options_ecolabbled_credit");
    if (opt === "1") {
      const n = f.num("material_resources", "annexure_master_material", "ecolablled_products");
      if (n >= 4) return 2;
      if (n >= 2) return 1;
    }
    if (opt === "2") {
      const p = f.num("material_resources", "annexure_master_material", "ecolablled_material_percent");
      if (p >= 15) return 2;
      if (p >= 10) return 1;
    }
    return 0;
  },
  "material_resources/use_of_salvaged_materials": (form) => {
    const v = new ChecklistForm(form).num(
      "material_resources",
      "annexure_master_material",
      "percent_salavged_used_ver_two",
    );
    if (v > 5) return 2;
    if (v >= 2.5) return 1;
    return 0;
  },
  "material_resources/use_of_reused_materials": (form) => {
    const v = new ChecklistForm(form).num("material_resources", "annexure_master_material", "reused_percent");
    return Number.isFinite(v) && v > 0 ? 1 : 0;
  },
  "material_resources/eco_friendly_wood_based_materials": (form, _t, _s, ctx) => {
    const v = new ChecklistForm(form).num("material_resources", "annexure_master_material", "wood_percent");
    if (!Number.isFinite(v)) return 0;
    if (isTopology1(ctx)) {
      if (v > 45) return 6;
      if (v > 40) return 6;
      if (v > 35) return 5;
      if (v > 30) return 4;
      if (v > 25) return 3;
      if (v > 20) return 2;
      if (v <= 20) return 1;
    }
    if (v > 45) return 4;
    if (v > 40) return 4;
    if (v > 35) return 3;
    if (v > 30) return 1;
    return 0;
  },
  "material_resources/eco_certified_interior_furniture": (form) => {
    const v = new ChecklistForm(form).num(
      "material_resources",
      "annexure_master_material",
      "alternate_material_percent",
    );
    if (v > 40) return 4;
    if (v > 30) return 3;
    if (v > 20) return 2;
    if (v <= 10) return 1;
    return 4;
  },
  "material_resources/life_cycle_assesment": (form) => {
    const c = new ChecklistForm(form).countFilled("material_resources", "life_cycle_assesment", [
      "embodied_carbon",
      "operational_carbon_building",
    ]);
    if (c === 2) return 2;
    if (c === 1) return 1;
    return 0;
  },
  "material_resources/purchase_of_green_consumables": (form, _t, _s, ctx) => {
    const params = [
      "recycled_paper_consumption",
      "eco_friendly_housekeeping_products",
      "no_use_of_plastics",
      "any_other_design_aspect",
    ];
    const c = new ChecklistForm(form).countFilled("material_resources", "purchase_of_green_consumables", params);
    if (isTopology1(ctx)) {
      if (c >= 3) return 3;
      if (c === 2) return 2;
      if (c === 1) return 1;
      return 0;
    }
    if (c >= 2) return 2;
    if (c === 1) return 1;
    return 0;
  },
  "indoor_enviornment_quality/enhanced_ventilation_interior": (form) => {
    const f = new ChecklistForm(form);
    const tab = "indoor_enviornment_quality";
    const sub = "minimum_fresh_air_requirements";
    let score = 0;
    if (f.isYes(tab, sub, "mechanical_ventilation")) {
      const pct = f.num(tab, sub, "percentage_fresh_air_supplied");
      if (pct >= 10) score = Math.max(score, 2);
      else if (pct >= 5) score = Math.max(score, 1);
    }
    if (f.isYes(tab, sub, "natural_ventilation")) {
      const area = f.num("project_details", "project_details", "regularly_occupied_area");
      const pct = f.num(tab, sub, "percentage_fresh_air_supplied");
      if (area < 150) {
        if (pct >= 8) score = Math.max(score, 2);
        else if (pct >= 6) score = Math.max(score, 1);
      } else {
        if (pct >= 8) score = Math.max(score, 2);
        else if (pct >= 10) score = Math.max(score, 1);
      }
    }
    return Math.min(score, 2);
  },
  "indoor_enviornment_quality/daylighting_credit": (form) => {
    const v = new ChecklistForm(form).jsonFirst(
      "indoor_enviornment_quality",
      "annex_daylight_noise",
      "base_total_consum_daylight",
    );
    if (!Number.isFinite(v)) return 0;
    if (v > 95) return 4;
    if (v >= 75) return 3;
    if (v >= 50) return 2;
    if (v >= 25) return 1;
    return 0;
  },
  "indoor_enviornment_quality/thermal_comfort": (form) =>
    new ChecklistForm(form).strEq(
      "indoor_enviornment_quality",
      "purchase_of_green_consumables",
      "daylighting_creditcompliancesyn",
      "Yes",
    )
      ? 1
      : 0,
  "indoor_enviornment_quality/ergonomic_design": (form) => {
    const c = new ChecklistForm(form).countFilled("indoor_enviornment_quality", "ergonomic_design", [
      "ergonomic_chairs",
      "height_adjustable_workstations",
      "monitor_arms",
      "other_ergonomically_adjustable",
    ]);
    if (c >= 2) return 2;
    if (c === 1) return 1;
    return 0;
  },
  "indoor_enviornment_quality/air_quality_monitoring": (form) => {
    const c = new ChecklistForm(form).countFilled("indoor_enviornment_quality", "air_quality_monitoring", [
      "daily_monitoring",
      "quarterly_monitoring",
    ]);
    if (c >= 2) return 2;
    if (c === 1) return 1;
    return 0;
  },
  "indoor_enviornment_quality/indoor_plants": (form) => {
    const v = new ChecklistForm(form).num(
      "indoor_enviornment_quality",
      "indoor_plants",
      "display_percentage_of_indoor_plants_provided",
    );
    if (v >= 95) return 2;
    if (v >= 50) return 1;
    return 0;
  },
  "indoor_enviornment_quality/material_acoustic_performance": (form) => {
    const c = new ChecklistForm(form).countFilled(
      "indoor_enviornment_quality",
      "material_acoustic_performance",
      ["system_ceiling", "system_floor", "criteria_noise"],
    );
    if (c === 3) return 3;
    if (c === 2) return 2;
    if (c === 1) return 1;
    return 0;
  },
  "indoor_enviornment_quality/outdoor_views": (form) => {
    const v = new ChecklistForm(form).num("indoor_enviornment_quality", "outdoor_views", "occupied_area_percentage");
    if (v >= 80) return 4;
    if (v >= 70) return 4;
    if (v >= 60) return 3;
    if (v >= 50) return 2;
    if (v >= 40) return 1;
    return 0;
  },
  "indoor_enviornment_quality/minimise_indoor_pollutant": (form, _t, _s, ctx) => {
    const params = [
      "fresh_air_supply_25_feet_away",
      "install_entryway_systems",
      "isolate_areas_exposed_hazardous_gases",
      "clean_air_conditioning_ducts_filters",
      "green_house_keeping_products",
    ];
    const c = new ChecklistForm(form).countFilled(
      "indoor_enviornment_quality",
      "minimise_indoor_pollutant",
      params,
    );
    if (isTopology1(ctx)) {
      if (c >= 2) return 2;
      if (c === 1) return 1;
      return 0;
    }
    return c >= 2 ? 1 : 0;
  },
  "indoor_enviornment_quality/low_emitting_materials": (form) => {
    const c = new ChecklistForm(form).countFilled("indoor_enviornment_quality", "low_emitting_materials", [
      "paints_coatings",
      "adhesives",
      "flooring_sys",
      "composite_wood",
    ]);
    return Math.min(c, 4);
  },
  "indoor_enviornment_quality/indoor_air_quality_management": (form, _t, _s, ctx) => {
    const params = [
      "scheduling_indoor_air",
      "electrical_mechan",
      "housekeeping_indoor_air",
      "isolate_clean_areas",
      "source_control",
    ];
    const c = new ChecklistForm(form).countFilled(
      "indoor_enviornment_quality",
      "indoor_air_quality_management",
      params,
    );
    if (isTopology1(ctx)) {
      if (c >= 2) return 2;
      if (c === 2) return 1;
      return 0;
    }
    return c >= 2 ? 1 : 0;
  },
  "indoor_enviornment_quality/interior_flush_out": (form) =>
    new ChecklistForm(form).strEq("indoor_enviornment_quality", "interior_flush_out", "interior_flush_out_yn", "Yes")
      ? 1
      : 0,
  "indoor_enviornment_quality/occupant_well_being_facilities": (form) => {
    const v = new ChecklistForm(form).num(
      "indoor_enviornment_quality",
      "occupant_well_being_facilities",
      "recreational_facilities",
    );
    if (v > 10) return 2;
    if (v >= 5) return 1;
    return 0;
  },
  "indoor_enviornment_quality/dedicated_dining_spaces": (form) =>
    new ChecklistForm(form).strEq(
      "indoor_enviornment_quality",
      "dedicated_dining_spaces",
      "compliances_environment_quality",
      "Yes",
    )
      ? 1
      : 0,
  "innovation_interior_design/innovation_one": (form) =>
    new ChecklistForm(form).paramExists("innovation_interior_design", "innovation_one", "select_innovation_one")
      ? 1
      : 0,
  "innovation_interior_design/innovation_two": (form) =>
    new ChecklistForm(form).paramExists("innovation_interior_design", "innovation_two", "select_innovation_two")
      ? 1
      : 0,
  "innovation_interior_design/innovation_three": (form) =>
    new ChecklistForm(form).paramExists("innovation_interior_design", "innovation_three", "select_innovation_three")
      ? 1
      : 0,
  "innovation_interior_design/innovation_four": (form) =>
    new ChecklistForm(form).paramExists("innovation_interior_design", "innovation_four", "select_innovation_four")
      ? 1
      : 0,
  "innovation_interior_design/igbc_accredited_professional": (form) =>
    new ChecklistForm(form).strEq(
      "innovation_interior_design",
      "igbc_accredited_professional",
      "compliances_accredited",
      "Yes",
    )
      ? 1
      : 0,
};

export function computeRating5ChecklistAttempted(
  form: CertificationFormResponse,
  tabSlug: string,
  subSlug: string,
  possiblePoints: number,
  ctx: ChecklistScoringContext,
): number | null {
  return runRegistry(REGISTRY, form, tabSlug, subSlug, possiblePoints, ctx);
}
