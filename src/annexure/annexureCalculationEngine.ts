import { evaluateExpr, formatAnnexNumber, type EvalCtx, type RowRecord } from "./annexureExprEval";
import type { AnnexureSchemaDefinition } from "./annexureTypes";

export type ComputedAnnexState = {
  rows: RowRecord[];
  scalar: Record<string, string>;
};

function emptyRow(schema: AnnexureSchemaDefinition): RowRecord {
  const r: RowRecord = {};
  for (const c of schema.table?.columns ?? []) {
    if (c.computed) continue;
    r[c.param] = "";
  }
  return r;
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

/** Load row arrays from `form.data` rows (Laravel-style one param per column, JSON array value). */
export function hydrateRowsFromForm(
  schema: AnnexureSchemaDefinition,
  getParam: (param: string) => string | undefined,
): RowRecord[] {
  const params = (schema.table?.columns ?? []).map((c) => c.param);
  const lens = params.map((p) => parseJsonArray(getParam(p)).length);
  const n = Math.max(
    schema.table.defaultRowCount ?? 5,
    ...lens,
    schema.table.minRows ?? 1,
  );
  const capped = schema.table.maxRows ? Math.min(n, schema.table.maxRows) : n;
  const rows: RowRecord[] = [];
  for (let i = 0; i < capped; i++) {
    const row = emptyRow(schema);
    for (const p of params) {
      const arr = parseJsonArray(getParam(p));
      if (arr[i] != null) row[p] = String(arr[i]);
    }
    rows.push(row);
  }
  return rows.length ? rows : [emptyRow(schema)];
}

export function hydrateScalarsFromForm(
  schema: AnnexureSchemaDefinition,
  getParam: (param: string) => string | undefined,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const p of schema.scalarParams ?? []) {
    out[p] = getParam(p) ?? "";
  }
  for (const step of schema.scalarPipeline ?? []) {
    if (!(step.set in out)) out[step.set] = "";
  }
  return out;
}

/** Run row pipeline then scalar pipeline (scalar may use sumRows over computed rows). */
export function runAnnexureCalculations(
  schema: AnnexureSchemaDefinition,
  rowsInput: RowRecord[],
  scalarInput: Record<string, string>,
  global: Record<string, string>,
): ComputedAnnexState {
  const rows = rowsInput.map((r) => ({ ...r }));

  const lookupMaps = schema.lookupMaps;

  const applyComputedValue = (v: string | number | boolean): string => {
    if (typeof v === "boolean") return v ? "1" : "0";
    if (typeof v === "number") return formatAnnexNumber(v);
    return String(v);
  };

  const runRowPipeline = (row: RowRecord) => {
    const ctxBase: EvalCtx = { row, rows, scalar: { ...scalarInput }, global, lookupMaps };
    for (const step of schema.rowPipeline ?? []) {
      const v = evaluateExpr(step.expr, { ...ctxBase, row });
      row[step.set] = applyComputedValue(v);
      ctxBase.row = row;
    }
  };

  for (const row of rows) {
    runRowPipeline(row);
  }

  const scalar = { ...scalarInput };
  for (const step of schema.scalarPipeline ?? []) {
    const ctx: EvalCtx = { row: {}, rows, scalar, global, lookupMaps };
    const v = evaluateExpr(step.expr, ctx);
    scalar[step.set] = applyComputedValue(v);
  }

  return { rows, scalar };
}

export function buildSavePayloadFromAnnex(
  schema: AnnexureSchemaDefinition,
  state: ComputedAnnexState,
): { paramName: string; type: string; value: string }[] {
  const fields: { paramName: string; type: string; value: string }[] = [];
  const params = (schema.table?.columns ?? []).map((c) => c.param);
  for (const p of params) {
    const arr = state.rows.map((r) => r[p] ?? "");
    fields.push({
      paramName: p,
      type: "t",
      value: JSON.stringify(arr),
    });
  }

  for (const p of schema.scalarParams ?? []) {
    fields.push({
      paramName: p,
      type: "t",
      value: state.scalar[p] ?? "",
    });
  }

  return fields;
}
