/**
 * Evaluates `AnnexureExpr` trees for config-driven annexures.
 * Refs: `row:field`, `scalar:key`, `global:key` (from parent form values).
 */

import type { AnnexureExpr } from "./annexureTypes";

export type RowRecord = Record<string, string>;
export type EvalCtx = {
  row: RowRecord;
  rows: RowRecord[];
  scalar: Record<string, string>;
  global: Record<string, string>;
  lookupMaps?: Record<string, Record<string, number>>;
};

function num(s: string | undefined): number {
  const n = parseFloat(String(s ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function str(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v);
}

function isEmptyish(s: string): boolean {
  return s.trim() === "";
}

export function evaluateExpr(e: AnnexureExpr, ctx: EvalCtx): string | number | boolean {
  if ("const" in e) {
    return e.const;
  }
  if ("ref" in e) {
    const r = e.ref;
    if (r.startsWith("row:")) {
      return ctx.row[r.slice(4)] ?? "";
    }
    if (r.startsWith("scalar:")) {
      return ctx.scalar[r.slice(7)] ?? "";
    }
    if (r.startsWith("global:")) {
      return ctx.global[r.slice(7)] ?? "";
    }
    return "";
  }

  const op = (e as { op: string }).op;
  switch (op) {
    case "parseNum": {
      const x = e as { op: "parseNum"; arg: AnnexureExpr };
      return num(str(evaluateExpr(x.arg, ctx)));
    }
    case "isEmpty": {
      const x = e as { op: "isEmpty"; arg: AnnexureExpr };
      return isEmptyish(str(evaluateExpr(x.arg, ctx)));
    }
    case "neg": {
      const x = e as { op: "neg"; arg: AnnexureExpr };
      return -num(str(evaluateExpr(x.arg, ctx)));
    }
    case "add":
    case "sub":
    case "mul":
    case "div": {
      const x = e as { op: "add" | "sub" | "mul" | "div"; args: AnnexureExpr[] };
      const vals = x.args.map((a) => num(str(evaluateExpr(a, ctx))));
      if (!vals.length) return 0;
      if (x.op === "add") return vals.reduce((a, b) => a + b, 0);
      if (x.op === "sub") {
        if (!vals.length) return 0;
        const [first, ...rest] = vals;
        return rest.reduce((acc, b) => acc - b, first ?? 0);
      }
      if (x.op === "mul") return vals.reduce((a, b) => a * b, 1);
      if (!vals.length) return 0;
      const [d0, ...drest] = vals;
      return drest.reduce((acc, b) => (b === 0 ? acc : acc / b), d0 ?? 0);
    }
    case "min": {
      const x = e as { op: "min"; args: AnnexureExpr[] };
      const vals = x.args.map((a) => num(str(evaluateExpr(a, ctx))));
      return vals.length ? Math.min(...vals) : 0;
    }
    case "eq":
    case "neq":
    case "lt":
    case "lte":
    case "gt":
    case "gte": {
      const x = e as {
        op: "eq" | "neq" | "lt" | "lte" | "gt" | "gte";
        left: AnnexureExpr;
        right: AnnexureExpr;
      };
      const L = evaluateExpr(x.left, ctx);
      const R = evaluateExpr(x.right, ctx);
      const ln = num(str(L));
      const rn = num(str(R));
      const ls = str(L);
      const rs = str(R);
      const useNum = Number.isFinite(ln) && Number.isFinite(rn) && ls !== "" && rs !== "";
      switch (x.op) {
        case "eq":
          return useNum ? ln === rn : ls === rs;
        case "neq":
          return useNum ? ln !== rn : ls !== rs;
        case "lt":
          return ln < rn;
        case "lte":
          return ln <= rn;
        case "gt":
          return ln > rn;
        case "gte":
          return ln >= rn;
        default:
          return false;
      }
    }
    case "and":
    case "or": {
      const x = e as { op: "and" | "or"; args: AnnexureExpr[] };
      const bools = x.args.map((a) => Boolean(evaluateExpr(a, ctx)));
      return x.op === "and" ? bools.every(Boolean) : bools.some(Boolean);
    }
    case "not": {
      const x = e as { op: "not"; arg: AnnexureExpr };
      return !Boolean(evaluateExpr(x.arg, ctx));
    }
    case "if": {
      const x = e as { op: "if"; cond: AnnexureExpr; then: AnnexureExpr; else: AnnexureExpr };
      return evaluateExpr(Boolean(evaluateExpr(x.cond, ctx)) ? x.then : x.else, ctx);
    }
    case "sumRows": {
      const x = e as { op: "sumRows"; field: string };
      return ctx.rows.reduce((s, r) => s + num(r[x.field]), 0);
    }
    case "minRowsPositive": {
      const x = e as { op: "minRowsPositive"; field: string };
      let min = Infinity;
      for (const r of ctx.rows) {
        const n = num(r[x.field]);
        if (n > 0 && n < min) min = n;
      }
      return min === Infinity ? 0 : min;
    }
    case "allRowsYes": {
      const x = e as { op: "allRowsYes"; field: string };
      let hasValue = false;
      for (const r of ctx.rows) {
        const v = String(r[x.field] ?? "").trim().toLowerCase();
        if (!v) continue;
        hasValue = true;
        if (v === "no") return "No";
      }
      return hasValue ? "Yes" : "";
    }
    case "sumRowsInclude": {
      const x = e as {
        op: "sumRowsInclude";
        field: string;
        includeField: string;
        includeValues: (number | string)[];
      };
      const included = new Set(x.includeValues.map(String));
      return ctx.rows.reduce((s, r) => {
        const key = String(r[x.includeField] ?? "");
        if (!included.has(key)) return s;
        return s + num(r[x.field]);
      }, 0);
    }
    case "sumRowsExclude": {
      const x = e as {
        op: "sumRowsExclude";
        field: string;
        excludeField: string;
        excludeValues: (number | string)[];
      };
      const excluded = new Set(x.excludeValues.map(String));
      return ctx.rows.reduce((s, r) => {
        const key = String(r[x.excludeField] ?? "");
        if (excluded.has(key)) return s;
        return s + num(r[x.field]);
      }, 0);
    }
    case "mapGet": {
      const x = e as { op: "mapGet"; mapKey: string; key: AnnexureExpr; default?: number | string };
      const map = ctx.lookupMaps?.[x.mapKey] ?? {};
      const k = str(evaluateExpr(x.key, ctx)).trim();
      if (k && map[k] != null) return map[k];
      return x.default ?? 0;
    }
    case "formatNum": {
      const x = e as { op: "formatNum"; arg: AnnexureExpr; decimals?: number };
      const d = x.decimals ?? 2;
      return num(str(evaluateExpr(x.arg, ctx))).toFixed(d);
    }
    default:
      return 0;
  }
}

/** Format number for display / storage (2 decimals). */
export function formatAnnexNumber(v: unknown): string {
  const n = num(str(v));
  return n.toFixed(2);
}

export function exprToBool(e: AnnexureExpr, ctx: EvalCtx): boolean {
  return Boolean(evaluateExpr(e, ctx));
}
