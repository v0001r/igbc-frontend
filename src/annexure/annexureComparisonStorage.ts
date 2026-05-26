import type { AnnexureComparisonLayoutDef, AnnexureSchemaDefinition } from "@/annexure/annexureTypes";

export type ComparisonValues = Record<string, string>;

function parseJsonArray(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) ? v.map((x) => (x === null || x === undefined ? "" : String(x))) : [];
  } catch {
    return [];
  }
}

export function listComparisonParams(schema: AnnexureSchemaDefinition): string[] {
  if (schema.comparisonParams?.length) return schema.comparisonParams;
  const layout = schema.comparisonLayout;
  if (!layout) return [];
  const out: string[] = [];
  for (const section of layout.sections) {
    for (const row of section.rows) {
      out.push(row.baseParam, row.designParam);
    }
  }
  return [...new Set(out)];
}

/** Laravel stores each field as a JSON array; MERN uses index 0 (defaultRowCount: 1). */
export function hydrateComparisonFromForm(
  schema: AnnexureSchemaDefinition,
  getParam: (param: string) => string | undefined,
  rowIndex = 0,
): ComparisonValues {
  const values: ComparisonValues = {};
  for (const p of listComparisonParams(schema)) {
    const arr = parseJsonArray(getParam(p));
    values[p] = arr[rowIndex] ?? "";
  }
  return values;
}

export function buildSavePayloadFromComparison(
  schema: AnnexureSchemaDefinition,
  values: ComparisonValues,
): { paramName: string; type: string; value: string }[] {
  return listComparisonParams(schema).map((p) => ({
    paramName: p,
    type: "t",
    value: JSON.stringify([values[p] ?? ""]),
  }));
}

export function getComparisonLayout(schema: AnnexureSchemaDefinition): AnnexureComparisonLayoutDef {
  if (!schema.comparisonLayout?.sections?.length) {
    throw new Error(`Annexure ${schema.id} is missing comparisonLayout`);
  }
  return schema.comparisonLayout;
}
