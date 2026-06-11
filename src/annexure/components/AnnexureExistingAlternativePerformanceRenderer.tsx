import {
  computeExistingAlternativePerformanceState,
  emptyAlternativePerformanceRow,
  type AlternativePerformanceRow,
  type ExistingAlternativePerformanceState,
} from "@/annexure/annexExistingAlternativePerformanceCalculations";
import {
  buildSavePayloadFromExistingAlternativePerformance,
  hydrateExistingAlternativePerformanceAnnex,
} from "@/annexure/annexExistingAlternativePerformanceStorage";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { AnnexureRendererHandle } from "@/annexure/components/annexureRendererHandle";
import type { CertificationFormResponse } from "@/lib/certificationForm";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { MutableRefObject } from "react";

const inputClass =
  "h-9 w-full min-w-0 rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean/30";
const readonlyClass =
  "h-9 w-full min-w-0 rounded-md border border-transparent bg-muted/50 px-2 text-sm text-muted-foreground";

type Props = {
  schema: AnnexureSchemaDefinition;
  tab: string;
  subtab: string;
  ratingTypeId: number;
  formState: CertificationFormResponse;
  saveHandleRef: MutableRefObject<AnnexureRendererHandle | null>;
};

function clampDecimal(raw: string): string {
  if (raw === "" || raw === ".") return raw;
  if (!raw.includes(".")) return raw;
  const [w, f] = raw.split(".");
  return f.length > 2 ? `${w}.${f.slice(0, 2)}` : raw;
}

const COLUMNS: {
  key: keyof AlternativePerformanceRow;
  label: string;
  type: "date" | "number" | "readonly";
}[] = [
  { key: "existing_month_year_annexone", label: "Previous Year Water Consumption", type: "date" },
  { key: "input_consumption", label: "Total Input Water Consumption from Municipal Water Supply", type: "number" },
  { key: "ro_consumption", label: "RO Water Consumption", type: "number" },
  { key: "stp_input", label: "STP Input", type: "number" },
  { key: "stp_output", label: "STP Output", type: "number" },
  { key: "rainwater_collection", label: "Rainwater Collection", type: "number" },
  { key: "domestic_water", label: "Domestic Water Consumption", type: "number" },
  { key: "cooling_consumption", label: "Cooling tower Consumption", type: "number" },
  { key: "flushing_water", label: "Flushing Water Consumption", type: "number" },
  { key: "landing_water", label: "Landscape Water Consumption", type: "number" },
  { key: "total_alter_water", label: "Total Alternate Water Consumption", type: "readonly" },
  { key: "total_water_com", label: "Total Water Consumption", type: "readonly" },
  { key: "water_performance", label: "Water Performance Ratio (WPR)", type: "readonly" },
];

const FOOTER_KEYS = [
  "total_municipal",
  "total_ro_water",
  "total_stp_input",
  "total_stp_output",
  "total_rainwater_collect",
  "total_domestic",
  "total_cooling_water",
  "total_flushing",
  "total_landing_water",
  "total_alter",
  "total_water_con",
  "total_water_ratio",
] as const;

export function AnnexureExistingAlternativePerformanceRenderer({
  schema,
  tab,
  subtab,
  ratingTypeId,
  formState,
  saveHandleRef,
}: Props) {
  const layout = schema.existingAlternativePerformanceLayout ?? {};
  const minRows = layout.minRows ?? 5;
  const maxRows = layout.maxRows ?? 50;
  const addRowLabel = layout.addRowLabel ?? "Add More";

  const dataSignature = useMemo(
    () =>
      JSON.stringify(
        (formState.data ?? [])
          .filter((d) => d.tab === tab && d.subtab === subtab)
          .map((d) => [d.paramName, d.value]),
      ),
    [formState.data, tab, subtab],
  );

  const [draft, setDraft] = useState<ExistingAlternativePerformanceState>(() =>
    hydrateExistingAlternativePerformanceAnnex(schema, formState, tab, subtab),
  );

  useEffect(() => {
    setDraft(hydrateExistingAlternativePerformanceAnnex(schema, formState, tab, subtab));
  }, [schema, formState, tab, subtab, dataSignature]);

  const recalc = useCallback(
    (fn: (s: ExistingAlternativePerformanceState) => ExistingAlternativePerformanceState) => {
      setDraft((prev) => computeExistingAlternativePerformanceState(fn(prev)));
    },
    [],
  );

  useEffect(() => {
    const handle: AnnexureRendererHandle = {
      getSaveFields: () => buildSavePayloadFromExistingAlternativePerformance(draft),
    };
    saveHandleRef.current = handle;
    return () => {
      if (saveHandleRef.current === handle) saveHandleRef.current = null;
    };
  }, [draft, saveHandleRef]);

  const addRow = useCallback(() => {
    recalc((s) => {
      if (s.rows.length >= maxRows) return s;
      return { ...s, rows: [...s.rows, emptyAlternativePerformanceRow()] };
    });
  }, [maxRows, recalc]);

  const patchRow = useCallback(
    (rowIndex: number, patch: Partial<AlternativePerformanceRow>) => {
      recalc((s) => ({
        ...s,
        rows: s.rows.map((row, i) => (i === rowIndex ? { ...row, ...patch } : row)),
      }));
    },
    [recalc],
  );

  if (schema.ratingTypeIds?.length && !schema.ratingTypeIds.includes(Number(ratingTypeId))) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-t-xl border border-b-0 border-border bg-ocean/10 px-4 py-3">
        <h2 className="text-base font-semibold text-ocean">{schema.title}</h2>
      </div>
      <div className="rounded-b-xl border border-border bg-card p-4 shadow-sm space-y-4">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={addRow}
            disabled={draft.rows.length >= maxRows}
            className="inline-flex items-center gap-1.5 rounded-lg bg-ocean px-4 py-2 text-sm font-medium text-white hover:bg-ocean-hover disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {addRowLabel}
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-max min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted/40 text-center text-xs font-medium">
                <th className="sticky left-0 z-20 border border-border bg-muted/40 px-2 py-2 w-12">
                  S.No
                </th>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className="border border-border px-2 py-2 min-w-[120px] whitespace-nowrap"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {draft.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="text-center">
                  <td className="sticky left-0 z-10 border border-border bg-card px-2 py-2 font-medium text-muted-foreground">
                    {rowIndex + 1}
                  </td>
                  {COLUMNS.map((col) => (
                    <td key={col.key} className="border border-border px-1 py-1">
                      {col.type === "date" ? (
                        <input
                          type="date"
                          className={inputClass}
                          value={row[col.key]}
                          onChange={(e) => patchRow(rowIndex, { [col.key]: e.target.value })}
                        />
                      ) : col.type === "readonly" ? (
                        <input readOnly className={readonlyClass} value={row[col.key]} />
                      ) : (
                        <input
                          type="number"
                          step="0.01"
                          className={inputClass}
                          value={row[col.key]}
                          onChange={(e) =>
                            patchRow(rowIndex, { [col.key]: clampDecimal(e.target.value) })
                          }
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted/20">
                <td colSpan={2} className="border border-border px-3 py-2 text-right font-medium">
                  Total
                </td>
                {FOOTER_KEYS.map((key) => (
                  <td key={key} className="border border-border px-2 py-1.5">
                    <input readOnly className={readonlyClass} value={draft.footer[key]} />
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
