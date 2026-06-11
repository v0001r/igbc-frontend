import {
  ALTERNATIVE_PERFORMANCE_FOOTER_PARAMS,
  ALTERNATIVE_PERFORMANCE_ROW_COMPUTED_PARAMS,
  ALTERNATIVE_PERFORMANCE_ROW_INPUT_PARAMS,
  computeExistingAlternativePerformanceState,
  emptyAlternativePerformanceFooter,
  emptyAlternativePerformanceRow,
  type AlternativePerformanceRow,
  type ExistingAlternativePerformanceState,
} from "@/annexure/annexExistingAlternativePerformanceCalculations";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { CertificationFormResponse } from "@/lib/certificationForm";

const ALL_ROW_PARAMS = [
  ...ALTERNATIVE_PERFORMANCE_ROW_INPUT_PARAMS,
  ...ALTERNATIVE_PERFORMANCE_ROW_COMPUTED_PARAMS,
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

function resolveRowCount(arrays: string[][], minRows: number): number {
  const maxLen = arrays.reduce((max, arr) => Math.max(max, arr.length), 0);
  return Math.max(minRows, maxLen || minRows);
}

export function hydrateExistingAlternativePerformanceAnnex(
  schema: AnnexureSchemaDefinition,
  form: CertificationFormResponse,
  tab: string,
  subtab: string,
): ExistingAlternativePerformanceState {
  const minRows = schema.existingAlternativePerformanceLayout?.minRows ?? 5;

  const saved: Record<(typeof ALL_ROW_PARAMS)[number], string[]> = {} as Record<
    (typeof ALL_ROW_PARAMS)[number],
    string[]
  >;
  for (const p of ALL_ROW_PARAMS) {
    saved[p] = parseJsonArray(getParam(form, tab, subtab, p));
  }

  const rowCount = resolveRowCount(Object.values(saved), minRows);
  const rows: AlternativePerformanceRow[] = Array.from({ length: rowCount }, (_, i) => {
    const row = emptyAlternativePerformanceRow();
    for (const p of ALL_ROW_PARAMS) {
      row[p] = saved[p][i] ?? "";
    }
    return row;
  });

  const footer = emptyAlternativePerformanceFooter();
  for (const p of ALTERNATIVE_PERFORMANCE_FOOTER_PARAMS) {
    footer[p] = parseScalar(getParam(form, tab, subtab, p), "0.00");
  }

  return computeExistingAlternativePerformanceState({ rows, footer });
}

export function buildSavePayloadFromExistingAlternativePerformance(
  state: ExistingAlternativePerformanceState,
): { paramName: string; type: string; value: string }[] {
  const computed = computeExistingAlternativePerformanceState(state);
  const fields: { paramName: string; type: string; value: string }[] = [];

  for (const param of ALL_ROW_PARAMS) {
    fields.push({
      paramName: param,
      type: "t",
      value: JSON.stringify(computed.rows.map((r) => r[param])),
    });
  }

  for (const param of ALTERNATIVE_PERFORMANCE_FOOTER_PARAMS) {
    fields.push({
      paramName: param,
      type: "t",
      value: computed.footer[param],
    });
  }

  return fields;
}
