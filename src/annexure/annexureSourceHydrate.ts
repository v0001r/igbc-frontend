import type { AnnexureSchemaDefinition, AnnexureSourceAnnexDef } from "@/annexure/annexureTypes";
import type { CertificationFormResponse } from "@/lib/certificationForm";
import type { RowRecord } from "@/annexure/annexureExprEval";

type DwellingMap = Record<string, string | string[]>;

function getParamValue(
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
  param: string,
): string | undefined {
  return (form.data ?? []).find((d) => d.tab === tab && d.subtab === subtab && d.paramName === param)?.value;
}

function parseDwellingMap(raw: string | undefined): DwellingMap {
  if (!raw?.trim()) return {};
  try {
    const v = JSON.parse(raw) as unknown;
    if (v && typeof v === "object" && !Array.isArray(v)) return v as DwellingMap;
  } catch {
    /* legacy plain string */
  }
  return { "1": raw };
}

function mapToOrderedValues(map: DwellingMap): string[] {
  const keys = Object.keys(map)
    .map((k) => parseInt(k, 10))
    .filter((n) => Number.isFinite(n) && n > 0)
    .sort((a, b) => a - b);
  return keys.map((k) => {
    const v = map[String(k)];
    if (Array.isArray(v)) return String(v[0] ?? "");
    return v != null ? String(v) : "";
  });
}

function parseJsonArray(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) ? v.map((x) => (x === null || x === undefined ? "" : String(x))) : [];
  } catch {
    return [];
  }
}

function emptyRow(schema: AnnexureSchemaDefinition): RowRecord {
  const r: RowRecord = {};
  for (const c of schema.table?.columns ?? []) {
    if (c.computed) continue;
    r[c.param] = "";
  }
  return r;
}

/** Merge rows from `sourceAnnex` (Annex RHW 1.1) with saved Annex RHW 1.2 data. */
export function hydrateRowsWithSourceAnnex(
  schema: AnnexureSchemaDefinition,
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
  getParam: (param: string) => string | undefined,
): RowRecord[] {
  const source = schema.sourceAnnex;
  if (!source) {
    return hydrateRowsSimple(schema, getParam);
  }

  const sourceTab = source.tab ?? tab;
  const sourceSubtab = source.subtab;

  const sourceMaps: Record<string, string[]> = {};
  for (const m of source.mappings) {
    const raw = getParamValue(form, sourceTab, sourceSubtab, m.source);
    sourceMaps[m.target] = mapToOrderedValues(parseDwellingMap(raw));
  }

  const rowCount = Math.max(
    ...Object.values(sourceMaps).map((a) => a.length),
    ...source.mappings
      .map((m) => parseJsonArray(getParam(m.target)).length)
      .filter((n) => n > 0),
    0,
  );

  const n = rowCount > 0 ? rowCount : schema.table?.defaultRowCount ?? 1;
  const rows: RowRecord[] = [];

  for (let i = 0; i < n; i++) {
    const row = emptyRow(schema);
    for (const m of source.mappings) {
      const savedArr = parseJsonArray(getParam(m.target));
      const sourceVal = sourceMaps[m.target]?.[i] ?? "";
      const savedVal = savedArr[i] ?? "";

      if (m.readonly) {
        row[m.target] = sourceVal;
        continue;
      }

      if (m.prefillOnly) {
        row[m.target] = savedVal !== "" ? savedVal : sourceVal;
      } else {
        row[m.target] = savedVal !== "" ? savedVal : sourceVal;
      }
    }

    for (const c of schema.table?.columns ?? []) {
      if (source.mappings.some((m) => m.target === c.param)) continue;
      const arr = parseJsonArray(getParam(c.param));
      if (arr[i] != null) row[c.param] = String(arr[i]);
    }

    rows.push(row);
  }

  return rows.length ? rows : [emptyRow(schema)];
}

function hydrateRowsSimple(
  schema: AnnexureSchemaDefinition,
  getParam: (param: string) => string | undefined,
): RowRecord[] {
  const params = (schema.table?.columns ?? []).map((c) => c.param);
  const lens = params.map((p) => parseJsonArray(getParam(p)).length);
  const n = Math.max(schema.table?.defaultRowCount ?? 1, ...lens, schema.table?.minRows ?? 1);
  const rows: RowRecord[] = [];
  for (let i = 0; i < n; i++) {
    const row = emptyRow(schema);
    for (const p of params) {
      const arr = parseJsonArray(getParam(p));
      if (arr[i] != null) row[p] = String(arr[i]);
    }
    rows.push(row);
  }
  return rows.length ? rows : [emptyRow(schema)];
}

export function sourceAnnexSignature(
  form: CertificationFormResponse,
  source: AnnexureSourceAnnexDef | undefined,
  tab: string,
): string {
  if (!source) return "";
  const sourceTab = source.tab ?? tab;
  return JSON.stringify(
    (form.data ?? [])
      .filter((d) => d.tab === sourceTab && d.subtab === source.subtab)
      .map((d) => [d.paramName, d.value])
      .sort((a, b) => String(a[0]).localeCompare(String(b[0]))),
  );
}
