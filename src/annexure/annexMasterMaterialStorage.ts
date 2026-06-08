import {
  computeMasterMaterialState,
  emptyMasterMaterialRow,
  type MasterMaterialRow,
  type MasterMaterialState,
} from "@/annexure/annexMasterMaterialCalculations";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { CertificationFormResponse } from "@/lib/certificationForm";

const ROW_PARAMS = [
  "one_materials_master",
  "other_material_input",
  "sub_category",
  "other_sub_catg",
  "quantity",
  "unit",
  "rates",
  "total_rates",
  "manufacture_details",
  "manufacture_location",
  "distance",
  "total_cost_material",
  "salvaged",
  "salvaged_cost",
  "reuse_material",
  "reuse_cost",
  "ecolablled",
  "ecolablled_cost",
  "recycled",
  "recycled_cost",
  "woodbased_material",
  "composite_wood",
  "woodbased_cost_rapid",
  "alternative_material",
  "alternative_material_cost",
] as const;

const SUMMARY_PARAMS = [
  "total_material_cost",
  "total_procured_cost",
  "total_salvage_cost",
  "total_resued_cost",
  "total_ecolabled_cost",
  "total_recycled_cost",
  "total_renewable_cost",
  "total_wood_cost",
  "total_alternative_cost",
  "local_percent",
  "recycled_percent",
  "ecolablled_products",
  "ecolablled_material_percent",
  "salvage_percent",
  "reused_percent",
  "wood_percent",
  "alternate_material_percent",
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

function parseScalar(raw: string | undefined, fallback = ""): string {
  if (!raw?.trim()) return fallback;
  try {
    const v = JSON.parse(raw) as unknown;
    if (Array.isArray(v)) return v[0] != null ? String(v[0]) : fallback;
  } catch {
    return raw;
  }
  return raw;
}

export function hydrateMasterMaterialAnnex(
  schema: AnnexureSchemaDefinition,
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
): MasterMaterialState {
  const minRows = schema.masterMaterialLayout?.minRows ?? 5;
  const localDistanceMaxKm = schema.masterMaterialLayout?.localDistanceMaxKm ?? 500;

  const saved: Record<(typeof ROW_PARAMS)[number], string[]> = {} as Record<
    (typeof ROW_PARAMS)[number],
    string[]
  >;
  for (const p of ROW_PARAMS) {
    saved[p] = parseJsonArray(getParam(form, tab, subtab, p));
  }

  const savedLen = Math.max(...ROW_PARAMS.map((p) => saved[p].length), 0);
  const targetLen = Math.max(savedLen, minRows);
  const rows: MasterMaterialRow[] = [];

  for (let i = 0; i < targetLen; i++) {
    const pick = (p: (typeof ROW_PARAMS)[number]) => saved[p][i] ?? "";
    rows.push({
      rowId: i + 1,
      one_materials_master: pick("one_materials_master"),
      other_material_input: pick("other_material_input"),
      sub_category: pick("sub_category"),
      other_sub_catg: pick("other_sub_catg"),
      quantity: pick("quantity"),
      unit: pick("unit"),
      rates: pick("rates"),
      total_rates: pick("total_rates"),
      manufacture_details: pick("manufacture_details"),
      manufacture_location: pick("manufacture_location"),
      distance: pick("distance"),
      total_cost_material: pick("total_cost_material"),
      salvaged: pick("salvaged"),
      salvaged_cost: pick("salvaged_cost"),
      reuse_material: pick("reuse_material"),
      reuse_cost: pick("reuse_cost"),
      ecolablled: pick("ecolablled"),
      ecolablled_cost: pick("ecolablled_cost"),
      recycled: pick("recycled"),
      recycled_cost: pick("recycled_cost"),
      woodbased_material: pick("woodbased_material"),
      composite_wood: pick("composite_wood"),
      woodbased_cost_rapid: pick("woodbased_cost_rapid"),
      alternative_material: pick("alternative_material"),
      alternative_material_cost: pick("alternative_material_cost"),
    });
  }

  const draft: MasterMaterialState = {
    rows,
    total_material_cost: parseScalar(getParam(form, tab, subtab, "total_material_cost")),
    total_procured_cost: parseScalar(getParam(form, tab, subtab, "total_procured_cost")),
    total_salvage_cost: parseScalar(getParam(form, tab, subtab, "total_salvage_cost")),
    total_resued_cost: parseScalar(getParam(form, tab, subtab, "total_resued_cost")),
    total_ecolabled_cost: parseScalar(getParam(form, tab, subtab, "total_ecolabled_cost")),
    total_recycled_cost: parseScalar(getParam(form, tab, subtab, "total_recycled_cost")),
    total_renewable_cost: parseScalar(getParam(form, tab, subtab, "total_renewable_cost")),
    total_wood_cost: parseScalar(getParam(form, tab, subtab, "total_wood_cost")),
    total_alternative_cost: parseScalar(getParam(form, tab, subtab, "total_alternative_cost")),
    local_percent: parseScalar(getParam(form, tab, subtab, "local_percent")),
    recycled_percent: parseScalar(getParam(form, tab, subtab, "recycled_percent")),
    ecolablled_products: parseScalar(getParam(form, tab, subtab, "ecolablled_products")),
    ecolablled_material_percent: parseScalar(
      getParam(form, tab, subtab, "ecolablled_material_percent"),
    ),
    salvage_percent: parseScalar(getParam(form, tab, subtab, "salvage_percent")),
    reused_percent: parseScalar(getParam(form, tab, subtab, "reused_percent")),
    wood_percent: parseScalar(getParam(form, tab, subtab, "wood_percent")),
    alternate_material_percent: parseScalar(
      getParam(form, tab, subtab, "alternate_material_percent"),
    ),
  };

  return computeMasterMaterialState(draft, localDistanceMaxKm);
}

export function buildSavePayloadFromMasterMaterial(state: MasterMaterialState): {
  paramName: string;
  type: string;
  value: string;
}[] {
  const fields: { paramName: string; type: string; value: string }[] = [];

  for (const p of ROW_PARAMS) {
    fields.push({
      paramName: p,
      type: "t",
      value: JSON.stringify(
        state.rows.map((r) => (r as unknown as Record<string, string>)[p] ?? ""),
      ),
    });
  }

  for (const p of SUMMARY_PARAMS) {
    const val = state[p as keyof MasterMaterialState] as string;
    fields.push({ paramName: p, type: "t", value: JSON.stringify([val]) });
  }

  return fields;
}

export { emptyMasterMaterialRow };
