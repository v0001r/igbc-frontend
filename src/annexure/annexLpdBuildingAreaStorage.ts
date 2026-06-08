import type { AreaSourceRow } from "@/annexure/annexConditionedSpacesCalculations";
import {
  baselineForTypology,
  computeLpdBuildingAreaState,
  emptyLpdBuildingAreaRow,
  filterLpdAreaSourceRows,
  sqftToSqmLpd,
  type LpdBuildingAreaRow,
  type LpdBuildingAreaState,
  type LpdBuildingTypologyEntry,
} from "@/annexure/annexLpdBuildingAreaCalculations";
import { loadAreaSourceRows } from "@/annexure/annexConditionedSpacesStorage";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { CertificationFormResponse } from "@/lib/certificationForm";

const ROW_PARAMS = [
  "reqularly_occupied_spaces",
  "carpet_area_lpd",
  "lighting_fixture_type",
  "no_of_lighting_fixture",
  "wattage_of_each_lighting_fixture",
  "total_wattage_lpd",
] as const;

const SUB_PARAMS = [
  "lighting_fixture_type_sub",
  "no_of_lighting_fixture_sub",
  "wattage_of_each_lighting_fixture_sub",
  "total_wattage_lpd_sub",
] as const;

const SUMMARY_PARAMS = [
  "building_typology_lpd",
  "total_carpet_area_lpd",
  "total_wattage_lpd_building",
  "design_lpd_building",
  "baseline_lpd_building",
  "percentagelpd_reduction_building",
] as const;

function getParam(
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
  param: string,
): string | undefined {
  return (form.data ?? []).find((d) => d.tab === tab && d.subtab === subtab && d.paramName === param)?.value;
}

function parseJsonArray(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) ? v.map((x) => (x == null ? "" : String(x))) : [];
  } catch {
    return [];
  }
}

function parseSummaryScalar(raw: string | undefined, fallback = ""): string {
  const arr = parseJsonArray(raw);
  return arr[0] ?? fallback;
}

function parseNestedSubMap(raw: string | undefined): Record<string, string[]> {
  if (!raw?.trim()) return {};
  try {
    const v = JSON.parse(raw) as unknown;
    if (!v || typeof v !== "object" || Array.isArray(v)) return {};
    const out: Record<string, string[]> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      if (Array.isArray(val)) out[k] = val.map((x) => (x == null ? "" : String(x)));
      else if (val != null) out[k] = [String(val)];
    }
    return out;
  } catch {
    return {};
  }
}

function hydrateRows(
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
  sources: AreaSourceRow[],
): LpdBuildingAreaRow[] {
  const filtered = filterLpdAreaSourceRows(sources);
  const saved: Record<string, string[]> = {};
  for (const p of ROW_PARAMS) {
    saved[p] = parseJsonArray(getParam(form, tab, subtab, p));
  }

  const subType = parseNestedSubMap(getParam(form, tab, subtab, "lighting_fixture_type_sub"));
  const subQty = parseNestedSubMap(getParam(form, tab, subtab, "no_of_lighting_fixture_sub"));
  const subWatt = parseNestedSubMap(getParam(form, tab, subtab, "wattage_of_each_lighting_fixture_sub"));
  const subTotal = parseNestedSubMap(getParam(form, tab, subtab, "total_wattage_lpd_sub"));

  return filtered.map((src, displayIdx) => {
    const key = String(src.sourceIndex);
    const typeList = subType[key] ?? [];
    const qtyList = subQty[key] ?? [];
    const wattList = subWatt[key] ?? [];
    const totalList = subTotal[key] ?? [];
    const subLen = Math.max(typeList.length, qtyList.length, wattList.length, totalList.length);
    const subRows = [];
    for (let s = 0; s < subLen; s++) {
      subRows.push({
        lighting_fixture_type: typeList[s] ?? "",
        no_of_lighting_fixture: qtyList[s] ?? "",
        wattage_of_each_lighting_fixture: wattList[s] ?? "",
        total_wattage_lpd: totalList[s] ?? "",
      });
    }

    return {
      sourceIndex: src.sourceIndex,
      reqularly_occupied_spaces:
        saved.reqularly_occupied_spaces[displayIdx] || src.reqularly_occupied_spaces,
      carpet_area_lpd: saved.carpet_area_lpd[displayIdx] || sqftToSqmLpd(src.total_carpet_area_circulation),
      lighting_fixture_type: saved.lighting_fixture_type[displayIdx] ?? "",
      no_of_lighting_fixture: saved.no_of_lighting_fixture[displayIdx] ?? "",
      wattage_of_each_lighting_fixture: saved.wattage_of_each_lighting_fixture[displayIdx] ?? "",
      total_wattage_lpd: saved.total_wattage_lpd[displayIdx] ?? "",
      expanded: subRows.length > 0,
      subRows,
    };
  });
}

export function typologyCatalogFromSchema(schema: AnnexureSchemaDefinition): LpdBuildingTypologyEntry[] {
  const entries = schema.lpdBuildingAreaLayout?.typologyBaselines ?? [];
  return entries.map((e) => ({ slug: e.slug, label: e.label, baseline: e.baseline }));
}

export function defaultTypologySlug(
  catalog: LpdBuildingTypologyEntry[],
  topologyType?: string,
): string {
  const map = catalog.find((e) => e.slug === "office_building");
  if (topologyType === "1" && catalog.find((e) => e.slug === "banking_building")) {
    return "banking_building";
  }
  return map?.slug ?? catalog[0]?.slug ?? "office_building";
}

export function hydrateLpdBuildingAreaAnnex(
  schema: AnnexureSchemaDefinition,
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
  topologyType?: string,
): LpdBuildingAreaState {
  const catalog = typologyCatalogFromSchema(schema);
  const sources = loadAreaSourceRows(form);
  const rows = hydrateRows(form, tab, subtab, sources);

  const savedTypology = parseSummaryScalar(getParam(form, tab, subtab, "building_typology_lpd"));
  const building_typology_lpd =
    savedTypology || defaultTypologySlug(catalog, topologyType);

  const draft: LpdBuildingAreaState = {
    rows,
    building_typology_lpd,
    total_carpet_area_lpd: parseSummaryScalar(getParam(form, tab, subtab, "total_carpet_area_lpd")),
    total_wattage_lpd_building: parseSummaryScalar(
      getParam(form, tab, subtab, "total_wattage_lpd_building"),
    ),
    design_lpd_building: parseSummaryScalar(getParam(form, tab, subtab, "design_lpd_building")),
    baseline_lpd_building:
      parseSummaryScalar(getParam(form, tab, subtab, "baseline_lpd_building")) ||
      String(baselineForTypology(building_typology_lpd, catalog)),
    percentagelpd_reduction_building: parseSummaryScalar(
      getParam(form, tab, subtab, "percentagelpd_reduction_building"),
    ),
  };

  return computeLpdBuildingAreaState(draft, catalog);
}

export function buildSavePayloadFromLpdBuildingArea(state: LpdBuildingAreaState): {
  paramName: string;
  type: string;
  value: string;
}[] {
  const fields: { paramName: string; type: string; value: string }[] = [];

  for (const p of ROW_PARAMS) {
    fields.push({
      paramName: p,
      type: "t",
      value: JSON.stringify(state.rows.map((r) => (r as Record<string, string>)[p] ?? "")),
    });
  }

  const subType: Record<string, string[]> = {};
  const subQty: Record<string, string[]> = {};
  const subWatt: Record<string, string[]> = {};
  const subTotal: Record<string, string[]> = {};
  for (const row of state.rows) {
    if (!row.subRows.length) continue;
    const key = String(row.sourceIndex);
    subType[key] = row.subRows.map((s) => s.lighting_fixture_type);
    subQty[key] = row.subRows.map((s) => s.no_of_lighting_fixture);
    subWatt[key] = row.subRows.map((s) => s.wattage_of_each_lighting_fixture);
    subTotal[key] = row.subRows.map((s) => s.total_wattage_lpd);
  }

  fields.push({ paramName: "lighting_fixture_type_sub", type: "t", value: JSON.stringify(subType) });
  fields.push({ paramName: "no_of_lighting_fixture_sub", type: "t", value: JSON.stringify(subQty) });
  fields.push({
    paramName: "wattage_of_each_lighting_fixture_sub",
    type: "t",
    value: JSON.stringify(subWatt),
  });
  fields.push({ paramName: "total_wattage_lpd_sub", type: "t", value: JSON.stringify(subTotal) });

  for (const p of SUMMARY_PARAMS) {
    const val = state[p as keyof LpdBuildingAreaState] as string;
    fields.push({ paramName: p, type: "t", value: JSON.stringify([val]) });
  }

  return fields;
}

export { emptyLpdFixtureSubRow } from "@/annexure/annexLpdBuildingAreaCalculations";
export { loadAreaSourceRows };
