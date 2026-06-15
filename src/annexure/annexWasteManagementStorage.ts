import {
  computeWasteManagementState,
  loadWasteMaterialSourceRows,
  materialLabelFromSource,
  mergeWasteRowsFromSource,
  type WasteManagementState,
} from "@/annexure/annexWasteManagementCalculations";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { CertificationFormResponse } from "@/lib/certificationForm";

const ROW_PARAMS = ["generated", "generated_proj", "reused", "recycle_used", "sent_landfill"] as const;
const MATERIAL_PARAMS = ["sub_category", "other_sub_catg"] as const;

const SUMMARY_PARAMS = [
  "total_generated_waste",
  "total_reused_project",
  "total_reused_recycle_vendor",
  "total_reused_donated_proj",
  "total_sent_landfil",
  "percentage_waste_diverted_landfill",
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
    return String(v);
  } catch {
    return raw;
  }
}

function loadMaterialSources(form: CertificationFormResponse, schema: AnnexureSchemaDefinition) {
  const src = schema.wasteManagementLayout?.sourceAnnex;
  const tab = src?.tab ?? "material_resources";
  const subtab = src?.subtab ?? "annexure_master_material";
  const mode = src?.materialSourceMode ?? "subCategory";

  if (mode === "freeText") {
    const materialField = src?.materialField ?? "one_materials";
    const materials = parseJsonArray(getParam(form, tab, subtab, materialField));
    return loadWasteMaterialSourceRows(materials, []);
  }

  const materialField = src?.materialField ?? "sub_category";
  const otherField = src?.otherMaterialField ?? "other_sub_catg";
  const srcTab = src?.tab ?? "material_resources";
  const srcSubtab = src?.subtab ?? "annexure_master_material";
  const rows = loadWasteMaterialSourceRows(
    parseJsonArray(getParam(form, srcTab, srcSubtab, materialField)),
    parseJsonArray(getParam(form, srcTab, srcSubtab, otherField)),
  );
  const rowCountField = src?.rowCountField;
  if (!rowCountField) return rows;

  const countLen = parseJsonArray(getParam(form, srcTab, srcSubtab, rowCountField)).length;
  if (countLen <= rows.length) return rows;

  const padded = [...rows];
  while (padded.length < countLen) {
    padded.push({
      sourceIndex: padded.length + 1,
      sub_category: "",
      other_sub_catg: "",
    });
  }
  return padded;
}

export function hydrateWasteManagementAnnex(
  schema: AnnexureSchemaDefinition,
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
): WasteManagementState {
  const minRows = schema.wasteManagementLayout?.minRows ?? 5;
  const materialOptions = schema.wasteManagementLayout?.materialOptions ?? {};
  const sources = loadMaterialSources(form, schema);

  const saved: Record<(typeof ROW_PARAMS)[number], string[]> = {} as Record<
    (typeof ROW_PARAMS)[number],
    string[]
  >;
  for (const p of ROW_PARAMS) {
    saved[p] = parseJsonArray(getParam(form, tab, subtab, p));
  }

  const savedMaterial: Record<(typeof MATERIAL_PARAMS)[number], string[]> = {} as Record<
    (typeof MATERIAL_PARAMS)[number],
    string[]
  >;
  for (const p of MATERIAL_PARAMS) {
    savedMaterial[p] = parseJsonArray(getParam(form, tab, subtab, p));
  }

  const emptyRows = mergeWasteRowsFromSource(sources, [], minRows, materialOptions);
  const rows = emptyRows.map((base, idx) => {
    const sub_category =
      savedMaterial.sub_category.length > idx ? savedMaterial.sub_category[idx] : base.sub_category;
    const other_sub_catg =
      savedMaterial.other_sub_catg.length > idx
        ? savedMaterial.other_sub_catg[idx]
        : base.other_sub_catg;
    return {
      ...base,
      sub_category,
      other_sub_catg,
      material_description: materialLabelFromSource(
        {
          sourceIndex: base.sourceIndex,
          sub_category,
          other_sub_catg,
        },
        materialOptions,
      ),
      generated: saved.generated[idx] ?? "",
      generated_proj: saved.generated_proj[idx] ?? "",
      reused: saved.reused[idx] ?? "",
      recycle_used: saved.recycle_used[idx] ?? "",
      sent_landfill: saved.sent_landfill[idx] ?? "0.00",
    };
  });

  const draft: WasteManagementState = {
    waste_unit: parseScalar(getParam(form, tab, subtab, "waste_unit")),
    rows,
    total_generated_waste: parseScalar(getParam(form, tab, subtab, "total_generated_waste")),
    total_reused_project: parseScalar(getParam(form, tab, subtab, "total_reused_project")),
    total_reused_recycle_vendor: parseScalar(
      getParam(form, tab, subtab, "total_reused_recycle_vendor"),
    ),
    total_reused_donated_proj: parseScalar(getParam(form, tab, subtab, "total_reused_donated_proj")),
    total_sent_landfil: parseScalar(getParam(form, tab, subtab, "total_sent_landfil")),
    percentage_waste_diverted_landfill: parseScalar(
      parseJsonArray(getParam(form, tab, subtab, "percentage_waste_diverted_landfill"))[0] ??
        getParam(form, tab, subtab, "percentage_waste_diverted_landfill"),
    ),
  };

  return computeWasteManagementState(draft);
}

export function buildSavePayloadFromWasteManagement(state: WasteManagementState): {
  paramName: string;
  type: string;
  value: string;
}[] {
  const fields: { paramName: string; type: string; value: string }[] = [];

  fields.push({ paramName: "waste_unit", type: "t", value: state.waste_unit });

  for (const p of [...MATERIAL_PARAMS, ...ROW_PARAMS]) {
    fields.push({
      paramName: p,
      type: "t",
      value: JSON.stringify(
        state.rows.map((r) => (r as unknown as Record<string, string>)[p] ?? ""),
      ),
    });
  }

  for (const p of SUMMARY_PARAMS) {
    const val = state[p as keyof WasteManagementState] as string;
    fields.push({ paramName: p, type: "t", value: JSON.stringify([val]) });
  }

  return fields;
}

export { loadMaterialSources };
