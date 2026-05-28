import type {
  AnnexureColumnDef,
  AnnexureFooterRowDef,
  AnnexureTableHeaderCellDef,
} from "@/annexure/annexureTypes";
import { exprToBool, type EvalCtx, type RowRecord } from "@/annexure/annexureExprEval";
import { Plus, Trash2 } from "lucide-react";

const inputClass =
  "h-9 w-full min-w-0 rounded-md border border-input bg-background px-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean/30 disabled:opacity-60";
const readonlyClass =
  "h-9 w-full min-w-0 rounded-md border border-transparent bg-muted/50 px-2 text-sm tabular-nums text-muted-foreground";
const footerFieldClass =
  "h-9 w-full min-w-[88px] rounded-md border border-input bg-muted/40 px-2 text-right text-sm font-medium tabular-nums text-foreground shadow-sm";

type Props = {
  columns: AnnexureColumnDef[];
  rows: RowRecord[];
  stickyFirstColumns?: number;
  addRowLabel?: string;
  minRows?: number;
  maxRows?: number;
  footerRows?: AnnexureFooterRowDef[];
  footerScalar?: Record<string, string>;
  onFooterScalarChange?: (param: string, value: string) => void;
  evalCtx: Omit<EvalCtx, "row">;
  onRowChange: (rowIndex: number, param: string, value: string) => void;
  onAddRow: () => void;
  onRemoveRow: (rowIndex: number) => void;
  allowRemoveRows?: boolean;
};

function cellVisible(col: AnnexureColumnDef, row: RowRecord, ctx: Omit<EvalCtx, "row">): boolean {
  if (!col.showWhen) return true;
  return exprToBool(col.showWhen, { ...ctx, row });
}

/** Blade LPD annex: limit number inputs to two decimal places while typing. */
function clampDecimalInput(raw: string, maxDecimals = 2): string {
  if (raw === "" || raw === ".") return raw;
  if (!raw.includes(".")) return raw;
  const [whole, frac] = raw.split(".");
  if (frac.length <= maxDecimals) return raw;
  return `${whole}.${frac.slice(0, maxDecimals)}`;
}

function selectOptions(col: AnnexureColumnDef): { placeholder: string; entries: [string, string][] } {
  const opts = col.options ?? {};
  const placeholder = opts[""] ?? "Select…";
  const entries = Object.entries(opts).filter(([k]) => k !== "") as [string, string][];
  return { placeholder, entries };
}

export function DynamicTable({
  columns,
  rows,
  stickyFirstColumns = 0,
  addRowLabel = "Add row",
  minRows = 1,
  maxRows = 99,
  headerRows,
  footerRows,
  footerScalar = {},
  onFooterScalarChange,
  evalCtx,
  onRowChange,
  onAddRow,
  onRemoveRow,
  allowRemoveRows = true,
}: Props) {
  return (
    <div className="space-y-3">
      {addRowLabel ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={onAddRow}
            disabled={rows.length >= maxRows}
            className="inline-flex items-center gap-1.5 rounded-lg bg-ocean px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-ocean-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {addRowLabel}
          </button>
          <p className="text-xs text-muted-foreground">
            {rows.length} row{rows.length !== 1 ? "s" : ""}
            {maxRows < 999 ? ` · max ${maxRows}` : ""}
          </p>
        </div>
      ) : rows.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          {rows.length} row{rows.length !== 1 ? "s" : ""} (synced from upstream ventilation annexes)
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">No dwelling data available from upstream annexes yet.</p>
      )}

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-max min-w-full border-collapse text-left text-sm">
          <thead>
            {headerRows?.map((hr, hi) => (
              <tr key={`hdr-${hi}`} className="border-b border-border/70 bg-ocean/5">
                <th className="sticky left-0 z-20 w-10 bg-ocean/5" />
                {hr.map((cell, ci) => (
                  <th
                    key={ci}
                    colSpan={cell.colspan ?? 1}
                    className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-ocean"
                  >
                    {cell.text ?? ""}
                  </th>
                ))}
                <th className="w-12 bg-ocean/5" />
              </tr>
            ))}
            <tr className="border-b border-border bg-ocean/10">
              <th className="sticky left-0 z-20 w-10 bg-ocean/10 px-2 py-2 text-center font-semibold text-ocean">#</th>
              {columns.map((col, ci) => {
                const sticky =
                  stickyFirstColumns > 0 && ci + 1 < stickyFirstColumns
                    ? `sticky z-10 bg-ocean/10 ${ci === 0 ? "left-10" : "left-[4.5rem]"}`
                    : "";
                return (
                  <th
                    key={col.id}
                    className={`whitespace-nowrap px-2 py-2 font-semibold text-ocean ${col.width ?? ""} ${sticky}`}
                  >
                    {col.header}
                  </th>
                );
              })}
              <th className="w-12 px-1 py-2 text-center font-semibold text-ocean"> </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="border-b border-border/80 odd:bg-muted/20">
                <td className="sticky left-0 z-10 bg-card px-2 py-1 text-center text-muted-foreground">{ri + 1}</td>
                {columns.map((col) => {
                  const visible = cellVisible(col, row, evalCtx);
                  if (!visible) {
                    return (
                      <td key={col.id} className="px-1 py-1">
                        <span className="text-muted-foreground">—</span>
                      </td>
                    );
                  }
                  const v = row[col.param] ?? "";
                  if (col.type === "readonly") {
                    return (
                      <td key={col.id} className={`px-1 py-1 ${col.width ?? ""}`}>
                        <div className={readonlyClass}>{v}</div>
                      </td>
                    );
                  }
                  if (col.type === "select" && col.options) {
                    const { placeholder, entries } = selectOptions(col);
                    return (
                      <td key={col.id} className={`px-1 py-1 ${col.width ?? ""}`}>
                        <select
                          className={inputClass}
                          value={v}
                          onChange={(e) => onRowChange(ri, col.param, e.target.value)}
                        >
                          <option value="">{placeholder}</option>
                          {entries.map(([val, label]) => (
                            <option key={val} value={val}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </td>
                    );
                  }
                  if (col.type === "number") {
                    return (
                      <td key={col.id} className={`px-1 py-1 ${col.width ?? ""}`}>
                        <input
                          type="number"
                          step={col.step ?? "1"}
                          className={inputClass}
                          value={v}
                          onChange={(e) => {
                            const next =
                              col.step === "0.01" ? clampDecimalInput(e.target.value) : e.target.value;
                            onRowChange(ri, col.param, next);
                          }}
                        />
                      </td>
                    );
                  }
                  return (
                    <td key={col.id} className={`px-1 py-1 ${col.width ?? ""}`}>
                      <input
                        type="text"
                        className={inputClass}
                        value={v}
                        onChange={(e) => onRowChange(ri, col.param, e.target.value)}
                      />
                    </td>
                  );
                })}
                <td className="px-1 py-1 text-center">
                  {allowRemoveRows ? (
                    <button
                      type="button"
                      disabled={rows.length <= minRows}
                      onClick={() => onRemoveRow(ri)}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-30"
                      title="Remove row"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
          {footerRows?.length ? (
            <tfoot className="border-t-2 border-border bg-muted/15">
              {footerRows.map((fr, fi) => (
                <tr key={fi} className="border-b border-border/70 last:border-b-0">
                  {fr.cells.map((cell, j) => {
                    if (cell.kind === "spacer") {
                      return <td key={j} colSpan={cell.colspan ?? 1} className="bg-muted/15" />;
                    }
                    if (cell.kind === "label") {
                      return (
                        <td
                          key={j}
                          colSpan={cell.colspan ?? 1}
                          className="px-2 py-2 text-center text-sm font-medium text-foreground"
                        >
                          {cell.text}
                        </td>
                      );
                    }
                    const val = cell.param ? footerScalar[cell.param] ?? "" : "";
                    if (cell.editable && cell.param && onFooterScalarChange) {
                      return (
                        <td key={j} colSpan={cell.colspan ?? 1} className="px-2 py-1.5">
                          <input
                            type={cell.inputType === "number" ? "number" : "text"}
                            step={cell.step ?? "0.01"}
                            className={inputClass}
                            value={val}
                            onChange={(e) => {
                              const next =
                                cell.step === "0.01" ? clampDecimalInput(e.target.value) : e.target.value;
                              onFooterScalarChange(cell.param!, next);
                            }}
                          />
                        </td>
                      );
                    }
                    return (
                      <td key={j} colSpan={cell.colspan ?? 1} className="px-2 py-1.5">
                        <div className={footerFieldClass}>{val}</div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tfoot>
          ) : null}
        </table>
      </div>
    </div>
  );
}
