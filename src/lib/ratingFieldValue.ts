import type { GreenHomesFieldDef } from "@/lib/greenHomesConfig";
import { RatingDataIndex } from "@/lib/ratingDataIndex";
import type { CertificationFormResponse } from "@/lib/certificationForm";
import { isFileFieldType } from "@/lib/certificationForm";

export type FieldValueContext = {
  form: CertificationFormResponse;
  tab: string;
  subtab: string;
  /** Current tab slug (Laravel `$action`). */
  actionTab: string;
  localValues: Record<string, string>;
  index: RatingDataIndex;
};

function parseNum(v: string): number {
  const n = parseFloat(v.replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** Laravel `applicability_nweb` — landscape % of site area > 10%. */
function computeApplicabilityNweb(index: RatingDataIndex): string {
  const landscape = parseNum(
    index.getRelated("landscape_details_total_area_landscape", "sustainable_design"),
  );
  const landscapeBuiltup = parseNum(
    index.getRelated("landscape_details_builtup", "sustainable_design"),
  );
  const landscapeVertical = parseNum(
    index.getRelated("landscape_details_area_vertical_landscape", "sustainable_design"),
  );
  const totalArea = parseNum(index.getRelated("site_area", "sustainable_design"));
  if (totalArea <= 0) return "No";
  const pct = ((landscape + landscapeBuiltup + landscapeVertical) / totalArea) * 100;
  return pct > 10 ? "Yes" : "No";
}

type ComputedRule = (ctx: FieldValueContext, field: GreenHomesFieldDef) => string | null;

const COMPUTED_BY_NAME: Record<string, ComputedRule> = {
  applicability_nweb: (ctx) => computeApplicabilityNweb(ctx.index),
};

const MATERIAL_TAB_RELATED = new Set([
  "circulation_percent",
  "no_ecolablled_products",
  "capacity_of_on_site_renewable_vk",
  "capacity_of_off_site_renewable",
  "percentage_area_meeting_acoustic",
  "saving_percentage_space_method_lpd",
  "saving_percentage_building_method_lpd",
  "saving_percentage_building_method",
  "total_regularly_occupied_spaces_sensors",
  "area_percentage_credit",
  "status_gwp_credit_complince",
  "percent_waste_diverted",
  "fresh_air_mechanical_ventilation",
  "percentage_fresh_air_supplied",
  "percentage_regularly_area",
  "mandatory_fresh_air_requirement",
  "mandatoryechanced_fresh_air",
  "daylight_measurement_report",
  "percentage_regularly_occupied",
  "saving_percentage_space_method",
  "occupied_area_percentage",
  "capacity_percetage",
  "capacity_percetage_on_site",
]);

/**
 * Resolved display/edit value for a field (DB + local edits + related_to + named calculations).
 */
export function resolveFieldValue(
  field: GreenHomesFieldDef,
  ctx: FieldValueContext,
): { value: string; readonly: boolean; source: "local" | "section" | "related" | "computed" } {
  const name = field.name ?? "";
  if (!name) return { value: "", readonly: false, source: "section" };

  if (name in ctx.localValues) {
    return { value: ctx.localValues[name], readonly: field.readonly === true, source: "local" };
  }

  const computed = COMPUTED_BY_NAME[name];
  if (computed) {
    const v = computed(ctx, field);
    if (v != null) return { value: v, readonly: true, source: "computed" };
  }

  if (field.related_to) {
    let preferTab = ctx.actionTab;
    if (MATERIAL_TAB_RELATED.has(name) || name === "recreational_facilities" || name === "toilets_abled") {
      preferTab = "material_resources";
    }
    if (name === "capacity_on_site_renewable" || name === "capacity_on_site_renewable_on_site") {
      preferTab = "sustainable_design";
    }
    const useFirst = MATERIAL_TAB_RELATED.has(name);
    const related = useFirst
      ? ctx.index.getRelatedFirst(field.related_to, preferTab)
      : ctx.index.getRelated(field.related_to, preferTab);
    if (related !== "" || field.readonly) {
      return { value: related, readonly: true, source: "related" };
    }
  }

  if (isFileFieldType(field.type)) {
    const docs = ctx.index.documentNames(ctx.tab, ctx.subtab, name);
    return { value: docs, readonly: field.readonly === true, source: "section" };
  }

  const section = ctx.index.get(ctx.tab, ctx.subtab, name);
  return { value: section, readonly: field.readonly === true, source: "section" };
}

/** Whether this field should be included in PATCH save payload. */
export function shouldPersistField(field: GreenHomesFieldDef, ctx: FieldValueContext): boolean {
  const name = field.name ?? "";
  if (!name || field.type === "hr" || isFileFieldType(field.type)) return false;
  const resolved = resolveFieldValue(field, ctx);
  if (resolved.readonly && resolved.source !== "local") return false;
  return true;
}

export function createFieldValueContext(
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
  localValues: Record<string, string>,
): FieldValueContext {
  return {
    form,
    tab,
    subtab,
    actionTab: tab,
    localValues,
    index: new RatingDataIndex(form),
  };
}
